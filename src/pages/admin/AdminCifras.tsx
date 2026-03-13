import { useAdminData } from "@/contexts/AdminDataContext";
import { getCifrasAnos } from "@/data/home";
import type { CifrasAnuales } from "@/data/home";
import { Pencil, RotateCcw, Users, Building2, BookOpen, Globe } from "lucide-react";
import { useState } from "react";

const CARD_KEYS: { key: keyof CifrasAnuales; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "gruposTrabajo", label: "Grupos de trabajo", description: "Equipos técnicos activos en agenda regional.", icon: Users },
  { key: "comitesEjecutivos", label: "Comités Ejecutivos", description: "Instancias de coordinación institucional.", icon: Building2 },
  { key: "revistaDigital", label: "Revista Digital", description: "Publicación periódica de avances.", icon: BookOpen },
  { key: "paises", label: "Países", description: "Miembros de REGULATEL en la región.", icon: Globe },
];

export default function AdminCifras() {
  const { getCifrasForYear, setCifrasForYear, clearCifrasForYear, adminCifrasPorAno } = useAdminData();
  const anos = getCifrasAnos();
  const [selectedYear, setSelectedYear] = useState<number>(anos[0] ?? 2026);
  const [editingKey, setEditingKey] = useState<keyof CifrasAnuales | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cifras = getCifrasForYear(selectedYear);
  const hasOverrideForYear = selectedYear in adminCifrasPorAno;

  const handleSave = (key: keyof CifrasAnuales, value: number) => {
    void setCifrasForYear(selectedYear, { ...cifras, [key]: value });
    setEditingKey(null);
    setSuccessMessage("Cifras guardadas.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const resetYearToDefault = () => {
    clearCifrasForYear(selectedYear);
    setEditingKey(null);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        REGULATEL en cifras
      </h1>
      {successMessage && (
        <p className="mb-4 text-sm font-medium text-green-700" role="status">{successMessage}</p>
      )}

      {/* Selector de año: 2025 | 2026 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium" style={{ color: "var(--regu-gray-600)" }}>
          Editar año:
        </span>
        <div className="flex gap-2" role="tablist" aria-label="Seleccionar año">
          {anos.map((year) => (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={selectedYear === year}
              onClick={() => {
                setSelectedYear(year);
                setEditingKey(null);
              }}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: selectedYear === year ? "var(--regu-green, #B7D400)" : "var(--regu-gray-100, #F3F5F7)",
                color: selectedYear === year ? "#0B1F2A" : "var(--regu-gray-700, #2C3E50)",
              }}
            >
              {year}
            </button>
          ))}
        </div>
        {hasOverrideForYear && (
          <button
            type="button"
            onClick={resetYearToDefault}
            className="ml-2 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium"
            style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-700)" }}
          >
            <RotateCcw className="h-4 w-4" /> Restaurar {selectedYear} por defecto
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_KEYS.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className="rounded-xl border bg-white p-5 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            {editingKey === key ? (
              <CifraNumForm
                value={cifras[key]}
                label={label}
                onSave={(v) => handleSave(key, v)}
                onCancel={() => setEditingKey(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-3xl font-bold" style={{ color: "var(--regu-blue)" }}>
                    {cifras[key]}
                  </p>
                  <Icon className="h-5 w-5 flex-shrink-0 opacity-70 text-[var(--regu-gray-400)]" />
                </div>
                <p className="mt-1 font-semibold" style={{ color: "var(--regu-gray-900)" }}>{label}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>{description}</p>
                <button
                  type="button"
                  onClick={() => setEditingKey(key)}
                  className="mt-3 flex items-center gap-1 text-sm font-medium"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Pencil className="h-3 w-3" /> Editar
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CifraNumForm({
  value,
  label,
  onSave,
  onCancel,
}: {
  value: number;
  label: string;
  onSave: (v: number) => void;
  onCancel: () => void;
}) {
  const [num, setNum] = useState(String(value));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseInt(num, 10);
        if (!Number.isNaN(n) && n >= 0) onSave(n);
      }}
      className="space-y-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-500)" }}>
          {label} (número)
        </label>
        <input
          type="number"
          min={0}
          value={num}
          onChange={(e) => setNum(e.target.value)}
          className="w-full rounded-lg border px-2 py-1 text-lg font-bold"
          style={{ borderColor: "var(--regu-gray-100)" }}
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm"
          style={{ color: "var(--regu-gray-500)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
