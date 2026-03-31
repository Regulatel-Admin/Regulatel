/**
 * Datos centralizados de convenios. Usado por: dropdown header, lista /convenios, detalle /convenios/:slug.
 */

export type ConvenioSlug = string;

export interface Convenio {
  slug: string;
  title: string;
  acronym: string;
  shortDescription: string;
  logoSrc: string;
  downloadUrl?: string;
  areas: string[];
  order: number;
}

const LOGOS = "/images/convenios";

/** Clave en site_settings; valor: { items: Convenio[] } */
export const CONVENIOS_SETTINGS_KEY = "convenios" as const;

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

export function parseConveniosFromSettingValue(value: unknown): Convenio[] | null {
  const root = unwrapSettingJson(value);
  if (root == null || typeof root !== "object") return null;
  const items = (root as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const out: Convenio[] = [];
  for (const row of items) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const slug = typeof r.slug === "string" ? r.slug.trim() : "";
    const title = typeof r.title === "string" ? r.title : "";
    const acronym = typeof r.acronym === "string" ? r.acronym : "";
    if (!slug || !title) continue;
    const areasRaw = r.areas;
    const areas: string[] = Array.isArray(areasRaw)
      ? areasRaw.filter((x): x is string => typeof x === "string")
      : typeof areasRaw === "string"
        ? areasRaw.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];
    out.push({
      slug,
      title,
      acronym,
      shortDescription: typeof r.shortDescription === "string" ? r.shortDescription : "",
      logoSrc: typeof r.logoSrc === "string" ? r.logoSrc : "",
      downloadUrl: typeof r.downloadUrl === "string" ? r.downloadUrl : undefined,
      areas,
      order: typeof r.order === "number" && !Number.isNaN(r.order) ? r.order : out.length + 1,
    });
  }
  return out;
}

export const convenios: Convenio[] = [
  {
    slug: "berec",
    title: "European Regulators for Electronic Communications",
    acronym: "BEREC",
    shortDescription:
      "Fomentar esfuerzos para abordar los desafíos regulatorios conjuntos actuales y futuros en Latinoamérica y Europa, y el desarrollo de relaciones laborales y colegiales entre expertos de ambas partes.",
    logoSrc: `${LOGOS}/berec.png`,
    downloadUrl: "/documents/convenios/mou-regulatel-berec.pdf",
    areas: [
      "Intercambio de información y mejores prácticas regulatorias",
      "Cooperación en temas de mercados electrónicos y redes",
      "Diálogo sobre políticas de competencia y usuarios",
      "Actividades de formación y coordinación técnica",
    ],
    order: 1,
  },
  {
    slug: "icann",
    title: "Internet Corporation for Assigned Names and Numbers",
    acronym: "ICANN",
    shortDescription:
      "Fortalecer los vínculos entre las partes, compartir experiencias y promover acciones de cooperación de conformidad con sus respectivas misiones y ordenanzas.",
    logoSrc: `${LOGOS}/icann.png`,
    areas: [
      "Gobernanza de internet y sistemas de nombres y números",
      "Intercambio de experiencias en políticas de DNS",
      "Capacitación y participación en foros globales",
      "Cooperación técnica en estándares y buenas prácticas",
    ],
    order: 2,
  },
  {
    slug: "fcc",
    title: "Federal Communications Commission",
    acronym: "FCC",
    shortDescription:
      "Fortalecer los vínculos entre la FCC y REGULATEL, compartir experiencias y promover acciones de cooperación en regulación de telecomunicaciones y TIC.",
    logoSrc: `${LOGOS}/fcc.png`,
    areas: [
      "Regulación de telecomunicaciones y espectro",
      "Intercambio de experiencias en políticas TIC",
      "Seguimiento de tendencias regulatorias",
      "Cooperación en temas de competencia y usuarios",
    ],
    order: 3,
  },
  {
    slug: "comtelca",
    title: "Comisión Técnica Regional de Telecomunicaciones",
    acronym: "COMTELCA",
    shortDescription:
      "Fortalecer los vínculos entre COMTELCA y REGULATEL, compartir experiencias y promover acciones de cooperación en regulación de telecomunicaciones y TIC en la región.",
    logoSrc: `${LOGOS}/comtelca.png`,
    areas: [
      "Armonización regulatoria en Centroamérica",
      "Intercambio de información técnica y normativa",
      "Proyectos conjuntos de capacitación",
      "Coordinación en foros regionales",
    ],
    order: 4,
  },
  {
    slug: "prai",
    title: "Memorando de entendimiento REGULATEL – PRAI",
    acronym: "PRAI",
    shortDescription:
      "Cooperación para la protección y el empoderamiento de la niñez y la adolescencia en entornos digitales, mediante el intercambio de experiencias y buenas prácticas entre reguladores.",
    logoSrc: `${LOGOS}/prai.png`,
    downloadUrl: "/documents/convenios/memorando-entendimiento-prai.pdf",
    areas: [
      "Protección de la niñez en entornos digitales",
      "Intercambio de experiencias y buenas prácticas",
      "Cooperación entre reguladores iberoamericanos",
      "Fortalecimiento de marcos de protección en línea",
    ],
    order: 5,
  },
].sort((a, b) => a.order - b.order);

export function getConvenioBySlug(slug: string, list: Convenio[] = convenios): Convenio | undefined {
  return list.find((c) => c.slug === slug);
}

export function getConvenioSlugs(list: Convenio[] = convenios): ConvenioSlug[] {
  return list.map((c) => c.slug);
}
