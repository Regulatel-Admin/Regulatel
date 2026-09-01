/**
 * Visitas anónimas del sitio público.
 * No guarda IP, nombre ni correo: cookie anónima, ruta, país (cabecera de Vercel) y tipo de aparato.
 */

import crypto from "crypto";
import type { IncomingHttpHeaders } from "http";
import { getDb } from "./db.js";

const TZ = "America/Santo_Domingo";
const COOKIE_NAME = "regulatel_vid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const PATH_MAX = 180;

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|linkedinbot|whatsapp|telegram|preview|ahrefs|semrush|pingdom|uptimerobot|vercel-screenshot|bytespider/i;

export type PeriodCounts = { visitors: number; views: number };

export type AnalyticsDay = {
  date: string;
  visitors: number;
  views: number;
};

export type AnalyticsTopPage = {
  path: string;
  views: number;
  visitors: number;
};

export type AnalyticsBreakdown = {
  key: string;
  visitors: number;
  views: number;
};

export type AnalyticsRecentHit = {
  path: string;
  country: string | null;
  city: string | null;
  device: string | null;
  referrer: string | null;
  visitedAt: string;
};

export type AnalyticsStats = {
  timezone: string;
  generatedAt: string;
  today: PeriodCounts;
  yesterday: PeriodCounts;
  week: PeriodCounts;
  prevWeek: PeriodCounts;
  todayNew: number;
  todayReturning: number;
  days: AnalyticsDay[];
  topPages: AnalyticsTopPage[];
  countries: AnalyticsBreakdown[];
  referrers: AnalyticsBreakdown[];
  devices: AnalyticsBreakdown[];
  recent: AnalyticsRecentHit[];
};

let schemaEnsured: Promise<void> | null = null;

export async function ensureAnalyticsSchema() {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS page_views (
          id TEXT PRIMARY KEY,
          visitor_id TEXT NOT NULL,
          path TEXT NOT NULL,
          referrer TEXT,
          country TEXT,
          city TEXT,
          device TEXT,
          visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT`;
      await sql`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT`;
      await sql`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views (visited_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_visitor_at ON page_views (visitor_id, visited_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views (country)`;
    })().catch((err) => {
      schemaEnsured = null;
      throw err;
    });
  }
  await schemaEnsured;
}

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

export function getVisitorIdFromCookie(cookieHeader: string | undefined): string | null {
  const raw = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!raw || !/^[A-Za-z0-9_-]{8,80}$/.test(raw)) return null;
  return raw;
}

export function newVisitorId() {
  return crypto.randomUUID();
}

export function visitorCookieHeader(visitorId: string, secure: boolean) {
  const securePart = secure ? "Secure; " : "";
  return `${COOKIE_NAME}=${encodeURIComponent(visitorId)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax; ${securePart}`.trim();
}

export function isBotUserAgent(ua: string | undefined) {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

export function sanitizePath(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let path = input.trim();
  const q = path.indexOf("?");
  if (q >= 0) path = path.slice(0, q);
  const h = path.indexOf("#");
  if (h >= 0) path = path.slice(0, h);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > PATH_MAX) path = path.slice(0, PATH_MAX);
  if (path.startsWith("/admin") || path.startsWith("/api") || path === "/login") return null;
  if (!/^\/[A-Za-z0-9\-._/~%]*$/.test(path)) return null;
  return path;
}

export function sanitizeReferrer(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.host.slice(0, 180);
  } catch {
    return raw.startsWith("/") ? raw.slice(0, 180) : null;
  }
}

function headerValue(headers: IncomingHttpHeaders, name: string): string | null {
  const raw = headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function countryFromHeaders(headers: IncomingHttpHeaders): string | null {
  const raw =
    headerValue(headers, "x-vercel-ip-country") ||
    headerValue(headers, "cf-ipcountry") ||
    headerValue(headers, "x-country-code");
  if (!raw) return null;
  const code = raw.toUpperCase();
  if (code === "XX" || code === "T1") return null;
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

export function cityFromHeaders(headers: IncomingHttpHeaders): string | null {
  const raw = headerValue(headers, "x-vercel-ip-city");
  if (!raw) return null;
  let city = raw;
  try {
    city = decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    city = raw;
  }
  city = city.replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 80);
  return city || null;
}

export function deviceFromUserAgent(ua: string | undefined): "mobile" | "tablet" | "desktop" | null {
  if (!ua) return null;
  if (/iPad|Tablet|PlayBook/i.test(ua) && !/Mobile/i.test(ua)) return "tablet";
  if (/Mobi|Android.+Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile/i.test(ua)) return "mobile";
  return "desktop";
}

export async function recordPageView(input: {
  visitorId: string;
  path: string;
  referrer?: string | null;
  country?: string | null;
  city?: string | null;
  device?: string | null;
}): Promise<boolean> {
  await ensureAnalyticsSchema();
  const sql = getDb();
  const recent = await sql<{ id: string }[]>`
    SELECT id FROM page_views
    WHERE visitor_id = ${input.visitorId}
      AND path = ${input.path}
      AND visited_at > NOW() - INTERVAL '25 seconds'
    LIMIT 1
  `;
  if (recent.length > 0) return false;

  await sql`
    INSERT INTO page_views (id, visitor_id, path, referrer, country, city, device, visited_at)
    VALUES (
      ${crypto.randomUUID()},
      ${input.visitorId},
      ${input.path},
      ${input.referrer ?? null},
      ${input.country ?? null},
      ${input.city ?? null},
      ${input.device ?? null},
      NOW()
    )
  `;
  return true;
}

function emptyCounts(): PeriodCounts {
  return { visitors: 0, views: 0 };
}

function asCounts(row: { visitors?: number; views?: number } | undefined): PeriodCounts {
  if (!row) return emptyCounts();
  return {
    visitors: Number(row.visitors ?? 0),
    views: Number(row.views ?? 0),
  };
}

function asDayKey(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  }
  const text = String(value ?? "");
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : text.slice(0, 10);
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  await ensureAnalyticsSchema();
  const sql = getDb();

  const [today] = await sql<{ visitors: number; views: number }[]>`
    SELECT COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        = (NOW() AT TIME ZONE 'America/Santo_Domingo')::date
  `;
  const [yesterday] = await sql<{ visitors: number; views: number }[]>`
    SELECT COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        = (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 1
  `;
  const [week] = await sql<{ visitors: number; views: number }[]>`
    SELECT COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 6
  `;
  const [prevWeek] = await sql<{ visitors: number; views: number }[]>`
    SELECT COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 13
      AND (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        <= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 7
  `;
  const dayRows = await sql<{ day: string; visitors: number; views: number }[]>`
    WITH bounds AS (
      SELECT (NOW() AT TIME ZONE 'America/Santo_Domingo')::date AS today
    ),
    days AS (
      SELECT generate_series(today - 13, today, INTERVAL '1 day')::date AS day
      FROM bounds
    )
    SELECT
      to_char(days.day, 'YYYY-MM-DD') AS day,
      COUNT(pv.id)::int AS views,
      COUNT(DISTINCT pv.visitor_id)::int AS visitors
    FROM days
    LEFT JOIN page_views pv
      ON (pv.visited_at AT TIME ZONE 'America/Santo_Domingo')::date = days.day
    GROUP BY days.day
    ORDER BY days.day
  `;
  const topPages = await sql<AnalyticsTopPage[]>`
    SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 6
    GROUP BY path
    ORDER BY views DESC, visitors DESC
    LIMIT 12
  `;

  const [split] = await sql<{ new_visitors: number; returning_visitors: number }[]>`
    WITH today_ids AS (
      SELECT DISTINCT visitor_id
      FROM page_views
      WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
          = (NOW() AT TIME ZONE 'America/Santo_Domingo')::date
    )
    SELECT
      COUNT(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1 FROM page_views older
          WHERE older.visitor_id = today_ids.visitor_id
            AND (older.visited_at AT TIME ZONE 'America/Santo_Domingo')::date
                < (NOW() AT TIME ZONE 'America/Santo_Domingo')::date
        )
      )::int AS new_visitors,
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM page_views older
          WHERE older.visitor_id = today_ids.visitor_id
            AND (older.visited_at AT TIME ZONE 'America/Santo_Domingo')::date
                < (NOW() AT TIME ZONE 'America/Santo_Domingo')::date
        )
      )::int AS returning_visitors
    FROM today_ids
  `;
  const countryRows = await sql<{ key: string; visitors: number; views: number }[]>`
    SELECT COALESCE(country, '') AS key, COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 6
    GROUP BY 1
    ORDER BY visitors DESC, views DESC
    LIMIT 12
  `;
  const referrerRows = await sql<{ key: string; visitors: number; views: number }[]>`
    SELECT COALESCE(NULLIF(referrer, ''), '(directo)') AS key, COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 6
    GROUP BY 1
    ORDER BY visitors DESC, views DESC
    LIMIT 8
  `;
  const deviceRows = await sql<{ key: string; visitors: number; views: number }[]>`
    SELECT COALESCE(device, '') AS key, COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 6
      AND device IS NOT NULL
      AND device <> ''
    GROUP BY 1
    ORDER BY visitors DESC, views DESC
  `;
  const recentRows = await sql<
    { path: string; country: string | null; city: string | null; device: string | null; referrer: string | null; visited_at: Date }[]
  >`
    SELECT path, country, city, device, referrer, visited_at
    FROM page_views
    ORDER BY visited_at DESC
    LIMIT 16
  `;

  const days: AnalyticsDay[] = dayRows.map((row) => ({
    date: asDayKey(row.day),
    visitors: Number(row.visitors ?? 0),
    views: Number(row.views ?? 0),
  }));

  const toBreakdown = (rows: { key: string; visitors: number; views: number }[]): AnalyticsBreakdown[] =>
    rows.map((row) => ({
      key: row.key,
      visitors: Number(row.visitors ?? 0),
      views: Number(row.views ?? 0),
    }));

  return {
    timezone: TZ,
    generatedAt: new Date().toISOString(),
    today: asCounts(today),
    yesterday: asCounts(yesterday),
    week: asCounts(week),
    prevWeek: asCounts(prevWeek),
    todayNew: Number(split?.new_visitors ?? 0),
    todayReturning: Number(split?.returning_visitors ?? 0),
    days,
    topPages: topPages.map((row) => ({
      path: row.path,
      views: Number(row.views ?? 0),
      visitors: Number(row.visitors ?? 0),
    })),
    countries: toBreakdown(countryRows),
    referrers: toBreakdown(referrerRows),
    devices: toBreakdown(deviceRows),
    recent: recentRows.map((row) => ({
      path: row.path,
      country: row.country,
      city: row.city,
      device: row.device,
      referrer: row.referrer,
      visitedAt: row.visited_at instanceof Date ? row.visited_at.toISOString() : String(row.visited_at),
    })),
  };
}
