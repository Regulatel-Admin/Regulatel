import type { IncomingMessage, ServerResponse } from "http";
import { getEventById, updateEvent, deleteEvent } from "../../server/lib/events.js";
import { ensureAdmin } from "../../server/lib/adminAuth.js";
import { logAudit } from "../../server/lib/auditLog.js";
import { parseJsonBody } from "../../server/lib/parseBody.js";
import { isDbConfigured } from "../../server/lib/db.js";

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
    console.error("api/events/[id]", err);
    const status = err instanceof Error && err.name === "UnauthorizedError" ? 401 : 500;
    sendJson(res, status, { error: err instanceof Error ? err.message : "Internal server error" });
  }
}
