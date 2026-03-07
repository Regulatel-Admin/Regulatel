import type { IncomingMessage, ServerResponse } from "http";
import { listEvents, createEvent } from "../server/lib/events.js";
import { ensureAdmin } from "../server/lib/adminAuth.js";
import { logAudit } from "../server/lib/auditLog.js";
import { parseJsonBody } from "../server/lib/parseBody.js";
import { isDbConfigured } from "../server/lib/db.js";

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function getEventStatus(startDate: string, endDate: string | null): string {
  const ref = endDate ?? startDate;
  const today = new Date().toISOString().slice(0, 10);
  return ref >= today ? "upcoming" : "past";
}

function getEventYear(startDate: string): number {
  return new Date(startDate + "T12:00:00").getFullYear();
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
      const items = await listEvents();
      sendJson(res, 200, items);
      return;
    }
    if (req.method === "POST") {
      const auth = await ensureAdmin(req);
      const body = (await parseJsonBody(req)) as Record<string, unknown>;
      const title = typeof body.title === "string" ? body.title : "";
      const startDate = typeof body.startDate === "string" ? body.startDate : "";
      const endDate = typeof body.endDate === "string" ? body.endDate : (body.endDate === null ? null : undefined);
      const year = typeof body.year === "number" ? body.year : getEventYear(startDate);
      const status = getEventStatus(startDate, endDate ?? null);
      const id = typeof body.id === "string" ? body.id : `${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${year}-${Date.now()}`;
      const item = await createEvent({
        id,
        title,
        organizer: typeof body.organizer === "string" ? body.organizer : "",
        location: typeof body.location === "string" ? body.location : "",
        startDate,
        endDate: endDate ?? null,
        year,
        status,
        registrationUrl: typeof body.registrationUrl === "string" ? body.registrationUrl : null,
        detailsUrl: typeof body.detailsUrl === "string" ? body.detailsUrl : null,
        isFeatured: body.isFeatured === true,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
        description: typeof body.description === "string" ? body.description : undefined,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
        imageFileName: typeof body.imageFileName === "string" ? body.imageFileName : undefined,
        imageMimeType: typeof body.imageMimeType === "string" ? body.imageMimeType : undefined,
        imageSize: typeof body.imageSize === "number" ? body.imageSize : undefined,
      });
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "created",
        resourceType: "event",
        resourceId: item.id,
        details: { title: item.title },
      });
      sendJson(res, 201, item);
      return;
    }
    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("api/events", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
