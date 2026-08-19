import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import {
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  mergeBoletinesGtaiWithDefaults,
  parseBoletinesGtaiFromSettingValue,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import { NotifySubscribersButton } from "@/components/admin/NotifySubscribersOption";
import { slugify } from "@/lib/slugify";

function cloneDefaults(): BoletinGtaiSerialized[] {
  return defaultBoletinesGtai.map((b) => ({ ...b }));
}

function emptyBoletin(): BoletinGtaiSerialized {
  const y = new Date().getFullYear();
  return {
    title: "",
    slug: "",
    groupName: "Grupo de Asuntos de Internet (GTAI)",
    issueNumber: 1,
    year: y,
    publicationDate: new Date().toISOString().slice(0, 10),
    shortSummary: "",
    description: "",
    coverImage: "",
    pdfFile: "",
    contentType: "Boletín",
    isPublished: false,
    isFeatured: false,
  };
}

export default function AdminBoletinesGtai() {
  const [entries, setEntries] = useState<BoletinGtaiSerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseBoletinesGtaiFromSettingValue(res.data.value);
        if (parsed !== null) {
          setEntries(mergeBoletinesGtaiWithDefaults(parsed).map((b) => ({ ...b })));
        } else {
          setEntries(cloneDefaults());
        }
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
    setTimeout(() => setMessage(null), 6000);
  };

  const notifyTarget = useMemo(
    () => entries.find((e) => e.isFeatured && e.isPublished) ?? entries.find((e) => e.isPublished),
    [entries]
  );

  const updateRow = (index: number, patch: Partial<BoletinGtaiSerialized>) => {
    setEntries((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setEntries((prev) => [...prev, emptyBoletin()]);
  };

  const resetToDefaults = () => {
    setEntries(cloneDefaults());
    showMessage("ok", "Lista restaurada. Pulsa Guardar para publicarla.");
  };

  const save = async () => {
    const slugs = new Set<string>();
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const slug = (e.slug.trim() || slugify(e.title) || `boletin-${i + 1}`).toLowerCase();
      if (!e.title.trim() || !e.pdfFile.trim()) {
        showMessage("err", `Boletín ${i + 1}: hace falta título y PDF.`);
        return;
      }
      if (slugs.has(slug)) {
        showMessage("err", `Hay dos boletines con el mismo título. Cambia uno para distinguirlos.`);
        return;
      }
      slugs.add(slug);
    }

    const normalized = entries.map((e, i) => ({
      ...e,
      slug: (e.slug.trim() || slugify(e.title) || `boletin-${i + 1}`).toLowerCase(),
      title: e.title.trim(),
      pdfFile: e.pdfFile.trim(),
      groupName: e.groupName.trim() || "Grupo de Asuntos de Internet (GTAI)",
      shortSummary: e.shortSummary.trim(),
      description: e.description.trim(),
      coverImage: e.coverImage?.trim() || undefined,
      contentType: e.contentType.trim() || "Boletín",
    }));

    setSaving(true);
    const res = await api.settings.set(BOLETINES_GTAI_SETTINGS_KEY, { entries: normalized });
    if (!res.ok) {
      setSaving(false);
      showMessage("err", res.error ?? "Error al guardar.");
      return;
    }
    setSaving(false);
    showMessage("ok", "Boletines GTAI guardados. Ya se reflejan en el sitio público.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando boletines…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Boletines GTAI
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Publicaciones del Grupo de Asuntos de Internet: texto, portada, PDF y si se muestra en el sitio.
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

      <div className="space-y-3">
        <NotifySubscribersButton
          payload={{
            type: "publicación",
            title: notifyTarget?.title ?? "",
            excerpt: notifyTarget?.shortSummary || notifyTarget?.description,
            url: `/boletines-gtai/${notifyTarget?.slug || slugify(notifyTarget?.title ?? "")}`,
            date: notifyTarget?.publicationDate,
          }}
          disabled={saving || !notifyTarget?.title.trim()}
          disabledHint="No hay un boletín visible para avisar. Márcalo Visible (y En portada si aplica) y guarda."
          onSent={(text) => showMessage("ok", text)}
        />
        <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ borderColor: "var(--regu-blue)", backgroundColor: "var(--regu-blue)", color: "white" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-800)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir boletín
        </button>
        <button
          type="button"
          onClick={resetToDefaults}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Volver al listado original
        </button>
      </div>
      </div>

      <div className="space-y-6">
        {entries.map((row, index) => (
          <div
            key={`${row.slug}-${index}`}
            className="rounded-xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
                Boletín {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Título" value={row.title} onChange={(v) => updateRow(index, { title: v })} />
              <Field label="Grupo" value={row.groupName} onChange={(v) => updateRow(index, { groupName: v })} />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field
                label="Número de edición"
                value={String(row.issueNumber)}
                onChange={(v) => updateRow(index, { issueNumber: Number(v.replace(/\D/g, "")) || 0 })}
              />
              <Field
                label="Año"
                value={String(row.year)}
                onChange={(v) => updateRow(index, { year: Number(v.replace(/\D/g, "")) || row.year })}
              />
              <Field
                label="Fecha de publicación"
                value={row.publicationDate}
                onChange={(v) => updateRow(index, { publicationDate: v })}
              />
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Resumen corto (tarjetas)
              </span>
              <textarea
                value={row.shortSummary}
                onChange={(e) => updateRow(index, { shortSummary: e.target.value })}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Texto descriptivo (página del boletín)
              </span>
              <textarea
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
              />
            </label>

            <div className="mt-3 space-y-3">
              <AdminBlobUploadField
                label="Portada (opcional)"
                value={row.coverImage ?? ""}
                onChange={(v) => updateRow(index, { coverImage: v.trim() || undefined })}
                kind="image"
                folder="documents"
                helpText="Foto de la tarjeta del boletín."
              />
              <AdminBlobUploadField
                label="PDF del boletín"
                value={row.pdfFile}
                onChange={(v) => updateRow(index, { pdfFile: v })}
                kind="document"
                folder="documents"
                helpText="El archivo que se descarga desde el sitio."
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-800)" }}>
                <input
                  type="checkbox"
                  checked={row.isPublished}
                  onChange={(e) => updateRow(index, { isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Publicado
              </label>
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-800)" }}>
                <input
                  type="checkbox"
                  checked={row.isFeatured}
                  onChange={(e) => updateRow(index, { isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Destacado en la página
              </label>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
          No hay boletines. Añade uno o vuelve al listado original.
        </p>
      )}
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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
      />
    </label>
  );
}
