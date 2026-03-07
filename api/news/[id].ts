import type { IncomingMessage, ServerResponse } from "http";
import { getNewsById, updateNews, deleteNews } from "../lib/news.js";
import { ensureAdmin } from "../lib/adminAuth.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? "";
  const id = url.split("/").pop()?.split("?")[0] ?? "";
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
      const item = await getNewsById(id);
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
      const item = await updateNews(id, {
        slug: typeof body.slug === "string" ? body.slug : undefined,
        title: typeof body.title === "string" ? body.title : undefined,
        date: typeof body.date === "string" ? body.date : undefined,
        dateFormatted: typeof body.dateFormatted === "string" ? body.dateFormatted : undefined,
        category: typeof body.category === "string" ? body.category : undefined,
        excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
        imageFileName: typeof body.imageFileName === "string" ? body.imageFileName : undefined,
        imageMimeType: typeof body.imageMimeType === "string" ? body.imageMimeType : undefined,
        imageSize: typeof body.imageSize === "number" ? body.imageSize : undefined,
        additionalImages: Array.isArray(body.additionalImages) ? body.additionalImages as string[] : undefined,
        additionalImageNames: Array.isArray(body.additionalImageNames) ? body.additionalImageNames as (string | undefined)[] : undefined,
        additionalImageMeta: Array.isArray(body.additionalImageMeta)
          ? (body.additionalImageMeta as Array<{ fileName?: string; mimeType?: string; size?: number }>)
          : undefined,
        body: typeof body.content === "string" ? body.content : (typeof body.body === "string" ? body.body : undefined),
        author: typeof body.author === "string" ? body.author : undefined,
        link: typeof body.link === "string" ? body.link : undefined,
        videoUrl: typeof body.videoUrl === "string" ? body.videoUrl : undefined,
        published: typeof body.published === "boolean" ? body.published : undefined,
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
      const ok = await deleteNews(id);
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
    console.error("api/news/[id]", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
