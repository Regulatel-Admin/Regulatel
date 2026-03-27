import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  DIRECTORIO_AUTORIDADES_SETTINGS_KEY,
  defaultDirectorioAutoridades,
  parseDirectorioFromSettingValue,
  type DirectorioAutoridad,
} from "@/data/directorioAutoridades";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";

function emptyRow(): DirectorioAutoridad {
  return { pais: "", acronym: "", presidente: "", cargo: "", corresponsal: "", correo: "" };
}

export default function AdminDirectorio() {
  const [entries, setEntries] = useState<DirectorioAutoridad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(DIRECTORIO_AUTORIDADES_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseDirectorioFromSettingValue(res.data.value);
        if (parsed !== null) setEntries(parsed);
        else setEntries(defaultDirectorioAutoridades.map((r) => ({ ...r })));
      } else {
        setEntries(defaultDirectorioAutoridades.map((r) => ({ ...r })));
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

  const updateRow = (index: number, patch: Partial<DirectorioAutoridad>) => {
    setEntries((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setEntries((prev) => [...prev, emptyRow()]);
  };

  const resetToDefaults = () => {
    setEntries(defaultDirectorioAutoridades.map((r) => ({ ...r })));
    showMessage("ok", "Formulario restaurado a la lista por defecto. Pulsa Guardar para publicar en el sitio.");
  };

  const save = async () => {
    setSaving(true);
    const res = await api.settings.set(DIRECTORIO_AUTORIDADES_SETTINGS_KEY, { entries });
    setSaving(false);
    if (res.ok) showMessage("ok", "Directorio guardado. Se muestra ya en Miembros.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando directorio…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Directorio de autoridades
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Contactos oficiales que aparecen en la sección homónima de{" "}
          <a href="/miembros" className="font-medium underline" style={{ color: "var(--regu-blue)" }}>
            Miembros
          </a>
          . Los datos se guardan en la base de datos (site settings).
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
          Añadir fila
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

      <div className="space-y-4">
        {entries.map((row, index) => (
          <div
            key={`row-${index}`}
            className="rounded-xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
                Entrada {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                aria-label={`Eliminar fila ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="País" value={row.pais} onChange={(v) => updateRow(index, { pais: v })} placeholder="ej. ARGENTINA" />
              <Field label="Acrónimo" value={row.acronym} onChange={(v) => updateRow(index, { acronym: v })} placeholder="ej. ENACOM" />
              <Field label="Autoridad (nombre)" value={row.presidente} onChange={(v) => updateRow(index, { presidente: v })} />
              <Field label="Cargo" value={row.cargo} onChange={(v) => updateRow(index, { cargo: v })} />
              <Field label="Corresponsal" value={row.corresponsal} onChange={(v) => updateRow(index, { corresponsal: v })} />
              <Field label="Correo" value={row.correo} onChange={(v) => updateRow(index, { correo: v })} type="email" />
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
          No hay filas. Usa «Añadir fila» o «Restaurar valores por defecto».
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
      />
    </label>
  );
}
