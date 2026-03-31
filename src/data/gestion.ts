/**
 * Categorías para filtro en /gestion. Coinciden con query param ?tipo=
 */
export type GestionCategory =
  | "revista"
  | "documentos"
  | "planes-actas"
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
  if (v === "banco") return "banco";
  return "otros";
}

/** Listado filtrado de revistas en Gestión documental. */
export const GESTION_REVISTA_ARCHIVE_PATH = "/gestion?tipo=revista";

function quarterSortRank(quarter?: string): number {
  if (!quarter) return 0;
  const m = /^Q(\d)/i.exec(quarter.trim());
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Edición de revista más reciente según año y trimestre (no depende del orden del array).
 * Usado por el aviso del hero y otros destacados.
 */
export function getLatestRevistaEdition(docs: GestionDocument[] = gestionDocuments): GestionDocument | null {
  const revistas = docs.filter((d) => d.category === "revista");
  if (!revistas.length) return null;
  return [...revistas].sort((a, b) => {
    const ya = parseInt(a.year ?? "0", 10);
    const yb = parseInt(b.year ?? "0", 10);
    if (yb !== ya) return yb - ya;
    return quarterSortRank(b.quarter) - quarterSortRank(a.quarter);
  })[0];
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
  },
  {
    id: "plan-2025",
    title: "Plan de Trabajo REGULATEL 2025",
    url: "/documents/Plan-de-trabajo-presidencia-Regulatel-2025.pdf",
    year: "2025",
    category: "planes-actas",
  },
  {
    id: "plan-2024",
    title: "Plan de Trabajo REGULATEL 2024",
    url: "/documents/Plan-Trabajo-REGULATEL-2024.pdf",
    year: "2024",
    category: "planes-actas",
  },
  {
    id: "acta-27",
    title: "Acta de la Asamblea 27",
    url: "/documents/Acta-27-Asamblea-Plenaria-Regulatel.pdf",
    year: "2025",
    category: "planes-actas",
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
    id: "revista-2026-final",
    title: "Revista REGULATEL 2026 — edición final",
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
  "otros",
] as const;

export type GestionTipo = (typeof GESTION_TIPO_VALUES)[number];

/** Labels para cada tab (solo tipos visibles; "banco" ya no es tab). */
export const GESTION_TAB_LABELS: Record<GestionTipo, string> = {
  todo: "Todo",
  revista: "Revista Digital",
  documentos: "Documentos Oficiales",
  "planes-actas": "Planes y Actas",
  otros: "Otros",
};

/** Títulos de bloque según tipo activo */
export const GESTION_BLOCK_TITLES: Record<Exclude<GestionTipo, "todo">, string> = {
  revista: "Revista digital REGULATEL",
  documentos: "Documentos Oficiales",
  "planes-actas": "Planes y Actas",
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
