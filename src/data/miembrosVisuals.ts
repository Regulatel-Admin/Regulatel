import { canonicalEnteSlug, type EnteReguladorMiembro } from "@/data/entesReguladoresMiembros";

/** Logos locales del carrusel y del directorio (public/images/logos). */
export const enteLogoByRoute: Record<string, string> = {
  "sub-secretaria-telecom": "/images/logos/sub-secretaria-telecom.png",
  anatel: "/images/comite-ejecutivo/anatel.png",
  att: "/images/logos/att.png",
  enacom: "/images/logos/enacom.png",
  sutel: "/images/logos/sutel.png",
  "min-com": "/images/logos/min-com.png",
  agcom: "/images/logos/agcom.png",
  arcotel: "/images/logos/arcotel.png",
  crc: "/images/logos/crc.png",
  cnmc: "/images/logos/cnmc.png",
  sit: "/images/logos/sit.png",
  conatel: "/images/logos/conatel.png",
  indotel: "/images/logos/indotel.png",
  ift: "/images/logos/CRT-Mexico.png",
  subtel: "/images/logos/subtel.png",
  osiptel: "/images/logos/osiptel.png",
  "conatel-gt": "/images/logos/conatel-gt.png",
  "conatel-py": "/images/logos/conatel-py.png",
  anacom: "/images/logos/anacom.png",
  net: "/images/logos/net.png",
  ursec: "/images/logos/ursec.png",
  "conatel-ve": "/images/logos/conatel-ve.png",
  asep: "/images/logos/asep.png",
  telcor: "/images/logos/telcor.png",
};

const COUNTRY_ISO: Record<string, string> = {
  argentina: "ar",
  bolivia: "bo",
  brasil: "br",
  chile: "cl",
  colombia: "co",
  "costa rica": "cr",
  cuba: "cu",
  ecuador: "ec",
  "el salvador": "sv",
  espana: "es",
  guatemala: "gt",
  honduras: "hn",
  italia: "it",
  mexico: "mx",
  nicaragua: "ni",
  panama: "pa",
  paraguay: "py",
  peru: "pe",
  portugal: "pt",
  "puerto rico": "pr",
  "republica dominicana": "do",
  uruguay: "uy",
  venezuela: "ve",
};

/** Acrónimo del directorio → clave de logo, cuando no coincide con el nombre del ente. */
const ACRONYM_LOGO_KEY: Record<string, string> = {
  enacom: "enacom",
  att: "att",
  anatel: "anatel",
  subtel: "subtel",
  crc: "crc",
  sutel: "sutel",
  mincom: "min-com",
  arcotel: "arcotel",
  siget: "sit",
  cnmc: "cnmc",
  sit: "conatel-gt",
  agcom: "agcom",
  crt: "ift",
  telcor: "telcor",
  asep: "asep",
  osiptel: "osiptel",
  anacom: "anacom",
  net: "net",
  indotel: "indotel",
  ursec: "ursec",
  "conatel::honduras": "conatel",
  "conatel::paraguay": "conatel-py",
  "conatel::venezuela": "conatel-ve",
};

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function flagSrcFromCountryName(pais: string): string | undefined {
  const iso = COUNTRY_ISO[normalizeName(pais)];
  if (!iso) return undefined;
  return `https://flagcdn.com/w40/${iso}.png`;
}

export function logoKeyFromEnteRoute(route: string, name?: string): string {
  const fromRoute = canonicalEnteSlug(route);
  if (enteLogoByRoute[fromRoute]) return fromRoute;
  const fromName = canonicalEnteSlug(name ?? "");
  if (fromName && enteLogoByRoute[fromName]) return fromName;
  return fromRoute;
}

function logoFromRoute(route: string, logoUrl?: string, name?: string): string | undefined {
  const custom = logoUrl?.trim();
  if (custom) return custom;
  return enteLogoByRoute[logoKeyFromEnteRoute(route, name)];
}

export function logoSrcForDirectorio(
  acronym: string,
  pais: string,
  entes: EnteReguladorMiembro[]
): string | undefined {
  const acr = normalizeName(acronym);
  const country = normalizeName(pais);
  if (!acr) return undefined;

  const sameName = entes.filter((e) => normalizeName(e.name) === acr);
  const byCountry = sameName.find((e) => normalizeName(e.country) === country);
  const ente = byCountry ?? (sameName.length === 1 ? sameName[0] : undefined);
  if (ente) {
    const fromEnte = logoFromRoute(ente.route, ente.logoUrl, ente.name);
    if (fromEnte) return fromEnte;
  }

  const keyed = ACRONYM_LOGO_KEY[`${acr}::${country}`] ?? ACRONYM_LOGO_KEY[acr];
  return keyed ? enteLogoByRoute[keyed] : undefined;
}
