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
