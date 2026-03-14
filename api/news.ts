import type { IncomingMessage, ServerResponse } from "http";
import { listNews, createNews } from "../server/lib/news.js";
import { ensureAdmin } from "../server/lib/adminAuth.js";
import { logAudit } from "../server/lib/auditLog.js";
import { parseJsonBody } from "../server/lib/parseBody.js";
import { isDbConfigured } from "../server/lib/db.js";
import { notifySubscribersNewContent } from "../server/lib/sendNewsletter.js";

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
      const items = await listNews();
      sendJson(res, 200, items);
      return;
    }
    if (req.method === "POST") {
      const auth = await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const id = typeof body.id === "string" ? body.id : "admin-" + Date.now();
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
        id,
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
      if (item.published) {
        void notifySubscribersNewContent({
          type: "noticia",
          title: item.title,
          excerpt: item.excerpt,
          url: `/noticias/${item.slug}`,
          date: item.dateFormatted || item.date,
        }).then((r) => r.sent > 0 && console.log("[news] Notificación enviada a", r.sent, "suscriptores."));
      }
      sendJson(res, 201, item);
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
