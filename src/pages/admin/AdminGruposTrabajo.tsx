import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  GRUPOS_TRABAJO_SETTINGS_KEY,
  GRUPO_ICON_KEYS,
  defaultGruposTrabajo,
  parseGruposTrabajoFromSettingValue,
  type GrupoTrabajoSerialized,
  type GrupoTrabajoIconKey,
} from "@/data/gruposTrabajo";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";

function cloneDefaults(): GrupoTrabajoSerialized[] {
  return defaultGruposTrabajo.map((g) => ({
    ...g,
    coordinadores: [...g.coordinadores],
    miembros: [...g.miembros],
  }));
}

function emptyGrupo(): GrupoTrabajoSerialized {
  return {
    id: `grupo-${Date.now()}`,
    title: "",
    description: "",
    coordinadores: [],
    miembros: [],
    iconKey: "Shield",
    imageUrl: "",
    termsUrl: undefined,
    informeUrl: undefined,
  };
}

export default function AdminGruposTrabajo() {
  const [entries, setEntries] = useState<GrupoTrabajoSerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(GRUPOS_TRABAJO_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseGruposTrabajoFromSettingValue(res.data.value);
        if (parsed !== null) {
          setEntries(parsed.map((g) => ({ ...g, coordinadores: [...g.coordinadores], miembros: [...g.miembros] })));
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
    setTimeout(() => setMessage(null), 5000);
  };

  const updateRow = (index: number, patch: Partial<GrupoTrabajoSerialized>) => {
    setEntries((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const setCoordinadoresText = (index: number, text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    updateRow(index, { coordinadores: lines });
  };

  const setMiembrosText = (index: number, text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    updateRow(index, { miembros: lines });
  };

  const removeRow = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setEntries((prev) => [...prev, emptyGrupo()]);
  };

  const resetToDefaults = () => {
    setEntries(cloneDefaults());
    showMessage("ok", "Lista restaurada al contenido por defecto. Pulsa Guardar para publicar.");
  };

  const save = async () => {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.id.trim() || !e.title.trim()) {
        showMessage("err", `La fila ${i + 1} necesita identificador (id) y título.`);
        return;
      }
    }
    setSaving(true);
    const res = await api.settings.set(GRUPOS_TRABAJO_SETTINGS_KEY, { entries });
    setSaving(false);
    if (res.ok) showMessage("ok", "Grupos de trabajo guardados. Ya se reflejan en la página pública.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando grupos…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Grupos de trabajo
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Edita título, descripción, coordinadores, miembros, imagen y enlaces (términos de referencia e informe). La
          numeración <strong>GT 01, GT 02…</strong> en el sitio sigue el orden de esta lista.
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Coordinadores y miembros: <strong>una línea por entrada</strong> (ej. <code>OSIPTEL, Perú</code>).
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
          Añadir grupo
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
            key={`${row.id}-${index}`}
            className="rounded-xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
                GT {String(index + 1).padStart(2, "0")} — {row.id || "(sin id)"}
              </span>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                aria-label={`Eliminar grupo ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Field
                label="Identificador (slug, único)"
                value={row.id}
                onChange={(v) => updateRow(index, { id: v })}
                placeholder="ej. proteccion-empoderamiento-usuarios"
              />
              <Field label="Título del grupo" value={row.title} onChange={(v) => updateRow(index, { title: v })} />
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Descripción
              </span>
              <textarea
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
              />
            </label>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Coordinadores (una por línea)
                </span>
                <textarea
                  value={row.coordinadores.join("\n")}
                  onChange={(e) => setCoordinadoresText(index, e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
                  style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
                  placeholder={"OSIPTEL, Perú\nCRC, Colombia"}
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Miembros (una por línea)
                </span>
                <textarea
                  value={row.miembros.join("\n")}
                  onChange={(e) => setMiembrosText(index, e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
                  style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
                  placeholder={"SUTEL, Costa Rica\nATT, Bolivia"}
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Icono (respaldo si falla la imagen)
                </span>
                <select
                  value={row.iconKey}
                  onChange={(e) => updateRow(index, { iconKey: e.target.value as GrupoTrabajoIconKey })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
                >
                  {GRUPO_ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="URL imagen"
                value={row.imageUrl}
                onChange={(v) => updateRow(index, { imageUrl: v })}
                placeholder="/grupos-trabajo/....jpg"
              />
              <Field
                label="Términos de referencia (URL/PDF, opcional)"
                value={row.termsUrl ?? ""}
                onChange={(v) => updateRow(index, { termsUrl: v.trim() || undefined })}
                placeholder="/documents/..."
              />
              <Field
                label="Informe (PDF o PPTX, opcional)"
                value={row.informeUrl ?? ""}
                onChange={(v) => updateRow(index, { informeUrl: v.trim() || undefined })}
                placeholder="/documents/..."
              />
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
          No hay grupos. Añade uno o restaura los valores por defecto.
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
