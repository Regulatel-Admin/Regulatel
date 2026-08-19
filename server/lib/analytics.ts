/**
 * Visitas anónimas del sitio público.
 * No guarda IP, nombre ni correo: solo un id de cookie y la ruta.
 */

import crypto from "crypto";
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

export type AnalyticsStats = {
  timezone: string;
  today: PeriodCounts;
  yesterday: PeriodCounts;
  week: PeriodCounts;
  prevWeek: PeriodCounts;
  days: AnalyticsDay[];
  topPages: AnalyticsTopPage[];
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
          visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views (visited_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_visitor_at ON page_views (visitor_id, visited_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path)`;
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

export async function recordPageView(input: {
  visitorId: string;
  path: string;
  referrer?: string | null;
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
    INSERT INTO page_views (id, visitor_id, path, referrer, visited_at)
    VALUES (
      ${crypto.randomUUID()},
      ${input.visitorId},
      ${input.path},
      ${input.referrer ?? null},
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
    SELECT
      ((visited_at AT TIME ZONE 'America/Santo_Domingo')::date)::text AS day,
      COUNT(*)::int AS views,
      COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE (visited_at AT TIME ZONE 'America/Santo_Domingo')::date
        >= (NOW() AT TIME ZONE 'America/Santo_Domingo')::date - 13
    GROUP BY 1
    ORDER BY 1
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

  const byDay = new Map(dayRows.map((row) => [row.day, row]));
  const days: AnalyticsDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const row = byDay.get(key);
    days.push({
      date: key,
      visitors: Number(row?.visitors ?? 0),
      views: Number(row?.views ?? 0),
    });
  }

  return {
    timezone: TZ,
    today: asCounts(today),
    yesterday: asCounts(yesterday),
    week: asCounts(week),
    prevWeek: asCounts(prevWeek),
    days,
    topPages: topPages.map((row) => ({
      path: row.path,
      views: Number(row.views ?? 0),
      visitors: Number(row.visitors ?? 0),
    })),
  };
}
