/**
 * Grupos de trabajo â€” pÃ¡gina pÃºblica /grupos-de-trabajo.
 * site_settings key: grupos_trabajo â†’ { entries: GrupoTrabajoSerialized[] }
 */

import type { LucideIcon } from "lucide-react";
import {
  Users,
  Briefcase,
  Network,
  TrendingUp,
  Shield,
  Sparkles,
  BarChart3,
  Wifi,
} from "lucide-react";

export const GRUPOS_TRABAJO_SETTINGS_KEY = "grupos_trabajo" as const;

const INFORMES_2025 = "/documents/grupos-trabajo/informes-2025";

export const GRUPO_ICON_KEYS = [
  "Shield",
  "Wifi",
  "BarChart3",
  "TrendingUp",
  "Network",
  "Briefcase",
  "Sparkles",
  "Users",
] as const;

export type GrupoTrabajoIconKey = (typeof GRUPO_ICON_KEYS)[number];

const ICON_MAP: Record<GrupoTrabajoIconKey, LucideIcon> = {
  Shield,
  Wifi,
  BarChart3,
  TrendingUp,
  Network,
  Briefcase,
  Sparkles,
  Users,
};

export function getGrupoTrabajoIcon(key: string): LucideIcon {
  if (key in ICON_MAP) return ICON_MAP[key as GrupoTrabajoIconKey];
  return Shield;
}

export function isGrupoTrabajoIconKey(s: string): s is GrupoTrabajoIconKey {
  return (GRUPO_ICON_KEYS as readonly string[]).includes(s);
}

/** Datos serializables (sin componentes React). */
export interface GrupoTrabajoSerialized {
  id: string;
  title: string;
  description: string;
  coordinadores: string[];
  miembros: string[];
  iconKey: GrupoTrabajoIconKey;
  imageUrl: string;
  termsUrl?: string;
  informeUrl?: string;
}

export const defaultGruposTrabajo: GrupoTrabajoSerialized[] = [
  {
    id: "proteccion-empoderamiento-usuarios",
    title: "ProtecciÃ³n y empoderamiento de los usuarios",
    description:
      "Buenas prÃ¡cticas regulatorias en atenciÃ³n al usuario, seguridad de dispositivos y control de fraudes en telecomunicaciones.",
    coordinadores: ["OSIPTEL, PerÃº"],
    miembros: ["SUTEL, Costa Rica", "ATT, Bolivia", "INDOTEL, RepÃºblica Dominicana", "CRC, Colombia"],
    iconKey: "Shield",
    imageUrl: "/grupos-trabajo/proteccion-empoderamiento-usuarios.jpg",
    termsUrl: "/documents/grupos-trabajo/proteccion-empoderamiento-usuarios-2026.pdf",
    informeUrl: `${INFORMES_2025}/proteccion-empoderamiento-informe-2025.pptx`,
  },
  {
    id: "cierre-brecha-calidad",
    title: "Cierre de brecha y calidad de servicios",
    description:
      "Intercambio de experiencias sobre calidad, despliegue y comparticiÃ³n de infraestructura para cerrar la brecha digital.",
    coordinadores: ["CRC, Colombia"],
    miembros: ["ASEP, PanamÃ¡", "ATT, Bolivia"],
    iconKey: "Wifi",
    imageUrl: "/grupos-trabajo/cierre-brecha-calidad.jpg",
    termsUrl: "/documents/grupos-trabajo/cierre-brecha-calidad-servicios-2026.pdf",
    informeUrl: `${INFORMES_2025}/cierre-brecha-calidad-informe-2025.pdf`,
  },
  {
    id: "indicadores-telecomunicaciones-tic",
    title: "Indicadores de Telecomunicaciones / TIC",
    description: "EstadÃ­sticas regionales y tecnologÃ­as emergentes para optimizar y visualizar datos de conectividad.",
    coordinadores: ["CRT, MÃ©xico", "SUTEL, Costa Rica"],
    miembros: ["INDOTEL, RepÃºblica Dominicana", "ATT, Bolivia"],
    iconKey: "BarChart3",
    imageUrl: "/grupos-trabajo/indicadores-telecomunicaciones-tic.jpg",
    termsUrl: "/documents/grupos-trabajo/indicadores-telecomunicaciones-tic-2026.pdf",
    informeUrl: `${INFORMES_2025}/indicadores-telecomunicaciones-informe-2025.pptx`,
  },
  {
    id: "fortalecimiento-institucional",
    title: "Fortalecimiento Institucional",
    description:
      "Iniciativas para la autoevaluaciÃ³n, transparencia y financiamiento del Foro en favor de la eficiencia regulatoria.",
    coordinadores: ["OSIPTEL, PerÃº"],
    miembros: ["ANATEL, Brasil", "INDOTEL, RepÃºblica Dominicana"],
    iconKey: "TrendingUp",
    imageUrl: "/grupos-trabajo/fortalecimiento-institucional.jpg",
    termsUrl: "/documents/grupos-trabajo/fortalecimiento-institucional-2026.pdf",
    informeUrl: `${INFORMES_2025}/fortalecimiento-institucional-informe-2025.pptx`,
  },
  {
    id: "asuntos-internet",
    title: "Asuntos de Internet",
    description: "Intercambio de experiencias sobre Internet desde perspectiva regulatoria, tÃ©cnica y de gobernanza.",
    coordinadores: ["ENACOM, Argentina", "ANATEL, Brasil"],
    miembros: ["ASEP, PanamÃ¡"],
    iconKey: "Network",
    imageUrl: "/grupos-trabajo/asuntos-internet.jpg",
    termsUrl: "/documents/grupos-trabajo/asuntos-internet-2026.pdf",
    informeUrl: `${INFORMES_2025}/asuntos-internet-informe-2025.pptx`,
  },
  {
    id: "mercados-digitales",
    title: "Mercados Digitales",
    description: "Espacio de diÃ¡logo para anticipar retos y oportunidades en mercados y servicios digitales.",
    coordinadores: ["CRC, Colombia", "ANATEL, Brasil"],
    miembros: ["OSIPTEL, PerÃº (TBC)"],
    iconKey: "Briefcase",
    imageUrl: "/grupos-trabajo/mercados-digitales.jpg",
    termsUrl: "/documents/grupos-trabajo/mercados-digitales-2026.pdf",
    informeUrl: `${INFORMES_2025}/mercados-digitales-informe-2025.pdf`,
  },
  {
    id: "innovacion-mejora-regulatoria",
    title: "InnovaciÃ³n y mejora regulatoria",
    description: "Promover marcos regulatorios eficientes y transparentes que impulsen la innovaciÃ³n y la competencia.",
    coordinadores: ["CRC, Colombia"],
    miembros: ["INDOTEL, RepÃºblica Dominicana", "ENACOM, Argentina", "ASEP, PanamÃ¡"],
    iconKey: "Sparkles",
    imageUrl: "/grupos-trabajo/innovacion-mejora-regulatoria.jpg",
    termsUrl: "/documents/grupos-trabajo/innovacion-mejora-regulatoria-2026.pdf",
  },
  {
    id: "paridad-sociedad-informacion",
    title: "Paridad en la Sociedad de la InformaciÃ³n",
    description: "Fomento de medidas regulatorias para la equidad en TIC y la igualdad de gÃ©nero, alineadas con los ODS.",
    coordinadores: ["INDOTEL, RepÃºblica Dominicana", "CONATEL, Paraguay"],
    miembros: ["ATT, Bolivia"],
    iconKey: "Users",
    imageUrl: "/grupos-trabajo/paridad-sociedad-informacion.jpg",
    termsUrl: "/documents/grupos-trabajo/paridad-sociedad-informacion-2026.pdf",
    informeUrl: `${INFORMES_2025}/paridad-sociedad-informacion-informe-2025.pdf`,
  },
  {
    id: "ciberseguridad",
    title: "Ciberseguridad",
    description:
      "Impulsar el anÃ¡lisis regulatorio y las buenas prÃ¡cticas para fortalecer la seguridad digital en telecomunicaciones a nivel regional.",
    coordinadores: ["INDOTEL, RepÃºblica Dominicana"],
    miembros: ["ANATEL, Brasil"],
    iconKey: "Shield",
    imageUrl: "/grupos-trabajo/ciberseguridad.jpg",
    termsUrl: "/documents/grupos-trabajo/ciberseguridad-2026.pdf",
  },
];

function parseStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== "string") continue;
    const t = item.trim();
    if (t) out.push(t);
  }
  return out;
}

export function parseGruposTrabajoFromSettingValue(value: unknown): GrupoTrabajoSerialized[] | null {
  if (value == null || typeof value !== "object") return null;
  const entries = (value as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return null;
  const out: GrupoTrabajoSerialized[] = [];
  for (const row of entries) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id.trim() : "";
    const title = typeof r.title === "string" ? r.title : "";
    const description = typeof r.description === "string" ? r.description : "";
    const imageUrl = typeof r.imageUrl === "string" ? r.imageUrl : "";
    if (!id || !title) continue;
    const coords = parseStringArray(r.coordinadores);
    const miems = parseStringArray(r.miembros);
    if (coords === null || miems === null) continue;
    const rawIcon = typeof r.iconKey === "string" ? r.iconKey : "Shield";
    const iconKey = isGrupoTrabajoIconKey(rawIcon) ? rawIcon : "Shield";
    const termsUrl = typeof r.termsUrl === "string" && r.termsUrl.trim() ? r.termsUrl.trim() : undefined;
    const informeUrl = typeof r.informeUrl === "string" && r.informeUrl.trim() ? r.informeUrl.trim() : undefined;
    out.push({
      id,
      title,
      description,
      coordinadores: coords,
      miembros: miems,
      iconKey,
      imageUrl,
      termsUrl,
      informeUrl,
    });
  }
  return out.length > 0 ? out : null;
}
