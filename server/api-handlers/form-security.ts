import type { IncomingMessage, ServerResponse } from "node:http";
import { createFormConfiguration, preparePublicFormRequest, PublicFormError } from "../lib/formSecurity.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!preparePublicFormRequest(req, res, "GET")) return;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const action = new URL(req.url || "/", "https://www.regulatel.org").searchParams.get("action");
  if (action !== "contact" && action !== "subscribe") {
    res.statusCode = 400; res.end(JSON.stringify({ error: "Formulario no válido." })); return;
  }
  try { res.statusCode = 200; res.end(JSON.stringify(createFormConfiguration(action))); }
  catch (error) {
    res.statusCode = error instanceof PublicFormError ? error.status : 503;
    res.end(JSON.stringify({ error: "La verificación del formulario no está disponible. Intente más tarde." }));
  }
}
