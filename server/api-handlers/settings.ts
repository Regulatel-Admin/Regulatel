import type { IncomingMessage, ServerResponse } from "http";
import { getSetting, getAllSettings, setSetting } from "../lib/siteSettings.js";
import { ensureAdmin } from "../lib/adminAuth.js";
import { logAudit } from "../lib/auditLog.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getQuery(req: IncomingMessage): Record<string, string> {
  const url = req.url ?? "";
  const i = url.indexOf("?");
  if (i === -1) return {};
  const params = new URLSearchParams(url.slice(i));
  return Object.fromEntries(params.entries());
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
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
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      const query = getQuery(req);
      const key = query.key;
      if (key) {
        const one = await getSetting(key);
        if (!one) {
          sendJson(res, 200, { key, value: null });
          return;
        }
        sendJson(res, 200, one);
        return;
      }
      const all = await getAllSettings();
      sendJson(res, 200, all);
      return;
    }

    if (req.method === "PUT") {
      const auth = await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as { key?: string; value?: unknown };
      const key = typeof body.key === "string" ? body.key.trim() : "";
      if (!key) {
        sendJson(res, 400, { error: "Missing key" });
        return;
      }
      const result = await setSetting(key, body.value ?? {});
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "updated",
        resourceType: "site_settings",
        resourceId: key,
        details: { key },
      });
      sendJson(res, 200, result);
      return;
    }

    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/settings", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
