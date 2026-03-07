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

/** Año desde startDate. */
export function getEventYear(startDate: string): number {
  return new Date(startDate + "T12:00:00").getFullYear();
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

/** Formatea rango de fechas para UI (ej. "25 de Febrero", "2-5 de marzo"). */
export function formatEventDateRange(startDate: string, endDate: string | null): string {
  const s = new Date(startDate + "T12:00:00");
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const d = s.getDate();
  const m = months[s.getMonth()];
  const y = s.getFullYear();
  if (!endDate || endDate === startDate) {
    return `${d} de ${m.charAt(0).toUpperCase() + m.slice(1)}`;
  }
  const e = new Date(endDate + "T12:00:00");
  const de = e.getDate();
  const me = months[e.getMonth()];
  if (m === me && y === e.getFullYear()) {
    return `${d}-${de} de ${m.charAt(0).toUpperCase() + m.slice(1)}`;
  }
  return `${d} ${m} - ${de} ${me} ${y}`;
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
