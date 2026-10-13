import type { IncomingMessage, ServerResponse } from "http";
import { validateContactMessage } from "../lib/contactMessages.js";
import { contactReviewReasons, queueContactForReview, approveContactReview } from "../lib/contactReview.js";
import { preparePublicFormRequest, readPublicFormBody, protectForm, PublicFormError } from "../lib/formSecurity.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!preparePublicFormRequest(req, res, "POST")) return;

  try {
    const body = await readPublicFormBody(req);
    const validation = validateContactMessage({
      name: typeof body.name === "string" ? body.name : "",
      email: typeof body.email === "string" ? body.email : "",
      organization: typeof body.organization === "string" ? body.organization : null,
      subject: typeof body.subject === "string" ? body.subject : "",
      message: typeof body.message === "string" ? body.message : "",
    });
    if (!validation.ok) {
      sendJson(res, validation.status, { error: validation.error });
      return;
    }
    // Server-side verification is required for both delivery and quarantine.
    const protection = await protectForm(req, body, "contact");
    if (!protection.ok) {
      if (protection.retryAfter) res.setHeader("Retry-After", String(protection.retryAfter));
      if (protection.silent) sendJson(res, 200, { ok: true });
      else sendJson(res, protection.status, { error: protection.error });
      return;
    }

    const reasons = contactReviewReasons(validation.value);
    // Every valid message is durable before delivery, including normal contact.
    // A provider outage or an interrupted send never loses the visitor's text.
    const messageId = await queueContactForReview(validation.value, reasons);
    if (reasons.length > 0) {
      sendJson(res, 200, { ok: true });
      return;
    }
    const result = await approveContactReview(messageId, "system:public-contact");
    if (!result.ok) {
      sendJson(res, result.status === 503 ? 503 : 502, { error: "Su mensaje quedó guardado para revisión, pero no pudimos completar el envío por correo." });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (err) {
    if (err instanceof PublicFormError) {
      sendJson(res, err.status, { error: err.message });
      return;
    }
    console.error("api/contact: no se pudo procesar el formulario.");
    sendJson(res, 500, { error: "Error interno. Intente más tarde." });
  }
}
