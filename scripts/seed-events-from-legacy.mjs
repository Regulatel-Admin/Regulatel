/**
 * Inserta eventos desde db/seed/events-legacy.json (misma fuente que el botón del admin).
 * @see server/lib/seedLegacyEvents.ts
 */
import "dotenv/config";
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function eventStatus(startDate, endDate) {
  const ref = endDate || startDate;
  const today = new Date().toISOString().slice(0, 10);
  return ref >= today ? "upcoming" : "past";
}

function eventYear(startDate) {
  const y = new Date(`${startDate}T12:00:00`).getFullYear();
  return Number.isNaN(y) ? new Date().getFullYear() : y;
}

function loadJson() {
  const p = path.join(__dirname, "..", "db", "seed", "events-legacy.json");
  if (!fs.existsSync(p)) {
    throw new Error(`No se encontró ${p}`);
  }
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("events-legacy.json debe ser un array");
  return data;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definido. Configúralo en .env o exporta la variable.");
  }

  const LEGACY_EVENTS = loadJson();
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
  });

  const now = new Date().toISOString();
  let inserted = 0;
  let skipped = 0;

  try {
    for (const e of LEGACY_EVENTS) {
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
    console.log(
      `Listo: ${inserted} evento(s) insertado(s), ${skipped} omitido(s) (ya existían). Total en JSON: ${LEGACY_EVENTS.length}.`
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
