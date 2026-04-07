import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  BUENAS_PRACTICAS_REGULATORIAS_KEY,
  BUENAS_PRACTICAS_PAGE_DEFAULT_DESCRIPTION,
  BUENAS_PRACTICAS_PAGE_DEFAULT_TITLE,
  parseBuenasPracticasRegulatoriasFromSettingValue,
  emptyScrapedEntry,
  emptyScrapedCategory,
  type ScrapedRegulatelEntry,
} from "@/data/mejoresPracticas";
import { Save, Plus, Trash2, RotateCcw, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

function cloneEntries(e: ScrapedRegulatelEntry[]): ScrapedRegulatelEntry[] {
  return JSON.parse(JSON.stringify(e)) as ScrapedRegulatelEntry[];
}

export default function AdminBuenasPracticasRegulatorias() {
  const { refetch } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [entries, setEntries] = useState<ScrapedRegulatelEntry[]>([]);
  const [openCountries, setOpenCountries] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(BUENAS_PRACTICAS_REGULATORIAS_KEY);
      if (cancelled) return;
      if (res.ok && res.data?.value != null) {
        const parsed = parseBuenasPracticasRegulatoriasFromSettingValue(res.data.value);
        if (parsed.entries.length > 0) {
          setPageTitle(parsed.pageTitle ?? "");
          setPageDescription(parsed.pageDescription ?? "");
          setEntries(cloneEntries(parsed.entries));
          const o: Record<number, boolean> = {};
          parsed.entries.forEach((_, i) => {
            o[i] = i < 2;
          });
          setOpenCountries(o);
          setLoading(false);
          return;
        }
      }
      try {
        const r = await fetch("/mejoresPracticasRegulatel.json");
        if (r.ok) {
          const raw = (await r.json()) as ScrapedRegulatelEntry[];
          if (Array.isArray(raw) && raw.length > 0) {
            setEntries(cloneEntries(raw));
            const o: Record<number, boolean> = {};
            raw.forEach((_, i) => {
              o[i] = i < 2;
            });
            setOpenCountries(o);
          }
        }
      } catch {
        /* vacío */
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 6000);
  };

  const toggleCountry = (i: number) => {
    setOpenCountries((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const updateEntry = (i: number, patch: Partial<ScrapedRegulatelEntry>) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };

  const updateCategoryName = (i: number, ci: number, name: string) => {
    setEntries((prev) =>
      prev.map((e, ei) => {
        if (ei !== i) return e;
        const categories = [...(e.categories ?? []).map((c) => ({ ...c, links: [...(c.links ?? [])] }))];
        if (!categories[ci]) return e;
        categories[ci] = { ...categories[ci], name };
        return { ...e, categories };
      })
    );
  };

  const updateLink = (i: number, ci: number, li: number, patch: { title?: string; url?: string }) => {
    setEntries((prev) =>
      prev.map((e, ei) => {
        if (ei !== i) return e;
        const categories = (e.categories ?? []).map((c) => ({
          ...c,
          links: (c.links ?? []).map((l) => ({ ...l })),
        }));
        if (!categories[ci]?.links?.[li]) return e;
        categories[ci].links![li] = { ...categories[ci].links![li], ...patch };
        return { ...e, categories };
      })
    );
  };

  const addLink = (i: number, ci: number) => {
    setEntries((prev) =>
      prev.map((e, ei) => {
        if (ei !== i) return e;
        const categories = (e.categories ?? []).map((c, idx) =>
          idx === ci
            ? { ...c, links: [...(c.links ?? []), { title: "", url: "" }] }
            : { ...c, links: [...(c.links ?? [])] }
        );
        return { ...e, categories };
      })
    );
  };

  const removeLink = (i: number, ci: number, li: number) => {
    setEntries((prev) =>
      prev.map((e, ei) => {
        if (ei !== i) return e;
        const categories = (e.categories ?? []).map((c, idx) =>
          idx === ci
            ? { ...c, links: (c.links ?? []).filter((_, j) => j !== li) }
            : { ...c, links: [...(c.links ?? [])] }
        );
        return { ...e, categories };
      })
    );
  };

  const addCategory = (i: number) => {
    setEntries((prev) =>
      prev.map((e, ei) => {
        if (ei !== i) return e;
        const categories = [...(e.categories ?? []), emptyScrapedCategory()];
        return { ...e, categories };
      })
    );
  };

  const removeCategory = (i: number, ci: number) => {
    setEntries((prev) =>
      prev.map((e, ei) => {
        if (ei !== i) return e;
        const categories = (e.categories ?? []).filter((_, j) => j !== ci);
        return { ...e, categories: categories.length ? categories : [emptyScrapedCategory()] };
      })
    );
  };

  const addCountry = () => {
    setEntries((prev) => {
      const newIdx = prev.length;
      setTimeout(() => setOpenCountries((o) => ({ ...o, [newIdx]: true })), 0);
      return [...prev, emptyScrapedEntry()];
    });
  };

  const removeCountry = (i: number) => {
    if (!confirm("¿Eliminar este país y todas sus categorías y enlaces?")) return;
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    setOpenCountries({});
  };

  const restoreFromPublicJson = async () => {
    try {
      const r = await fetch("/mejoresPracticasRegulatel.json");
      if (!r.ok) throw new Error("No se pudo cargar el JSON");
      const raw = (await r.json()) as ScrapedRegulatelEntry[];
      if (!Array.isArray(raw) || raw.length === 0) throw new Error("JSON vacío");
      setEntries(cloneEntries(raw));
      setPageTitle("");
      setPageDescription("");
      const o: Record<number, boolean> = {};
      raw.forEach((_, i) => {
        o[i] = i < 2;
      });
      setOpenCountries(o);
      showMessage("ok", "Datos restaurados desde /mejoresPracticasRegulatel.json (sin guardar en base de datos todavía).");
    } catch (e) {
      showMessage("err", e instanceof Error ? e.message : "Error al cargar JSON");
    }
  };

  const save = async () => {
    const valid = entries.filter((e) => (e.country ?? "").trim() || (e.entity ?? "").trim());
    if (valid.length === 0) {
      showMessage("err", "Añada al menos un país con nombre o entidad.");
      return;
    }
    setSaving(true);
    const res = await api.settings.set(BUENAS_PRACTICAS_REGULATORIAS_KEY, {
      pageTitle: pageTitle.trim() || undefined,
      pageDescription: pageDescription.trim() || undefined,
      entries: valid,
    });
    setSaving(false);
    if (res.ok) {
      showMessage("ok", "Guardado. La página /micrositio-buenas-practicas usará estos datos.");
      await refetch();
    } else showMessage("err", res.error ?? "Error al guardar.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Buenas Prácticas Regulatorias
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Edita el contenido público de{" "}
          <a href="/micrositio-buenas-practicas" className="font-medium underline" style={{ color: "var(--regu-blue)" }}>
            /micrositio-buenas-practicas
          </a>
          : título, descripción, países, nombres de subcategorías y enlaces (título + URL).
        </p>
      </div>

      {message && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === "ok" ? "var(--regu-blue)" : "#dc2626",
            backgroundColor: message.type === "ok" ? "rgba(68,137,198,0.08)" : "#fef2f2",
            color: message.type === "ok" ? "var(--regu-navy)" : "#991b1b",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ borderColor: "var(--regu-blue)", backgroundColor: "var(--regu-blue)", color: "white" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar en base de datos"}
        </button>
        <button
          type="button"
          onClick={addCountry}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-800)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir país
        </button>
        <button
          type="button"
          onClick={restoreFromPublicJson}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar desde JSON del sitio
        </button>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4" style={{ borderColor: "var(--regu-gray-100)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-600)" }}>
          Cabecera de la página
        </h2>
        <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
          Si los deja vacíos, se usan los textos por defecto: «{BUENAS_PRACTICAS_PAGE_DEFAULT_TITLE}» y la descripción
          estándar.
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
            Título (hero)
          </span>
          <input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder={BUENAS_PRACTICAS_PAGE_DEFAULT_TITLE}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--regu-gray-200)" }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
            Descripción (hero)
          </span>
          <textarea
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            placeholder={BUENAS_PRACTICAS_PAGE_DEFAULT_DESCRIPTION}
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--regu-gray-200)" }}
          />
        </label>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm rounded-xl border border-dashed p-8 text-center" style={{ color: "var(--regu-gray-500)", borderColor: "var(--regu-gray-200)" }}>
            No hay países. Pulse «Añadir país» o «Restaurar desde JSON del sitio».
          </p>
        ) : (
          entries.map((entry, i) => {
            const open = openCountries[i] ?? false;
            const label = (entry.country ?? "").trim() || (entry.entity ?? "").trim() || `País ${i + 1}`;
            return (
              <div
                key={`country-${i}-${label.slice(0, 20)}`}
                className="rounded-xl border bg-white shadow-sm overflow-hidden"
                style={{ borderColor: "var(--regu-gray-100)" }}
              >
                <div
                  className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer select-none"
                  style={{ backgroundColor: "rgba(22,61,89,0.03)" }}
                  onClick={() => toggleCountry(i)}
                  onKeyDown={(e) => e.key === "Enter" && toggleCountry(i)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="font-semibold truncate" style={{ color: "var(--regu-navy)" }}>
                      {label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCountry(i);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar país
                  </button>
                </div>
                {open && (
                  <div className="p-4 space-y-4 border-t" style={{ borderColor: "var(--regu-gray-100)" }}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="País"
                        value={entry.country ?? ""}
                        onChange={(v) => updateEntry(i, { country: v })}
                        placeholder="Argentina"
                      />
                      <Field
                        label="Ente / entidad"
                        value={entry.entity ?? ""}
                        onChange={(v) => updateEntry(i, { entity: v })}
                        placeholder="ENACOM"
                      />
                      <Field
                        label="Sigla (opc.)"
                        value={entry.acronym ?? ""}
                        onChange={(v) => updateEntry(i, { acronym: v })}
                      />
                      <Field
                        label="URL detalle (opc.)"
                        value={entry.detailUrl ?? ""}
                        onChange={(v) => updateEntry(i, { detailUrl: v })}
                        placeholder="https://…"
                      />
                    </div>
                    {(entry.categories ?? []).map((cat, ci) => (
                      <div
                        key={`cat-${i}-${ci}`}
                        className="rounded-lg border p-3 space-y-3"
                        style={{ borderColor: "var(--regu-gray-100)" }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <label className="block flex-1 min-w-[200px]">
                            <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--regu-gray-700)" }}>
                              Subcategoría / bloque
                            </span>
                            <input
                              value={cat.name ?? ""}
                              onChange={(e) => updateCategoryName(i, ci, e.target.value)}
                              placeholder="Espectro radioeléctrico, Ciberseguridad…"
                              className="w-full rounded-lg border px-3 py-2 text-sm font-medium"
                              style={{ borderColor: "var(--regu-gray-200)" }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeCategory(i, ci)}
                            className="text-xs font-medium text-red-700 hover:underline mt-6"
                          >
                            Quitar bloque
                          </button>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                            Enlaces
                          </span>
                          {(cat.links ?? []).map((link, li) => (
                            <div key={`link-${i}-${ci}-${li}`} className="flex flex-col sm:flex-row gap-2 sm:items-end">
                              <label className="flex-1 min-w-0">
                                <span className="sr-only">Título del enlace</span>
                                <input
                                  value={link.title ?? ""}
                                  onChange={(e) => updateLink(i, ci, li, { title: e.target.value })}
                                  placeholder="Título del recurso"
                                  className="w-full rounded-lg border px-2 py-1.5 text-xs"
                                  style={{ borderColor: "var(--regu-gray-200)" }}
                                />
                              </label>
                              <label className="flex-[2] min-w-0">
                                <span className="sr-only">URL</span>
                                <input
                                  value={link.url ?? ""}
                                  onChange={(e) => updateLink(i, ci, li, { url: e.target.value })}
                                  placeholder="https://…"
                                  className="w-full rounded-lg border px-2 py-1.5 text-xs font-mono"
                                  style={{ borderColor: "var(--regu-gray-200)" }}
                                />
                              </label>
                              <div className="flex gap-1 shrink-0">
                                {link.url?.trim() && (
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border"
                                    style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-blue)" }}
                                    title="Abrir enlace"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeLink(i, ci, li)}
                                  className="text-xs text-red-600 px-2 py-1.5"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addLink(i, ci)}
                            className="text-xs font-semibold"
                            style={{ color: "var(--regu-blue)" }}
                          >
                            + Añadir enlace
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCategory(i)}
                      className="inline-flex items-center gap-1 text-sm font-semibold"
                      style={{ color: "var(--regu-blue)" }}
                    >
                      <Plus className="h-4 w-4" />
                      Añadir subcategoría
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--regu-gray-200)" }}
      />
    </label>
  );
}
