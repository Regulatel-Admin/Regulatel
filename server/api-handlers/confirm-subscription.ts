import type { IncomingMessage, ServerResponse } from "http";
import { confirmSubscriber } from "../lib/subscribers.js";
import { notifyStaffNewSubscriber } from "../lib/subscribeMail.js";
import { isDbConfigured } from "../lib/db.js";
import {
  preparePublicFormRequest, protectConfirmation, PublicFormError, readPublicFormBody,
} from "../lib/formSecurity.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Email scanners opening a GET link must never activate subscriptions.
  if (!preparePublicFormRequest(req, res, "POST")) return;
  try {
    const body = await readPublicFormBody(req);
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      sendJson(res, 400, { error: "Este enlace de confirmación no es válido o ha vencido." });
      return;
    }
    const protection = await protectConfirmation(req);
    if (!protection.ok) {
      if (protection.retryAfter) res.setHeader("Retry-After", protection.retryAfter);
      sendJson(res, protection.status, { error: protection.error });
      return;
    }
    if (!isDbConfigured()) {
      sendJson(res, 503, { error: "Servicio no disponible. Intente más tarde." });
      return;
    }
    const result = await confirmSubscriber(token);
    if (!result.ok) {
      sendJson(res, 400, { error: result.error });
      return;
    }
    await notifyStaffNewSubscriber(result.subscriber);
    sendJson(res, 200, { ok: true, message: "Tu suscripción quedó confirmada. Ya puedes recibir las actualizaciones de REGULATEL." });
  } catch (err) {
    if (err instanceof PublicFormError) {
      sendJson(res, err.status, { error: err.message });
      return;
    }
    console.error("api/confirm-subscription", err instanceof Error ? err.name : "UnknownError");
    sendJson(res, 500, { error: "No se pudo confirmar la suscripción. Intente más tarde." });
  }
}
