import type { IncomingMessage, ServerResponse } from "http";
import { unsubscribeByToken } from "../lib/subscribers.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function tokenFromRequest(req: IncomingMessage, body: { token?: string }): string {
  if (typeof body.token === "string" && body.token.trim()) return body.token.trim();
  const url = new URL(req.url ?? "", `http://${req.headers.host ?? "localhost"}`);
  return (url.searchParams.get("token") ?? "").trim();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST" && req.method !== "GET") {
    sendJson(res, 405, { error: "Método no permitido" });
    return;
  }

  if (!isDbConfigured()) {
    sendJson(res, 503, { error: "Servicio no disponible. Intente más tarde." });
    return;
  }

  try {
    const body =
      req.method === "POST" ? ((await parseJsonBody(req)) as { token?: string }) : {};
    const token = tokenFromRequest(req, body);
    if (!token) {
      sendJson(res, 400, { error: "Falta el enlace de baja." });
      return;
    }
    if (req.method === "GET") {
      sendJson(res, 200, { ok: true, pending: true });
      return;
    }
    const result = await unsubscribeByToken(token);
    if (!result.ok) {
      sendJson(res, 400, { error: result.error });
      return;
    }
    sendJson(res, 200, { ok: true, email: result.email });
  } catch (err) {
    console.error("api/unsubscribe", err);
    sendJson(res, 500, { error: "No se pudo completar la baja. Intente más tarde." });
  }
}
