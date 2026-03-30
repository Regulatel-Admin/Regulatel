import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { uploadAdminFile } from "@/lib/uploads";
import {
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  parseBoletinesGtaiFromSettingValue,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";
import { Save, Plus, Trash2, RotateCcw, Upload } from "lucide-react";

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
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseBoletinesGtaiFromSettingValue(res.data.value);
        if (parsed !== null) {
          setEntries(parsed.map((b) => ({ ...b })));
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
    showMessage("ok", "Lista restaurada al contenido por defecto (incluye el PDF local). Pulsa Guardar para publicar en base de datos.");
  };

  const handlePdfUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadIndex(index);
    try {
      const result = await uploadAdminFile({ file, kind: "document", folder: "documents" });
      updateRow(index, { pdfFile: result.url });
      showMessage("ok", "PDF subido. Enlace guardado en el campo; recuerda guardar en base de datos.");
    } catch (e) {
      showMessage("err", e instanceof Error ? e.message : "No se pudo subir el PDF.");
    } finally {
      setUploadIndex(null);
    }
  };

  const save = async () => {
    const slugs = new Set<string>();
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const slug = e.slug.trim().toLowerCase().replace(/\s+/g, "-");
      if (!e.title.trim() || !slug || !e.pdfFile.trim()) {
        showMessage("err", `Boletín ${i + 1}: título, slug y URL del PDF son obligatorios.`);
        return;
      }
      if (slugs.has(slug)) {
        showMessage("err", `El slug "${slug}" está duplicado. Cada boletín debe tener un slug único.`);
        return;
      }
      slugs.add(slug);
    }

    const normalized = entries.map((e) => ({
      ...e,
      slug: e.slug.trim().toLowerCase().replace(/\s+/g, "-"),
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
    setSaving(false);
    if (res.ok) showMessage("ok", "Boletines GTAI guardados. Ya se reflejan en el sitio público.");
    else showMessage("err", res.error ?? "Error al guardar.");
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
          Gestiona las publicaciones del Grupo de Asuntos de Internet: metadatos, PDF (subida o URL), estado de publicación y
          destacado en la página principal de boletines.
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Ruta pública: <strong>/boletines-gtai</strong>. El primer boletín por defecto usa el PDF en{" "}
          <code className="rounded bg-gray-100 px-1">/documents/boletines-gtai/boletin-1-2026.pdf</code>.
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
          Restaurar valores por defecto
        </button>
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
                Boletín #{index + 1} — {row.slug || "(sin slug)"}
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
              <Field
                label="Slug (URL, único)"
                value={row.slug}
                onChange={(v) => updateRow(index, { slug: v })}
                placeholder="boletin-1-2026"
              />
              <Field label="Grupo (nombre mostrado)" value={row.groupName} onChange={(v) => updateRow(index, { groupName: v })} />
              <Field label="Tipo de contenido" value={row.contentType} onChange={(v) => updateRow(index, { contentType: v })} />
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
                label="Fecha publicación (YYYY-MM-DD)"
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

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <Field
                label="Portada (URL imagen, opcional)"
                value={row.coverImage ?? ""}
                onChange={(v) => updateRow(index, { coverImage: v.trim() || undefined })}
                placeholder="/grupos-trabajo/asuntos-internet.jpg"
              />
              <Field
                label="PDF (URL absoluta o ruta /documents/...)"
                value={row.pdfFile}
                onChange={(v) => updateRow(index, { pdfFile: v })}
                placeholder="/documents/boletines-gtai/....pdf"
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
                Destacado (hero en listado)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50" style={{ borderColor: "var(--regu-gray-200)" }}>
                <Upload className="h-4 w-4" />
                {uploadIndex === index ? "Subiendo…" : "Subir PDF (Vercel Blob)"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  disabled={uploadIndex !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    void handlePdfUpload(index, f);
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
          No hay boletines. Añade uno o restaura los valores por defecto.
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
