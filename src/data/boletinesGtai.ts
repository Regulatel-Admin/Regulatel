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
const PDF_BOLETIN_2 = "/documents/boletines-gtai/boletin-2-2026.pdf";
const PDF_BOLETIN_3 = "/documents/boletines-gtai/boletin-3-2026.pdf";
const PDF_BOLETIN_4 = "/documents/boletines-gtai/boletin-4-2026.pdf";

export const defaultBoletinesGtai: BoletinGtaiSerialized[] = [
  {
    title: "Boletín 4",
    slug: "boletin-4-2026",
    groupName: "Grupo de Asuntos de Internet (GTAI)",
    issueNumber: 4,
    year: 2026,
    publicationDate: "2026-09-01",
    shortSummary:
      "Notas sobre bloqueos de Internet, desinformación, IA generativa, protección de menores en redes y desconexión digital, con mirada comparada regional e internacional.",
    description:
      "Este cuarto boletín del GTAI reúne una curaduría institucional de tendencias y hechos relevantes en materia de Internet: cómo las personas desafían los bloqueos de la red de Myanmar a Venezuela, la desconfianza hacia las noticias en línea, el uso de imágenes generadas con IA para desacreditar víctimas, restricciones a la inteligencia artificial en escuelas de Noruega, incidentes de ciberseguridad atribuidos a modelos de OpenAI, cargos imprevistos en compras por internet en la UE, las jornadas laborales en empresas de IA, la multa a Meta por seguridad infantil y el debate sobre la desconexión digital. Su propósito es apoyar el intercambio técnico entre reguladores de la región REGULATEL.",
    coverImage: "/images/boletines/boletin-4-2026-cover-b.webp",
    pdfFile: PDF_BOLETIN_4,
    contentType: "Boletín",
    isPublished: true,
    isFeatured: true,
  },
  {
    title: "Boletín 3",
    slug: "boletin-3-2026",
    groupName: "Grupo de Asuntos de Internet (GTAI)",
    issueNumber: 3,
    year: 2026,
    publicationDate: "2026-06-20",
    shortSummary:
      "Notas sobre apagones y restricciones de Internet, acceso clandestino a Starlink, derechos digitales, costos de banda ancha en Europa y regulación de redes sociales para menores, con mirada comparada regional e internacional.",
    description:
      "Este tercer boletín del GTAI reúne una curaduría institucional de tendencias y hechos relevantes en materia de Internet: cortes y restablecimientos del servicio móvil en Moscú, redes clandestinas con Starlink en Irán, bloqueos en Myanmar y Venezuela, desmentidos sobre restricciones en Cuba, debates sobre derechos digitales, precios de banda ancha en Europa, la prohibición de redes sociales para menores de 16 años en Reino Unido y mejoras de conectividad 5G en eventos masivos en España. Su propósito es apoyar el intercambio técnico entre reguladores de la región REGULATEL.",
    coverImage: "/images/boletines/boletin-3-2026-cover.webp",
    pdfFile: PDF_BOLETIN_3,
    contentType: "Boletín",
    isPublished: true,
    isFeatured: false,
  },
  {
    title: "Boletín 2",
    slug: "boletin-2-2026",
    groupName: "Grupo de Asuntos de Internet (GTAI)",
    issueNumber: 2,
    year: 2026,
    publicationDate: "2026-05-13",
    shortSummary:
      "Selección de notas sobre redes sociales, regulación digital y conectividad, abordando la protección de menores, la privacidad en entornos conectados y el futuro de las redes en la región.",
    description:
      "Este segundo boletín del GTAI reúne una curaduría institucional de tendencias y hechos relevantes en materia de Internet: redes sociales, regulación digital, conectividad, protección de menores, privacidad en entornos conectados y evolución de las redes en la región. Su propósito es apoyar el intercambio técnico entre reguladores de la región REGULATEL.",
    coverImage: "/images/boletines/boletin-2-2026-cover.webp",
    pdfFile: PDF_BOLETIN_2,
    contentType: "Boletín",
    isPublished: true,
    isFeatured: false,
  },
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
    coverImage: "/images/boletines/boletin-1-2026-cover.webp",
    pdfFile: PDF_BOLETIN_1,
    contentType: "Boletín",
    isPublished: true,
    isFeatured: false,
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

/**
 * Combina entradas del CMS con defaults del código.
 * Los defaults definen el catálogo completo; el CMS puede sobreescribir por slug.
 * Un boletín nuevo del código (aún no guardado en CMS) puede pasar a destacado.
 */
export function mergeBoletinesGtaiWithDefaults(
  cmsEntries: BoletinGtaiSerialized[] | null
): BoletinGtaiSerialized[] {
  const bySlug = new Map<string, BoletinGtaiSerialized>();

  for (const def of defaultBoletinesGtai) {
    bySlug.set(def.slug, { ...def });
  }

  for (const cms of cmsEntries ?? []) {
    const existing = bySlug.get(cms.slug);
    const merged = existing ? { ...existing, ...cms } : { ...cms };
    const cmsCover = (cms.coverImage ?? "").trim();
    const cmsHasGenericCover =
      !cmsCover || cmsCover === "/grupos-trabajo/asuntos-internet.jpg";
    if (existing?.coverImage && cmsHasGenericCover) {
      merged.coverImage = existing.coverImage;
    }
    bySlug.set(cms.slug, merged);
  }

  const cmsSlugs = new Set((cmsEntries ?? []).map((e) => e.slug));
  const newlyAddedFeatured = defaultBoletinesGtai.find((e) => e.isFeatured && !cmsSlugs.has(e.slug));
  const defaultFeatured = defaultBoletinesGtai.find((e) => e.isFeatured);
  const cmsFeatured = (cmsEntries ?? []).find((e) => e.isFeatured);
  const featuredSlug = newlyAddedFeatured?.slug ?? cmsFeatured?.slug ?? defaultFeatured?.slug;
  const merged = Array.from(bySlug.values());

  if (!featuredSlug) return merged;

  return merged.map((e) => ({
    ...e,
    isFeatured: e.slug === featuredSlug,
  }));
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

/** Resuelve un boletín publicado por slug (lista ya mergeada con defaults). */
export function resolveBoletinBySlug(
  slug: string,
  mergedEntries: BoletinGtaiSerialized[]
): BoletinGtaiSerialized | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  const found = mergedEntries.find((b) => b.slug.toLowerCase() === key);
  return found?.isPublished ? found : null;
}
