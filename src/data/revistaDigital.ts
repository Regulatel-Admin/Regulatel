/**
 * Ediciones de la Revista Digital REGULATEL.
 * Persistidas en site_settings bajo revista_digital → { entries: RevistaEdition[] }.
 */
import { documentRecencyScore, type GestionDocument } from "@/data/gestion";

export const REVISTA_DIGITAL_SETTINGS_KEY = "revista_digital" as const;

export interface RevistaEdition {
  id: string;
  title: string;
  url: string;
  fileName?: string;
  year: string;
  quarter?: string;
  description?: string;
  coverEdition?: string;
  /** Portada (primera página del PDF) para la miniatura del aviso. */
  coverImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export const defaultRevistaEditions: RevistaEdition[] = [
  {
    id: "revista-2026-tercera-edicion",
    title: "Revista REGULATEL - Tercera edición - Septiembre, 2026",
    url: "/documents/Revista-REGULATEL-2026-Tercera-Edicion.pdf",
    year: "2026",
    coverEdition: "Tercera edición",
    coverImage: "/images/revistas/revista-2026-tercera-edicion-cover.webp",
    description:
      "Ya está disponible la tercera edición (septiembre 2026) de la Revista REGULATEL, con artículos sobre espectro, ciberseguridad, infraestructuras digitales y cooperación regional.",
    isPublished: true,
    isFeatured: true,
  },
  {
    id: "revista-2026-segunda-edicion",
    title: "Revista REGULATEL - Segunda edición - Junio, 2026",
    url: "/documents/Revista-REGULATEL-2026-Segunda-Edicion.pdf",
    year: "2026",
    coverEdition: "Segunda edición",
    coverImage: "/images/revistas/revista-2026-segunda-edicion-cover.webp",
    description: "Ya está disponible la segunda edición (junio 2026) de la Revista REGULATEL.",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-2026-final",
    title: "Revista REGULATEL - Primera edicion - Abril 2026",
    url: "/documents/Revista-REGULATEL-2026-FINAL.pdf",
    year: "2026",
    coverEdition: "Primera edición",
    coverImage: "/images/revistas/revista-2026-primera-edicion-cover.webp",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q4-2025",
    title: "Revista Digital REGULATEL - Cuarto Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q4-2025.pdf",
    year: "2025",
    quarter: "Q4",
    coverImage: "/images/revistas/revista-q4-2025-cover.webp",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q3-2025",
    title: "Revista Digital REGULATEL - Tercer Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q3-2025.pdf",
    year: "2025",
    quarter: "Q3",
    coverImage: "/images/revistas/revista-q3-2025-cover.webp",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q2-2025",
    title: "Revista Digital REGULATEL - Segundo Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q2-2025.pdf",
    year: "2025",
    quarter: "Q2",
    coverImage: "/images/revistas/revista-q2-2025-cover.webp",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q1-2025",
    title: "Revista Digital REGULATEL - Primer Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q1-2025.pdf",
    year: "2025",
    quarter: "Q1",
    coverImage: "/images/revistas/revista-q1-2025-cover.webp",
    isPublished: true,
    isFeatured: false,
  },
];

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

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

export function parseRevistaDigitalFromSettingValue(value: unknown): RevistaEdition[] | null {
  const root = unwrapSettingJson(value);
  if (root == null || typeof root !== "object") return null;
  const arr = Array.isArray(root) ? root : (root as { entries?: unknown }).entries;
  if (!Array.isArray(arr)) return null;
  const out: RevistaEdition[] = [];
  for (const row of arr) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id.trim() : "";
    const title = typeof r.title === "string" ? r.title.trim() : "";
    const url = typeof r.url === "string" ? r.url.trim() : "";
    if (!id || !title || !url) continue;
    out.push({
      id,
      title,
      url,
      fileName: typeof r.fileName === "string" ? r.fileName : undefined,
      year: typeof r.year === "string" && r.year.trim() ? r.year.trim() : String(new Date().getFullYear()),
      quarter: typeof r.quarter === "string" && r.quarter.trim() ? r.quarter.trim() : undefined,
      description: typeof r.description === "string" && r.description.trim() ? r.description.trim() : undefined,
      coverEdition: typeof r.coverEdition === "string" && r.coverEdition.trim() ? r.coverEdition.trim() : undefined,
      coverImage: typeof r.coverImage === "string" && r.coverImage.trim() ? r.coverImage.trim() : undefined,
      isPublished: parseBool(r.isPublished, true),
      isFeatured: parseBool(r.isFeatured, false),
    });
  }
  return out;
}

export function sortRevistaEditions(editions: RevistaEdition[]): RevistaEdition[] {
  return [...editions].sort((a, b) => documentRecencyScore(b) - documentRecencyScore(a));
}

/**
 * Combina ediciones del CMS con el catálogo del código.
 * Una edición nueva del código (aún no guardada en CMS) puede pasar a portada.
 */
export function mergeRevistaDigitalWithDefaults(
  cmsEntries: RevistaEdition[] | null
): RevistaEdition[] {
  const byId = new Map<string, RevistaEdition>();

  for (const def of defaultRevistaEditions) {
    byId.set(def.id, { ...def });
  }

  for (const cms of cmsEntries ?? []) {
    const existing = byId.get(cms.id);
    const merged = existing ? { ...existing, ...cms } : { ...cms };
    if (!merged.coverImage && existing?.coverImage) merged.coverImage = existing.coverImage;
    byId.set(cms.id, merged);
  }

  const cmsIds = new Set((cmsEntries ?? []).map((e) => e.id));
  const newlyAddedFeatured = defaultRevistaEditions.find((e) => e.isFeatured && !cmsIds.has(e.id));
  const defaultFeatured = defaultRevistaEditions.find((e) => e.isFeatured);
  const cmsFeatured = (cmsEntries ?? []).find((e) => e.isFeatured);
  const featuredId = newlyAddedFeatured?.id ?? cmsFeatured?.id ?? defaultFeatured?.id;
  const merged = Array.from(byId.values());

  if (!featuredId) return merged;

  return merged.map((e) => ({
    ...e,
    isFeatured: e.id === featuredId,
  }));
}

export function getPublishedRevistaEditions(editions: RevistaEdition[]): RevistaEdition[] {
  return sortRevistaEditions(editions.filter((e) => e.isPublished));
}

export function getFeaturedRevistaEdition(editions: RevistaEdition[]): RevistaEdition | null {
  return getPublishedRevistaEditions(editions).find((e) => e.isFeatured) ?? null;
}

export function revistaEditionToGestionDocument(edition: RevistaEdition): GestionDocument {
  return {
    id: edition.id,
    title: edition.title,
    url: edition.url,
    fileName: edition.fileName,
    year: edition.year,
    quarter: edition.quarter,
    category: "revista",
    coverImage: edition.coverImage,
  };
}
