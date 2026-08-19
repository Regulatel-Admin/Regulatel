/**
 * GET/POST/etc. /api/route?path=admin/session (o path=news, path=news/123, etc.)
 * Un solo archivo para que Vercel lo sirva sin depender de catch-all en subcarpeta.
 */
import type { IncomingMessage, ServerResponse } from "http";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getPathFromQuery(req: IncomingMessage): string[] {
  const url = req.url ?? "";
  const q = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
  const params = new URLSearchParams(q);
  const path = params.get("path") ?? "";
  return path.replace(/^\/+/, "").split("/").filter(Boolean);
}

function setReqUrl(req: IncomingMessage, pathSegments: string[]) {
  const pathStr = pathSegments.join("/");
  const url = req.url ?? "";
  const q = url.includes("?") ? url.slice(url.indexOf("?")) : "";
  (req as IncomingMessage & { url: string }).url = `/api/${pathStr}${q}`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const path = getPathFromQuery(req);
  const segment = path[0];

  try {
    if (segment === "health" || path.length === 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, api: true, message: "API route handler" }));
      return;
    }

    setReqUrl(req, path);

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

    if (segment === "analytics") {
      const mod = await import("../server/api-handlers/analytics.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "subscribe") {
      const mod = await import("../server/api-handlers/subscribe.js");
      await mod.default(req, res);
      return;
    }

    if (segment === "unsubscribe") {
      const mod = await import("../server/api-handlers/unsubscribe.js");
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
    console.error("api/route", segment, err);
    sendJson(res, 500, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
