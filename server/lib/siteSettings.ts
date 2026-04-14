/**
 * Site-wide CMS settings (hero, carousel, quick links, navigation).
 * Stored in site_settings table as key/value JSONB.
 */

import { getDb } from "./db.js";
import { deepFixMojibakeUtf8 } from "./utf8Mojibake.js";

const ALLOWED_KEYS = [
  "home_hero",
  "featured_carousel",
  "quick_links",
  "navigation",
  "gallery_albums",
  "directorio_autoridades",
  "grupos_trabajo",
  "boletines_gtai",
  "buenas_practicas_regulatorias",
  "comite_ejecutivo",
] as const;

export type SiteSettingKey = (typeof ALLOWED_KEYS)[number];

function isAllowedKey(key: string): key is SiteSettingKey {
  return (ALLOWED_KEYS as readonly string[]).includes(key);
}

export interface SiteSettingRow {
  key: string;
  value: unknown;
  updated_at: string;
}

/** Algunos clientes Postgres devuelven JSONB como string; normalizar a objeto/array. */
function normalizeJsonValue(val: unknown): unknown {
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as unknown;
    } catch {
      return val;
    }
  }
  return val;
}

/** Get one setting by key. Returns null if not found. */
export async function getSetting(key: string): Promise<{ key: string; value: unknown; updated_at: string } | null> {
  if (!isAllowedKey(key)) return null;
  const sql = getDb();
  const [row] = await sql<SiteSettingRow[]>`
    SELECT key, value, updated_at FROM site_settings WHERE key = ${key}
  `;
  if (!row) return null;
  const value = postProcessValue(row.key, normalizeJsonValue(row.value));
  return { key: row.key, value, updated_at: row.updated_at };
}

const ALLOWED_SET = new Set<string>(ALLOWED_KEYS);

/** Claves cuyo valor es texto CMS: aplicar reparación UTF-8 mal grabado (mojibake) al leer. */
const MOJIBAKE_FIX_KEYS = new Set<string>(["directorio_autoridades", "grupos_trabajo", "boletines_gtai", "buenas_practicas_regulatorias", "comite_ejecutivo"]);

function postProcessValue(key: string, value: unknown): unknown {
  if (!MOJIBAKE_FIX_KEYS.has(key)) return value;
  return deepFixMojibakeUtf8(value);
}

/** Get all allowed settings. Returns object key -> value. */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const sql = getDb();
  const rows = await sql<SiteSettingRow[]>`
    SELECT key, value, updated_at FROM site_settings
  `;
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    if (ALLOWED_SET.has(r.key)) {
      out[r.key] = postProcessValue(r.key, normalizeJsonValue(r.value));
    }
  }
  return out;
}

/** Set one setting. key must be in ALLOWED_KEYS. */
export async function setSetting(key: string, value: unknown): Promise<{ key: string; value: unknown; updated_at: string }> {
  if (!isAllowedKey(key)) {
    throw new Error(`Invalid site setting key: ${key}`);
  }
  const sql = getDb();
  const now = new Date().toISOString();
  const valueToStore = MOJIBAKE_FIX_KEYS.has(key) ? deepFixMojibakeUtf8(value) : value;
  const jsonValue = JSON.parse(JSON.stringify(valueToStore));
  const [row] = await sql<SiteSettingRow[]>`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${sql.json(jsonValue)}, ${now}::timestamptz)
    ON CONFLICT (key) DO UPDATE SET
      value = ${sql.json(jsonValue)},
      updated_at = ${now}::timestamptz
    RETURNING key, value, updated_at
  `;
  const outVal = postProcessValue(row.key, normalizeJsonValue(row.value));
  return { key: row.key, value: outVal, updated_at: row.updated_at };
}
