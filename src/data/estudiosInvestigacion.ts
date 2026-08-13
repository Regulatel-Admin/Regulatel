export const ESTUDIOS_INVESTIGACION_SETTINGS_KEY = "estudios_investigacion" as const;

export interface EstudioInvestigacion {
  id: string;
  title: string;
  description: string;
  url: string;
}

export const defaultEstudiosInvestigacion: EstudioInvestigacion[] = [
  {
    id: "conectividad-2022",
    title: "Diagnóstico sobre la Conectividad en la Región de REGULATEL 2022",
    description: "Análisis de la conectividad en la región de REGULATEL (versión final).",
    url: "/documents/estudios/diagnostico-conectividad-region-regulatel-2022.pdf",
  },
  {
    id: "industria-40",
    title: "Diagnóstico sobre la Industria 4.0 en la región de REGULATEL",
    description: "Estudio sobre Industria 4.0 en la región (versión final).",
    url: "/documents/estudios/diagnostico-industria-40-region-regulatel.pdf",
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

export function parseEstudiosFromSettingValue(value: unknown): EstudioInvestigacion[] | null {
  const root = unwrapSettingJson(value);
  if (root == null) return null;
  const items = Array.isArray(root)
    ? root
    : root && typeof root === "object"
      ? (root as { items?: unknown }).items
      : null;
  if (!Array.isArray(items)) return null;
  const out: EstudioInvestigacion[] = [];
  for (const row of items) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id.trim() : "";
    const title = typeof r.title === "string" ? r.title : "";
    if (!id && !title) continue;
    out.push({
      id: id || `estudio-${out.length + 1}`,
      title,
      description: typeof r.description === "string" ? r.description : "",
      url: typeof r.url === "string" ? r.url : "",
    });
  }
  return out;
}
