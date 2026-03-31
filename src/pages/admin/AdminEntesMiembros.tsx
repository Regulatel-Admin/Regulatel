import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ENTES_MIEMBROS_SETTINGS_KEY,
  defaultEntesReguladoresMiembros,
  parseEntesMiembrosFromSettingValue,
  type EnteReguladorMiembro,
} from "@/data/entesReguladoresMiembros";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";

function emptyEnte(): EnteReguladorMiembro {
  return { name: "", country: "", fullName: "", route: "/", externalUrl: "", linkExternalOnly: false };
}

export default function AdminEntesMiembros() {
  const [entes, setEntes] = useState<EnteReguladorMiembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(ENTES_MIEMBROS_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseEntesMiembrosFromSettingValue(res.data.value);
        if (parsed !== null) setEntes(parsed.map((e) => ({ ...e })));
        else setEntes(defaultEntesReguladoresMiembros.map((e) => ({ ...e })));
      } else {
        setEntes(defaultEntesReguladoresMiembros.map((e) => ({ ...e })));
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

  const updateRow = (index: number, patch: Partial<EnteReguladorMiembro>) => {
    setEntes((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setEntes((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setEntes((prev) => [...prev, emptyEnte()]);
  };

  const resetDefaults = () => {
    setEntes(defaultEntesReguladoresMiembros.map((e) => ({ ...e })));
    showMessage("ok", "Restaurado al listado del código. Pulse Guardar para publicar.");
  };

  const save = async () => {
    const bad = entes.filter((e) => !e.name.trim() || !e.country.trim() || !e.externalUrl.trim());
    if (bad.length) {
      showMessage("err", "Nombre, país y URL externa son obligatorios.");
      return;
    }
    setSaving(true);
    const res = await api.settings.set(ENTES_MIEMBROS_SETTINGS_KEY, { entes });
    setSaving(false);
    if (res.ok) showMessage("ok", "Guardado. Carrusel de /miembros actualizado.");
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
          Entes reguladores miembros
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Tarjetas del carrusel en{" "}
          <a href="/miembros" className="font-medium underline" style={{ color: "var(--regu-blue)" }}>
            /miembros
          </a>
          . Para una ficha interna, use una ruta existente en el sitio (ej. /enacom). Marque «solo enlace externo» si aún no hay página propia.
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
          Añadir ente
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
        {entes.map((row, index) => (
          <div
            key={`${row.country}-${row.name}-${index}`}
            className="rounded-xl border bg-white p-4 shadow-sm space-y-3"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--regu-gray-500)" }}>
                Ente {index + 1}
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
              <Field label="Nombre corto (logo)" value={row.name} onChange={(v) => updateRow(index, { name: v })} placeholder="ENACOM" />
              <Field label="País" value={row.country} onChange={(v) => updateRow(index, { country: v })} />
              <Field label="Ruta interna" value={row.route} onChange={(v) => updateRow(index, { route: v })} placeholder="/enacom" />
              <Field label="URL externa" value={row.externalUrl} onChange={(v) => updateRow(index, { externalUrl: v })} />
              <Field label="Nombre completo (opc.)" value={row.fullName ?? ""} onChange={(v) => updateRow(index, { fullName: v || undefined })} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={row.linkExternalOnly === true}
                onChange={(e) => updateRow(index, { linkExternalOnly: e.target.checked })}
              />
              <span style={{ color: "var(--regu-gray-800)" }}>Solo enlace externo (sin ficha interna)</span>
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
