import type { IncomingMessage, ServerResponse } from "http";
import { parseJsonBody } from "../lib/parseBody.js";
import { sendContactMessage } from "../lib/contactMessages.js";

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

  try {
    const body = (await parseJsonBody(req)) as Record<string, unknown>;
    const result = await sendContactMessage({
      name: typeof body.name === "string" ? body.name : "",
      email: typeof body.email === "string" ? body.email : "",
      organization: typeof body.organization === "string" ? body.organization : null,
      subject: typeof body.subject === "string" ? body.subject : "",
      message: typeof body.message === "string" ? body.message : "",
    });
    if (!result.ok) {
      sendJson(res, result.status, { error: result.error });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("api/contact", err);
    sendJson(res, 500, { error: "Error interno. Intente más tarde." });
  }
}
