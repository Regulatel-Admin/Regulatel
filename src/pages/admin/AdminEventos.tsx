/**
 * Panel Admin: gestionar TODOS los eventos (crear / editar / eliminar / duplicar).
 * Source of truth: events en AdminDataContext (Neon / API).
 * Añadir nuevos eventos o URLs: usar el formulario "Nuevo evento" o editar una fila.
 */

import { useState, useMemo } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { Event } from "@/types/event";
import { getEventYear, slugifyEventId, EVENT_STATUS_LABEL } from "@/types/event";
import { Pencil, Trash2, Plus, Copy, X, Image as ImageIcon } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";

const emptyForm = {
  title: "",
  organizer: "",
  location: "",
  startDate: "",
  endDate: "",
  registrationUrl: "",
  detailsUrl: "",
  isFeatured: false,
  description: "",
  tags: [] as string[],
  imageUrl: "",
  imageFileName: "",
  imageMimeType: "",
  imageSize: undefined as number | undefined,
};

function isValidUrl(s: string): boolean {
  if (!s.trim()) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AdminEventos() {
  const { events, addEvent, updateEvent, deleteEvent, duplicateEvent } = useAdminData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [events]
  );

  const openNew = () => {
    setForm(emptyForm);
    setAdding(true);
    setEditingId(null);
    setUrlError(null);
  };

  const openEdit = (e: Event) => {
    setForm({
      title: e.title,
      organizer: e.organizer,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate ?? "",
      registrationUrl: e.registrationUrl ?? "",
      detailsUrl: e.detailsUrl ?? "",
      isFeatured: e.isFeatured,
      description: e.description ?? "",
      tags: e.tags ?? [],
      imageUrl: e.imageUrl ?? "",
      imageFileName: e.imageFileName ?? "",
      imageMimeType: e.imageMimeType ?? "",
      imageSize: e.imageSize,
    });
    setEditingId(e.id);
    setAdding(false);
    setUrlError(null);
  };

  const closeModal = () => {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm);
    setUrlError(null);
    setIsSubmitting(false);
    setIsUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate.trim()) return;
    if (form.registrationUrl.trim() && !isValidUrl(form.registrationUrl)) {
      setUrlError("URL de registro debe ser http o https.");
      return;
    }
    if (form.detailsUrl.trim() && !isValidUrl(form.detailsUrl)) {
      setUrlError("URL de detalles debe ser http o https.");
      return;
    }
    if (form.imageUrl.trim() && !isValidUrl(form.imageUrl)) {
      setUrlError("La URL de imagen debe ser http o https.");
      return;
    }
    setUrlError(null);
    const year = getEventYear(form.startDate);
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateEvent(editingId, {
          title: form.title,
          organizer: form.organizer,
          location: form.location,
          startDate: form.startDate,
          endDate: form.endDate.trim() || null,
          registrationUrl: form.registrationUrl.trim() || null,
          detailsUrl: form.detailsUrl.trim() || null,
          isFeatured: form.isFeatured,
          description: form.description.trim() || undefined,
          tags: form.tags,
          imageUrl: form.imageUrl.trim() || undefined,
          imageFileName: form.imageFileName || undefined,
          imageMimeType: form.imageMimeType || undefined,
          imageSize: form.imageSize,
        });
      } else {
        await addEvent({
          id: slugifyEventId(form.title, year),
          title: form.title,
          organizer: form.organizer,
          location: form.location,
          startDate: form.startDate,
          endDate: form.endDate.trim() || null,
          registrationUrl: form.registrationUrl.trim() || null,
          detailsUrl: form.detailsUrl.trim() || null,
          isFeatured: form.isFeatured,
          description: form.description.trim() || undefined,
          tags: form.tags,
          imageUrl: form.imageUrl.trim() || undefined,
          imageFileName: form.imageFileName || undefined,
          imageMimeType: form.imageMimeType || undefined,
          imageSize: form.imageSize,
        });
      }
      closeModal();
    } catch (error) {
      setUrlError(
        error instanceof Error ? error.message : "No se pudo guardar el evento."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--token-font-body)" }}>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Eventos
      </h1>
      {urlError && !adding && !editingId && (
        <p className="mb-4 text-sm font-medium text-red-600">{urlError}</p>
      )}
      <p className="mb-4 text-sm" style={{ color: "var(--regu-gray-600)" }}>
        Gestionar todos los eventos que se muestran en la página pública y en el slider. El botón &quot;Registrarse&quot; usa la URL de registro configurada aquí.
      </p>

      {!adding && !editingId && (
        <button
          type="button"
          onClick={openNew}
          className="mb-6 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Plus className="h-4 w-4" /> Nuevo evento
        </button>
      )}

      {(adding || editingId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
                {editingId ? "Editar evento" : "Nuevo evento"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {urlError && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {urlError}
                </p>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-100)" }}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    Organizador
                  </label>
                  <input
                    type="text"
                    value={form.organizer}
                    onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    Lugar
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    Fecha inicio (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    Fecha fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                  URL de registro (http/https)
                </label>
                <input
                  type="url"
                  value={form.registrationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, registrationUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-100)" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                  URL de detalles (opcional)
                </label>
                <input
                  type="url"
                  value={form.detailsUrl}
                  onChange={(e) => setForm((f) => ({ ...f, detailsUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-100)" }}
                />
              </div>
              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                  Imagen del evento
                </label>
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 transition hover:bg-[var(--regu-gray-50)]"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                >
                  <ImageIcon className="h-5 w-5 shrink-0" style={{ color: "var(--regu-blue)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                    {isUploadingImage
                      ? "Subiendo..."
                      : form.imageFileName || "Subir imagen a Blob"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUrlError(null);
                      setIsUploadingImage(true);
                      try {
                        const uploaded = await uploadAdminFile({
                          file,
                          kind: "image",
                          folder: "events",
                        });
                        setForm((f) => ({
                          ...f,
                          imageUrl: uploaded.url,
                          imageFileName: uploaded.fileName ?? "",
                          imageMimeType: uploaded.mimeType ?? "",
                          imageSize: uploaded.size,
                        }));
                      } catch (error) {
                        setUrlError(
                          error instanceof Error
                            ? error.message
                            : "No se pudo subir la imagen."
                        );
                      } finally {
                        setIsUploadingImage(false);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      imageUrl: e.target.value,
                      imageFileName: "",
                      imageMimeType: "",
                      imageSize: undefined,
                    }))
                  }
                  placeholder="https://... o URL pública de la imagen"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-100)" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-100)" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                  Destacado (aparece en el slider de la home)
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--regu-blue)", opacity: isSubmitting || isUploadingImage ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Guardando..." : editingId ? "Guardar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-700)" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: "var(--regu-gray-100)" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--regu-gray-100)", backgroundColor: "var(--regu-offwhite)" }}>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Título</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Año</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Fecha inicio</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Lugar</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Estado</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>URL registro</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Destacado</th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-900)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((ev) => (
              <tr
                key={ev.id}
                className="border-b border-[var(--regu-gray-100)] hover:bg-gray-50/50"
              >
                <td className="px-4 py-3 font-medium max-w-[200px] truncate" style={{ color: "var(--regu-gray-900)" }} title={ev.title}>
                  {ev.title}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--regu-gray-600)" }}>{ev.year}</td>
                <td className="px-4 py-3" style={{ color: "var(--regu-gray-600)" }}>{ev.startDate}</td>
                <td className="px-4 py-3" style={{ color: "var(--regu-gray-600)" }}>{ev.location}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: ev.status === "upcoming" ? "rgba(68,137,198,0.12)" : "rgba(22,61,89,0.1)",
                      color: ev.status === "upcoming" ? "var(--regu-blue)" : "var(--regu-gray-600)",
                    }}
                  >
                    {EVENT_STATUS_LABEL[ev.status]}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[140px] truncate" style={{ color: "var(--regu-gray-600)" }} title={ev.registrationUrl ?? ""}>
                  {ev.registrationUrl ? "Sí" : "—"}
                </td>
                <td className="px-4 py-3">{ev.isFeatured ? "Sí" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(ev)}
                      className="rounded-lg p-2 transition hover:bg-slate-100"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void (async () => {
                          try {
                            await duplicateEvent(ev.id);
                          } catch (error) {
                            setUrlError(
                              error instanceof Error
                                ? error.message
                                : "No se pudo duplicar el evento."
                            );
                          }
                        })();
                      }}
                      className="rounded-lg p-2 transition hover:bg-slate-100"
                      aria-label="Duplicar"
                    >
                      <Copy className="h-4 w-4" style={{ color: "var(--regu-gray-600)" }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("¿Eliminar este evento?")) return;
                        void (async () => {
                          try {
                            await deleteEvent(ev.id);
                          } catch (error) {
                            setUrlError(
                              error instanceof Error
                                ? error.message
                                : "No se pudo eliminar el evento."
                            );
                          }
                        })();
                      }}
                      className="rounded-lg p-2 transition hover:bg-red-50"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" style={{ color: "var(--regu-salmon, #c53030)" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length === 0 && (
        <p className="mt-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          No hay eventos en la fuente activa. Añade uno con &quot;Nuevo evento&quot;.
        </p>
      )}
    </div>
  );
}
