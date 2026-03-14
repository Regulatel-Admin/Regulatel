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
import { listAuditLog, listAuditLogByResource } from "../../server/lib/auditLog.js";
import { listBlobs, isBlobConfigured } from "../../server/lib/blob.js";
import type { BlobListFolder } from "../../server/lib/blob.js";
import {
  ensureDocumentAccessSchema,
  listDocumentAccessUsers,
  createDocumentAccessUser,
  findDocumentAccessUserByEmail,
  findDocumentAccessUserById,
  deleteDocumentAccessUser,
  updateDocumentAccessUser,
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

function getPathname(req: IncomingMessage): string {
  let pathname = (req.url ?? "").split("?")[0];
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      pathname = (req.url ?? "").split("?")[0];
    }
  }
  return pathname;
}

function getAdminSubpath(req: IncomingMessage): string {
  const pathname = getPathname(req);
  const match = pathname.match(/\/api\/admin\/?(.*)$/);
  const rest = match ? match[1] ?? "" : "";
  return rest.split("/")[0] ?? "";
}

/** Path segments after /api/admin/ (e.g. ["document-access-users", "dau_xxx"]) */
function getAdminPathSegments(req: IncomingMessage): string[] {
  const r = req as IncomingMessage & { query?: { path?: string[] } };
  if (Array.isArray(r.query?.path) && r.query.path.length > 0) {
    return r.query.path;
  }
  const pathname = getPathname(req);
  const match = pathname.match(/\/api\/admin\/?(.*)$/);
  const rest = match ? match[1] ?? "" : "";
  return rest.split("/").filter(Boolean);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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
          details: { name, email, role },
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
      if (req.method !== "GET") {
        sendJson(res, 405, { error: "Method Not Allowed" });
        return;
      }
      const url = new URL(req.url ?? "", `http://${req.headers.host}`);
      const resourceType = url.searchParams.get("resource_type") ?? "";
      const resourceId = url.searchParams.get("resource_id") ?? "";
      if (resourceType && resourceId) {
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));
        const items = await listAuditLogByResource(resourceType, resourceId, limit);
        sendJson(res, 200, { items });
        return;
      }
      if (!isSuperAdmin(auth.user.email)) {
        sendJson(res, 403, { error: "Solo los administradores autorizados pueden ver el registro completo de auditoría." });
        return;
      }
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));
      const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));
      const items = await listAuditLog(limit, offset);
      sendJson(res, 200, { items });
      return;
    }

    if (subpath === "media") {
      await ensureAdmin(req);
      if (req.method !== "GET") {
        sendJson(res, 405, { error: "Method Not Allowed" });
        return;
      }
      if (!isBlobConfigured()) {
        sendJson(res, 503, { error: "Blob storage no configurado (BLOB_READ_WRITE_TOKEN)." });
        return;
      }
      const url = new URL(req.url ?? "", `http://${req.headers.host}`);
      const prefix = (url.searchParams.get("prefix") ?? "all") as BlobListFolder;
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "100", 10)));
      const validPrefixes: BlobListFolder[] = ["news", "events", "gallery", "all"];
      const folder = validPrefixes.includes(prefix) ? prefix : "all";
      const items = await listBlobs(folder, limit);
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
      const segments = getAdminPathSegments(req);
      const documentAccessUserId = segments[0] === "document-access-users" && segments[1] ? segments[1] : null;

      if (documentAccessUserId && (req.method === "DELETE" || req.method === "PATCH")) {
        if (req.method === "DELETE") {
          const ok = await deleteDocumentAccessUser(documentAccessUserId);
          if (!ok) {
            sendJson(res, 404, { error: "Usuario no encontrado." });
            return;
          }
          sendJson(res, 200, { deleted: true });
          return;
        }
        if (req.method === "PATCH") {
          const body = (await parseJsonBody(req)) as Record<string, unknown>;
          const name = typeof body.name === "string" ? body.name.trim() || null : undefined;
          const institution = typeof body.institution === "string" ? body.institution.trim() || null : undefined;
          const position = typeof body.position === "string" ? body.position.trim() || null : undefined;
          const country = typeof body.country === "string" ? body.country.trim() || null : undefined;
          const password = typeof body.password === "string" ? body.password : undefined;
          if (password !== undefined && password.length > 0 && password.length < 6) {
            sendJson(res, 400, { error: "La contraseña debe tener al menos 6 caracteres." });
            return;
          }
          const ok = await updateDocumentAccessUser(documentAccessUserId, {
            name,
            institution,
            position,
            country,
            password: password && password.length >= 6 ? password : undefined,
          });
          if (!ok) {
            sendJson(res, 404, { error: "Usuario no encontrado." });
            return;
          }
          const updated = await findDocumentAccessUserById(documentAccessUserId);
          if (!updated) {
            sendJson(res, 200, { id: documentAccessUserId });
            return;
          }
          sendJson(res, 200, {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            institution: updated.institution,
            position: updated.position,
            country: updated.country,
          });
          return;
        }
      }

      if (req.method === "GET") {
        sendJson(res, 200, await listDocumentAccessUsers());
        return;
      }
      if (req.method === "POST") {
        const body = (await parseJsonBody(req)) as Record<string, unknown>;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const name = typeof body.name === "string" ? body.name.trim() || null : null;
        const institution = typeof body.institution === "string" ? body.institution.trim() || null : null;
        const position = typeof body.position === "string" ? body.position.trim() || null : null;
        const country = typeof body.country === "string" ? body.country.trim() || null : null;
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
        await createDocumentAccessUser({ id, email, passwordHash, name, institution, position, country });
        sendJson(res, 201, { id, email, name, institution, position, country });
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
