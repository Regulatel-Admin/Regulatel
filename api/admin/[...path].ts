/**
 * Router unificado para /api/admin/* (session, users, audit, document-access-users).
 * Reduce 4 funciones a 1 para cumplir límite Vercel Hobby (12).
 */
import type { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  getAdminAuthStatus,
  loginAdmin,
  logoutAdmin,
  ensureAdmin,
} from "../../server/lib/adminAuth.js";
import { listAdminUsers, createAdminUser } from "../../server/lib/adminUsers.js";
import { findAdminUserByIdentifier } from "../../server/lib/adminUsers.js";
import { logAudit } from "../../server/lib/auditLog.js";
import { listAuditLog } from "../../server/lib/auditLog.js";
import {
  ensureDocumentAccessSchema,
  listDocumentAccessUsers,
  createDocumentAccessUser,
  findDocumentAccessUserByEmail,
} from "../../server/lib/documentAccess.js";
import { parseJsonBody } from "../../server/lib/parseBody.js";
import { isDbConfigured } from "../../server/lib/db.js";

const SUPER_ADMIN_EMAILS = ["dcuervo@indotel.gob.do", "aarango@indotel.gob.do", "aarango@indotel.gob"];

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function isSuperAdmin(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

function getAdminSubpath(req: IncomingMessage): string {
  const pathname = (req.url ?? "").split("?")[0];
  const match = pathname.match(/^\/api\/admin\/?(.*)$/);
  const rest = match ? match[1] ?? "" : "";
  return rest.split("/")[0] ?? "";
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!isDbConfigured()) {
    sendJson(res, 503, { error: "Database not configured (DATABASE_URL)" });
    return;
  }

  const subpath = getAdminSubpath(req);

  try {
    if (subpath === "session") {
      if (req.method === "GET") {
        sendJson(res, 200, await getAdminAuthStatus(req));
        return;
      }
      if (req.method === "POST") {
        const ok = await loginAdmin(req, res);
        sendJson(res, ok ? 200 : 401, ok ? { authenticated: true } : { error: "Usuario o contraseña incorrectos." });
        return;
      }
      if (req.method === "DELETE") {
        await logoutAdmin(req, res);
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    if (subpath === "users") {
      const auth = await ensureAdmin(req);
      if (!isSuperAdmin(auth.user.email)) {
        sendJson(res, 403, { error: "Solo los administradores autorizados pueden gestionar usuarios." });
        return;
      }
      if (req.method === "GET") {
        sendJson(res, 200, await listAdminUsers());
        return;
      }
      if (req.method === "POST") {
        const body = (await parseJsonBody(req)) as Record<string, unknown>;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const name = typeof body.name === "string" ? body.name.trim() : email.split("@")[0] || "Usuario";
        const role = typeof body.role === "string" && (body.role === "admin" || body.role === "editor") ? body.role : "admin";
        if (!email || !password) {
          sendJson(res, 400, { error: "Se requieren email y contraseña." });
          return;
        }
        if (password.length < 6) {
          sendJson(res, 400, { error: "La contraseña debe tener al menos 6 caracteres." });
          return;
        }
        const existing = await findAdminUserByIdentifier(email);
        if (existing) {
          sendJson(res, 409, { error: "Ya existe un usuario con ese email." });
          return;
        }
        const id = `usr_${crypto.randomUUID()}`;
        const passwordHash = await bcrypt.hash(password, 12);
        await createAdminUser({ id, name, email, passwordHash, role });
        await logAudit({
          userId: auth.user.id,
          userEmail: auth.user.email,
          userName: auth.user.name,
          action: "created",
          resourceType: "admin_user",
          resourceId: id,
          details: { email, role },
        });
        sendJson(res, 201, { id, email, name, role });
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    if (subpath === "audit") {
      const auth = await ensureAdmin(req);
      if (!isSuperAdmin(auth.user.email)) {
        sendJson(res, 403, { error: "Solo los administradores autorizados pueden ver la auditoría." });
        return;
      }
      if (req.method !== "GET") {
        sendJson(res, 405, { error: "Method Not Allowed" });
        return;
      }
      const url = new URL(req.url ?? "", `http://${req.headers.host}`);
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));
      const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));
      const items = await listAuditLog(limit, offset);
      sendJson(res, 200, { items });
      return;
    }

    if (subpath === "document-access-users") {
      const auth = await ensureAdmin(req);
      if (!isSuperAdmin(auth.user.email)) {
        sendJson(res, 403, { error: "Solo los super administradores pueden gestionar usuarios de acceso a actas." });
        return;
      }
      await ensureDocumentAccessSchema();
      if (req.method === "GET") {
        sendJson(res, 200, await listDocumentAccessUsers());
        return;
      }
      if (req.method === "POST") {
        const body = (await parseJsonBody(req)) as Record<string, unknown>;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const name = typeof body.name === "string" ? body.name.trim() : null;
        if (!email) {
          sendJson(res, 400, { error: "El email es obligatorio." });
          return;
        }
        if (!password || password.length < 6) {
          sendJson(res, 400, { error: "La contraseña debe tener al menos 6 caracteres." });
          return;
        }
        const existing = await findDocumentAccessUserByEmail(email);
        if (existing) {
          sendJson(res, 409, { error: "Ya existe un usuario con ese email." });
          return;
        }
        const id = `dau_${crypto.randomUUID()}`;
        const passwordHash = await bcrypt.hash(password, 12);
        await createDocumentAccessUser({ id, email, passwordHash, name });
        sendJson(res, 201, { id, email, name });
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("api/admin/[...path]", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Error interno" });
  }
}
