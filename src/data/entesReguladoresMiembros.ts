/**
 * Entes reguladores — carousel "Miembros" (tarjetas por país).
 * Clave site_settings: { entes: EnteReguladorMiembro[] } bajo ENTES_MIEMBROS_SETTINGS_KEY.
 */

export interface EnteReguladorMiembro {
  /** Identificador estable para editar en el sitio. */
  id?: string;
  name: string;
  country: string;
  fullName?: string;
  /** Logo en carrusel (URL absoluta o blob); si falta, se usa el mapa local por ruta. */
  logoUrl?: string;
  /** Ruta interna de la ficha, ej. /siget o /enacom. Se crea al vuelo; no hace falta una página hardcodeada. */
  route: string;
  /** Sitio u página de referencia del ente. */
  externalUrl: string;
  /** Si es true, la tarjeta enlaza solo a externalUrl (nueva pestaña), sin ficha interna. Útil para nuevos miembros sin página propia aún. */
  linkExternalOnly?: boolean;
}

export const ENTES_MIEMBROS_SETTINGS_KEY = "entes_reguladores_miembros" as const;

/**
 * Slugs históricos o alternativos → clave canónica de ficha/logo.
 * SIGET se publicó durante años como /sit.
 */
export const ENTE_SLUG_ALIASES: Record<string, string> = {
  siget: "sit",
};

/** `/Siget/`, `siget` o una URL de este sitio → `/siget`. */
export function normalizeEnteInternalRoute(raw: string): string {
  const t = raw.trim();
  if (!t || t === "/") return "";
  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      const host = u.hostname.replace(/^www\./i, "").toLowerCase();
      const isThisSite =
        host === "regulatel.org" ||
        host.endsWith(".regulatel.org") ||
        host.endsWith(".vercel.app");
      if (!isThisSite) return "";
      const path = u.pathname.replace(/\/+$/, "");
      return path.toLowerCase();
    } catch {
      return "";
    }
  }
  const path = (t.startsWith("/") ? t : `/${t}`).split(/[?#]/)[0];
  return path.replace(/\/{2,}/g, "/").replace(/\/+$/, "").toLowerCase();
}

export function enteRouteSlug(route: string): string {
  return normalizeEnteInternalRoute(route).replace(/^\//, "");
}

export function canonicalEnteSlug(slugOrRoute: string): string {
  const slug = enteRouteSlug(slugOrRoute);
  return ENTE_SLUG_ALIASES[slug] || slug;
}

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

export function parseEntesMiembrosFromSettingValue(value: unknown): EnteReguladorMiembro[] | null {
  const root = unwrapSettingJson(value);
  if (root == null || typeof root !== "object") return null;
  const arr = (root as { entes?: unknown }).entes;
  if (!Array.isArray(arr)) return null;
  const out: EnteReguladorMiembro[] = [];
  for (const row of arr) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    const country = typeof r.country === "string" ? r.country.trim() : "";
    const route = typeof r.route === "string" ? r.route.trim() : "";
    const externalUrl = typeof r.externalUrl === "string" ? r.externalUrl.trim() : "";
    if (!name || !country || !externalUrl) continue;
    const logoUrlRaw = typeof r.logoUrl === "string" ? r.logoUrl.trim() : "";
    const id = typeof r.id === "string" ? r.id.trim() : "";
    out.push({
      id: id || undefined,
      name,
      country,
      fullName: typeof r.fullName === "string" ? r.fullName : undefined,
      logoUrl: logoUrlRaw || undefined,
      route: normalizeEnteInternalRoute(route) || "/",
      externalUrl,
      linkExternalOnly: r.linkExternalOnly === true,
    });
  }
  return out;
}

/** Lista por defecto (coincide con Miembros.tsx antes del CMS). */
export const defaultEntesReguladoresMiembros: EnteReguladorMiembro[] = [
  { name: "ENACOM", country: "Argentina", fullName: "Ente Nacional de Comunicaciones", route: "/enacom", externalUrl: "https://www.regulatel.org/enacom" },
  { name: "ATT", country: "Bolivia", fullName: "Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes", route: "/att", externalUrl: "https://www.regulatel.org/att" },
  { name: "ANATEL", country: "Brasil", fullName: "Agência Nacional de Telecomunicações", route: "/anatel", externalUrl: "https://www.regulatel.org/anatel" },
  { name: "SUBTEL", country: "Chile", fullName: "Subsecretaría de Telecomunicaciones", route: "/subtel", externalUrl: "https://www.regulatel.org/subtel" },
  { name: "CRC", country: "Colombia", fullName: "Comisión de Regulación de Comunicaciones", route: "/crc", externalUrl: "https://www.regulatel.org/crc" },
  { name: "SUTEL", country: "Costa Rica", fullName: "Superintendencia de Telecomunicaciones", route: "/sutel", externalUrl: "https://www.sutel.go.cr" },
  { name: "SIGET", country: "El Salvador", fullName: "Superintendencia General de Telecomunicaciones", route: "/siget", externalUrl: "https://www.siget.gob.sv" },
  { name: "ARCOTEL", country: "Ecuador", fullName: "Agencia de Regulación y Control de las Telecomunicaciones", route: "/arcotel", externalUrl: "https://www.arcotel.gob.ec" },
  { name: "MINCOM", country: "Cuba", fullName: "Ministerio de Comunicaciones", route: "/min-com", externalUrl: "https://www.mincom.gob.cu" },
  { name: "CNMC", country: "España", fullName: "Comisión Nacional de los Mercados y la Competencia", route: "/cnmc", externalUrl: "https://www.regulatel.org/cnmc" },
  { name: "CONATEL", country: "Guatemala", fullName: "Comisión Nacional de Telecomunicaciones", route: "/conatel-gt", externalUrl: "https://www.regulatel.org/conatel-gt" },
  { name: "CONATEL", country: "Honduras", fullName: "Comisión Nacional de Telecomunicaciones", route: "/conatel", externalUrl: "https://www.regulatel.org/conatel" },
  { name: "AGCOM", country: "Italia", fullName: "Autorità per le Garanzie nelle Comunicazioni", route: "/agcom", externalUrl: "https://www.regulatel.org/agcom" },
  { name: "CRT", country: "México", fullName: "Comisión Reguladora de Telecomunicaciones", route: "/ift", externalUrl: "https://www.regulatel.org/ift" },
  { name: "TELCOR", country: "Nicaragua", fullName: "Instituto Nicaraguense de Telecomunicaciones y Correo", route: "/telcor", externalUrl: "https://www.telcor.gob.ni" },
  { name: "ASEP", country: "Panamá", fullName: "Autoridad Nacional de los Servicios Públicos", route: "/asep", externalUrl: "https://www.asep.gob.pa" },
  { name: "CONATEL", country: "Paraguay", fullName: "Comisión Nacional de Telecomunicaciones", route: "/conatel-py", externalUrl: "https://www.conatel.gov.py" },
  { name: "OSIPTEL", country: "Perú", fullName: "Organismo Supervisor de Inversión Privada en Telecomunicaciones", route: "/osiptel", externalUrl: "https://www.osiptel.gob.pe" },
  { name: "ANACOM", country: "Portugal", fullName: "Autoridade Nacional de Comunicações", route: "/anacom", externalUrl: "https://www.anacom.pt" },
  { name: "NET", country: "Puerto Rico", fullName: "Negociado de Telecomunicaciones de Puerto Rico", route: "/net", externalUrl: "https://www.jrsp.pr.gov" },
  { name: "INDOTEL", country: "República Dominicana", fullName: "Instituto Dominicano de las Telecomunicaciones", route: "/indotel", externalUrl: "https://www.regulatel.org/indotel" },
  { name: "URSEC", country: "Uruguay", fullName: "Unidad Reguladora de Servicios de Comunicaciones", route: "/ursec", externalUrl: "https://www.ursec.gub.uy" },
  { name: "CONATEL", country: "Venezuela", fullName: "Comisión Nacional de Telecomunicaciones", route: "/conatel-ve", externalUrl: "https://www.conatel.gob.ve" },
];

export function stampEnteIds(list: EnteReguladorMiembro[]): EnteReguladorMiembro[] {
  return list.map((e, i) => ({
    ...e,
    id: e.id?.trim() || `ente-${e.route || "x"}--${e.country || "x"}--${i}`,
  }));
}
