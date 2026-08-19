/**
 * GET/POST /api/news y GET/PATCH/DELETE /api/news/:id
 */
import type { IncomingMessage, ServerResponse } from "http";
import { listNews, createNews, getNewsById, updateNews, deleteNews } from "../lib/news.js";
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
  const i = parts.indexOf("news");
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
        const items = await listNews();
        sendJson(res, 200, items);
        return;
      }
      if (req.method === "POST") {
        const auth = await ensureAdmin(req);
        const body = (await parseJsonBody(req)) as Record<string, unknown>;
        const newId = typeof body.id === "string" ? body.id : "admin-" + Date.now();
        const slug = typeof body.slug === "string" ? body.slug : "";
        const title = typeof body.title === "string" ? body.title : "";
        const date = typeof body.date === "string" ? body.date : new Date().toISOString().slice(0, 10);
        const dateFormatted = typeof body.dateFormatted === "string" ? body.dateFormatted : date;
        const category = typeof body.category === "string" ? body.category : "Noticias";
        const excerpt = typeof body.excerpt === "string" ? body.excerpt : "";
        const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
        const imageFileName = typeof body.imageFileName === "string" ? body.imageFileName : undefined;
        const imageMimeType = typeof body.imageMimeType === "string" ? body.imageMimeType : undefined;
        const imageSize = typeof body.imageSize === "number" ? body.imageSize : undefined;
        const additionalImages = Array.isArray(body.additionalImages) ? (body.additionalImages as string[]) : [];
        const additionalImageNames = Array.isArray(body.additionalImageNames) ? (body.additionalImageNames as (string | undefined)[]) : [];
        const additionalImageMeta = Array.isArray(body.additionalImageMeta)
          ? (body.additionalImageMeta as Array<{ fileName?: string; mimeType?: string; size?: number }>)
          : [];
        const bodyText = typeof body.content === "string" ? body.content : (typeof body.body === "string" ? body.body : "");
        const author = typeof body.author === "string" ? body.author : undefined;
        const link = typeof body.link === "string" ? body.link : undefined;
        const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl : undefined;
        const published = body.published !== false;
        const item = await createNews({
          id: newId,
          slug,
          title,
          date,
          dateFormatted,
          category,
          excerpt,
          imageUrl,
          imageFileName,
          imageMimeType,
          imageSize,
          additionalImages,
          additionalImageNames,
          additionalImageMeta,
          body: bodyText,
          author,
          link,
          videoUrl,
          published,
        });
        await logAudit({
          userId: auth.user.id,
          userEmail: auth.user.email,
          userName: auth.user.name,
          action: "created",
          resourceType: "news",
          resourceId: item.id,
          details: { title: item.title, slug: item.slug },
        });
        sendJson(res, 201, item);
        return;
      }
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

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
      const auth = await ensureAdmin(req);
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
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "updated",
        resourceType: "news",
        resourceId: id,
        details: { title: item.title },
      });
      sendJson(res, 200, item);
      return;
    }
    if (req.method === "DELETE") {
      const auth = await ensureAdmin(req);
      const existing = await getNewsById(id);
      const title = existing?.title ?? null;
      const ok = await deleteNews(id);
      if (!ok) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "deleted",
        resourceType: "news",
        resourceId: id,
        details: title != null ? { title } : {},
      });
      res.statusCode = 204;
      res.end();
      return;
    }
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/news", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
