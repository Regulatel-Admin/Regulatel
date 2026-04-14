/**
 * Inserta eventos por defecto desde db/seed/events-legacy.json (mismo listado que el seed estático del front).
 * ON CONFLICT (id) DO NOTHING — no pisa filas ya existentes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "./db.js";

export interface LegacyEventJsonRow {
  id: string;
  title: string;
  organizer: string;
  location: string;
  startDate: string;
  endDate: string | null;
  registrationUrl: string | null;
  detailsUrl: string | null;
  isFeatured: boolean;
  tags: string[];
  description?: string;
  imageUrl?: string;
}

function eventStatus(startDate: string, endDate: string | null): string {
  const ref = endDate || startDate;
  const today = new Date().toISOString().slice(0, 10);
  return ref >= today ? "upcoming" : "past";
}

function eventYear(startDate: string): number {
  const y = new Date(`${startDate}T12:00:00`).getFullYear();
  return Number.isNaN(y) ? new Date().getFullYear() : y;
}

function resolveJsonPath(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(process.cwd(), "db", "seed", "events-legacy.json"),
    path.join(dirname, "..", "..", "db", "seed", "events-legacy.json"),
    path.join(dirname, "..", "..", "..", "db", "seed", "events-legacy.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No se encontró db/seed/events-legacy.json");
}

export function loadLegacyEventsFromDisk(): LegacyEventJsonRow[] {
  const raw = fs.readFileSync(resolveJsonPath(), "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("events-legacy.json debe ser un array");
  return parsed as LegacyEventJsonRow[];
}

export async function seedLegacyEventsIfMissing(): Promise<{
  inserted: number;
  skipped: number;
  total: number;
}> {
  const rows = loadLegacyEventsFromDisk();
  const sql = getDb();
  const now = new Date().toISOString();
  let inserted = 0;
  let skipped = 0;

  for (const e of rows) {
    const status = eventStatus(e.startDate, e.endDate ?? null);
    const year = eventYear(e.startDate);
    const result = await sql`
      INSERT INTO events (
        id, title, organizer, location, start_date, end_date, year, status,
        registration_url, details_url, is_featured, tags, description, image_url,
        image_file_name, image_mime_type, image_size,
        created_at, updated_at
      ) VALUES (
        ${e.id},
        ${e.title},
        ${e.organizer},
        ${e.location},
        ${e.startDate}::date,
        ${e.endDate ?? null}::date,
        ${year},
        ${status},
        ${e.registrationUrl ?? null},
        ${e.detailsUrl ?? null},
        ${e.isFeatured ?? false},
        ${sql.json(Array.isArray(e.tags) ? e.tags : [])},
        ${e.description ?? null},
        ${e.imageUrl ?? null},
        ${null},
        ${null},
        ${null},
        ${now}::timestamptz,
        ${now}::timestamptz
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    if (result.length) inserted += 1;
    else skipped += 1;
  }

  return { inserted, skipped, total: rows.length };
}
