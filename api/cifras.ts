import type { IncomingMessage, ServerResponse } from "http";
import { listCifras, upsertCifras } from "../server/lib/cifras.js";
import { ensureAdmin } from "../server/lib/adminAuth.js";
import { parseJsonBody } from "../server/lib/parseBody.js";
import { isDbConfigured } from "../server/lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
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
      const data = await listCifras();
      sendJson(res, 200, data);
      return;
    }
    if (req.method === "PUT") {
      const auth = await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const year = typeof body.year === "number" ? body.year : parseInt(String(body.year), 10);
      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        sendJson(res, 400, { error: "Invalid year" });
        return;
      }
      const gruposTrabajo = typeof body.gruposTrabajo === "number" ? body.gruposTrabajo : 0;
      const comitesEjecutivos = typeof body.comitesEjecutivos === "number" ? body.comitesEjecutivos : 0;
      const revistaDigital = typeof body.revistaDigital === "number" ? body.revistaDigital : 0;
      const paises = typeof body.paises === "number" ? body.paises : 0;
      const item = await upsertCifras(year, {
        gruposTrabajo,
        comitesEjecutivos,
        revistaDigital,
        paises,
      });
      sendJson(res, 200, item);
      return;
    }
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/cifras", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
