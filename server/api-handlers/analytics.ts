import type { IncomingMessage, ServerResponse } from "http";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";
import {
  cityFromHeaders,
  countryFromHeaders,
  deviceFromUserAgent,
  getVisitorIdFromCookie,
  isBotUserAgent,
  newVisitorId,
  recordPageView,
  sanitizePath,
  sanitizeReferrer,
  visitorCookieHeader,
} from "../lib/analytics.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function isSecureRequest(req: IncomingMessage) {
  if (process.env.NODE_ENV === "production") return true;
  const proto = req.headers["x-forwarded-proto"];
  return proto === "https" || (Array.isArray(proto) && proto[0] === "https");
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Método no permitido" });
    return;
  }

  if (isBotUserAgent(req.headers["user-agent"])) {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!isDbConfigured()) {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const body = (await parseJsonBody(req)) as { path?: unknown; referrer?: unknown };
    const path = sanitizePath(body.path);
    if (!path) {
      res.statusCode = 204;
      res.end();
      return;
    }

    const visitorId = getVisitorIdFromCookie(req.headers.cookie) ?? newVisitorId();
    await recordPageView({
      visitorId,
      path,
      referrer: sanitizeReferrer(body.referrer),
      country: countryFromHeaders(req.headers),
      city: cityFromHeaders(req.headers),
      device: deviceFromUserAgent(req.headers["user-agent"]),
    });
    res.setHeader("Set-Cookie", visitorCookieHeader(visitorId, isSecureRequest(req)));
    res.statusCode = 204;
    res.end();
  } catch (err) {
    console.error("api/analytics", err);
    res.statusCode = 204;
    res.end();
  }
}
