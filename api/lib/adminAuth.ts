import crypto from "crypto";
import type { IncomingMessage, ServerResponse } from "http";
import bcrypt from "bcryptjs";
import { getDb } from "./db.js";
import { parseJsonBody } from "./parseBody.js";
import {
  findAdminUserByIdentifier,
  getAdminUserById,
  getAdminUserCount,
  updateAdminLastLogin,
} from "./adminUsers.js";

const COOKIE_NAME = "regulatel_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

interface AdminSessionRow {
  id: string;
  user_id: string;
  session_token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return [name, decodeURIComponent(rest.join("="))];
    })
  );
}

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildOpaqueSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function setCookie(res: ServerResponse, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax; ${secure}`.trim()
  );
}

export function clearAdminSession(res: ServerResponse) {
  setCookie(res, "", 0);
}

function getRequestIp(req: IncomingMessage): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return null;
}

async function revokeSessionByToken(token: string) {
  const sql = getDb();
  const now = new Date().toISOString();
  const tokenHash = hashSessionToken(token);
  await sql`
    UPDATE admin_sessions
    SET revoked_at = ${now}::timestamptz,
        updated_at = ${now}::timestamptz
    WHERE session_token_hash = ${tokenHash}
      AND revoked_at IS NULL
  `;
}

async function createSessionForUser(input: {
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
}) {
  const sql = getDb();
  const token = buildOpaqueSessionToken();
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  const sessionId = `sess_${crypto.randomUUID()}`;

  await sql`
    INSERT INTO admin_sessions (
      id, user_id, session_token_hash, expires_at, revoked_at, user_agent, ip_address, created_at, updated_at
    ) VALUES (
      ${sessionId}, ${input.userId}, ${tokenHash}, ${expiresAt.toISOString()}::timestamptz,
      NULL, ${input.userAgent}, ${input.ipAddress}, ${now.toISOString()}::timestamptz, ${now.toISOString()}::timestamptz
    )
  `;

  return token;
}

async function getSessionByToken(token: string): Promise<AdminSessionRow | null> {
  const sql = getDb();
  const tokenHash = hashSessionToken(token);
  const [row] = await sql<AdminSessionRow[]>`
    SELECT id, user_id, session_token_hash, expires_at, revoked_at, created_at, updated_at
    FROM admin_sessions
    WHERE session_token_hash = ${tokenHash}
    LIMIT 1
  `;
  return row ?? null;
}

export async function getAuthenticatedAdmin(req: IncomingMessage) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const session = await getSessionByToken(token);
  if (!session) return null;
  if (session.revoked_at) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const user = await getAdminUserById(session.user_id);
  if (!user || !user.is_active) return null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    sessionId: session.id,
    token,
  };
}

export async function loginAdmin(req: IncomingMessage, res: ServerResponse) {
  const body = (await parseJsonBody(req)) as Record<string, unknown>;
  const submittedUser = typeof body.username === "string" ? body.username.trim() : "";
  const submittedPassword = typeof body.password === "string" ? body.password : "";
  if (!submittedUser || !submittedPassword) return false;

  const user = await findAdminUserByIdentifier(submittedUser);
  if (!user || !user.is_active) return false;

  const ok = await bcrypt.compare(submittedPassword, user.password_hash);
  if (!ok) return false;

  const token = await createSessionForUser({
    userId: user.id,
    userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null,
    ipAddress: getRequestIp(req),
  });
  setCookie(res, token, SESSION_MAX_AGE_SECONDS);
  await updateAdminLastLogin(user.id);
  return true;
}

export async function logoutAdmin(req: IncomingMessage, res: ServerResponse) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (token) {
    await revokeSessionByToken(token);
  }
  clearAdminSession(res);
}

export async function ensureAdmin(req: IncomingMessage) {
  const auth = await getAuthenticatedAdmin(req);
  if (!auth) {
    const err = new Error("No autorizado.");
    err.name = "UnauthorizedError";
    throw err;
  }
  return auth;
}

export async function getAdminAuthStatus(req: IncomingMessage) {
  const auth = await getAuthenticatedAdmin(req);
  const userCount = await getAdminUserCount();
  return {
    authenticated: Boolean(auth),
    configured: true,
    bootstrapRequired: userCount === 0,
    user: auth?.user ?? null,
  };
}
