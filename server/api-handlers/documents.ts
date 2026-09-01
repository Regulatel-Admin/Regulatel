/**
 * GET/POST /api/documents y GET/PATCH/DELETE /api/documents/:id
 */
import type { IncomingMessage, ServerResponse } from "http";
import { listDocuments, createDocument, getDocumentById, updateDocument, deleteDocument } from "../lib/documents.js";
import { ensureAdmin } from "../lib/adminAuth.js";
import { logAudit } from "../lib/auditLog.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getIdFromPath(req: IncomingMessage): string | null {
  const pathname = (req.url ?? "").split("?")[0];
  const parts = pathname.split("/").filter(Boolean);
  const i = parts.indexOf("documents");
  if (i === -1 || i + 1 >= parts.length) return null;
  return parts[i + 1] ?? null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const id = getIdFromPath(req);
  const isBase = id == null || id === "";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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
    if (isBase) {
      if (req.method === "GET") {
        const items = await listDocuments();
        sendJson(res, 200, items);
        return;
      }
      if (req.method === "POST") {
        const auth = await ensureAdmin(req);
        const body = (await parseJsonBody(req)) as Record<string, unknown>;
        const newId = typeof body.id === "string" ? body.id : "admin-doc-" + Date.now();
        const title = typeof body.title === "string" ? body.title : "";
        const url = typeof body.url === "string" ? body.url : "";
        const fileName = typeof body.fileName === "string" ? body.fileName : undefined;
        const fileType = typeof body.fileType === "string" ? body.fileType : undefined;
        const fileSize = typeof body.fileSize === "number" ? body.fileSize : undefined;
        const year = typeof body.year === "string" ? body.year : undefined;
        const quarter = typeof body.quarter === "string" ? body.quarter : undefined;
        const category = typeof body.category === "string" ? body.category : "otros";
        const coverImage = typeof body.coverImage === "string" ? body.coverImage : undefined;
        const item = await createDocument({
          id: newId,
          title,
          url,
          fileName,
          fileType,
          fileSize,
          year,
          quarter,
          category,
          coverImage,
        });
        await logAudit({
          userId: auth.user.id,
          userEmail: auth.user.email,
          userName: auth.user.name,
          action: "created",
          resourceType: "document",
          resourceId: item.id,
          details: { title: item.title },
        });
        sendJson(res, 201, item);
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

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
      const auth = await ensureAdmin(req);
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
        coverImage: typeof body.coverImage === "string" ? body.coverImage : undefined,
      });
      if (!item) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "updated",
        resourceType: "document",
        resourceId: id,
        details: { title: item.title },
      });
      sendJson(res, 200, item);
      return;
    }
    if (req.method === "DELETE") {
      const auth = await ensureAdmin(req);
      const ok = await deleteDocument(id);
      if (!ok) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "deleted",
        resourceType: "document",
        resourceId: id,
        details: {},
      });
      res.statusCode = 204;
      res.end();
      return;
    }
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/documents", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
