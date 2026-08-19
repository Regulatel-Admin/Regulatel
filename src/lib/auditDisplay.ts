export type AuditRow = {
  id: string;
  user_email: string;
  user_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: unknown;
  created_at: string;
};

export const ACTION_LABELS: Record<string, string> = {
  created: "Creó",
  updated: "Guardó",
  deleted: "Eliminó",
  uploaded: "Subió",
};

export const RESOURCE_LABELS: Record<string, string> = {
  news: "Noticia",
  event: "Evento",
  document: "Documento",
  upload: "Archivo",
  admin_user: "Usuario",
  cifras: "Cifras",
  site_settings: "Página del sitio",
};

const SETTING_LABELS: Record<string, string> = {
  home_hero: "Portada",
  featured_carousel: "Cumbres",
  quick_links: "Accesos de la portada",
  navigation: "Menú del sitio",
  gallery_albums: "Galería",
  directorio_autoridades: "Directorio de autoridades",
  grupos_trabajo: "Grupos de trabajo",
  boletines_gtai: "Boletines GTAI",
  buenas_practicas_regulatorias: "Buenas prácticas",
  comite_ejecutivo: "Comité Ejecutivo",
  convenios: "Convenios",
  entes_reguladores_miembros: "Entes miembros",
  autoridades_actuales: "Autoridades actuales",
  revista_digital: "Revista digital",
  home_announcements: "Avisos de la portada",
  hero_announce_order: "Orden de avisos de la portada",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  slug: "Enlace",
  name: "Nombre",
  email: "Correo",
  role: "Rol",
  key: "Sección",
  year: "Año",
  url: "Archivo",
  merged: "Combinó cambios de otra persona",
  gruposTrabajo: "Grupos de trabajo",
  comitesEjecutivos: "Comités ejecutivos",
  revistaDigital: "Revista digital",
  paises: "Países",
  restoredDefault: "Volvió a los valores originales",
};

export function normalizeAuditDetails(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    try {
      return normalizeAuditDetails(JSON.parse(trimmed));
    } catch {
      return { nota: trimmed };
    }
  }
  if (Array.isArray(raw)) {
    if (raw.length > 8 && raw.every((item) => typeof item === "string" && item.length <= 1)) {
      return normalizeAuditDetails(raw.join(""));
    }
    return { elementos: raw };
  }
  if (typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    const keys = Object.keys(record);
    if (
      keys.length > 8 &&
      keys.every((key, index) => key === String(index) && typeof record[key] === "string")
    ) {
      return normalizeAuditDetails(keys.map((key) => String(record[key])).join(""));
    }
    return record;
  }
  return { valor: raw };
}

export function humanizeKey(value: string): string {
  if (SETTING_LABELS[value]) return SETTING_LABELS[value];
  if (RESOURCE_LABELS[value]) return RESOURCE_LABELS[value];
  if (FIELD_LABELS[value]) return FIELD_LABELS[value];
  const cleaned = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return value;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function actorName(row: AuditRow): string {
  const name = row.user_name?.trim();
  if (name) return name;
  const email = row.user_email?.trim();
  if (email) return email.split("@")[0] ?? email;
  return "Alguien del equipo";
}

export function actorInitials(row: AuditRow): string {
  const name = actorName(row);
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function resourceLabel(row: AuditRow): string {
  if (row.resource_type === "site_settings") {
    const details = normalizeAuditDetails(row.details);
    const key = typeof details.key === "string" ? details.key : row.resource_id;
    return key ? humanizeKey(key) : "Página del sitio";
  }
  return RESOURCE_LABELS[row.resource_type] ?? humanizeKey(row.resource_type);
}

function titleFromDetails(details: Record<string, unknown>, fallback?: string | null): string | null {
  for (const key of ["title", "name", "label"] as const) {
    const value = details[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  if (fallback) {
    if (SETTING_LABELS[fallback]) return SETTING_LABELS[fallback];
    return humanizeKey(fallback);
  }
  return null;
}

export function auditHeadline(row: AuditRow): string {
  const who = actorName(row);
  const verb = ACTION_LABELS[row.action] ?? row.action;
  const details = normalizeAuditDetails(row.details);
  const subject = resourceLabel(row);
  const title = titleFromDetails(details, row.resource_type === "site_settings" ? null : row.resource_id);

  if (row.resource_type === "site_settings") {
    return `${who} ${verb.toLowerCase()} ${subject}`;
  }
  if (row.resource_type === "cifras") {
    const year = details.year ?? row.resource_id;
    return `${who} ${verb.toLowerCase()} las cifras${year ? ` de ${year}` : ""}`;
  }
  if (row.resource_type === "upload") {
    return `${who} subió un archivo`;
  }
  if (title && title !== subject) {
    return `${who} ${verb.toLowerCase()} ${subject.toLowerCase()}: ${title}`;
  }
  return `${who} ${verb.toLowerCase()} ${subject.toLowerCase()}`;
}

export function formatFieldValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value) || value.includes("@")) return value;
    if (/[_-]/.test(value)) return humanizeKey(value);
    return value;
  }
  if (Array.isArray(value)) {
    return value.length === 1 ? "1 elemento" : `${value.length} elementos`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.title === "string") return record.title;
    if (typeof record.label === "string") return record.label;
    if (typeof record.name === "string") return record.name;
    const count = Object.keys(record).length;
    return count === 1 ? "1 campo" : `${count} campos`;
  }
  return "—";
}

export type AuditFact = { label: string; value: string; href?: string };

export function auditFacts(row: AuditRow): AuditFact[] {
  const details = normalizeAuditDetails(row.details);
  const facts: AuditFact[] = [];
  const skip = new Set(["key"]);

  if (row.resource_type === "site_settings") {
    facts.push({ label: "Sección", value: resourceLabel(row) });
    if (details.merged === true) {
      facts.push({ label: "Nota", value: "Se combinó con cambios de otra persona" });
    }
    return facts;
  }

  for (const [key, value] of Object.entries(details)) {
    if (skip.has(key) || value == null || value === "") continue;
    if (key === "url" && typeof value === "string") {
      facts.push({ label: FIELD_LABELS[key] ?? humanizeKey(key), value, href: value });
      continue;
    }
    facts.push({
      label: FIELD_LABELS[key] ?? humanizeKey(key),
      value: formatFieldValue(value),
    });
  }

  if (facts.length === 0 && row.resource_id) {
    facts.push({ label: "Referencia", value: humanizeKey(row.resource_id) });
  }
  return facts;
}

export function formatAuditDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-DO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function relativeAuditTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Ahora mismo";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return formatAuditDate(iso);
}

export function dayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha desconocida";
  const today = new Date();
  const startOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return date.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function actionTone(action: string): { bg: string; fg: string; dot: string } {
  if (action === "deleted") return { bg: "rgba(185,28,28,0.10)", fg: "#991b1b", dot: "#dc2626" };
  if (action === "created") return { bg: "rgba(68,137,198,0.14)", fg: "#1d4f7a", dot: "var(--regu-blue)" };
  if (action === "uploaded") return { bg: "rgba(22,61,89,0.10)", fg: "var(--regu-navy)", dot: "var(--regu-navy)" };
  return { bg: "rgba(15,118,110,0.12)", fg: "#0f766e", dot: "#0f766e" };
}
