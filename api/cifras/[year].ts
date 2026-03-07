import type { IncomingMessage, ServerResponse } from "http";
import { deleteCifrasForYear } from "../../server/lib/cifras.js";
import { ensureAdmin } from "../../server/lib/adminAuth.js";
import { isDbConfigured } from "../../server/lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? "";
  const yearStr = url.split("/").filter(Boolean).pop()?.split("?")[0] ?? "";
  const year = parseInt(yearStr, 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    sendJson(res, 400, { error: "Invalid year" });
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
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
    if (req.method === "DELETE") {
      await ensureAdmin(req);
      const ok = await deleteCifrasForYear(year);
      if (!ok) {
        sendJson(res, 404, { error: "No cifras for this year" });
        return;
      }
      res.statusCode = 204;
      res.end();
      return;
    }
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/cifras/[year]", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
