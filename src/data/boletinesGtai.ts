/**
 * Boletines del Grupo de Asuntos de Internet (GTAI).
 * Persistido en site_settings bajo la clave boletines_gtai → { entries: BoletinGtaiSerialized[] }
 */

export const BOLETINES_GTAI_SETTINGS_KEY = "boletines_gtai" as const;

export const BOLETINES_GTAI_LIST_PATH = "/boletines-gtai" as const;

/** Serializado para JSON / CMS (sin fechas en objeto Date). */
export interface BoletinGtaiSerialized {
  title: string;
  slug: string;
  groupName: string;
  issueNumber: number;
  year: number;
  /** ISO date YYYY-MM-DD */
  publicationDate: string;
  shortSummary: string;
  description: string;
  coverImage?: string;
  pdfFile: string;
  contentType: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export interface BoletinesGtaiSettingShape {
  entries: BoletinGtaiSerialized[];
}

const PDF_BOLETIN_1 = "/documents/boletines-gtai/boletin-1-2026.pdf";

export const defaultBoletinesGtai: BoletinGtaiSerialized[] = [
  {
    title: "Boletín 1",
    slug: "boletin-1-2026",
    groupName: "Grupo de Asuntos de Internet (GTAI)",
    issueNumber: 1,
    year: 2026,
    publicationDate: "2026-01-15",
    shortSummary:
      "Selección de notas sobre gobernanza de Internet, privacidad y plataformas digitales, regulación de contenidos y el papel de la IA en el ecosistema en línea, con mirada comparada regional e internacional.",
    description:
      "Este primer boletín del GTAI reúne una curaduría institucional de tendencias y hechos relevantes en materia de Internet: arquitectura abierta y algoritmos, verificación de edad en plataformas, debates sobre IA y moderación de contenidos, y noticias de conectividad y políticas públicas digitales. Su propósito es apoyar el intercambio técnico entre reguladores de la región REGULATEL.",
    coverImage: "/grupos-trabajo/asuntos-internet.jpg",
    pdfFile: PDF_BOLETIN_1,
    contentType: "Boletín",
    isPublished: true,
    isFeatured: true,
  },
];

function parseBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function parseNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function parseBoletinesGtaiFromSettingValue(value: unknown): BoletinGtaiSerialized[] | null {
  if (value == null) return null;
  let obj: unknown = value;
  if (typeof value === "string") {
    try {
      obj = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const entries = (obj as BoletinesGtaiSettingShape).entries;
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const out: BoletinGtaiSerialized[] = [];
  for (const raw of entries) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as unknown as Record<string, unknown>;
    const slug = String(r.slug ?? "").trim();
    const title = String(r.title ?? "").trim();
    const pdfFile = String(r.pdfFile ?? "").trim();
    if (!slug || !title || !pdfFile) continue;

    const groupName = String(r.groupName ?? "Grupo de Asuntos de Internet (GTAI)").trim();
    const publicationDate = String(r.publicationDate ?? "").trim() || "1970-01-01";
    const shortSummary = String(r.shortSummary ?? "").trim();
    const description = String(r.description ?? "").trim();
    const coverImage = r.coverImage != null && String(r.coverImage).trim() ? String(r.coverImage).trim() : undefined;

    out.push({
      title,
      slug,
      groupName,
      issueNumber: parseNumber(r.issueNumber, 1),
      year: parseNumber(r.year, new Date().getFullYear()),
      publicationDate,
      shortSummary: shortSummary || title,
      description: description || shortSummary || title,
      coverImage,
      pdfFile,
      contentType: String(r.contentType ?? "Boletín").trim() || "Boletín",
      isPublished: parseBool(r.isPublished, true),
      isFeatured: parseBool(r.isFeatured, false),
    });
  }

  return out.length > 0 ? out : null;
}

export function getBoletinesGtaiPublished(entries: BoletinGtaiSerialized[]): BoletinGtaiSerialized[] {
  return entries.filter((e) => e.isPublished);
}

export function sortBoletinesByDateDesc(entries: BoletinGtaiSerialized[]): BoletinGtaiSerialized[] {
  return [...entries].sort((a, b) => {
    const ta = Date.parse(a.publicationDate);
    const tb = Date.parse(b.publicationDate);
    if (tb !== ta) return tb - ta;
    if (b.year !== a.year) return b.year - a.year;
    return b.issueNumber - a.issueNumber;
  });
}

export function getFeaturedBoletin(entries: BoletinGtaiSerialized[]): BoletinGtaiSerialized | null {
  const pub = sortBoletinesByDateDesc(getBoletinesGtaiPublished(entries));
  const featured = pub.find((e) => e.isFeatured);
  return featured ?? pub[0] ?? null;
}

export function uniqueYearsDesc(entries: BoletinGtaiSerialized[]): number[] {
  const years = new Set<number>();
  for (const e of getBoletinesGtaiPublished(entries)) years.add(e.year);
  return Array.from(years).sort((a, b) => b - a);
}
