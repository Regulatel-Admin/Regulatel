/**
 * Router único en la raíz de api/: atiende /api/* directamente en Vercel.
 * Ej: /api/admin/session, /api/news, /api/settings.
 */
import type { IncomingMessage, ServerResponse } from "http";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getPathSegments(req: IncomingMessage): string[] {
  const pathname = (req.url ?? "").split("?")[0];
  return pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const path = getPathSegments(req);
  const segment = path[0];

  try {
    if (segment === "health" || segment === undefined) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, api: true, message: "API routes are deployed." }));
      return;
    }

    if (segment === "settings") {
      const mod = await import("../server/api-handlers/settings.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "news") {
      const mod = await import("../server/api-handlers/news.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "events") {
      const mod = await import("../server/api-handlers/events.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "documents") {
      const mod = await import("../server/api-handlers/documents.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "cifras") {
      const mod = await import("../server/api-handlers/cifras.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "admin") {
      const mod = await import("../server/api-handlers/admin.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "uploads") {
      const mod = await import("../server/api-handlers/uploads.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "subscribe") {
      const mod = await import("../server/api-handlers/subscribe.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "contact") {
      const mod = await import("../server/api-handlers/contact.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "document-access-requests") {
      const mod = await import("../server/api-handlers/document-access-requests.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "document-access") {
      const mod = await import("../server/api-handlers/document-access.js");
      await mod.default(req, res);
      return;
    }

    sendJson(res, 404, { error: "Not Found", path: path.join("/") });
  } catch (err) {
    console.error("api/[[...path]]", segment, err);
    sendJson(res, 500, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
