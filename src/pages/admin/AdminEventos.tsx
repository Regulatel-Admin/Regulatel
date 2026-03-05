import { useState } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { HomeEventItem } from "@/data/events";
import { Pencil, Trash2, Plus } from "lucide-react";

const emptyEvent: HomeEventItem = {
  title: "",
  city: "",
  year: new Date().getFullYear(),
  status: "proxima",
  href: "",
  description: "",
};

export default function AdminEventos() {
  const { adminEvents, addEvent, updateEvent, deleteEvent } = useAdminData();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<HomeEventItem>(emptyEvent);

  const resetForm = () => {
    setForm({ ...emptyEvent, year: new Date().getFullYear() });
    setEditingIndex(null);
    setAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      updateEvent(editingIndex, form);
    } else {
      addEvent(form);
    }
    resetForm();
  };

  const startEdit = (index: number) => {
    setForm(adminEvents[index]);
    setEditingIndex(index);
    setAdding(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Eventos
      </h1>

      {!adding && editingIndex === null && (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setForm({ ...emptyEvent, year: new Date().getFullYear() });
          }}
          className="mb-6 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Plus className="h-4 w-4" /> Añadir evento
        </button>
      )}

      {(adding || editingIndex !== null) && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          <h2 className="mb-4 font-bold" style={{ color: "var(--regu-gray-900)" }}>
            {editingIndex !== null ? "Editar evento" : "Nuevo evento"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Año *</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value, 10) || 2025 }))}
                min={2020}
                max={2030}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Estado</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as "proxima" | "pasada",
                  }))
                }
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              >
                <option value="proxima">Próxima</option>
                <option value="pasada">Pasada</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Enlace</label>
              <input
                type="url"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              {editingIndex !== null ? "Guardar" : "Añadir"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border px-4 py-2 text-sm font-medium"
              style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-700)" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {adminEvents.map((e, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="min-w-0">
              <p className="font-semibold" style={{ color: "var(--regu-gray-900)" }}>{e.title}</p>
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>{e.city} · {e.year}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(i)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              </button>
              <button
                type="button"
                onClick={() => deleteEvent(i)}
                className="rounded-lg p-2 transition hover:bg-red-50"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" style={{ color: "var(--regu-salmon)" }} />
              </button>
            </div>
          </div>
        ))}
        {adminEvents.length === 0 && !adding && (
          <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
            No hay eventos añadidos por el admin. Los eventos estáticos del sitio siguen mostrándose.
          </p>
        )}
      </div>
    </div>
  );
}
