/**
 * Ediciones de la Revista Digital REGULATEL.
 * Persistidas en site_settings bajo revista_digital → { entries: RevistaEdition[] }.
 */
import type { GestionDocument } from "@/data/gestion";

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
  isPublished: boolean;
  isFeatured: boolean;
}

export const defaultRevistaEditions: RevistaEdition[] = [
  {
    id: "revista-2026-segunda-edicion",
    title: "Revista REGULATEL - Segunda edición - Junio, 2026",
    url: "/documents/Revista-REGULATEL-2026-Segunda-Edicion.pdf",
    year: "2026",
    coverEdition: "Segunda edición",
    description: "Ya está disponible la segunda edición (junio 2026) de la Revista REGULATEL.",
    isPublished: true,
    isFeatured: true,
  },
  {
    id: "revista-2026-final",
    title: "Revista REGULATEL - Primera edicion - Abril 2026",
    url: "/documents/Revista-REGULATEL-2026-FINAL.pdf",
    year: "2026",
    coverEdition: "Primera edición",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q4-2025",
    title: "Revista Digital REGULATEL - Cuarto Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q4-2025.pdf",
    year: "2025",
    quarter: "Q4",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q3-2025",
    title: "Revista Digital REGULATEL - Tercer Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q3-2025.pdf",
    year: "2025",
    quarter: "Q3",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q2-2025",
    title: "Revista Digital REGULATEL - Segundo Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q2-2025.pdf",
    year: "2025",
    quarter: "Q2",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "revista-q1-2025",
    title: "Revista Digital REGULATEL - Primer Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q1-2025.pdf",
    year: "2025",
    quarter: "Q1",
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
      isPublished: parseBool(r.isPublished, true),
      isFeatured: parseBool(r.isFeatured, false),
    });
  }
  return out;
}

function quarterSortRank(quarter?: string): number {
  if (!quarter) return 0;
  const m = /^Q(\d)/i.exec(quarter.trim());
  return m ? parseInt(m[1], 10) : 0;
}

export function sortRevistaEditions(editions: RevistaEdition[]): RevistaEdition[] {
  return [...editions].sort((a, b) => {
    const ya = parseInt(a.year ?? "0", 10);
    const yb = parseInt(b.year ?? "0", 10);
    if (yb !== ya) return yb - ya;
    return quarterSortRank(b.quarter) - quarterSortRank(a.quarter);
  });
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
  };
}
