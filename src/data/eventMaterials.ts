import type { Event } from "@/types/event";
import materials from "@/data/semanaRegulatelMaterials.json";
import { SEMANA_REGULATEL_2026_ATTACHMENTS, SEMANA_REGULATEL_2026_EVENT_ID } from "@/data/semanaRegulatel2026";

export const SEMANA_RESOURCE_GROUPS: Record<string, "cumbres" | "comite"> = {
  "cumbre-berec-regulatel-2026": "cumbres",
  "cumbre-regulatel-prai-2026": "cumbres",
  "asamblea-general-prai-2026": "cumbres",
  "reunio-n-anual-grupos-de-trabajo-regulatel-2026": "comite",
  "reunion-anual-grupos-de-trabajo-regulatel-2026": "comite",
};

/** Advertise only resources actually rendered by the event detail page. */
export function getEventMaterials(event: Event) {
  const group = SEMANA_RESOURCE_GROUPS[event.id];
  if (group) {
    const data = materials[group];
    return { programs: data.programs.length, documents: data.documents.length, photos: data.photos.length };
  }
  const attachments = event.attachments?.filter(doc => doc.url?.trim()) ?? [];
  const isAsiet = event.id === SEMANA_REGULATEL_2026_EVENT_ID ||
    (event.startDate === "2026-10-16" && /asiet/i.test(event.title) && /comtelca/i.test(event.title));
  const documents = attachments.length || (isAsiet ? SEMANA_REGULATEL_2026_ATTACHMENTS.length : 0);
  return documents ? { programs: 0, documents, photos: 0 } : null;
}
