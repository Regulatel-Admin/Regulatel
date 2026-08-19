/**
 * Avisos extra en el hero del inicio (además del boletín y la revista).
 * Persistidos en site_settings bajo home_announcements → { slots: HomeAvisoSlot[] }.
 */

import type { HablaElReguladorInterview } from "@/data/hablaElRegulador";
import {
  hablaElReguladorInterviews,
  hablaElReguladorTeaser,
} from "@/data/hablaElRegulador";

export const HOME_ANNOUNCEMENTS_SETTINGS_KEY = "home_announcements" as const;
export const HERO_ANNOUNCE_ORDER_SETTINGS_KEY = "hero_announce_order" as const;

export const HERO_ANNOUNCE_BOLETIN_ID = "boletin";
export const HERO_ANNOUNCE_REVISTA_ID = "revista";

export const HOME_AVISO_MAX = 2;

export type HomeAvisoKind = "noticia" | "episodio" | "evento" | "revista" | "boletin";

export interface HomeAvisoSlot {
  id: string;
  kind: HomeAvisoKind;
  refId: string;
  visible: boolean;
}

/** Nota de prensa del webinar regional; se fija en los avisos de portada hasta el día del evento. */
export const WEBINAR_VIOLENCIA_DIGITAL_NEWS_SLUG = "webinar-violencia-digital-rol-entes-reguladores";

export const PINNED_HOME_ANNOUNCEMENTS: HomeAvisoSlot[] = [
  {
    id: "aviso-webinar-violencia-digital-2026",
    kind: "noticia",
    refId: WEBINAR_VIOLENCIA_DIGITAL_NEWS_SLUG,
    visible: true,
  },
];

/** Inclusive calendar day (UTC date) through which the pinned aviso stays on the home. */
export const PINNED_HOME_ANNOUNCEMENTS_UNTIL = "2026-08-20";

export const HOME_AVISO_KIND_META: Record<
  HomeAvisoKind,
  { label: string; hint: string; badge: string; cta: string; more: string }
> = {
  noticia: {
    label: "Noticia",
    hint: "Una nota publicada en el sitio",
    badge: "Noticia",
    cta: "Leer noticia",
    more: "Todas las noticias",
  },
  episodio: {
    label: "Episodio",
    hint: "Habla el Regulador",
    badge: "Habla el Regulador",
    cta: "Ver episodio",
    more: "Todos los episodios",
  },
  evento: {
    label: "Evento",
    hint: "Agenda de REGULATEL",
    badge: "Evento",
    cta: "Ver evento",
    more: "Toda la agenda",
  },
  revista: {
    label: "Revista",
    hint: "Revista Digital",
    badge: "Revista Digital",
    cta: "Leer edición",
    more: "Todas las ediciones",
  },
  boletin: {
    label: "Boletín",
    hint: "Boletines GTAI",
    badge: "Boletín GTAI",
    cta: "Ver boletín",
    more: "Todos los boletines",
  },
};

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

const KINDS: HomeAvisoKind[] = ["noticia", "episodio", "evento", "revista", "boletin"];

export function parseHomeAnnouncementsFromSettingValue(value: unknown): HomeAvisoSlot[] | null {
  const root = unwrapSettingJson(value);
  if (root == null || typeof root !== "object") return null;
  const arr = Array.isArray(root) ? root : (root as { slots?: unknown }).slots;
  if (!Array.isArray(arr)) return null;
  const out: HomeAvisoSlot[] = [];
  for (const row of arr) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id.trim() : "";
    const kind = typeof r.kind === "string" ? r.kind.trim() : "";
    const refId = typeof r.refId === "string" ? r.refId.trim() : "";
    if (!id || !KINDS.includes(kind as HomeAvisoKind) || !refId) continue;
    out.push({
      id,
      kind: kind as HomeAvisoKind,
      refId,
      visible: r.visible !== false,
    });
    if (out.length >= HOME_AVISO_MAX) break;
  }
  return out;
}

export function visibleHomeAvisos(slots: HomeAvisoSlot[] | null | undefined): HomeAvisoSlot[] {
  return (slots ?? []).filter((s) => s.visible && s.refId.trim()).slice(0, HOME_AVISO_MAX);
}

export function activePinnedHomeAnnouncements(
  todayIso = new Date().toISOString().slice(0, 10)
): HomeAvisoSlot[] {
  if (todayIso > PINNED_HOME_ANNOUNCEMENTS_UNTIL) return [];
  return PINNED_HOME_ANNOUNCEMENTS.filter((s) => s.visible && s.refId.trim());
}

/** Combina avisos fijados (webinar) con los del CMS, sin duplicar y respetando el máximo. */
export function mergeHomeAnnouncements(
  cms: HomeAvisoSlot[] | null | undefined,
  todayIso?: string
): HomeAvisoSlot[] {
  const pinned = activePinnedHomeAnnouncements(todayIso);
  const cmsVisible = visibleHomeAvisos(cms);
  const rest = cmsVisible.filter(
    (slot) =>
      !pinned.some(
        (p) => p.kind === slot.kind && p.refId.toLowerCase() === slot.refId.toLowerCase()
      )
  );
  return visibleHomeAvisos([...pinned, ...rest]);
}

export function parseHeroAnnounceOrder(value: unknown): string[] | null {
  const root = unwrapSettingJson(value);
  const arr = Array.isArray(root)
    ? root
    : root && typeof root === "object"
      ? (root as { order?: unknown }).order
      : null;
  if (!Array.isArray(arr)) return null;
  const out: string[] = [];
  for (const row of arr) {
    if (typeof row !== "string") continue;
    const id = row.trim();
    if (!id || out.includes(id)) continue;
    out.push(id);
  }
  return out;
}

/** Aplica el orden guardado y deja al final lo que aún no estaba en la lista. */
export function applyHeroAnnounceOrder(
  available: string[],
  saved: string[] | null | undefined,
): string[] {
  const remaining = new Set(available);
  const ordered: string[] = [];
  for (const id of saved ?? []) {
    if (!remaining.has(id)) continue;
    ordered.push(id);
    remaining.delete(id);
  }
  for (const id of available) {
    if (remaining.has(id)) ordered.push(id);
  }
  return ordered;
}

export function moveHeroAnnounce(order: string[], id: string, direction: -1 | 1): string[] {
  const i = order.indexOf(id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const next = order.slice();
  const current = next[i];
  const swap = next[j];
  if (current === undefined || swap === undefined) return order;
  next[i] = swap;
  next[j] = current;
  return next;
}

export function homeAvisoEpisodeCatalog(
  interviews: HablaElReguladorInterview[] = hablaElReguladorInterviews,
): HablaElReguladorInterview[] {
  return [
    {
      slug: "teaser-habla-el-regulador",
      episode: 0,
      name: "Tráiler",
      role: "Serie de entrevistas",
      organization: "REGULATEL",
      country: "",
      countryCode: "",
      duration: hablaElReguladorTeaser.duration,
      poster: hablaElReguladorTeaser.poster,
      videoSrc: hablaElReguladorTeaser.videoSrc,
    },
    ...interviews,
  ];
}
