/**
 * Unificado: GET = verificar sesión, POST = login (email + contraseña).
 * Reduce una función serverless para cumplir límite Vercel Hobby (12).
 */
import type { IncomingMessage, ServerResponse } from "http";
import {
  ensureDocumentAccessSchema,
  findDocumentAccessUserByEmail,
  verifyDocumentAccessPassword,
  createDocumentAccessSession,
  setDocumentAccessCookie,
  getDocumentAccessSession,
} from "../server/lib/documentAccess.js";
import { parseJsonBody } from "../server/lib/parseBody.js";
import { isDbConfigured } from "../server/lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!isDbConfigured()) {
    sendJson(res, 503, req.method === "GET" ? { ok: false } : { error: "Servicio no disponible." });
    return;
  }

  try {
    if (req.method === "GET") {
      const session = await getDocumentAccessSession(req);
      sendJson(res, session ? 200 : 401, { ok: !!session });
      return;
    }
    if (req.method === "POST") {
      await ensureDocumentAccessSchema();
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const email = typeof body.email === "string" ? body.email.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!email || !password) {
        sendJson(res, 400, { ok: false, error: "Email y contraseña son obligatorios." });
        return;
      }
      const user = await findDocumentAccessUserByEmail(email);
      if (!user) {
        sendJson(res, 401, { ok: false, error: "Credenciales incorrectas." });
        return;
      }
      const valid = await verifyDocumentAccessPassword(user, password);
      if (!valid) {
        sendJson(res, 401, { ok: false, error: "Credenciales incorrectas." });
        return;
      }
      const token = await createDocumentAccessSession(user.id);
      setDocumentAccessCookie(res, token);
      sendJson(res, 200, { ok: true });
      return;
    }
    sendJson(res, 405, { error: "Método no permitido" });
  } catch (err) {
    console.error("api/document-access", err);
    sendJson(res, 500, req.method === "GET" ? { ok: false } : { error: "Error interno." });
  }
}
