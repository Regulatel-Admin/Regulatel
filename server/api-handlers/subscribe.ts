import type { IncomingMessage, ServerResponse } from "http";
import { addSubscriber } from "../lib/subscribers.js";
import { notifyStaffNewSubscriber, sendSubscriptionConfirmation } from "../lib/subscribeMail.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

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
    sendJson(res, 405, { error: "Método no permitido" });
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
      sendJson(res, 400, { error: result.error });
      return;
    }

    const { subscriber } = result;
    await sendSubscriptionConfirmation(subscriber);
    if (subscriber.created || subscriber.reactivated) {
      await notifyStaffNewSubscriber(subscriber);
    }

    sendJson(res, 201, {
      ok: true,
      alreadySubscribed: !subscriber.created && !subscriber.reactivated,
      message: subscriber.created
        ? "Gracias por suscribirte. Te enviamos un correo de confirmación."
        : subscriber.reactivated
          ? "Volvimos a activar tu suscripción. Te enviamos un correo de confirmación."
          : "Este correo ya estaba suscrito. Te reenviamos la confirmación.",
    });
  } catch (err) {
    console.error("api/subscribe", err);
    sendJson(res, 500, { error: "Error al procesar la suscripción. Intente más tarde." });
  }
}
