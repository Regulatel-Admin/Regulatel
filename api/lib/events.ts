import { getDb } from "./db.js";

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
  tags: string[];
  description: string | null;
  image_url: string | null;
  image_file_name: string | null;
  image_mime_type: string | null;
  image_size: number | null;
  created_at: string;
  updated_at: string;
}

function rowToEvent(r: EventRow) {
  return {
    id: r.id,
    title: r.title,
    organizer: r.organizer,
    location: r.location,
    startDate: r.start_date,
    endDate: r.end_date,
    year: r.year,
    status: r.status as "upcoming" | "past",
    registrationUrl: r.registration_url,
    detailsUrl: r.details_url,
    isFeatured: r.is_featured,
    tags: Array.isArray(r.tags) ? r.tags : [],
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageFileName: r.image_file_name ?? undefined,
    imageMimeType: r.image_mime_type ?? undefined,
    imageSize: r.image_size ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listEvents(): Promise<ReturnType<typeof rowToEvent>[]> {
  const sql = getDb();
  const rows = await sql<EventRow[]>`
    SELECT id, title, organizer, location, start_date, end_date, year, status,
           registration_url, details_url, is_featured, tags, description, image_url,
           image_file_name, image_mime_type, image_size,
           created_at, updated_at
    FROM events
    ORDER BY start_date DESC
  `;
  return rows.map(rowToEvent);
}

export async function getEventById(id: string): Promise<ReturnType<typeof rowToEvent> | null> {
  const sql = getDb();
  const [row] = await sql<EventRow[]>`
    SELECT id, title, organizer, location, start_date, end_date, year, status,
           registration_url, details_url, is_featured, tags, description, image_url,
           image_file_name, image_mime_type, image_size,
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
  tags: string[];
  description?: string;
  imageUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
  imageSize?: number;
}

export async function createEvent(input: CreateEventInput): Promise<ReturnType<typeof rowToEvent>> {
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<EventRow[]>`
    INSERT INTO events (
      id, title, organizer, location, start_date, end_date, year, status,
      registration_url, details_url, is_featured, tags, description, image_url,
      image_file_name, image_mime_type, image_size,
      created_at, updated_at
    ) VALUES (
      ${input.id}, ${input.title}, ${input.organizer}, ${input.location},
      ${input.startDate}::date, ${input.endDate ?? null}::date, ${input.year}, ${input.status},
      ${input.registrationUrl ?? null}, ${input.detailsUrl ?? null}, ${input.isFeatured},
      ${JSON.stringify(input.tags)}::jsonb, ${input.description ?? null}, ${input.imageUrl ?? null},
      ${input.imageFileName ?? null}, ${input.imageMimeType ?? null}, ${input.imageSize ?? null},
      ${now}::timestamptz, ${now}::timestamptz
    )
    RETURNING id, title, organizer, location, start_date, end_date, year, status,
              registration_url, details_url, is_featured, tags, description, image_url,
              image_file_name, image_mime_type, image_size,
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
    tags: input.tags ?? existing.tags,
    description: input.description !== undefined ? input.description : existing.description,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl,
    imageFileName:
      input.imageFileName !== undefined ? input.imageFileName : existing.imageFileName,
    imageMimeType:
      input.imageMimeType !== undefined ? input.imageMimeType : existing.imageMimeType,
    imageSize: input.imageSize !== undefined ? input.imageSize : existing.imageSize,
  };
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<EventRow[]>`
    UPDATE events SET
      title = ${merged.title}, organizer = ${merged.organizer}, location = ${merged.location},
      start_date = ${merged.startDate}::date, end_date = ${merged.endDate ?? null}::date,
      year = ${merged.year}, status = ${merged.status},
      registration_url = ${merged.registrationUrl ?? null}, details_url = ${merged.detailsUrl ?? null},
      is_featured = ${merged.isFeatured}, tags = ${JSON.stringify(merged.tags)}::jsonb,
      description = ${merged.description ?? null}, image_url = ${merged.imageUrl ?? null},
      image_file_name = ${merged.imageFileName ?? null},
      image_mime_type = ${merged.imageMimeType ?? null},
      image_size = ${merged.imageSize ?? null},
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING id, title, organizer, location, start_date, end_date, year, status,
              registration_url, details_url, is_featured, tags, description, image_url,
              image_file_name, image_mime_type, image_size,
              created_at, updated_at
  `;
  return row ? rowToEvent(row) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM events WHERE id = ${id}`;
  return result.count > 0;
}
