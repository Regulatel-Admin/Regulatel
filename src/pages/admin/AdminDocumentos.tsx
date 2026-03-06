import { useState } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { GestionDocument, GestionCategory } from "@/data/gestion";
import { GESTION_TAB_LABELS } from "@/data/gestion";
import { Pencil, Trash2, Plus, FileText } from "lucide-react";

const CATEGORY_OPTIONS: { value: GestionCategory; label: string }[] = [
  { value: "planes-actas", label: GESTION_TAB_LABELS["planes-actas"] },
  { value: "documentos", label: GESTION_TAB_LABELS.documentos },
  { value: "revista", label: GESTION_TAB_LABELS.revista },
  { value: "banco", label: GESTION_TAB_LABELS.banco },
  { value: "otros", label: GESTION_TAB_LABELS.otros },
];

const YEAR_OPTIONS = ["2024", "2025", "2026", "2027"] as const;

const emptyDoc: Omit<GestionDocument, "id"> = {
  title: "",
  url: "",
  category: "documentos",
  year: "2026",
  quarter: "",
};

export default function AdminDocumentos() {
  const { adminDocuments, addDocument, updateDocument, deleteDocument } = useAdminData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyDoc);

  const resetForm = () => {
    setForm(emptyDoc);
    setEditingId(null);
    setAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url?.trim()) {
      return;
    }
    const payload = {
      ...form,
      year: form.year?.trim() || form.year,
      quarter: form.quarter?.trim() || undefined,
    };
    if (editingId) {
      updateDocument(editingId, payload);
    } else {
      addDocument(payload);
    }
    resetForm();
  };

  const startEdit = (d: GestionDocument) => {
    setForm({
      title: d.title,
      url: d.url,
      category: d.category,
      year: d.year ?? "",
      quarter: d.quarter ?? "",
    });
    setEditingId(d.id);
    setAdding(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Documentos
      </h1>
      <p className="mb-6 text-sm max-w-2xl" style={{ color: "var(--regu-gray-500)" }}>
        Aquí puedes añadir documentos y asignarlos a las subcategorías del menú Recursos (Planes de trabajo, Actas, Declaraciones, Revista Digital, etc.). Los documentos que añadas aparecerán en la categoría correspondiente en Gestión.
      </p>

      {!adding && !editingId && (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setForm(emptyDoc);
          }}
          className="mb-6 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Plus className="h-4 w-4" /> Añadir documento
        </button>
      )}

      {(adding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          <h2 className="mb-4 font-bold" style={{ color: "var(--regu-gray-900)" }}>
            {editingId ? "Editar documento" : "Nuevo documento"}
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
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Adjuntar documento *</label>
              <p className="mb-2 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                Sube el archivo (PDF, etc.) o pega la URL si el documento está en línea.
              </p>
              <div className="mb-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 transition hover:bg-[var(--regu-gray-50)]"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                >
                  <FileText className="h-5 w-5 shrink-0" style={{ color: "var(--regu-blue)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    {form.url.startsWith("data:") ? "Documento adjunto" : "Seleccionar archivo"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf,application/msword,.doc,.docx"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setForm((f) => ({ ...f, url: reader.result as string }));
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <input
                type="url"
                value={form.url.startsWith("data:") ? "" : form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="O pegar URL del documento (https://... o /documents/archivo.pdf)"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
              {form.url.startsWith("data:") && (
                <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                  Para cambiar, sube otro archivo o pega una URL.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Categoría *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GestionCategory }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Año *</label>
              <select
                value={form.year ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
                required
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Trimestre (opcional)</label>
              <input
                type="text"
                value={form.quarter ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, quarter: e.target.value }))}
                placeholder="Q1, Q2, Q3, Q4"
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
              {editingId ? "Guardar" : "Añadir"}
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
        {adminDocuments.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="h-5 w-5 shrink-0" style={{ color: "var(--regu-blue)" }} />
              <div className="min-w-0">
                <p className="font-semibold" style={{ color: "var(--regu-gray-900)" }}>{d.title}</p>
                <p className="truncate text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {GESTION_TAB_LABELS[d.category]}
                  {d.year && ` · ${d.year}`}
                  {d.quarter && ` ${d.quarter}`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(d)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              </button>
              <button
                type="button"
                onClick={() => deleteDocument(d.id)}
                className="rounded-lg p-2 transition hover:bg-red-50"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" style={{ color: "var(--regu-salmon)" }} />
              </button>
            </div>
          </div>
        ))}
        {adminDocuments.length === 0 && !adding && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm" style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-500)" }}>
            No hay documentos añadidos por el admin. Los documentos estáticos del sitio siguen mostrándose en Gestión. Añade uno para que aparezca en la categoría que elijas.
          </p>
        )}
      </div>
    </div>
  );
}
