/**
 * Datos unificados para la página "Buenas Prácticas Regulatorias".
 * Origen: países de countries.ts + enlaces por categoría de sources.ts (countryCategorySources).
 * Estructura: país → categorías → enlaces.
 */

import { countries } from "@/data/buenasPracticas/countries";
import { countryCategorySources } from "@/data/buenasPracticas/sources";
import type { Category } from "@/data/buenasPracticas/countries";

export interface PracticeLink {
  title: string;
  url: string;
}

export interface CategoryWithLinks {
  name: Category | string;
  links: PracticeLink[];
}

export interface CountryPracticesData {
  countryId: string;
  name: string;
  slug: string;
  flag: string;
  categories: CategoryWithLinks[];
}

const ID_TO_SLUG: Record<string, string> = {
  rep_dominicana: "republica-dominicana",
  argentina: "argentina",
  chile: "chile",
  brasil: "brasil",
  bolivia: "bolivia",
  colombia: "colombia",
  ecuador: "ecuador",
  mexico: "mexico",
  panama: "panama",
  peru: "peru",
  uruguay: "uruguay",
  paraguay: "paraguay",
};

/** Códigos ISO 3166-1 alpha-2 para URLs de banderas (flagcdn.com). Claves normalizadas (minúsculas, sin tildes). */
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
  españa: "es",
  espana: "es",
  guatemala: "gt",
  honduras: "hn",
  italia: "it",
  méxico: "mx",
  mexico: "mx",
  nicaragua: "ni",
  panamá: "pa",
  panama: "pa",
  paraguay: "py",
  perú: "pe",
  peru: "pe",
  portugal: "pt",
  "puerto rico": "pr",
  "república dominicana": "do",
  "republica dominicana": "do",
  uruguay: "uy",
  venezuela: "ve",
};

const FLAG_CDN = "https://flagcdn.com";

function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Devuelve URL de imagen de bandera para el país (siempre visible en todos los navegadores). */
function getFlagForCountry(countryName: string): string {
  const key = normalizeKey(countryName);
  const iso = COUNTRY_ISO[key] ?? COUNTRY_ISO[countryName.trim().toLowerCase()];
  if (iso) return `${FLAG_CDN}/w80/${iso}.png`;
  return "";
}

function toSlug(id: string): string {
  return ID_TO_SLUG[id] ?? id.replace(/_/g, "-");
}

/** Enlaces únicos por título+url para evitar duplicados */
function uniqueLinks(links: PracticeLink[]): PracticeLink[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    const key = `${(l.title ?? "").trim()}|${(l.url ?? "").trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Construye la estructura país → categorías → enlaces a partir de countries y countryCategorySources */
export function buildMejoresPracticasData(): CountryPracticesData[] {
  const categoryOrder = [
    "Espectro radioeléctrico",
    "Competencia Económica",
    "Ciberseguridad",
    "Protección del usuario",
    "Tecnologías emergentes",
    "Compartición de la infraestructura",
    "Telecomunicaciones de emergencia",
    "Homologación de productos y dispositivos",
  ] as const;

  const list = countries.map((c) => {
    const sources = countryCategorySources[c.id];
    const categories: CategoryWithLinks[] = categoryOrder.map((catName) => {
      const linksRaw = sources?.[catName] ?? [];
      const links = uniqueLinks(
        linksRaw
          .filter((l) => l && typeof l.title === "string" && typeof l.url === "string" && l.url.trim())
          .map((l) => ({ title: (l.title ?? "").trim(), url: (l.url ?? "").trim() }))
      );
      return { name: catName, links };
    });
    return {
      countryId: c.id,
      name: c.name,
      slug: toSlug(c.id),
      flag: getFlagForCountry(c.name),
      categories,
    };
  });
  list.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  return list;
}

export const mejoresPracticasData = buildMejoresPracticasData();

/** Slug → país */
export const mejoresPracticasBySlug = new Map(
  mejoresPracticasData.map((d) => [d.slug, d])
);

/** Todas las categorías que aparecen en al menos un país (con links) */
export function getUniqueCategoryNames(): string[] {
  const set = new Set<string>();
  mejoresPracticasData.forEach((d) => {
    d.categories.forEach((cat) => {
      if (cat.links.length > 0) set.add(cat.name);
    });
  });
  return Array.from(set);
}

/** Total de enlaces por país */
export function getLinkCountByCountry(data: CountryPracticesData): number {
  return data.categories.reduce((acc, cat) => acc + cat.links.length, 0);
}

/** Formato del JSON generado por scripts/scrape-mejores-practicas.mjs */
export interface ScrapedRegulatelEntry {
  country?: string;
  entity?: string;
  acronym?: string;
  detailUrl?: string;
  categories?: { name?: string; links?: { title?: string; url?: string }[] }[];
}

/** Valor guardado en site_settings para CMS de /micrositio-buenas-practicas */
export interface BuenasPracticasRegulatoriasSetting {
  pageTitle?: string;
  pageDescription?: string;
  entries: ScrapedRegulatelEntry[];
}

export const BUENAS_PRACTICAS_REGULATORIAS_KEY = "buenas_practicas_regulatorias" as const;

export const BUENAS_PRACTICAS_PAGE_DEFAULT_TITLE = "Buenas Prácticas Regulatorias";
export const BUENAS_PRACTICAS_PAGE_DEFAULT_DESCRIPTION =
  "Consulte prácticas, iniciativas y recursos regulatorios de telecomunicaciones por país y categoría. Información proporcionada por los miembros de REGULATEL.";

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

/** Interpreta el valor en BD; si falta estructura devuelve entries vacíos. */
export function parseBuenasPracticasRegulatoriasFromSettingValue(value: unknown): BuenasPracticasRegulatoriasSetting {
  const root = unwrapSettingJson(value);
  if (root == null || typeof root !== "object") {
    return { entries: [] };
  }
  const obj = root as Record<string, unknown>;
  const raw = obj.entries;
  const entries: ScrapedRegulatelEntry[] = Array.isArray(raw)
    ? (raw as ScrapedRegulatelEntry[]).filter((e) => e != null && typeof e === "object")
    : Array.isArray(root)
      ? (root as ScrapedRegulatelEntry[])
      : [];
  return {
    pageTitle: typeof obj.pageTitle === "string" ? obj.pageTitle : undefined,
    pageDescription: typeof obj.pageDescription === "string" ? obj.pageDescription : undefined,
    entries,
  };
}

export function emptyScrapedCategory(): { name: string; links: { title: string; url: string }[] } {
  return { name: "", links: [{ title: "", url: "" }] };
}

export function emptyScrapedEntry(): ScrapedRegulatelEntry {
  return {
    country: "",
    entity: "",
    acronym: "",
    detailUrl: "",
    categories: [emptyScrapedCategory()],
  };
}

/** Convierte el JSON extraído del sitio oficial a CountryPracticesData[] */
export function normalizeScrapedRegulatelJson(
  raw: ScrapedRegulatelEntry[]
): CountryPracticesData[] {
  function toSlugFromName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  const list = raw
    .filter((e) => (e.country || e.entity || e.detailUrl))
    .map((e, i) => {
      const name = (e.country || e.entity || "País").trim();
      const slug = toSlugFromName(name) || `pais-${i + 1}`;
      const allCategories: CategoryWithLinks[] = (e.categories || []).map((cat) => {
        const links = (cat.links || [])
          .filter((l) => l && (l.url ?? "").trim())
          .map((l) => ({
            title: (l.title ?? "").trim() || "Recurso",
            url: (l.url ?? "").trim(),
          }));
        return {
          name: (cat.name ?? "").trim() || "Recursos",
          links: uniqueLinks(links),
        };
      });
      const isContactOrFooter = (name: string) => {
        const n = normalizeKey(name);
        return (
          n === "contactanos" ||
          n.startsWith("contactanos") ||
          n.includes("indotel.gob.do") ||
          n.includes("internacionales@") ||
          n.startsWith("oficina en") ||
          n === "redes sociales" ||
          n === "app" ||
          n.includes("abraham lincoln") ||
          /^\d{3}[- ]?\d{3}[- ]?\d{4}$/.test(n.replace(/\s/g, ""))
        );
      };
      const firstContactIdx = allCategories.findIndex((c) => isContactOrFooter(c.name));
      const categories =
        firstContactIdx === -1 ? allCategories : allCategories.slice(0, firstContactIdx);
      return {
        countryId: slug,
        name,
        slug,
        flag: getFlagForCountry(name),
        categories,
      };
    });
  list.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  return list;
}
