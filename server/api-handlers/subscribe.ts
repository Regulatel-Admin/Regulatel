import type { IncomingMessage, ServerResponse } from "http";
import { addSubscriber, revokePendingConfirmation } from "../lib/subscribers.js";
import { sendSubscriptionConfirmation } from "../lib/subscribeMail.js";
import { isDbConfigured } from "../lib/db.js";
import {
  isValidPublicEmail, preparePublicFormRequest, protectForm, PublicFormError, readPublicFormBody,
} from "../lib/formSecurity.js";

const SUBSCRIPTION_RESPONSE = {
  ok: true,
  message: "Si corresponde, recibirás un correo para confirmar tu suscripción. Revisa también la carpeta de correo no deseado.",
};

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!preparePublicFormRequest(req, res, "POST")) return;
  try {
    const body = await readPublicFormBody(req);
    const protection = await protectForm(req, body, "subscribe");
    if (!protection.ok) {
      if (protection.silent) {
        sendJson(res, 200, SUBSCRIPTION_RESPONSE);
      } else {
        if (protection.retryAfter) res.setHeader("Retry-After", protection.retryAfter);
        sendJson(res, protection.status, { error: protection.error });
      }
      return;
    }
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!isValidPublicEmail(email)) {
      sendJson(res, 400, { error: "Indique un correo electrónico válido." });
      return;
    }
    if (body.consent !== true) {
      sendJson(res, 400, { error: "Debe aceptar recibir las actualizaciones de REGULATEL." });
      return;
    }
    if (!isDbConfigured()) {
      sendJson(res, 503, { error: "Servicio no disponible. Intente más tarde." });
      return;
    }
    const result = await addSubscriber(email);
    if (!result.ok) {
      sendJson(res, 400, { error: result.error });
      return;
    }
    if (result.confirmationToken) {
      const mail = await sendSubscriptionConfirmation(result.subscriber, result.confirmationToken);
      if (!mail.ok) {
        if (!mail.uncertain) await revokePendingConfirmation(result.confirmationToken);
        sendJson(res, 503, { error: mail.uncertain
          ? "No pudimos confirmar el envío. Revise su correo antes de volver a intentar."
          : mail.error });
        return;
      }
    }
    sendJson(res, 200, SUBSCRIPTION_RESPONSE);
  } catch (err) {
    if (err instanceof PublicFormError) {
      sendJson(res, err.status, { error: err.message });
      return;
    }
    console.error("api/subscribe", err instanceof Error ? err.name : "UnknownError");
    sendJson(res, 500, { error: "Error al procesar la suscripción. Intente más tarde." });
  }
}
