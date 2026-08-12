import type { IncomingMessage, ServerResponse } from "http";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";
import {
  createAccessRequest,
  decideAccessRequest,
  findRequestByToken,
  toPublicRequest,
} from "../lib/documentAccessRequests.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getSubpath(req: IncomingMessage): string {
  const pathname = (req.url ?? "").split("?")[0];
  const parts = pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  return parts.slice(1).join("/");
}

function getQuery(req: IncomingMessage): URLSearchParams {
  const q = (req.url ?? "").includes("?") ? (req.url ?? "").slice((req.url ?? "").indexOf("?") + 1) : "";
  return new URLSearchParams(q);
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

  if (!isDbConfigured()) {
    sendJson(res, 503, { error: "Servicio no disponible. Intente más tarde." });
    return;
  }

  const subpath = getSubpath(req);

  try {
    if (req.method === "GET") {
      const token = getQuery(req).get("token")?.trim() ?? "";
      if (!token) {
        sendJson(res, 400, { error: "Falta el token de la solicitud." });
        return;
      }
      const row = await findRequestByToken(token);
      if (!row) {
        sendJson(res, 404, { error: "El enlace no es válido o ya no existe." });
        return;
      }
      sendJson(res, 200, toPublicRequest(row));
      return;
    }

    if (req.method === "POST" && subpath === "decide") {
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const token = typeof body.token === "string" ? body.token.trim() : "";
      const action = body.action === "deny" ? "deny" : body.action === "approve" ? "approve" : null;
      if (!token || !action) {
        sendJson(res, 400, { error: "Token y acción (approve o deny) son obligatorios." });
        return;
      }
      const result = await decideAccessRequest(token, action);
      if (!result.ok) {
        sendJson(res, result.status, { error: result.error });
        return;
      }
      sendJson(res, 200, { ok: true, status: result.status, email: result.email, name: result.name });
      return;
    }

    if (req.method === "POST") {
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const result = await createAccessRequest({
        email: typeof body.email === "string" ? body.email : "",
        name: typeof body.name === "string" ? body.name : "",
        institution: typeof body.institution === "string" ? body.institution : null,
        position: typeof body.position === "string" ? body.position : null,
        country: typeof body.country === "string" ? body.country : null,
        documentId: typeof body.documentId === "string" ? body.documentId : null,
        documentTitle: typeof body.documentTitle === "string" ? body.documentTitle : null,
        collectionTipo: typeof body.collectionTipo === "string" ? body.collectionTipo : null,
      });
      if (!result.ok) {
        sendJson(res, result.status, { error: result.error });
        return;
      }
      sendJson(res, 201, {
        ok: true,
        message: "Solicitud enviada. Recibirá un correo cuando el administrador autorice o deniegue el acceso.",
      });
      return;
    }

    sendJson(res, 405, { error: "Método no permitido" });
  } catch (err) {
    console.error("api/document-access-requests", err);
    sendJson(res, 500, { error: "Error interno. Intente más tarde." });
  }
}
