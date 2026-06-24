/**
 * Modelo único de evento (source of truth).
 * Admin gestiona todos los eventos desde /admin/eventos.
 * status se deriva por fecha; year se puede derivar de startDate o editar.
 */

export type EventStatus = "upcoming" | "past";

export interface Event {
  id: string;
  title: string;
  organizer: string;
  location: string;
  startDate: string; // ISO YYYY-MM-DD, obligatorio
  endDate: string | null;
  year: number;
  status: EventStatus;
  registrationUrl: string | null;
  detailsUrl: string | null;
  isFeatured: boolean;
  tags: string[];
  description?: string;
  imageUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
  imageSize?: number;
  createdAt: string; // ISO
  updatedAt: string;
}

/** Deriva status: upcoming si endDate (o startDate) >= hoy, sino past. */
export function getEventStatus(e: { startDate: string; endDate: string | null }): EventStatus {
  const ref = e.endDate ?? e.startDate;
  const today = new Date().toISOString().slice(0, 10);
  return ref >= today ? "upcoming" : "past";
}

/** Año desde startDate. Si la fecha es inválida, devuelve el año actual. */
export function getEventYear(startDate: string): number {
  if (!startDate || typeof startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(startDate.trim())) {
    return new Date().getFullYear();
  }
  const y = new Date(startDate.trim() + "T12:00:00").getFullYear();
  return Number.isNaN(y) ? new Date().getFullYear() : y;
}

/** Genera id slug desde título y año. */
export function slugifyEventId(title: string, year: number): string {
  const base = `${title}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "evento";
}

/** Crea un Event con status y year derivados y timestamps. */
export function createEvent(
  input: Omit<Event, "status" | "year" | "createdAt" | "updatedAt"> & {
    year?: number;
    startDate: string;
    endDate?: string | null;
  }
): Event {
  const now = new Date().toISOString();
  const year = input.year ?? getEventYear(input.startDate);
  const status = getEventStatus({
    startDate: input.startDate,
    endDate: input.endDate ?? null,
  });
  return {
    ...input,
    year,
    status,
    endDate: input.endDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

const FALLBACK_DATE_LABEL = "—";

const LOCALE_MAP: Record<string, string> = {
  es: "es-ES",
  en: "en-GB",
  pt: "pt-PT",
};

function monthLabel(date: Date, language: string): string {
  const locale = LOCALE_MAP[language] ?? "es-ES";
  const raw = date.toLocaleDateString(locale, { month: "long" });
  return language === "es" ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
}

/** Formatea rango de fechas para UI (ej. "25 de Febrero", "2-5 de marzo"). Si la fecha es inválida, devuelve "—". */
export function formatEventDateRange(
  startDate: string,
  endDate: string | null,
  language = "es"
): string {
  if (!startDate || typeof startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(startDate.trim())) {
    return FALLBACK_DATE_LABEL;
  }
  const s = new Date(startDate.trim() + "T12:00:00");
  if (Number.isNaN(s.getTime())) return FALLBACK_DATE_LABEL;
  const d = s.getDate();
  const m = monthLabel(s, language);
  const y = s.getFullYear();
  const dePrefix = language === "es" ? " de " : " ";
  if (!endDate || endDate === startDate) {
    return language === "es" ? `${d} de ${m}` : `${d}${dePrefix}${m}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
    return language === "es" ? `${d} de ${m}` : `${d}${dePrefix}${m}`;
  }
  const e = new Date(endDate.trim() + "T12:00:00");
  if (Number.isNaN(e.getTime())) {
    return language === "es" ? `${d} de ${m}` : `${d}${dePrefix}${m}`;
  }
  const de = e.getDate();
  const me = monthLabel(e, language);
  if (m === me && y === e.getFullYear()) {
    return language === "es"
      ? `${d}-${de} de ${m}`
      : `${d}-${de}${dePrefix}${m}${y !== new Date().getFullYear() ? ` ${y}` : ""}`;
  }
  return language === "es"
    ? `${d} ${m} - ${de} ${me} ${y}`
    : `${d}${dePrefix}${m} - ${de}${dePrefix}${me} ${y}`;
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "Próximo",
  past: "Pasado",
};

/** Recalcula status y year desde fechas (al cargar desde storage). */
export function normalizeEvent(e: Event): Event {
  return {
    ...e,
    status: getEventStatus(e),
    year: getEventYear(e.startDate),
  };
}
