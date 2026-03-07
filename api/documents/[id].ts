import type { IncomingMessage, ServerResponse } from "http";
import { getDocumentById, updateDocument, deleteDocument } from "../lib/documents.js";
import { ensureAdmin } from "../lib/adminAuth.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getIdFromUrl(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1]?.split("?")[0] ?? "";
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const id = getIdFromUrl(req.url ?? "");
  if (!id) {
    sendJson(res, 400, { error: "Missing id" });
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!isDbConfigured()) {
    sendJson(res, 503, { error: "Database not configured (DATABASE_URL)" });
    return;
  }

  try {
    if (req.method === "GET") {
      const item = await getDocumentById(id);
      if (!item) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      sendJson(res, 200, item);
      return;
    }
    if (req.method === "PATCH") {
      await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const item = await updateDocument(id, {
        title: typeof body.title === "string" ? body.title : undefined,
        url: typeof body.url === "string" ? body.url : undefined,
        fileName: typeof body.fileName === "string" ? body.fileName : undefined,
        fileType: typeof body.fileType === "string" ? body.fileType : undefined,
        fileSize: typeof body.fileSize === "number" ? body.fileSize : undefined,
        year: typeof body.year === "string" ? body.year : undefined,
        quarter: typeof body.quarter === "string" ? body.quarter : undefined,
        category: typeof body.category === "string" ? body.category : undefined,
      });
      if (!item) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      sendJson(res, 200, item);
      return;
    }
    if (req.method === "DELETE") {
      await ensureAdmin(req);
      const ok = await deleteDocument(id);
      if (!ok) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      res.statusCode = 204;
      res.end();
      return;
    }
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/documents/[id]", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
