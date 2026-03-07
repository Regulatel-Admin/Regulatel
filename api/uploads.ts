import type { IncomingMessage, ServerResponse } from "http";
import { ensureAdmin } from "./lib/adminAuth.js";
import { deleteFromBlob, isBlobConfigured, uploadToBlob } from "./lib/blob.js";
import { parseJsonBody } from "./lib/parseBody.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!isBlobConfigured()) {
    sendJson(res, 503, { error: "Blob no configurado (BLOB_READ_WRITE_TOKEN)." });
    return;
  }

  try {
    if (req.method === "POST") {
      await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const kind = body.kind === "document" ? "document" : "image";
      const folder =
        body.folder === "events" ||
        body.folder === "documents" ||
        body.folder === "attachments"
          ? body.folder
          : "news";
      const fileName = typeof body.fileName === "string" ? body.fileName : "";
      const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";

      if (!fileName || !dataUrl) {
        sendJson(res, 400, { error: "Faltan datos del archivo." });
        return;
      }

      const uploaded = await uploadToBlob({
        kind,
        folder,
        fileName,
        dataUrl,
      });
      sendJson(res, 201, uploaded);
      return;
    }

    if (req.method === "DELETE") {
      await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const url = typeof body.url === "string" ? body.url : "";
      if (!url) {
        sendJson(res, 400, { error: 'Falta "url" para eliminar.' });
        return;
      }
      await deleteFromBlob(url);
      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/uploads", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, {
      error: err instanceof Error ? err.message : "Error interno en upload",
    });
  }
}
