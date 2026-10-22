import { getDb } from "./db.js";
import { parseContentBlocks, type ContentBlock } from "../../src/types/contentBlocks.js";
import { parseEventResources, type EventResources } from "../../src/types/event.js";

export interface EventAttachment {
  id: string;
  title: string;
  url: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface EventRow {
  id: string;
  title: string;
  organizer: string;
  location: string;
  start_date: string;
  end_date: string | null;
  year: number;
  status: string;
  registration_url: string | null;
  details_url: string | null;
  is_featured: boolean;
  published: boolean;
  content_blocks: unknown;
  resources: unknown;
  tags: string[];
  description: string | null;
  image_url: string | null;
  image_file_name: string | null;
  image_mime_type: string | null;
  image_size: number | null;
  attachments: unknown;
  created_at: string;
  updated_at: string;
}

let publicationSchemaReady: Promise<void> | undefined;
async function ensurePublicationSchema(): Promise<void> {
  publicationSchemaReady ??= (async () => {
    const sql = getDb();
    await sql`ALTER TABLE events
      ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS content_blocks JSONB,
      ADD COLUMN IF NOT EXISTS resources JSONB`;
  })().catch((error) => {
    publicationSchemaReady = undefined;
    throw error;
  });
  await publicationSchemaReady;
}

/**
 * postgres.js puede devolver columnas DATE como objetos Date o como ISO timestamps
 * ("2026-04-20T00:00:00.000Z"). Normalizamos siempre a "YYYY-MM-DD".
 */
function toDateStr(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  // "2026-04-20T..." → "2026-04-20"
  return s.length > 10 && s[10] === "T" ? s.slice(0, 10) : s;
}

function toDateStrOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const r = toDateStr(v);
  return r || null;
}

function parseAttachments(value: unknown): EventAttachment[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const o = item as Record<string, unknown>;
    const url = typeof o.url === "string" ? o.url.trim() : "";
    if (!url) return [];
    const title = typeof o.title === "string" ? o.title.trim() : "";
    return [
      {
        id: typeof o.id === "string" && o.id.trim() ? o.id.trim() : `att-${index + 1}`,
        title: title || "Documento",
        url,
        fileName: typeof o.fileName === "string" ? o.fileName : undefined,
        fileType: typeof o.fileType === "string" ? o.fileType : undefined,
        fileSize: typeof o.fileSize === "number" ? o.fileSize : undefined,
      },
    ];
  });
}

function rowToEvent(r: EventRow) {
  return {
    id: r.id,
    title: r.title,
    organizer: r.organizer,
    location: r.location,
    startDate: toDateStr(r.start_date),
    endDate: toDateStrOrNull(r.end_date),
    year: r.year,
    status: r.status as "upcoming" | "past",
    registrationUrl: r.registration_url,
    detailsUrl: r.details_url,
    isFeatured: r.is_featured,
    published: r.published !== false,
    contentBlocks: parseContentBlocks(r.content_blocks),
    resources: parseEventResources(r.resources),
    tags: Array.isArray(r.tags) ? r.tags : [],
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageFileName: r.image_file_name ?? undefined,
    imageMimeType: r.image_mime_type ?? undefined,
    imageSize: r.image_size ?? undefined,
    attachments: parseAttachments(r.attachments),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listEvents(): Promise<ReturnType<typeof rowToEvent>[]> {
  await ensurePublicationSchema();
  const sql = getDb();
  const rows = await sql<EventRow[]>`
    SELECT id, title, organizer, location, start_date, end_date, year, status,
           registration_url, details_url, is_featured, published, content_blocks, resources, tags, description, image_url,
           image_file_name, image_mime_type, image_size, attachments,
           created_at, updated_at
    FROM events
    ORDER BY start_date DESC
  `;
  return rows.map(rowToEvent);
}

export async function getEventById(id: string): Promise<ReturnType<typeof rowToEvent> | null> {
  await ensurePublicationSchema();
  const sql = getDb();
  const [row] = await sql<EventRow[]>`
    SELECT id, title, organizer, location, start_date, end_date, year, status,
           registration_url, details_url, is_featured, published, content_blocks, resources, tags, description, image_url,
           image_file_name, image_mime_type, image_size, attachments,
           created_at, updated_at
    FROM events WHERE id = ${id}
  `;
  return row ? rowToEvent(row) : null;
}

export interface CreateEventInput {
  id: string;
  title: string;
  organizer: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  year: number;
  status: string;
  registrationUrl?: string | null;
  detailsUrl?: string | null;
  isFeatured: boolean;
  published?: boolean;
  contentBlocks?: ContentBlock[];
  resources?: EventResources;
  tags: string[];
  description?: string;
  imageUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
  imageSize?: number;
  attachments?: EventAttachment[];
}

export async function createEvent(input: CreateEventInput): Promise<ReturnType<typeof rowToEvent>> {
  await ensurePublicationSchema();
  const sql = getDb();
  const now = new Date().toISOString();
  const attachments = parseAttachments(input.attachments);
  const [row] = await sql<EventRow[]>`
    INSERT INTO events (
      id, title, organizer, location, start_date, end_date, year, status,
      registration_url, details_url, is_featured, published, content_blocks, resources, tags, description, image_url,
      image_file_name, image_mime_type, image_size, attachments,
      created_at, updated_at
    ) VALUES (
      ${input.id}, ${input.title}, ${input.organizer}, ${input.location},
      ${input.startDate}::date, ${input.endDate ?? null}::date, ${input.year}, ${input.status},
      ${input.registrationUrl ?? null}, ${input.detailsUrl ?? null}, ${input.isFeatured}, ${input.published !== false},
      ${input.contentBlocks === undefined ? null : JSON.stringify(parseContentBlocks(input.contentBlocks))}::jsonb,
      ${input.resources === undefined ? null : JSON.stringify(parseEventResources(input.resources))}::jsonb,
      ${JSON.stringify(input.tags)}::jsonb, ${input.description ?? null}, ${input.imageUrl ?? null},
      ${input.imageFileName ?? null}, ${input.imageMimeType ?? null}, ${input.imageSize ?? null},
      ${JSON.stringify(attachments)}::jsonb,
      ${now}::timestamptz, ${now}::timestamptz
    )
    RETURNING id, title, organizer, location, start_date, end_date, year, status,
              registration_url, details_url, is_featured, published, content_blocks, resources, tags, description, image_url,
              image_file_name, image_mime_type, image_size, attachments,
              created_at, updated_at
  `;
  return rowToEvent(row);
}

export async function updateEvent(
  id: string,
  input: Partial<Omit<CreateEventInput, "id">>
): Promise<ReturnType<typeof rowToEvent> | null> {
  const existing = await getEventById(id);
  if (!existing) return null;
  const merged = {
    title: input.title ?? existing.title,
    organizer: input.organizer ?? existing.organizer,
    location: input.location ?? existing.location,
    startDate: input.startDate ?? existing.startDate,
    endDate: input.endDate !== undefined ? input.endDate : existing.endDate,
    year: input.year ?? existing.year,
    status: input.status ?? existing.status,
    registrationUrl: input.registrationUrl !== undefined ? input.registrationUrl : existing.registrationUrl,
    detailsUrl: input.detailsUrl !== undefined ? input.detailsUrl : existing.detailsUrl,
    isFeatured: input.isFeatured ?? existing.isFeatured,
    published: input.published ?? existing.published,
    contentBlocks: input.contentBlocks !== undefined ? parseContentBlocks(input.contentBlocks) : existing.contentBlocks,
    resources: input.resources !== undefined ? parseEventResources(input.resources) : existing.resources,
    tags: input.tags ?? existing.tags,
    description: input.description !== undefined ? input.description : existing.description,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl,
    imageFileName:
      input.imageFileName !== undefined ? input.imageFileName : existing.imageFileName,
    imageMimeType:
      input.imageMimeType !== undefined ? input.imageMimeType : existing.imageMimeType,
    imageSize: input.imageSize !== undefined ? input.imageSize : existing.imageSize,
    attachments: input.attachments !== undefined ? parseAttachments(input.attachments) : existing.attachments,
  };
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<EventRow[]>`
    UPDATE events SET
      title = ${merged.title}, organizer = ${merged.organizer}, location = ${merged.location},
      start_date = ${merged.startDate}::date, end_date = ${merged.endDate ?? null}::date,
      year = ${merged.year}, status = ${merged.status},
      registration_url = ${merged.registrationUrl ?? null}, details_url = ${merged.detailsUrl ?? null},
      is_featured = ${merged.isFeatured}, published = ${merged.published}, tags = ${JSON.stringify(merged.tags)}::jsonb,
      description = ${merged.description ?? null}, image_url = ${merged.imageUrl ?? null},
      image_file_name = ${merged.imageFileName ?? null},
      image_mime_type = ${merged.imageMimeType ?? null},
      image_size = ${merged.imageSize ?? null},
      attachments = ${JSON.stringify(merged.attachments)}::jsonb,
      content_blocks = ${merged.contentBlocks === undefined ? null : JSON.stringify(merged.contentBlocks)}::jsonb,
      resources = ${merged.resources === undefined ? null : JSON.stringify(merged.resources)}::jsonb,
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING id, title, organizer, location, start_date, end_date, year, status,
              registration_url, details_url, is_featured, published, content_blocks, resources, tags, description, image_url,
              image_file_name, image_mime_type, image_size, attachments,
              created_at, updated_at
  `;
  return row ? rowToEvent(row) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM events WHERE id = ${id}`;
  return result.count > 0;
}
