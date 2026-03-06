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
  /** Año o trimestre para mostrar (ej. "2025", "Q4 2025") */
  year?: string;
  quarter?: string;
  category: GestionCategory;
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

/** Documentos unificados para la página Gestión. Filtrable por category. */
export const gestionDocuments: GestionDocument[] = [
  // —— Planes y Actas ——
  {
    id: "plan-2026",
    title: "Plan de trabajo de la Presidencia para Regulatel en 2026",
    url: "/documents/Plan-Trabajo-REGULATEL-2026.pdf",
    year: "2026",
    category: "planes-actas",
  },
  {
    id: "plan-2025",
    title: "Plan de Trabajo REGULATEL 2025",
    url: "https://www.regulatel.org/sites/default/files/gallery/gallery/Plan-trabajo-presidencia-Regulatel-2025-VF.pdf",
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

/** Valores de tipo para tabs (query param). "todo" = sin filtro. */
export const GESTION_TIPO_VALUES = [
  "todo",
  "revista",
  "documentos",
  "planes-actas",
  "banco",
  "otros",
] as const;

export type GestionTipo = (typeof GESTION_TIPO_VALUES)[number];

/** Labels para cada tab */
export const GESTION_TAB_LABELS: Record<GestionTipo, string> = {
  todo: "Todo",
  revista: "Revista Digital",
  documentos: "Documentos Oficiales",
  "planes-actas": "Planes y Actas",
  banco: "Banco de información",
  otros: "Otros",
};

/** Títulos de bloque según tipo activo */
export const GESTION_BLOCK_TITLES: Record<Exclude<GestionTipo, "todo">, string> = {
  revista: "Revista digital REGULATEL",
  documentos: "Documentos Oficiales",
  "planes-actas": "Planes y Actas",
  banco: "Banco de información",
  otros: "Otros documentos",
};

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
