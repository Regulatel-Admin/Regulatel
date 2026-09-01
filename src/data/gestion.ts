/**
 * Categorías para filtro en /gestion. Coinciden con query param ?tipo=
 */
export type GestionCategory =
  | "revista"
  | "documentos"
  | "planes-actas"
  | "comite-ejecutivo"
  | "banco"
  | "otros";

export interface GestionDocument {
  id: string;
  title: string;
  url: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  /** Año o trimestre para mostrar (ej. "2025", "Q4 2025") */
  year?: string;
  quarter?: string;
  category: GestionCategory;
  /**
   * Miniatura opcional (portada de revista o primera página del PDF) para la card de Gestión.
   */
  coverImage?: string;
  /**
   * Ruta pública de detalle (ej. /revista/slug). Si existe, los CTAs “leer edición”
   * pueden enlazar aquí en lugar del PDF. Opcional hasta que exista la página.
   */
  publicDetailPath?: string;
}

/**
 * Mapeo: si un item tiene type, tag, section, mapear a category.
 * Por defecto "otros".
 */
export function toCategory(
  raw: { type?: string; tag?: string; section?: string; category?: string } | null
): GestionCategory {
  if (!raw) return "otros";
  const v = (raw.type ?? raw.tag ?? raw.section ?? raw.category ?? "").toLowerCase();
  if (v === "revista" || v === "revista digital") return "revista";
  if (v === "documentos" || v === "documento oficial" || v === "declaracion") return "documentos";
  if (v === "planes-actas" || v === "planes" || v === "actas" || v === "plan" || v === "acta")
    return "planes-actas";
  if (
    v === "comite-ejecutivo" ||
    v === "comité ejecutivo" ||
    v === "comite ejecutivo" ||
    v === "actas comite ejecutivo"
  )
    return "comite-ejecutivo";
  if (v === "banco") return "banco";
  return "otros";
}

/** Listado filtrado de revistas en Gestión documental. */
export const GESTION_REVISTA_ARCHIVE_PATH = "/gestion?tipo=revista";

function stripDiacritics(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const MONTH_NAME_TO_NUM: Record<string, number> = {
  enero: 1,
  january: 1,
  janeiro: 1,
  gennaio: 1,
  febrero: 2,
  february: 2,
  fevereiro: 2,
  febbraio: 2,
  marzo: 3,
  march: 3,
  marco: 3,
  abril: 4,
  april: 4,
  aprile: 4,
  mayo: 5,
  may: 5,
  maio: 5,
  maggio: 5,
  junio: 6,
  june: 6,
  junho: 6,
  giugno: 6,
  julio: 7,
  july: 7,
  julho: 7,
  luglio: 7,
  agosto: 8,
  august: 8,
  septiembre: 9,
  setiembre: 9,
  september: 9,
  setembro: 9,
  settembre: 9,
  octubre: 10,
  october: 10,
  outubro: 10,
  ottobre: 10,
  noviembre: 11,
  november: 11,
  novembro: 11,
  novembre: 11,
  diciembre: 12,
  december: 12,
  dezembro: 12,
  dicembre: 12,
};

const MONTH_NAMES_BY_LENGTH = Object.keys(MONTH_NAME_TO_NUM).sort((a, b) => b.length - a.length);

function monthFromTitle(title: string): number {
  const normalized = stripDiacritics(title);
  for (const name of MONTH_NAMES_BY_LENGTH) {
    const re = new RegExp(`(?:^|[^a-z])${name}(?:$|[^a-z])`);
    if (re.test(normalized)) return MONTH_NAME_TO_NUM[name];
  }
  return 0;
}

function quarterFromDoc(quarter?: string, title?: string): number {
  if (quarter) {
    const fromField = /^Q(\d)/i.exec(quarter.trim());
    if (fromField) return Number(fromField[1]) || 0;
  }
  const normalized = stripDiacritics(title ?? "");
  if (/\b(q4|cuarto trimestre|4[o.]?\s*trimestre|quarto trimestre)\b/.test(normalized)) return 4;
  if (/\b(q3|tercer trimestre|3[er.]?\s*trimestre|terceiro trimestre|terzo trimestre)\b/.test(normalized)) return 3;
  if (/\b(q2|segundo trimestre|2[o.]?\s*trimestre|secondo trimestre)\b/.test(normalized)) return 2;
  if (/\b(q1|primer trimestre|1[er.]?\s*trimestre|primeiro trimestre|primo trimestre)\b/.test(normalized)) return 1;
  return 0;
}

function sequenceFromTitle(title: string): number {
  const normalized = stripDiacritics(title);
  const acta = normalized.match(/\bacta\b(?:\s+(?:no|n[o°]|num(?:ero)?)\.?)?\s*(\d+)/);
  if (acta) return Number(acta[1]) || 0;
  const asamblea = normalized.match(/\basamblea\s+(\d+)/);
  if (asamblea) return Number(asamblea[1]) || 0;
  if (/\b(edic|edition|edicao)\b/.test(normalized)) {
    if (/\b(quinta|fifth)\b/.test(normalized)) return 5;
    if (/\b(cuarta|fourth|quarta)\b/.test(normalized)) return 4;
    if (/\b(tercera|third|terceira|terza)\b/.test(normalized)) return 3;
    if (/\b(segunda|second|seconda)\b/.test(normalized)) return 2;
    if (/\b(primera|first|primeira|prima)\b/.test(normalized)) return 1;
    const numbered = normalized.match(/\bedic(?:ion|ao)?\s*(\d+)/);
    if (numbered) return Number(numbered[1]) || 0;
  }
  return 0;
}

/**
 * Puntuación cronológica (más alta = más reciente).
 * Usa año, mes del título, trimestre y números de edición/acta.
 */
export function documentRecencyScore(doc: {
  title?: string;
  year?: string;
  quarter?: string;
}): number {
  const year = parseInt(doc.year ?? "", 10);
  const y = Number.isFinite(year) ? year : 0;
  const month = monthFromTitle(doc.title ?? "") || quarterFromDoc(doc.quarter, doc.title) * 3;
  const sequence = sequenceFromTitle(doc.title ?? "");
  return y * 1_000_000 + month * 10_000 + sequence;
}

/**
 * Edición de revista más reciente según año, mes, trimestre o número de edición.
 */
export function getLatestRevistaEdition(docs: GestionDocument[] = gestionDocuments): GestionDocument | null {
  const revistas = docs.filter((d) => d.category === "revista");
  if (!revistas.length) return null;
  return [...revistas].sort((a, b) => documentRecencyScore(b) - documentRecencyScore(a))[0];
}

/** Documentos unificados para la página Gestión. Filtrable por category. */
export const gestionDocuments: GestionDocument[] = [
  // —— Planes y Actas ——
  {
    id: "plan-2026",
    title: "Plan de trabajo de la presidencia de Regulatel 2026",
    url: "/documents/Plan-Trabajo-REGULATEL-2026.pdf",
    year: "2026",
    category: "planes-actas",
    coverImage: "/images/planes-actas/plan-2026-cover.webp",
  },
  {
    id: "plan-2025",
    title: "Plan de Trabajo REGULATEL 2025",
    url: "/documents/Plan-de-trabajo-presidencia-Regulatel-2025.pdf",
    year: "2025",
    category: "planes-actas",
    coverImage: "/images/planes-actas/plan-2025-cover.webp",
  },
  {
    id: "plan-2024",
    title: "Plan de Trabajo REGULATEL 2024",
    url: "/documents/Plan-Trabajo-REGULATEL-2024.pdf",
    year: "2024",
    category: "planes-actas",
    coverImage: "/images/planes-actas/plan-2024-cover.webp",
  },
  {
    id: "acta-27",
    title: "Acta de la Asamblea 27",
    url: "/documents/Acta-27-Asamblea-Plenaria-Regulatel.pdf",
    year: "2025",
    category: "planes-actas",
    coverImage: "/images/planes-actas/acta-27-cover.webp",
  },
  {
    id: "acta-28",
    title: "Acta de la Asamblea 28",
    url: "/documents/Acta-28-Asamblea-Plenaria-Regulatel.pdf",
    year: "2025",
    category: "planes-actas",
  },
  {
    id: "acta-2023",
    title: "Acta de la Asamblea REGULATEL 2023",
    url: "/documents/ACTA-DE-LA-ASAMBLEA-REGULATEL-2023.pdf",
    year: "2023",
    category: "planes-actas",
    coverImage: "/images/planes-actas/acta-2023-cover.webp",
  },
  // —— Actas del Comité Ejecutivo (acceso restringido) ——
  {
    id: "acta-ce-1",
    title: "Acta No. 1 del Comité Ejecutivo",
    url: "/documents/comite-ejecutivo/Acta-1-Comite-Ejecutivo-REGULATEL.docx",
    fileName: "Acta-1-Comite-Ejecutivo-REGULATEL.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    year: "2026",
    category: "comite-ejecutivo",
  },
  {
    id: "acta-ce-2",
    title: "Acta No. 2 del Comité Ejecutivo",
    url: "/documents/comite-ejecutivo/Acta-2-Comite-Ejecutivo-REGULATEL.docx",
    fileName: "Acta-2-Comite-Ejecutivo-REGULATEL.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    year: "2026",
    category: "comite-ejecutivo",
  },
  {
    id: "acta-ce-3",
    title: "Acta No. 3 del Comité Ejecutivo",
    url: "/documents/comite-ejecutivo/Acta-3-Comite-Ejecutivo-REGULATEL.docx",
    fileName: "Acta-3-Comite-Ejecutivo-REGULATEL.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    year: "2026",
    category: "comite-ejecutivo",
  },
  {
    id: "acta-ce-4",
    title: "Acta No. 4 del Comité Ejecutivo",
    url: "/documents/comite-ejecutivo/Acta-4-Comite-Ejecutivo-REGULATEL.docx",
    fileName: "Acta-4-Comite-Ejecutivo-REGULATEL.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    year: "2026",
    category: "comite-ejecutivo",
  },
  {
    id: "acta-ce-5",
    title: "Acta No. 5 del Comité Ejecutivo",
    url: "/documents/comite-ejecutivo/Acta-5-Comite-Ejecutivo-REGULATEL.docx",
    fileName: "Acta-5-Comite-Ejecutivo-REGULATEL.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    year: "2026",
    category: "comite-ejecutivo",
  },
  {
    id: "acta-ce-6",
    title: "Acta No. 6 del Comité Ejecutivo",
    url: "/documents/comite-ejecutivo/Acta-6-Comite-Ejecutivo-REGULATEL.docx",
    fileName: "Acta-6-Comite-Ejecutivo-REGULATEL.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    year: "2026",
    category: "comite-ejecutivo",
  },
  // —— Documentos Oficiales (declaraciones, etc.) ——
  {
    id: "declaracion-paz-2023",
    title: "Declaración de la Paz REGULATEL 2023",
    url: "/documents/DECLARACION-DE-LA-PAZ-REGULATEL-2023.pdf",
    year: "2023",
    category: "documentos",
  },
  // —— Revista Digital ——
  {
    id: "revista-2026-tercera-edicion",
    title: "Revista REGULATEL - Tercera edición - Septiembre, 2026",
    url: "/documents/Revista-REGULATEL-2026-Tercera-Edicion.pdf",
    year: "2026",
    category: "revista",
  },
  {
    id: "revista-2026-segunda-edicion",
    title: "Revista REGULATEL - Segunda edición - Junio, 2026",
    url: "/documents/Revista-REGULATEL-2026-Segunda-Edicion.pdf",
    year: "2026",
    category: "revista",
  },
  {
    id: "revista-2026-final",
    title: "Revista REGULATEL - Primera edicion - Abril 2026",
    url: "/documents/Revista-REGULATEL-2026-FINAL.pdf",
    year: "2026",
    category: "revista",
  },
  {
    id: "revista-q4-2025",
    title: "Revista Digital REGULATEL - Cuarto Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q4-2025.pdf",
    year: "2025",
    quarter: "Q4",
    category: "revista",
  },
  {
    id: "revista-q3-2025",
    title: "Revista Digital REGULATEL - Tercer Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q3-2025.pdf",
    year: "2025",
    quarter: "Q3",
    category: "revista",
  },
  {
    id: "revista-q2-2025",
    title: "Revista Digital REGULATEL - Segundo Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q2-2025.pdf",
    year: "2025",
    quarter: "Q2",
    category: "revista",
  },
  {
    id: "revista-q1-2025",
    title: "Revista Digital REGULATEL - Primer Trimestre 2025",
    url: "/documents/Revista-Digital-REGULATEL-Q1-2025.pdf",
    year: "2025",
    quarter: "Q1",
    category: "revista",
  },
];

/** Valores de tipo para tabs (query param). "todo" = sin filtro. "banco" eliminado como opción visible. */
export const GESTION_TIPO_VALUES = [
  "todo",
  "revista",
  "documentos",
  "planes-actas",
  "comite-ejecutivo",
  "otros",
] as const;

export type GestionTipo = (typeof GESTION_TIPO_VALUES)[number];

/** Labels para cada tab (solo tipos visibles; "banco" ya no es tab). */
export const GESTION_TAB_LABELS: Record<GestionTipo, string> = {
  todo: "Todo",
  revista: "Revista Digital",
  documentos: "Documentos Oficiales",
  "planes-actas": "Planes y Actas",
  "comite-ejecutivo": "Comité Ejecutivo",
  otros: "Otros",
};

/** Títulos de bloque según tipo activo */
export const GESTION_BLOCK_TITLES: Record<Exclude<GestionTipo, "todo">, string> = {
  revista: "Revista digital REGULATEL",
  documentos: "Documentos Oficiales",
  "planes-actas": "Planes y Actas",
  "comite-ejecutivo": "Comité Ejecutivo",
  otros: "Otros documentos",
};

/** Label para mostrar categoría en UI (documentos con category "banco" legacy se muestran como "Otros"). */
export function getCategoryDisplayLabel(category: GestionCategory): string {
  if (category === "banco") return "Otros";
  return GESTION_TAB_LABELS[category as GestionTipo] ?? "Otros";
}

export function filterByTipo(
  docs: GestionDocument[],
  tipo: string | null
): GestionDocument[] {
  if (!tipo || tipo === "todo") return docs;
  return docs.filter((d) => d.category === tipo);
}

export type GestionSortOrder = "desc" | "asc";

/** Años únicos, del más reciente al más antiguo. */
export function uniqueDocumentYears(docs: GestionDocument[]): string[] {
  const years = new Set<string>();
  for (const doc of docs) {
    const year = doc.year?.trim();
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
}

/**
 * Orden cronológico. Por defecto, lo más reciente primero:
 * 2026 → 2025, y dentro del mismo año septiembre antes que abril, Q4 antes que Q1, acta 28 antes que 27.
 */
export function sortGestionDocuments(
  docs: GestionDocument[],
  order: GestionSortOrder = "desc"
): GestionDocument[] {
  const dir = order === "asc" ? 1 : -1;
  return [...docs].sort((a, b) => {
    const recencyDiff = documentRecencyScore(a) - documentRecencyScore(b);
    if (recencyDiff !== 0) return recencyDiff * dir;
    return a.title.localeCompare(b.title, "es", { numeric: true, sensitivity: "base" }) * dir;
  });
}

/** Normaliza texto para búsqueda (sin tildes, minúsculas). */
function normalizeSearch(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

/**
 * Busca documentos por título/categoría/año en una lista dada.
 * Usado en "Buscar documentos" con la lista estática o la lista fusionada (estático + admin).
 */
export function searchDocumentsInList(docs: GestionDocument[], query: string): GestionDocument[] {
  const n = normalizeSearch(query);
  if (!n) return [];
  return docs.filter((d) => {
    const titleNorm = normalizeSearch(d.title);
    const yearStr = d.year ? normalizeSearch(d.year) : "";
    const quarterStr = d.quarter ? normalizeSearch(d.quarter) : "";
    const catNorm = normalizeSearch(d.category);
    return (
      titleNorm.includes(n) ||
      yearStr.includes(n) ||
      quarterStr.includes(n) ||
      catNorm.includes(n)
    );
  });
}

/** Busca en la lista estática (para compatibilidad). */
export function searchDocuments(query: string): GestionDocument[] {
  return searchDocumentsInList(gestionDocuments, query);
}
