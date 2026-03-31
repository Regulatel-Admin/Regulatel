import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  CONVENIOS_SETTINGS_KEY,
  convenios,
  parseConveniosFromSettingValue,
  type Convenio,
} from "@/data/convenios";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";

function emptyConvenio(order: number): Convenio {
  return {
    slug: "",
    title: "",
    acronym: "",
    shortDescription: "",
    logoSrc: "",
    areas: [],
    order,
  };
}

export default function AdminConvenios() {
  const [items, setItems] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(CONVENIOS_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseConveniosFromSettingValue(res.data.value);
        if (parsed !== null) setItems(parsed.map((c) => ({ ...c, areas: [...c.areas] })));
        else setItems(convenios.map((c) => ({ ...c, areas: [...c.areas] })));
      } else {
        setItems(convenios.map((c) => ({ ...c, areas: [...c.areas] })));
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

  const updateRow = (index: number, patch: Partial<Convenio>) => {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateAreasText = (index: number, text: string) => {
    const areas = text.split("\n").map((s) => s.trim()).filter(Boolean);
    updateRow(index, { areas });
  };

  const removeRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setItems((prev) => [...prev, emptyConvenio(prev.length + 1)]);
  };

  const resetDefaults = () => {
    setItems(convenios.map((c) => ({ ...c, areas: [...c.areas] })));
    showMessage("ok", "Restaurado al listado del código. Pulse Guardar para publicar.");
  };

  const save = async () => {
    const slugs = items.map((c) => c.slug.trim().toLowerCase());
    const dup = slugs.find((s, i) => s && slugs.indexOf(s) !== i);
    if (dup) {
      showMessage("err", `Slug duplicado: ${dup}`);
      return;
    }
    const bad = items.filter((c) => !c.slug.trim() || !c.title.trim());
    if (bad.length) {
      showMessage("err", "Cada convenio necesita slug y título.");
      return;
    }
    setSaving(true);
    const res = await api.settings.set(CONVENIOS_SETTINGS_KEY, { items });
    setSaving(false);
    if (res.ok) showMessage("ok", "Guardado. Menú, /convenios y fichas usan estos datos.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Convenios
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Lista y detalle en{" "}
          <a href="/convenios" className="font-medium underline" style={{ color: "var(--regu-blue)" }}>
            /convenios
          </a>{" "}
          y menú del sitio.
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
          Añadir convenio
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar desde código
        </button>
      </div>

      <div className="space-y-4">
        {items.map((row, index) => (
            <div
              key={`${row.slug || "nuevo"}-${index}`}
              className="rounded-xl border bg-white p-4 shadow-sm space-y-3"
              style={{ borderColor: "var(--regu-gray-100)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase" style={{ color: "var(--regu-gray-500)" }}>
                  Convenio (orden {row.order})
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg px-2 py-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Slug (URL)" value={row.slug} onChange={(v) => updateRow(index, { slug: v })} placeholder="berec" />
                <Field label="Acrónimo" value={row.acronym} onChange={(v) => updateRow(index, { acronym: v })} />
                <Field label="Orden" value={String(row.order)} onChange={(v) => updateRow(index, { order: parseInt(v, 10) || 0 })} />
                <Field label="Título largo" value={row.title} onChange={(v) => updateRow(index, { title: v })} />
              </div>
              <AdminBlobUploadField
                label="Logo del convenio"
                value={row.logoSrc}
                onChange={(v) => updateRow(index, { logoSrc: v })}
                kind="image"
                folder="attachments"
                helpText="Imagen que aparece en lista y ficha."
              />
              <AdminBlobUploadField
                label="Documento principal (memorándum / PDF)"
                value={row.downloadUrl ?? ""}
                onChange={(v) => updateRow(index, { downloadUrl: v || undefined })}
                kind="document"
                folder="attachments"
                helpText="Primer archivo descargable (p. ej. MOU)."
              />
              <AdminBlobUploadField
                label="Informe u otro documento (opc.)"
                value={row.informeUrl ?? ""}
                onChange={(v) => updateRow(index, { informeUrl: v || undefined })}
                kind="document"
                folder="attachments"
                helpText="Segundo PDF o informe, si aplica."
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Descripción corta
                </span>
                <textarea
                  value={row.shortDescription}
                  onChange={(e) => updateRow(index, { shortDescription: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Áreas (una por línea)
                </span>
                <textarea
                  value={row.areas.join("\n")}
                  onChange={(e) => updateAreasText(index, e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </label>
            </div>
        ))}
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
