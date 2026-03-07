import type { IncomingMessage, ServerResponse } from "http";
import { listDocuments, createDocument } from "../server/lib/documents.js";
import { ensureAdmin } from "../server/lib/adminAuth.js";
import { logAudit } from "../server/lib/auditLog.js";
import { parseJsonBody } from "../server/lib/parseBody.js";
import { isDbConfigured } from "../server/lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
      const items = await listDocuments();
      sendJson(res, 200, items);
      return;
    }
    if (req.method === "POST") {
      const auth = await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const id = typeof body.id === "string" ? body.id : "admin-doc-" + Date.now();
      const title = typeof body.title === "string" ? body.title : "";
      const url = typeof body.url === "string" ? body.url : "";
      const fileName = typeof body.fileName === "string" ? body.fileName : undefined;
      const fileType = typeof body.fileType === "string" ? body.fileType : undefined;
      const fileSize = typeof body.fileSize === "number" ? body.fileSize : undefined;
      const year = typeof body.year === "string" ? body.year : undefined;
      const quarter = typeof body.quarter === "string" ? body.quarter : undefined;
      const category = typeof body.category === "string" ? body.category : "otros";
      const item = await createDocument({
        id,
        title,
        url,
        fileName,
        fileType,
        fileSize,
        year,
        quarter,
        category,
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
  } catch (err) {
    console.error("api/documents", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
