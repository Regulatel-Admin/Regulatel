import type { IncomingMessage, ServerResponse } from "http";
import { ensureAdmin } from "../../server/lib/adminAuth.js";
import { listAuditLog } from "../../server/lib/auditLog.js";
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
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

  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    const auth = await ensureAdmin(req);
    if (!isSuperAdmin(auth.user.email)) {
      sendJson(res, 403, { error: "Solo los administradores autorizados pueden ver la auditoría." });
      return;
    }

    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));

    const items = await listAuditLog(limit, offset);
    sendJson(res, 200, { items });
  } catch (err) {
    console.error("api/admin/audit", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Error interno" });
  }
}
