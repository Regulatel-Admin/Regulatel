/**
 * Revista Digital — ediciones con PDF, visibles en Gestión y en la portada.
 */
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import { PdfCoverPicker } from "@/components/admin/PdfCoverPicker";
import { NotifySubscribersButton } from "@/components/admin/NotifySubscribersOption";
import { slugify } from "@/lib/slugify";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  REVISTA_DIGITAL_SETTINGS_KEY,
  defaultRevistaEditions,
  mergeRevistaDigitalWithDefaults,
  parseRevistaDigitalFromSettingValue,
  type RevistaEdition,
} from "@/data/revistaDigital";
import { Save, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028"] as const;
const PERIOD_OPTIONS = ["", "Q1", "Q2", "Q3", "Q4"] as const;

function cloneDefaults(): RevistaEdition[] {
  return defaultRevistaEditions.map((e) => ({ ...e }));
}

function emptyEdition(): RevistaEdition {
  return {
    id: `revista-${Date.now()}`,
    title: "",
    url: "",
    year: String(new Date().getFullYear()),
    isPublished: true,
    isFeatured: false,
  };
}

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function yearChoices(current: string): string[] {
  const years = new Set<string>([...YEAR_OPTIONS, String(new Date().getFullYear())]);
  if (current.trim()) years.add(current.trim());
  return [...years].sort();
}

export default function AdminRevista() {
  const { refetch } = useSiteSettings();
  const [entries, setEntries] = useState<RevistaEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(REVISTA_DIGITAL_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseRevistaDigitalFromSettingValue(res.data.value);
        setEntries(mergeRevistaDigitalWithDefaults(parsed).map((e) => ({ ...e })));
      } else {
        setEntries(cloneDefaults());
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const notifyTarget = useMemo(
    () => entries.find((e) => e.isFeatured && e.isPublished) ?? entries.find((e) => e.isPublished),
    [entries]
  );

  const updateRow = (index: number, patch: Partial<RevistaEdition>) => {
    setEntries((prev) =>
      prev.map((row, i) => {
        if (i !== index) {
          if (patch.isFeatured === true) return { ...row, isFeatured: false };
          return row;
        }
        const next = { ...row, ...patch };
        if (patch.isFeatured === true) next.isPublished = true;
        if (patch.isPublished === false) next.isFeatured = false;
        return next;
      })
    );
  };

  const save = async () => {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.title.trim() || !e.url.trim()) {
        showMessage("err", `La edición ${i + 1} necesita título y PDF.`);
        return;
      }
    }
    const usedIds = new Set<string>();
    const prepared = entries.map((e, i) => {
      let id = e.id.trim() || `revista-${e.year}-${slugify(e.title) || i + 1}`;
      if (usedIds.has(id)) id = `${id}-${i + 1}`;
      usedIds.add(id);
      return {
        ...e,
        id,
        title: e.title.trim(),
        url: e.url.trim(),
        year: e.year.trim() || String(new Date().getFullYear()),
        quarter: e.quarter?.trim() || undefined,
        description: e.description?.trim() || undefined,
        coverEdition: e.coverEdition?.trim() || undefined,
        coverImage: e.coverImage?.trim() || undefined,
        fileName: e.fileName?.trim() || undefined,
      };
    });
    setSaving(true);
    const res = await api.settings.set(REVISTA_DIGITAL_SETTINGS_KEY, { entries: prepared });
    if (!res.ok) {
      setSaving(false);
      showMessage("err", res.error ?? "No se pudo guardar.");
      return;
    }
    setEntries(prepared);
    await refetch();
    setSaving(false);
    showMessage("ok", "Revista Digital guardada. Ya se ve en el sitio.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando las ediciones…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Revista Digital
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Ediciones que se ven en Gestión. Al subir el PDF, la miniatura se arma sola con la primera página (puedes elegir otra). La marcada «En portada» aparece en el aviso de la home.
        </p>
      </div>

      {message && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === "ok" ? "var(--regu-blue)" : "#dc2626",
            backgroundColor: message.type === "ok" ? "rgba(68,137,198,0.08)" : "#fef2f2",
            color: message.type === "ok" ? "var(--regu-navy)" : "#991b1b",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <NotifySubscribersButton
          payload={{
            type: "publicación",
            title: notifyTarget?.title ?? "",
            excerpt: notifyTarget?.description,
            url:
              notifyTarget && (notifyTarget.url.startsWith("http") || notifyTarget.url.startsWith("/"))
                ? notifyTarget.url
                : "/gestion",
            date: notifyTarget?.year,
          }}
          disabled={saving || !notifyTarget?.title.trim()}
          disabledHint="No hay una edición visible para avisar. Márcala Visible (y En portada si aplica) y guarda."
          onSent={(text) => showMessage("ok", text)}
        />
        <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setEntries((prev) => [...prev, emptyEdition()])}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-800)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir edición
        </button>
        <button
          type="button"
          onClick={() => {
            setEntries(cloneDefaults());
            showMessage("ok", "Lista restaurada. Pulsa Guardar para publicarla.");
          }}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Volver al listado original
        </button>
      </div>
      </div>

      <div className="space-y-3">
        {entries.map((row, index) => (
          <article
            key={row.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <input
                type="text"
                value={row.title}
                onChange={(e) => updateRow(index, { title: e.target.value })}
                placeholder="Título de la edición"
                className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--regu-blue)]"
                style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
              />
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label="Subir"
                  disabled={index === 0}
                  onClick={() => setEntries((current) => moveItem(current, index, -1))}
                  className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Bajar"
                  disabled={index === entries.length - 1}
                  onClick={() => setEntries((current) => moveItem(current, index, 1))}
                  className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Quitar edición"
                  onClick={() => setEntries((prev) => prev.filter((_, i) => i !== index))}
                  className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Año
                </span>
                <select
                  value={row.year}
                  onChange={(e) => updateRow(index, { year: e.target.value })}
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  style={{ borderColor: "rgba(22,61,89,0.14)" }}
                >
                  {yearChoices(row.year).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Trimestre (opcional)
                </span>
                <select
                  value={row.quarter ?? ""}
                  onChange={(e) => updateRow(index, { quarter: e.target.value || undefined })}
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  style={{ borderColor: "rgba(22,61,89,0.14)" }}
                >
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p || "none"} value={p}>
                      {p || "Ninguno"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Nombre corto (portada)
                </span>
                <input
                  type="text"
                  value={row.coverEdition ?? ""}
                  onChange={(e) => updateRow(index, { coverEdition: e.target.value })}
                  placeholder="Ej. Segunda edición"
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  style={{ borderColor: "rgba(22,61,89,0.14)" }}
                />
              </label>
            </div>

            <AdminBlobUploadField
              label="PDF de la edición"
              value={row.url}
              onChange={(url) =>
                updateRow(index, {
                  url,
                  fileName: undefined,
                  ...(url.trim() ? {} : { coverImage: undefined }),
                })
              }
              kind="document"
              folder="documents"
              helpText="El archivo que la gente descarga o lee. La miniatura se arma sola con la primera página."
            />

            <div className="mt-3">
              <PdfCoverPicker
                pdfUrl={row.url}
                coverUrl={row.coverImage}
                onCoverChange={(coverImage) => updateRow(index, { coverImage: coverImage || undefined })}
              />
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Texto del aviso en la portada (opcional)
              </span>
              <textarea
                value={row.description ?? ""}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                rows={2}
                placeholder="Una frase corta si esta edición sale en la home."
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateRow(index, { isPublished: !row.isPublished })}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                style={{
                  borderColor: row.isPublished ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
                  backgroundColor: row.isPublished ? "rgba(68,137,198,0.10)" : "white",
                  color: row.isPublished ? "var(--regu-blue)" : "var(--regu-gray-600)",
                }}
              >
                {row.isPublished ? "Visible en el sitio" : "Oculta"}
              </button>
              <button
                type="button"
                onClick={() => updateRow(index, { isFeatured: !row.isFeatured })}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                style={{
                  borderColor: row.isFeatured ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
                  backgroundColor: row.isFeatured ? "rgba(68,137,198,0.10)" : "white",
                  color: row.isFeatured ? "var(--regu-blue)" : "var(--regu-gray-600)",
                }}
              >
                {row.isFeatured ? "En portada" : "No sale en portada"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>
          No hay ediciones. Añade una o vuelve al listado original.
        </p>
      )}
    </div>
  );
}
