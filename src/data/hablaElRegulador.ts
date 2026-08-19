import { extractYoutubeId } from "@/lib/youtube";

export interface HablaElReguladorInterview {
  slug: string;
  episode: number;
  name: string;
  role: string;
  organization: string;
  country: string;
  countryCode: string;
  date?: string;
  duration: string;
  poster: string;
  youtubeId?: string;
  videoSrc?: string;
}

/**
 * Episodios finales de la serie. Los videos publicados se reproducen
 * desde YouTube.
 */
export const hablaElReguladorInterviews: HablaElReguladorInterview[] = [
  {
    slug: "angel-garcia-castillejo",
    episode: 5,
    name: "Ángel García Castillejo",
    role: "Vicepresidente",
    organization: "CNMC",
    country: "España",
    countryCode: "ES",
    date: "2026-07-06",
    duration: "16:14",
    poster: "/images/habla-el-regulador/angel-garcia-castillejo.jpg",
    youtubeId: "GfNp-AiYINU",
  },
  {
    slug: "felipe-diaz-suaza",
    episode: 4,
    name: "Felipe Augusto Díaz Suaza",
    role: "Director Ejecutivo",
    organization: "CRC",
    country: "Colombia",
    countryCode: "CO",
    date: "2026-07-03",
    duration: "21:20",
    poster: "/images/habla-el-regulador/felipe-diaz-suaza.jpg",
    youtubeId: "jEKPKg_0elM",
  },
  {
    slug: "raquel-brizida-castro",
    episode: 3,
    name: "Raquel Brízida Castro",
    role: "Vicepresidenta del Consejo de Administración",
    organization: "ANACOM",
    country: "Portugal",
    countryCode: "PT",
    date: "2026-07-03",
    duration: "14:47",
    poster: "/images/habla-el-regulador/raquel-brizida-castro.jpg",
    youtubeId: "SHhX94NcUKQ",
  },
  {
    slug: "jorge-hoyos-zavala",
    episode: 2,
    name: "Jorge Roberto Hoyos Zavala",
    role: "Director Ejecutivo",
    organization: "ARCOTEL",
    country: "Ecuador",
    countryCode: "EC",
    date: "2026-07-02",
    duration: "18:08",
    poster: "/images/habla-el-regulador/jorge-hoyos-zavala.jpg",
    youtubeId: "zbcEq7thoNM",
  },
  {
    slug: "guido-gomez-mazara",
    episode: 1,
    name: "Guido Gómez Mazara",
    role: "Presidente del Consejo Directivo y presidente de REGULATEL",
    organization: "INDOTEL",
    country: "República Dominicana",
    countryCode: "DO",
    duration: "13:01",
    poster: "/images/habla-el-regulador/guido-gomez-mazara.jpg",
    youtubeId: "1lEdh83SqeQ",
  },
];

export const HABLA_EL_REGULADOR_SETTINGS_KEY = "habla_el_regulador" as const;

function unwrapSettingJson(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

function parseInterview(row: unknown): HablaElReguladorInterview | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const slug = typeof r.slug === "string" ? r.slug.trim() : "";
  const name = typeof r.name === "string" ? r.name : "";
  if (!slug && !name) return null;
  const episode = typeof r.episode === "number" && Number.isFinite(r.episode) ? r.episode : 0;
  return {
    slug: slug || `entrevista-${episode || Date.now()}`,
    episode,
    name,
    role: typeof r.role === "string" ? r.role : "",
    organization: typeof r.organization === "string" ? r.organization : "",
    country: typeof r.country === "string" ? r.country : "",
    countryCode: typeof r.countryCode === "string" ? r.countryCode : "",
    date: typeof r.date === "string" && r.date.trim() ? r.date.trim() : undefined,
    duration: typeof r.duration === "string" ? r.duration : "",
    poster: typeof r.poster === "string" ? r.poster : "",
    youtubeId: typeof r.youtubeId === "string" ? extractYoutubeId(r.youtubeId) : undefined,
    videoSrc: typeof r.videoSrc === "string" && r.videoSrc.trim() ? r.videoSrc.trim() : undefined,
  };
}

export function parseHablaInterviewsFromSettingValue(value: unknown): HablaElReguladorInterview[] | null {
  const root = unwrapSettingJson(value);
  if (root == null) return null;
  const items = Array.isArray(root)
    ? root
    : root && typeof root === "object"
      ? (root as { interviews?: unknown }).interviews
      : null;
  if (!Array.isArray(items)) return null;
  const out: HablaElReguladorInterview[] = [];
  for (const row of items) {
    const parsed = parseInterview(row);
    if (parsed) out.push(parsed);
  }
  return out;
}

export const hablaElReguladorTeaser = {
  name: "Habla El Regulador",
  duration: "01:32",
  poster: "/images/habla-el-regulador/teaser-habla-el-regulador.jpg",
  videoSrc: "/videos/habla-el-regulador/teaser-habla-el-regulador.mp4",
};

/** Local flag files in /public/flags (when available). */
const LOCAL_FLAG_BY_CODE: Record<string, string> = {
  AR: "argentina.png",
  BO: "bolivia.png",
  BR: "brasil.png",
  CL: "chile.png",
  CO: "colombia.png",
  EC: "ecuador.png",
  MX: "mexico.png",
  PY: "paraguay.png",
  PE: "peru.png",
  DO: "rep_dominicana.png",
  UY: "uruguay.png",
};

/** Returns a reliable flag image URL (local first, CDN fallback). */
export function countryFlagSrc(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  const local = LOCAL_FLAG_BY_CODE[code];
  if (local) return `/flags/${local}`;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

/** @deprecated Use countryFlagSrc + <img>. Kept for compatibility. */
export function countryFlag(countryCode: string): string {
  return countryFlagSrc(countryCode);
}
