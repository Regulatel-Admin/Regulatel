/**
 * Site-wide CMS settings (hero, carousel, quick links, navigation).
 * Stored in site_settings table as key/value JSONB.
 */

import { getDb } from "./db.js";

const ALLOWED_KEYS = [
  "home_hero",
  "featured_carousel",
  "quick_links",
  "navigation",
  "gallery_albums",
  "directorio_autoridades",
  "grupos_trabajo",
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
  return { key: row.key, value: normalizeJsonValue(row.value), updated_at: row.updated_at };
}

const ALLOWED_SET = new Set<string>(ALLOWED_KEYS);

/** Get all allowed settings. Returns object key -> value. */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const sql = getDb();
  const rows = await sql<SiteSettingRow[]>`
    SELECT key, value, updated_at FROM site_settings
  `;
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    if (ALLOWED_SET.has(r.key)) out[r.key] = normalizeJsonValue(r.value);
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
  const [row] = await sql<SiteSettingRow[]>`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${now}::timestamptz)
    ON CONFLICT (key) DO UPDATE SET
      value = ${JSON.stringify(value)}::jsonb,
      updated_at = ${now}::timestamptz
    RETURNING key, value, updated_at
  `;
  return { key: row.key, value: row.value, updated_at: row.updated_at };
}
