import { useState, useEffect, useCallback } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { GestionDocument, GestionCategory } from "@/data/gestion";
import { GESTION_TAB_LABELS, getCategoryDisplayLabel } from "@/data/gestion";
import { Pencil, Trash2, Plus, FileText, History, X } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";
import { api } from "@/lib/api";

const CATEGORY_OPTIONS: { value: GestionCategory; label: string }[] = [
  { value: "planes-actas", label: GESTION_TAB_LABELS["planes-actas"] },
  { value: "documentos", label: GESTION_TAB_LABELS.documentos },
  { value: "revista", label: GESTION_TAB_LABELS.revista },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [historyDocId, setHistoryDocId] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<Array<{ id: string; action: string; user_email: string; user_name: string | null; details: Record<string, unknown>; created_at: string }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async (docId: string) => {
    setHistoryDocId(docId);
    setHistoryError(null);
    setHistoryLoading(true);
    try {
      const res = await api.admin.audit.list({ resource_type: "document", resource_id: docId, limit: 50 });
      if (!res.ok) {
        setHistoryError(res.error ?? "No se pudo cargar el historial.");
        setHistoryEntries([]);
      } else {
        setHistoryEntries(res.data?.items ?? []);
      }
    } catch {
      setHistoryError("No se pudo cargar el historial.");
      setHistoryEntries([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const resetForm = () => {
    setForm(emptyDoc);
    setEditingId(null);
    setAdding(false);
    setFormError(null);
    setIsUploading(false);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url?.trim()) {
      setFormError("Debes adjuntar un documento o indicar una URL.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    const payload = {
      ...form,
      year: form.year?.trim() || form.year,
      quarter: form.quarter?.trim() || undefined,
    };
    try {
      if (editingId) {
        await updateDocument(editingId, payload);
        setSuccessMessage("Documento actualizado correctamente.");
      } else {
        await addDocument(payload);
        setSuccessMessage("Documento añadido correctamente.");
      }
      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar el documento."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (d: GestionDocument) => {
    setForm({
      title: d.title,
      url: d.url,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSize: d.fileSize,
      category: d.category === "banco" ? "otros" : d.category,
      year: d.year ?? "",
      quarter: d.quarter ?? "",
    });
    setEditingId(d.id);
    setAdding(false);
    setFormError(null);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Documentos
      </h1>
      {successMessage && (
        <p className="mb-4 text-sm font-medium text-green-700" role="status">
          {successMessage}
        </p>
      )}
      {formError && !adding && !editingId && (
        <p className="mb-4 text-sm font-medium text-red-600" role="alert">{formError}</p>
      )}
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
            {formError && (
              <p className="md:col-span-2 text-sm font-medium text-red-600" role="alert">
                {formError}
              </p>
            )}
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
                Sube el archivo a Vercel Blob o pega una URL externa si el documento ya está publicado.
              </p>
              <div className="mb-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 transition hover:bg-[var(--regu-gray-50)]"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                >
                  <FileText className="h-5 w-5 shrink-0" style={{ color: "var(--regu-blue)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    {isUploading
                      ? "Subiendo..."
                      : form.fileName || "Seleccionar archivo"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf,application/msword,.doc,.docx"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setFormError(null);
                      setIsUploading(true);
                      try {
                        const uploaded = await uploadAdminFile({
                          file,
                          kind: "document",
                          folder: "documents",
                        });
                        setForm((f) => ({
                          ...f,
                          url: uploaded.url,
                          fileName: uploaded.fileName,
                          fileType: uploaded.mimeType,
                          fileSize: uploaded.size,
                        }));
                      } catch (error) {
                        setFormError(
                          error instanceof Error
                            ? error.message
                            : "No se pudo subir el documento."
                        );
                      } finally {
                        setIsUploading(false);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </label>
              </div>
              <input
                type="url"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    url: e.target.value,
                    fileName: undefined,
                    fileType: undefined,
                    fileSize: undefined,
                  }))
                }
                placeholder="https://... o /documents/archivo.pdf"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
              {form.fileName && (
                <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                  Archivo guardado: {form.fileName}
                  {form.fileType ? ` · ${form.fileType}` : ""}
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
          {/* Vista previa de la card del documento */}
          <div className="mt-4 rounded-xl border bg-[var(--regu-offwhite)] p-3" style={{ borderColor: "var(--regu-gray-100)" }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
              Vista previa (card)
            </p>
            <div className="max-w-xs rounded-lg border bg-white px-3 py-2 shadow-sm" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
              <p className="font-semibold" style={{ color: "var(--regu-gray-900)" }}>
                {form.title || "Título del documento"}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                {form.category} {form.year ? ` · ${form.year}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--regu-blue)", opacity: isSubmitting || isUploading ? 0.7 : 1 }}
            >
              {isSubmitting ? "Guardando..." : editingId ? "Guardar" : "Añadir"}
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
                  {getCategoryDisplayLabel(d.category)}
                  {d.year && ` · ${d.year}`}
                  {d.quarter && ` ${d.quarter}`}
                  {d.fileName && ` · ${d.fileName}`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => loadHistory(d.id)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Ver historial"
                title="Historial de cambios"
              >
                <History className="h-4 w-4" style={{ color: "var(--regu-gray-600)" }} />
              </button>
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
                onClick={() => {
                  if (!window.confirm("¿Eliminar este documento? Esta acción no se puede deshacer.")) return;
                  void (async () => {
                    try {
                      await deleteDocument(d.id);
                      setSuccessMessage("Documento eliminado.");
                    } catch (error) {
                      setFormError(
                        error instanceof Error
                          ? error.message
                          : "No se pudo eliminar el documento."
                      );
                    }
                  })();
                }}
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

      {historyDocId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} role="dialog" aria-modal="true" aria-labelledby="historial-doc-title">
          <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border bg-white shadow-xl" style={{ borderColor: "var(--regu-gray-100)" }}>
            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--regu-gray-100)" }}>
              <h2 id="historial-doc-title" className="text-lg font-bold" style={{ color: "var(--regu-gray-900)" }}>Historial de cambios</h2>
              <button type="button" onClick={() => { setHistoryDocId(null); setHistoryError(null); }} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 80px)" }}>
              {historyLoading ? <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p> : historyError ? <p className="text-sm font-medium text-red-600">{historyError}</p> : historyEntries.length === 0 ? <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>No hay registros de cambios para este documento.</p> : (
                <ul className="space-y-3">
                  {historyEntries.map((entry) => (
                    <li key={entry.id} className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--regu-gray-100)" }}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: entry.action === "created" ? "rgba(68,137,198,0.15)" : entry.action === "deleted" ? "rgba(252,145,135,0.2)" : "var(--regu-gray-100)", color: entry.action === "created" ? "var(--regu-blue)" : entry.action === "deleted" ? "var(--regu-salmon)" : "var(--regu-gray-700)" }}>
                          {entry.action === "created" ? "Creado" : entry.action === "updated" ? "Actualizado" : "Eliminado"}
                        </span>
                        <span style={{ color: "var(--regu-gray-600)" }}>{new Date(entry.created_at).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="mt-1" style={{ color: "var(--regu-gray-700)" }}>{entry.user_name || entry.user_email}</p>
                      {typeof entry.details?.title === "string" && <p className="mt-0.5 truncate text-xs" style={{ color: "var(--regu-gray-500)" }}>{entry.details.title}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
