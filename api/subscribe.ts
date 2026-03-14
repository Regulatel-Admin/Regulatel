import type { IncomingMessage, ServerResponse } from "http";
import { addSubscriber } from "../server/lib/subscribers.js";
import { parseJsonBody } from "../server/lib/parseBody.js";
import { isDbConfigured } from "../server/lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  if (!isDbConfigured()) {
    sendJson(res, 503, { error: "Servicio no disponible. Intente más tarde." });
    return;
  }

  try {
    const body = (await parseJsonBody(req)) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      sendJson(res, 400, { error: "El correo electrónico es obligatorio." });
      return;
    }

    const result = await addSubscriber(email);
    if (!result.ok) {
      sendJson(res, 409, { error: result.error });
      return;
    }
    sendJson(res, 201, { ok: true, message: "Gracias por suscribirte. Recibirás nuestras actualizaciones por correo." });
  } catch (err) {
    console.error("api/subscribe", err);
    sendJson(res, 500, { error: "Error al procesar la suscripción. Intente más tarde." });
  }
}
