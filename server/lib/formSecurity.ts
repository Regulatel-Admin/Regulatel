import crypto from "node:crypto";
import { isIP } from "node:net";
import { domainToASCII } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb, isDbConfigured } from "./db.js";

export type FormAction = "contact" | "subscribe";
export type FormProtection = { ok: true } | {
  ok: false; status: number; error: string; retryAfter?: number; silent?: boolean;
};
export class PublicFormError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) { super(message); }
}
// 5,000 Unicode characters plus field values and challenge tokens fit here.
const MAX_BODY_BYTES = 32_768;
const FORM_LIFETIME_MS = 2 * 60 * 60 * 1000;
let schemaEnsured: Promise<void> | null = null;

function firstHeader(req: IncomingMessage, name: string) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}
function isProduction() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}
export function allowedFormOrigins(): Set<string> {
  const origins = new Set(["https://www.regulatel.org", "https://regulatel.org"]);
  for (const candidate of [process.env.SITE_URL,
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined]) {
    if (candidate) { try { origins.add(new URL(candidate).origin); } catch { /* Invalid configuration is never allowed. */ } }
  }
  if (!isProduction()) {
    for (const port of [5173, 4173, 4178]) {
      origins.add(`http://localhost:${port}`); origins.add(`http://127.0.0.1:${port}`);
    }
  }
  return origins;
}
function respond(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(data));
}
export function preparePublicFormRequest(req: IncomingMessage, res: ServerResponse, method: "POST" | "GET") {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Origin");
  const origin = firstHeader(req, "origin");
  if (origin && !allowedFormOrigins().has(origin)) {
    respond(res, 403, { error: "El origen de la solicitud no está permitido." }); return false;
  }
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", `${method}, OPTIONS`);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return false; }
  if (req.method !== method) {
    res.setHeader("Allow", `${method}, OPTIONS`);
    respond(res, 405, { error: "Método no permitido." }); return false;
  }
  if (method === "POST") {
    if (!origin) { respond(res, 403, { error: "Envíe el formulario desde la página de REGULATEL." }); return false; }
    if (firstHeader(req, "content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      respond(res, 415, { error: "Formato de solicitud no permitido." }); return false;
    }
  }
  return true;
}
export async function readPublicFormBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (Number(firstHeader(req, "content-length") ?? 0) > MAX_BODY_BYTES) {
    throw new PublicFormError(413, "El formulario supera el tamaño permitido.");
  }
  let size = 0; const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new PublicFormError(413, "El formulario supera el tamaño permitido.");
    chunks.push(buffer);
  }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new PublicFormError(400, "El formulario no es válido."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new PublicFormError(400, "El formulario no es válido.");
  return body as Record<string, unknown>;
}
export function isValidPublicEmail(email: string): boolean {
  if (email.length > 254 || /[\s\u0000-\u001f\u007f]/u.test(email)) return false;
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at); const domain = domainToASCII(email.slice(at + 1));
  return at > 0 && local.length <= 64 && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
    && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
    && domain.length <= 253 && domain.includes(".")
    && domain.split(".").every(label => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
}
export function rateLimitEmail(email: string) {
  const [local, domain] = email.trim().toLowerCase().split("@");
  return domain === "gmail.com" || domain === "googlemail.com"
    ? `${local.split("+")[0].replace(/\./g, "")}@gmail.com` : `${local}@${domain}`;
}
export function clientIp(req: IncomingMessage) {
  // Vercel overwrites X-Forwarded-For; never trust user-supplied CF-Connecting-IP.
  const forwarded = process.env.VERCEL === "1" ? firstHeader(req, "x-forwarded-for")?.split(",")[0].trim() : undefined;
  const value = forwarded || req.socket.remoteAddress || "unknown";
  return isIP(value) ? value : "unknown";
}
function securityConfig() {
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!siteKey || !secret || (isProduction() && (/^[123]x0{5}/.test(siteKey) || /^[123]x0{5}/.test(secret)))) {
    throw new PublicFormError(503, "La verificación del formulario no está disponible. Intente más tarde.");
  }
  return { siteKey, secret };
}
function hash(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}
export function createFormConfiguration(action: FormAction, now = Date.now()) {
  const { siteKey, secret } = securityConfig();
  const payload = `${action}:${now}:${crypto.randomBytes(16).toString("hex")}`;
  const formToken = `${Buffer.from(payload).toString("base64url")}.${hash(payload, secret)}`;
  return { siteKey, formToken, expiresAt: now + FORM_LIFETIME_MS };
}
export function validateFormToken(token: unknown, action: FormAction, now = Date.now()): boolean {
  if (typeof token !== "string" || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return false;
  const { secret } = securityConfig();
  const payload = Buffer.from(parts[0], "base64url").toString("utf8");
  if (!crypto.timingSafeEqual(Buffer.from(parts[1], "hex"), Buffer.from(hash(payload, secret), "hex"))) return false;
  const [tokenAction, time, nonce] = payload.split(":");
  const started = Number(time);
  return tokenAction === action && /^[a-f0-9]{32}$/.test(nonce ?? "") && Number.isSafeInteger(started)
    && now - started >= 0 && now - started <= FORM_LIFETIME_MS;
}
type LimitRule = { key: string; max: number; seconds: number };
export async function ensureFormSecuritySchema() {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      const sql = getDb();
      await sql`CREATE TABLE IF NOT EXISTS public_form_limits (
        key_hash TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL
      )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_public_form_limits_expiry ON public_form_limits(expires_at)`;
      await sql`DELETE FROM public_form_limits WHERE expires_at < NOW() - INTERVAL '1 day'`;
    })().catch(error => { schemaEnsured = null; throw error; });
  }
  await schemaEnsured;
}
export async function consumeRateLimits(rules: LimitRule[]) {
  await ensureFormSecuritySchema();
  const { secret } = securityConfig();
  const sql = getDb();
  await sql.begin(async transaction => {
    // postgres TransactionSql's Omit type loses the tagged-template overload.
    const tx = transaction as unknown as typeof sql;
    for (const rule of rules) {
      const keyHash = hash(rule.key, secret);
      const rows = await tx<{ hits: number }[]>`
        INSERT INTO public_form_limits (key_hash, hits, expires_at)
        VALUES (${keyHash}, 1, NOW() + ${rule.seconds} * INTERVAL '1 second')
        ON CONFLICT (key_hash) DO UPDATE SET
          hits = CASE WHEN public_form_limits.expires_at <= NOW() THEN 1 ELSE public_form_limits.hits + 1 END,
          expires_at = CASE WHEN public_form_limits.expires_at <= NOW() THEN EXCLUDED.expires_at ELSE public_form_limits.expires_at END
        WHERE public_form_limits.expires_at <= NOW() OR public_form_limits.hits < ${rule.max}
        RETURNING hits
      `;
      if (!rows[0]) {
        const remaining = await tx<{ seconds: number }[]>`
          SELECT GREATEST(1, CEIL(EXTRACT(EPOCH FROM expires_at - NOW())))::integer AS seconds
          FROM public_form_limits WHERE key_hash = ${keyHash}
        `;
        throw new PublicFormError(429, "Ha realizado varios envíos. Espere unos minutos antes de intentarlo de nuevo.", remaining[0]?.seconds || rule.seconds);
      }
    }
  });
}
type TurnstileResult = { success?: boolean; hostname?: string; action?: string };
export function isValidTurnstileResult(result: TurnstileResult, action: FormAction) {
  const hostnames = new Set(["www.regulatel.org", "regulatel.org"]);
  for (const name of (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "").split(",").map(item => item.trim()).filter(Boolean)) hostnames.add(name);
  if (!isProduction()) { hostnames.add("localhost"); hostnames.add("127.0.0.1"); }
  return result.success === true && result.action === action && hostnames.has(result.hostname ?? "");
}
async function verifyTurnstile(token: string, ip: string, action: FormAction) {
  const { secret } = securityConfig();
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, ...(isIP(ip) ? { remoteip: ip } : {}) }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new PublicFormError(503, "La verificación no está disponible. Intente de nuevo.");
  return isValidTurnstileResult(await response.json() as TurnstileResult, action);
}
function failure(error: unknown): FormProtection {
  if (error instanceof PublicFormError) return { ok: false, status: error.status, error: error.message, retryAfter: error.retryAfter };
  console.error("[form-security] Verification unavailable", error instanceof Error ? error.name : "unknown");
  return { ok: false, status: 503, error: "No fue posible verificar el formulario. Intente más tarde." };
}
export async function protectForm(req: IncomingMessage, body: Record<string, unknown>, action: FormAction): Promise<FormProtection> {
  try {
    if (typeof body.website === "string" && body.website.trim()) return { ok: false, status: 200, error: "", silent: true };
    if (typeof body.website !== "string" || !validateFormToken(body.formToken, action)) {
      return { ok: false, status: 400, error: "La verificación del formulario venció. Actualice la verificación e intente de nuevo." };
    }
    if (typeof body.email !== "string" || !isValidPublicEmail(body.email.trim())) return { ok: false, status: 400, error: "Indique un correo electrónico válido." };
    if (typeof body.turnstileToken !== "string" || !body.turnstileToken || body.turnstileToken.length > 2048) {
      return { ok: false, status: 400, error: "Complete la verificación de seguridad antes de enviar." };
    }
    if (!isDbConfigured()) throw new PublicFormError(503, "Servicio no disponible. Intente más tarde.");
    const ip = clientIp(req);
    await consumeRateLimits([{ key: `${action}:attempt:${ip}`, max: 20, seconds: 900 }]);
    if (!await verifyTurnstile(body.turnstileToken, ip, action)) return { ok: false, status: 400, error: "La verificación de seguridad no es válida. Intente de nuevo." };
    const email = rateLimitEmail(body.email);
    const rules: LimitRule[] = [
      { key: `${action}:ip:${ip}`, max: action === "contact" ? 3 : 5, seconds: 900 },
      { key: `${action}:email:${email}`, max: 1, seconds: 600 },
    ];
    if (action === "contact") {
      const content = [body.subject, body.message].map(value => typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "").join("\n");
      rules.push({ key: `contact:duplicate:${email}:${content}`, max: 1, seconds: 86400 });
    }
    await consumeRateLimits(rules);
    return { ok: true };
  } catch (error) { return failure(error); }
}
export async function protectConfirmation(req: IncomingMessage): Promise<FormProtection> {
  try {
    securityConfig();
    if (!isDbConfigured()) throw new PublicFormError(503, "Servicio no disponible. Intente más tarde.");
    await consumeRateLimits([{ key: `confirm:ip:${clientIp(req)}`, max: 20, seconds: 900 }]);
    return { ok: true };
  } catch (error) { return failure(error); }
}
