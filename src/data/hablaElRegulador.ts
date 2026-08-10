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
