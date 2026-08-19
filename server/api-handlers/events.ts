/**
 * GET/POST /api/events y GET/PATCH/DELETE /api/events/:id
 */
import type { IncomingMessage, ServerResponse } from "http";
import { listEvents, createEvent, getEventById, updateEvent, deleteEvent } from "../lib/events.js";
import { ensureAdmin } from "../lib/adminAuth.js";
import { logAudit } from "../lib/auditLog.js";
import { parseJsonBody } from "../lib/parseBody.js";
import { isDbConfigured } from "../lib/db.js";

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

function getIdFromPath(req: IncomingMessage): string | null {
  const pathname = (req.url ?? "").split("?")[0];
  const parts = pathname.split("/").filter(Boolean);
  const i = parts.indexOf("events");
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
        const newId = typeof body.id === "string" ? body.id : `${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${year}-${Date.now()}`;
        const item = await createEvent({
          id: newId,
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
      return;
    }

    if (req.method === "GET") {
      const item = await getEventById(id);
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
      const item = await updateEvent(id, {
        title: typeof body.title === "string" ? body.title : undefined,
        organizer: typeof body.organizer === "string" ? body.organizer : undefined,
        location: typeof body.location === "string" ? body.location : undefined,
        startDate: typeof body.startDate === "string" ? body.startDate : undefined,
        endDate: body.endDate !== undefined ? (body.endDate === null ? null : (typeof body.endDate === "string" ? body.endDate : undefined)) : undefined,
        year: typeof body.year === "number" ? body.year : undefined,
        status: typeof body.status === "string" ? body.status : undefined,
        registrationUrl: body.registrationUrl !== undefined ? (body.registrationUrl === null ? null : (typeof body.registrationUrl === "string" ? body.registrationUrl : undefined)) : undefined,
        detailsUrl: body.detailsUrl !== undefined ? (body.detailsUrl === null ? null : (typeof body.detailsUrl === "string" ? body.detailsUrl : undefined)) : undefined,
        isFeatured: typeof body.isFeatured === "boolean" ? body.isFeatured : undefined,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
        imageFileName: typeof body.imageFileName === "string" ? body.imageFileName : undefined,
        imageMimeType: typeof body.imageMimeType === "string" ? body.imageMimeType : undefined,
        imageSize: typeof body.imageSize === "number" ? body.imageSize : undefined,
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
        resourceType: "event",
        resourceId: id,
        details: { title: item.title },
      });
      sendJson(res, 200, item);
      return;
    }
    if (req.method === "DELETE") {
      const auth = await ensureAdmin(req);
      const ok = await deleteEvent(id);
      if (!ok) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      await logAudit({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userName: auth.user.name,
        action: "deleted",
        resourceType: "event",
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
    console.error("api/events", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
