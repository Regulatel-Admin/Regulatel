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
 * Episodios finales de la serie. Los cinco videos publicados se reproducen
 * desde YouTube; los dos restantes usan copias web optimizadas del archivo
 * maestro entregado por REGULATEL.
 */
export const hablaElReguladorInterviews: HablaElReguladorInterview[] = [
  {
    slug: "johnny-marchan-pena",
    episode: 7,
    name: "Johnny Marchán Peña",
    role: "Gerente General",
    organization: "OSIPTEL",
    country: "Perú",
    countryCode: "PE",
    date: "2026-07-15",
    duration: "27:38",
    poster: "/images/habla-el-regulador/johnny-marchan-pena.jpg",
    videoSrc: "/videos/habla-el-regulador/johnny-marchan-pena.mp4",
  },
  {
    slug: "carlos-watson-carazo",
    episode: 6,
    name: "Carlos Watson Carazo",
    role: "Presidente del Consejo",
    organization: "SUTEL",
    country: "Costa Rica",
    countryCode: "CR",
    date: "2026-07-14",
    duration: "17:50",
    poster: "/images/habla-el-regulador/carlos-watson-carazo.jpg",
    videoSrc: "/videos/habla-el-regulador/carlos-watson-carazo.mp4",
  },
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

export function countryFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/[A-Z]/g, (letter) =>
      String.fromCodePoint(127397 + letter.charCodeAt(0)),
    );
}
