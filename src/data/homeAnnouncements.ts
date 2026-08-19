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

export const HOME_AVISO_MAX = 2;

export type HomeAvisoKind = "noticia" | "episodio" | "evento";

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

const KINDS: HomeAvisoKind[] = ["noticia", "episodio", "evento"];

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

export function homeAvisoEpisodeCatalog(): HablaElReguladorInterview[] {
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
    ...hablaElReguladorInterviews,
  ];
}
