import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, Mic2, Newspaper, Search, Send, Trash2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useHablaElReguladorInterviews, useRevistaDigitalEditions, useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAdminData, useEvents, useMergedNews } from "@/contexts/AdminDataContext";
import { useBoletinesGtai } from "@/hooks/useBoletinesGtai";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import {
  HOME_ANNOUNCEMENTS_SETTINGS_KEY,
  HOME_AVISO_KIND_META,
  HOME_AVISO_MAX,
  homeAvisoEpisodeCatalog,
  type HomeAvisoKind,
  type HomeAvisoSlot,
} from "@/data/homeAnnouncements";

const KINDS: Array<{ kind: HomeAvisoKind; icon: typeof Newspaper }> = [
  { kind: "noticia", icon: Newspaper },
  { kind: "episodio", icon: Mic2 },
  { kind: "evento", icon: CalendarDays },
  { kind: "revista", icon: BookOpen },
  { kind: "boletin", icon: FileText },
];

type Choice = {
  id: string;
  title: string;
  meta?: string;
  thumb?: string;
  draft?: boolean;
  sortDate?: string;
};

function emptySlot(): HomeAvisoSlot {
  return {
    id: `aviso-${Date.now()}`,
    kind: "noticia",
    refId: "",
    visible: true,
  };
}

function matchesQuery(query: string, ...parts: Array<string | undefined>) {
  if (!query) return true;
  return parts.some((part) => (part ?? "").toLowerCase().includes(query));
}

export function HomeAvisoForm({ id }: { id?: string }) {
  const { homeAnnouncements, refetch } = useSiteSettings();
  const { recordPersistedChange, clearPreview } = useSiteEdit();
  const persisted = homeAnnouncements ?? [];
  const { adminNews } = useAdminData();
  const publishedNews = useMergedNews();
  const events = useEvents();
  const interviews = useHablaElReguladorInterviews();
  const episodes = useMemo(() => homeAvisoEpisodeCatalog(interviews), [interviews]);
  const revistas = useRevistaDigitalEditions();
  const { entries: boletines } = useBoletinesGtai();

  const { value: slot, setValue: setSlot } = useDraftHistory<HomeAvisoSlot>(() => {
    const found = id ? persisted.find((s) => s.id === id) : undefined;
    return found ? { ...found } : emptySlot();
  });

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewSlots = useMemo(() => {
    const list = persisted.map((s) => ({ ...s }));
    if (!slot.refId.trim()) {
      return list.filter((s) => s.id !== slot.id);
    }
    const next: HomeAvisoSlot = { ...slot, visible: true };
    const idx = list.findIndex((s) => s.id === slot.id);
    if (idx >= 0) list[idx] = next;
    else if (list.length < HOME_AVISO_MAX) list.push(next);
    return list;
  }, [persisted, slot]);

  const captureBaseline = usePreviewSync("homeAnnouncements", previewSlots);

  const q = query.trim().toLowerCase();
  const choices = useMemo((): Choice[] => {
    if (slot.kind === "noticia") {
      const bySlug = new Map<string, Choice>();
      for (const n of publishedNews) {
        if (!matchesQuery(q, n.title, n.excerpt)) continue;
        bySlug.set(n.slug.toLowerCase(), {
          id: n.slug,
          title: n.title,
          meta: n.dateFormatted,
          thumb: n.imageUrl,
          sortDate: n.date,
        });
      }
      for (const n of adminNews) {
        if (n.published !== false) continue;
        if (!matchesQuery(q, n.title, n.excerpt)) continue;
        const slug = n.slug || n.id;
        bySlug.set(slug.toLowerCase(), {
          id: slug,
          title: n.title,
          meta: n.dateFormatted || n.date,
          thumb: n.imageUrl,
          draft: true,
          sortDate: n.date,
        });
      }
      return [...bySlug.values()].sort((a, b) => (a.sortDate ?? "").localeCompare(b.sortDate ?? "") * -1);
    }
    if (slot.kind === "episodio") {
      return episodes
        .filter((e) => matchesQuery(q, e.name, e.organization, e.country, e.role))
        .map((e) => ({
          id: e.slug,
          title: e.episode > 0 ? `Episodio ${e.episode} · ${e.name}` : `Tráiler · ${e.name}`,
          meta: [e.organization, e.country].filter(Boolean).join(" · "),
          thumb: e.poster,
        }));
    }
    if (slot.kind === "revista") {
      return [...revistas]
        .filter((e) => matchesQuery(q, e.title, e.description, e.year, e.coverEdition))
        .sort((a, b) => `${b.year}${b.quarter ?? ""}`.localeCompare(`${a.year}${a.quarter ?? ""}`))
        .map((e) => ({
          id: e.id,
          title: e.title,
          meta: [e.year, e.coverEdition || e.quarter].filter(Boolean).join(" · "),
          draft: !e.isPublished,
        }));
    }
    if (slot.kind === "boletin") {
      return [...boletines]
        .filter((e) => matchesQuery(q, e.title, e.shortSummary, e.description, String(e.year)))
        .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate) || b.issueNumber - a.issueNumber)
        .map((e) => ({
          id: e.slug,
          title: e.title,
          meta: `${e.year} · Nº ${e.issueNumber}`,
          thumb: e.coverImage,
          draft: !e.isPublished,
        }));
    }
    return [...events]
      .filter((e) => matchesQuery(q, e.title, e.location, e.description))
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map((e) => ({
        id: e.id,
        title: e.title,
        meta: [e.startDate, e.location].filter(Boolean).join(" · "),
        thumb: e.imageUrl,
      }));
  }, [slot.kind, publishedNews, adminNews, events, episodes, revistas, boletines, q]);

  const save = async () => {
    const next = previewSlots.filter((s) => s.visible && s.refId.trim()).slice(0, HOME_AVISO_MAX);
    if (!slot.refId.trim() && next.length === persisted.length) {
      setError("Elige qué quieres que se vea en la tarjeta.");
      return;
    }
    setSaving(true);
    setError(null);
    const before = cloneJson(persisted);
    const res = await api.settings.set(HOME_ANNOUNCEMENTS_SETTINGS_KEY, { slots: next });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "aviso de portada",
      undo: async () => {
        const r = await api.settings.set(HOME_ANNOUNCEMENTS_SETTINGS_KEY, { slots: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(HOME_ANNOUNCEMENTS_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(HOME_ANNOUNCEMENTS_SETTINGS_KEY, { slots: next });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(HOME_ANNOUNCEMENTS_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(HOME_ANNOUNCEMENTS_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("homeAnnouncements");
    setPublished(true);
  };

  const remove = () => {
    setSlot({ ...slot, refId: "", visible: false });
    setPublished(false);
  };

  const isExisting = persisted.some((s) => s.id === slot.id && s.refId);
  const selectedChoice = choices.find((item) => item.id === slot.refId);

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Elige el tipo y luego la pieza. La lista es la del menú de admin: si subes una noticia, un evento, un episodio,
        una revista o un boletín, aparece aquí. La tarjeta se actualiza al instante.
      </p>

      <div>
        <p className="mb-2 text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
          Qué quieres mostrar
        </p>
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map(({ kind, icon: Icon }) => {
            const active = slot.kind === kind;
            const meta = HOME_AVISO_KIND_META[kind];
            return (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setSlot({ ...slot, kind, refId: "" });
                  setQuery("");
                  setPublished(false);
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition"
                style={{
                  borderColor: active ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
                  backgroundColor: active ? "rgba(68,137,198,0.10)" : "white",
                  color: active ? "var(--regu-blue)" : "var(--regu-gray-600)",
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                <span className="text-[11px] font-bold leading-tight">{meta.label}</span>
                <span className="text-[9px] leading-tight opacity-80">{meta.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
          Cuál
          <span className="ml-1.5 font-normal" style={{ color: "var(--regu-gray-400)" }}>
            {choices.length} {choices.length === 1 ? "pieza" : "piezas"}
          </span>
        </p>
        <div
          className="mb-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2"
          style={{ borderColor: "rgba(22,61,89,0.14)" }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: "var(--regu-gray-400)" }} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título…"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
            style={{ color: "var(--regu-navy)" }}
          />
        </div>
        <div
          className="max-h-72 overflow-y-auto rounded-xl border"
          style={{ borderColor: "rgba(22,61,89,0.12)" }}
        >
          {choices.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--regu-gray-500)" }}>
              No hay resultados. Súbelo en el menú de admin y vuelve a abrir este aviso.
            </p>
          ) : (
            choices.map((item) => {
              const selected = slot.refId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSlot({ ...slot, refId: item.id, visible: true });
                    setPublished(false);
                  }}
                  className="flex w-full items-center gap-2.5 border-b px-2.5 py-2 text-left last:border-b-0"
                  style={{
                    borderColor: "rgba(22,61,89,0.08)",
                    backgroundColor: selected ? "rgba(68,137,198,0.12)" : "white",
                  }}
                >
                  {item.thumb ? (
                    <img
                      src={item.thumb}
                      alt=""
                      className="h-10 w-8 shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-10 w-8 shrink-0 items-center justify-center rounded-sm text-[9px] font-bold text-white"
                      style={{ backgroundColor: "var(--regu-navy)" }}
                    >
                      {HOME_AVISO_KIND_META[slot.kind].label.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[12px] font-semibold leading-snug"
                      style={{ color: "var(--regu-navy)" }}
                    >
                      {item.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      {item.draft ? (
                        <span
                          className="rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
                          style={{ backgroundColor: "#fffbeb", color: "#92400e" }}
                        >
                          Borrador
                        </span>
                      ) : null}
                      {item.meta ? (
                        <span className="truncate text-[10px]" style={{ color: "var(--regu-gray-500)" }}>
                          {item.meta}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedChoice?.draft ? (
        <p
          className="rounded-xl border px-3 py-2 text-[12px] leading-relaxed"
          style={{ borderColor: "#f59e0b", backgroundColor: "#fffbeb", color: "#92400e" }}
        >
          Esta pieza aún es un borrador. En el sitio público no se verá hasta que la publiques en el admin.
        </p>
      ) : null}

      {error && (
        <p className="text-sm" style={{ color: "#991b1b" }}>
          {error}
        </p>
      )}
      {published && !error && (
        <p className="text-sm font-medium" style={{ color: "#0f766e" }}>
          Ya está en el sitio público.
        </p>
      )}
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Se ve al instante en esta página. Hasta que publiques, el sitio real no cambia.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Send className="h-4 w-4" />
          {saving ? "Publicando…" : published ? "Publicar otra vez" : "Publicar"}
        </button>
        {isExisting && (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold"
            style={{ borderColor: "rgba(22,61,89,0.14)", color: "#991b1b" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar de la portada
          </button>
        )}
      </div>
    </div>
  );
}
