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
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import { slugify } from "@/lib/slugify";

const ICON_LABELS: Record<GrupoTrabajoIconKey, string> = {
  Shield: "Escudo",
  Wifi: "Conectividad",
  BarChart3: "Gráfico",
  TrendingUp: "Tendencia",
  Network: "Red",
  Briefcase: "Maletín",
  Sparkles: "Destellos",
  Users: "Personas",
};

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
    showMessage("ok", "Lista restaurada. Pulsa Guardar para publicarla.");
  };

  const save = async () => {
    for (let i = 0; i < entries.length; i++) {
      if (!entries[i].title.trim()) {
        showMessage("err", `El grupo ${i + 1} necesita un título.`);
        return;
      }
    }
    const prepared = entries.map((e, i) => ({
      ...e,
      id: e.id.trim() || slugify(e.title) || `grupo-${i + 1}`,
    }));
    setSaving(true);
    const res = await api.settings.set(GRUPOS_TRABAJO_SETTINGS_KEY, { entries: prepared });
    setSaving(false);
    if (res.ok) showMessage("ok", "Grupos de trabajo guardados. Ya se ven en el sitio.");
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
          Edita título, descripción, coordinadores, miembros, foto y documentos. El número GT 01, GT 02… sigue el orden de esta lista.
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Coordinadores y miembros: una línea por persona o institución (ej. OSIPTEL, Perú).
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
          {saving ? "Guardando…" : "Guardar"}
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
          Volver al listado original
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
                GT {String(index + 1).padStart(2, "0")}
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
              <Field label="Título del grupo" value={row.title} onChange={(v) => updateRow(index, { title: v })} />
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Icono (si no hay foto)
                </span>
                <select
                  value={row.iconKey}
                  onChange={(e) => updateRow(index, { iconKey: e.target.value as GrupoTrabajoIconKey })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
                >
                  {GRUPO_ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {ICON_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
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
                  className="w-full rounded-lg border px-3 py-2 text-sm"
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
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
                  placeholder={"SUTEL, Costa Rica\nATT, Bolivia"}
                />
              </label>
            </div>

            <div className="mt-3 space-y-3">
              <AdminBlobUploadField
                label="Foto del grupo"
                value={row.imageUrl}
                onChange={(v) => updateRow(index, { imageUrl: v })}
                kind="image"
                folder="attachments"
                helpText="Foto que se ve en la ficha del grupo."
              />
              <AdminBlobUploadField
                label="Términos de referencia (opcional)"
                value={row.termsUrl ?? ""}
                onChange={(v) => updateRow(index, { termsUrl: v.trim() || undefined })}
                kind="document"
                folder="documents"
                helpText="PDF de los términos, si hay."
              />
              <AdminBlobUploadField
                label="Informe (opcional)"
                value={row.informeUrl ?? ""}
                onChange={(v) => updateRow(index, { informeUrl: v.trim() || undefined })}
                kind="document"
                folder="documents"
                helpText="PDF del informe, si hay."
              />
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
          No hay grupos. Añade uno o vuelve al listado original.
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
