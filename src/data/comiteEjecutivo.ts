/**
 * Comité Ejecutivo — datos por defecto y CMS (site_settings key: comite_ejecutivo).
 */

export interface ComiteMemberLogo {
  name: string;
  logoUrl: string;
  linkUrl?: string;
  /** País para ordenar Miembros del Comité alfabéticamente */
  country?: string;
}

export interface ComiteEjecutivoData {
  presidente: ComiteMemberLogo;
  vicepresidentes: ComiteMemberLogo[];
  secretarioEjecutivo: ComiteMemberLogo;
  miembros: ComiteMemberLogo[];
  /** Párrafo introductorio del bloque Funciones principales */
  funcionesIntro: string;
  funciones: string[];
}

/** Textos de cabecera y secciones editables desde el admin */
export interface ComiteEjecutivoUiResolved {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  presidenciaTitle: string;
  presidenciaSubtitle: string;
  miembrosTitle: string;
  miembrosSubtitle: string;
  funcionesSectionTitle: string;
}

export const COMITE_EJECUTIVO_SETTINGS_KEY = "comite_ejecutivo" as const;

export interface ComiteEjecutivoCmsDocument extends ComiteEjecutivoData {
  ui?: Partial<ComiteEjecutivoUiResolved>;
}

const LOGOS = "/images/comite-ejecutivo";

export const comiteEjecutivoData: ComiteEjecutivoData = {
  presidente: {
    name: "INDOTEL",
    logoUrl: `${LOGOS}/indotel.png`,
    linkUrl: "https://www.indotel.gob.do",
  },
  vicepresidentes: [
    {
      name: "Comisión de Regulación de Comunicaciones (CRC)",
      logoUrl: `${LOGOS}/crc.png`,
      linkUrl: "https://www.crcom.gov.co",
    },
    {
      name: "ANACOM",
      logoUrl: `${LOGOS}/anacom.png`,
      linkUrl: "https://www.anacom.pt",
    },
  ],
  secretarioEjecutivo: {
    name: "INDOTEL",
    logoUrl: `${LOGOS}/indotel.png`,
    linkUrl: "https://www.indotel.gob.do",
  },
  miembros: [
    { name: "ATT", logoUrl: `${LOGOS}/att.png`, linkUrl: "https://www.att.gob.bo", country: "Bolivia" },
    { name: "ANATEL", logoUrl: `${LOGOS}/anatel.png`, linkUrl: "https://www.anatel.gov.br", country: "Brasil" },
    { name: "SUTEL", logoUrl: `${LOGOS}/sutel.png`, linkUrl: "https://www.sutel.go.cr", country: "Costa Rica" },
    { name: "CNMC", logoUrl: `${LOGOS}/cnmc.png`, linkUrl: "https://www.cnmc.es", country: "España" },
    { name: "OSIPTEL", logoUrl: `${LOGOS}/osiptel.png`, linkUrl: "https://www.osiptel.gob.pe", country: "Perú" },
  ],
  funcionesIntro:
    "El Comité Ejecutivo está constituído por un grupo de organismos reguladores que lideran la dirección estratégica del Foro y coordinan la ejecución del plan de trabajo. Sus miembros son elegidos anualmente por la Asamblea y tienen como funciones principales:",
  funciones: [
    "Dirigir y coordinar las actividades del Foro y establecer las prioridades estratégicas.",
    "Supervisar la implementación de los programas y el plan de trabajo.",
    "Coordinar los grupos de trabajo y la representación del Foro en eventos internacionales.",
    "Promover la cooperación entre los países miembros y el intercambio de mejores prácticas.",
  ],
};

const DEFAULT_UI: ComiteEjecutivoUiResolved = {
  heroTitle: "Comité Ejecutivo",
  heroSubtitle: "QUIÉNES SOMOS",
  heroDescription:
    "Organismos reguladores que lideran la dirección estratégica del Foro y coordinan el plan de trabajo anual.",
  presidenciaTitle: "Presidencia y Vicepresidencias",
  presidenciaSubtitle: "Elegidos anualmente por la Asamblea Plenaria",
  miembrosTitle: "Miembros del Comité",
  miembrosSubtitle: "Orden alfabético por país",
  funcionesSectionTitle: "Funciones principales",
};

export function defaultComiteEjecutivoCmsDocument(): ComiteEjecutivoCmsDocument {
  return {
    presidente: { ...comiteEjecutivoData.presidente },
    vicepresidentes: comiteEjecutivoData.vicepresidentes.map((x) => ({ ...x })),
    secretarioEjecutivo: { ...comiteEjecutivoData.secretarioEjecutivo },
    miembros: comiteEjecutivoData.miembros.map((x) => ({ ...x })),
    funcionesIntro: comiteEjecutivoData.funcionesIntro,
    funciones: [...comiteEjecutivoData.funciones],
    ui: {},
  };
}

export function resolveComiteEjecutivoUi(doc: ComiteEjecutivoCmsDocument): ComiteEjecutivoUiResolved {
  const u = doc.ui ?? {};
  return {
    heroTitle: (u.heroTitle ?? "").trim() || DEFAULT_UI.heroTitle,
    heroSubtitle: (u.heroSubtitle ?? "").trim() || DEFAULT_UI.heroSubtitle,
    heroDescription: (u.heroDescription ?? "").trim() || DEFAULT_UI.heroDescription,
    presidenciaTitle: (u.presidenciaTitle ?? "").trim() || DEFAULT_UI.presidenciaTitle,
    presidenciaSubtitle: (u.presidenciaSubtitle ?? "").trim() || DEFAULT_UI.presidenciaSubtitle,
    miembrosTitle: (u.miembrosTitle ?? "").trim() || DEFAULT_UI.miembrosTitle,
    miembrosSubtitle: (u.miembrosSubtitle ?? "").trim() || DEFAULT_UI.miembrosSubtitle,
    funcionesSectionTitle: (u.funcionesSectionTitle ?? "").trim() || DEFAULT_UI.funcionesSectionTitle,
  };
}

function parseMember(v: unknown): ComiteMemberLogo | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const logoUrl = typeof o.logoUrl === "string" ? o.logoUrl.trim() : "";
  if (!name || !logoUrl) return null;
  const linkUrl = typeof o.linkUrl === "string" && o.linkUrl.trim() ? o.linkUrl.trim() : undefined;
  const country = typeof o.country === "string" && o.country.trim() ? o.country.trim() : undefined;
  return { name, logoUrl, linkUrl, country };
}

function parseMembersArray(v: unknown): ComiteMemberLogo[] {
  if (!Array.isArray(v)) return [];
  const out: ComiteMemberLogo[] = [];
  for (const item of v) {
    const m = parseMember(item);
    if (m) out.push(m);
  }
  return out;
}

function parseUiPartial(v: unknown): ComiteEjecutivoCmsDocument["ui"] {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : undefined);
  const ui: NonNullable<ComiteEjecutivoCmsDocument["ui"]> = {};
  const keys: (keyof ComiteEjecutivoUiResolved)[] = [
    "heroTitle",
    "heroSubtitle",
    "heroDescription",
    "presidenciaTitle",
    "presidenciaSubtitle",
    "miembrosTitle",
    "miembrosSubtitle",
    "funcionesSectionTitle",
  ];
  for (const k of keys) {
    const s = str(k);
    if (s !== undefined) ui[k] = s;
  }
  return Object.keys(ui).length ? ui : undefined;
}

/** Devuelve documento CMS o null si falta estructura mínima (p. ej. presidente). */
export function parseComiteEjecutivoCmsFromSettingValue(value: unknown): ComiteEjecutivoCmsDocument | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  const presidente = parseMember(o.presidente);
  if (!presidente) return null;
  const vicepresidentes = parseMembersArray(o.vicepresidentes);
  const miembros = parseMembersArray(o.miembros);
  const secretarioEjecutivo =
    parseMember(o.secretarioEjecutivo) ?? { ...comiteEjecutivoData.secretarioEjecutivo };
  const funcionesIntro =
    typeof o.funcionesIntro === "string" ? o.funcionesIntro : comiteEjecutivoData.funcionesIntro;
  let funciones: string[] = [];
  if (Array.isArray(o.funciones)) {
    funciones = o.funciones.filter((x): x is string => typeof x === "string").map((x) => x.trim());
  }
  if (funciones.length === 0) funciones = [...comiteEjecutivoData.funciones];
  return {
    presidente,
    vicepresidentes,
    secretarioEjecutivo,
    miembros,
    funcionesIntro,
    funciones,
    ui: parseUiPartial(o.ui),
  };
}
