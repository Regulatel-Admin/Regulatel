import { useState, useEffect, useCallback } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { AdminNewsItem } from "@/contexts/AdminDataContext";
import { Pencil, Trash2, Plus, History, X } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";
import type { UploadedFileMeta } from "@/types/uploads";
import { api } from "@/lib/api";

const emptyItem: Omit<AdminNewsItem, "id"> = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  dateFormatted: "",
  category: "Noticias",
  excerpt: "",
  imageUrl: "",
  imageMimeType: undefined,
  imageSize: undefined,
  additionalImages: [],
  content: "",
  author: "REGULATEL",
  imageFileName: undefined,
  additionalImageNames: undefined,
  additionalImageMeta: undefined,
  published: true,
};

type ImageSlot = {
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
};
type FormState = Omit<AdminNewsItem, "id"> & { imageSlots: ImageSlot[] };

function formatDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const initialFormState = (): FormState => ({
  ...emptyItem,
  date: new Date().toISOString().slice(0, 10),
  imageSlots: [{ url: "" }],
});

type AuditEntry = {
  id: string;
  action: string;
  user_email: string;
  user_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export default function AdminNoticias() {
  const { adminNews, addNews, updateNews, deleteNews } = useAdminData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [historyNewsId, setHistoryNewsId] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<AuditEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const loadHistory = useCallback(async (newsId: string) => {
    setHistoryNewsId(newsId);
    setHistoryError(null);
    setHistoryLoading(true);
    try {
      const res = await api.admin.audit.list({
        resource_type: "news",
        resource_id: newsId,
        limit: 50,
      });
      if (!res.ok) {
        setHistoryError(res.error ?? "No se pudo cargar el historial.");
        setHistoryEntries([]);
      } else {
        setHistoryEntries(res.data?.items ?? []);
      }
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "No se pudo cargar el historial.");
      setHistoryEntries([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const resetForm = () => {
    setForm(initialFormState());
    setEditingId(null);
    setAdding(false);
    setIsSubmitting(false);
    setIsUploading(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateFormatted = formatDate(form.date);
    const slots = form.imageSlots.filter((s) => s.url.trim());
    const additionalImageMeta: UploadedFileMeta[] = slots.slice(1).map((s) => ({
      fileName: s.name,
      mimeType: s.mimeType,
      size: s.size,
    }));
    const payload = {
      slug: form.slug,
      title: form.title,
      date: form.date,
      dateFormatted,
      category: form.category,
      excerpt: form.excerpt,
      imageUrl: slots[0]?.url ?? "",
      imageFileName: slots[0]?.name,
      imageMimeType: slots[0]?.mimeType,
      imageSize: slots[0]?.size,
      additionalImages: slots.slice(1).map((s) => s.url),
      additionalImageNames: slots.slice(1).map((s) => s.name ?? undefined),
      additionalImageMeta,
      content: form.content,
      author: form.author,
      link: form.link,
      videoUrl: form.videoUrl,
      published: form.published,
    };
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateNews(editingId, payload);
      } else {
        const slug =
          form.slug ||
          form.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        await addNews({ ...payload, slug, published: form.published });
      }
      setSuccessMessage(editingId ? "Noticia actualizada correctamente." : "Noticia añadida correctamente.");
      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar la noticia."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (n: AdminNewsItem) => {
    const urls = [n.imageUrl, ...(n.additionalImages ?? [])].filter(Boolean);
    const names = [n.imageFileName, ...(n.additionalImageNames ?? [])];
    const meta = [
      { fileName: n.imageFileName, mimeType: n.imageMimeType, size: n.imageSize },
      ...(n.additionalImageMeta ?? []),
    ];
    const imageSlots: ImageSlot[] =
      urls.length > 0
        ? urls.map((url, i) => ({
            url,
            name: names[i],
            mimeType: meta[i]?.mimeType,
            size: meta[i]?.size,
          }))
        : [{ url: "" }];
    setForm({
      slug: n.slug,
      title: n.title,
      date: n.date,
      dateFormatted: n.dateFormatted,
      category: n.category,
      excerpt: n.excerpt,
      imageUrl: n.imageUrl,
      imageFileName: n.imageFileName,
      imageMimeType: n.imageMimeType,
      imageSize: n.imageSize,
      additionalImages: n.additionalImages ?? [],
      additionalImageNames: n.additionalImageNames ?? [],
      additionalImageMeta: n.additionalImageMeta ?? [],
      content: n.content,
      author: n.author,
      link: n.link,
      videoUrl: n.videoUrl,
      published: n.published !== false,
      imageSlots,
    });
    setEditingId(n.id);
    setAdding(false);
    setFormError(null);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Noticias
      </h1>
      {successMessage && (
        <p className="mb-4 text-sm font-medium text-green-700" role="status">{successMessage}</p>
      )}
      {formError && !adding && !editingId && (
        <p className="mb-4 text-sm font-medium text-red-600" role="alert">{formError}</p>
      )}

      {!adding && !editingId && (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setForm(initialFormState());
          }}
          className="mb-6 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Plus className="h-4 w-4" /> Añadir noticia
        </button>
      )}

      {(adding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          <h2 className="mb-4 font-bold" style={{ color: "var(--regu-gray-900)" }}>
            {editingId ? "Editar noticia" : "Nueva noticia"}
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
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Fecha *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Categoría</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="news-published"
                checked={form.published !== false}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="news-published" className="text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                Publicado (visible en el sitio)
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Resumen *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
                Imágenes y enlaces
              </label>
              <p className="mb-2 text-xs leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                Puedes añadir varias imágenes: pegar URL públicas o subir archivos reales a Vercel Blob. Todas se mostrarán en la noticia individual.
              </p>
              <div className="space-y-2">
                {form.imageSlots.map((slot, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    {slot.name ? (
                      <span className="min-w-0 truncate rounded-lg border bg-[var(--regu-gray-50)] px-3 py-2 text-sm" style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-800)" }} title={slot.name || "Archivo adjunto"}>
                        {slot.name || "Archivo adjunto"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={slot.url}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            imageSlots: f.imageSlots.map((s, j) =>
                              j === i
                                ? {
                                    url: e.target.value,
                                    name: undefined,
                                    mimeType: undefined,
                                    size: undefined,
                                  }
                                : s
                            ),
                          }))
                        }
                        placeholder="https://... o /images/noticias/foto.jpg"
                        className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--regu-gray-100)" }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          imageSlots: f.imageSlots.filter((_, j) => j !== i),
                        }))
                      }
                      className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-red-50"
                      style={{ color: "var(--regu-gray-500)" }}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageSlots: [...f.imageSlots, { url: "" }] }))}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium"
                  style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
                >
                  Añadir enlace
                </button>
                <label className="cursor-pointer">
                  <span
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--regu-gray-50)]"
                    style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
                  >
                    {isUploading ? "Subiendo..." : "Subir imagen(es)"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files?.length) return;
                      setFormError(null);
                      setIsUploading(true);
                      try {
                        const uploaded = await Promise.all(
                          Array.from(files).map((file) =>
                            uploadAdminFile({
                              file,
                              kind: "image",
                              folder: "news",
                            })
                          )
                        );
                        setForm((f) => ({
                          ...f,
                          imageSlots: [
                            ...(f.imageSlots.length === 1 && !f.imageSlots[0].url.trim()
                              ? []
                              : f.imageSlots),
                            ...uploaded.map((item) => ({
                              url: item.url,
                              name: item.fileName,
                              mimeType: item.mimeType,
                              size: item.size,
                            })),
                          ],
                        }));
                      } catch (error) {
                        setFormError(
                          error instanceof Error
                            ? error.message
                            : "No se pudieron subir las imágenes."
                        );
                      } finally {
                        setIsUploading(false);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Contenido (texto completo)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={6}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Enlace externo</label>
              <input
                type="url"
                value={form.link ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value || undefined }))}
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>URL de video</label>
              <input
                type="url"
                value={form.videoUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value || undefined }))}
                placeholder="https://..."
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--regu-blue)", opacity: isSubmitting || isUploading ? 0.7 : 1 }}
            >
              {isSubmitting ? "Guardando..." : editingId ? "Guardar" : "Publicar"}
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

          {/* Vista previa de la card */}
          <div className="mt-6 rounded-xl border bg-[var(--regu-offwhite)] p-4" style={{ borderColor: "var(--regu-gray-100)" }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
              Vista previa (card)
            </p>
            <div className="max-w-sm overflow-hidden rounded-lg border bg-white shadow-sm" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
              {form.imageSlots[0]?.url ? (
                <div className="aspect-video w-full bg-[var(--regu-gray-100)]">
                  <img src={form.imageSlots[0].url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="p-3">
                <p className="font-semibold leading-snug" style={{ color: "var(--regu-gray-900)" }}>
                  {form.title || "Título de la noticia"}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                  {formatDate(form.date) || "—"}
                </p>
                <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
                  {form.excerpt || "Resumen…"}
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {adminNews.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold" style={{ color: "var(--regu-gray-900)" }}>{n.title}</p>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: n.published !== false ? "rgba(68,137,198,0.12)" : "var(--regu-gray-100)",
                    color: n.published !== false ? "var(--regu-blue)" : "var(--regu-gray-600)",
                  }}
                >
                  {n.published !== false ? "Publicado" : "Borrador"}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>{formatDate(n.date)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => loadHistory(n.id)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Ver historial"
                title="Historial de cambios"
              >
                <History className="h-4 w-4" style={{ color: "var(--regu-gray-600)" }} />
              </button>
              <button
                type="button"
                onClick={() => startEdit(n)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("¿Eliminar esta noticia? Esta acción no se puede deshacer.")) return;
                  void (async () => {
                    try {
                      await deleteNews(n.id);
                      setSuccessMessage("Noticia eliminada.");
                    } catch (error) {
                      setFormError(
                        error instanceof Error
                          ? error.message
                          : "No se pudo eliminar la noticia."
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
        {adminNews.length === 0 && !adding && (
          <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
            No hay noticias añadidas por el admin. Las noticias estáticas del sitio siguen mostrándose. Añade una para que aparezca en la sección Noticias.
          </p>
        )}
      </div>

      {/* Modal Historial de cambios */}
      {historyNewsId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="historial-title"
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border bg-white shadow-xl"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--regu-gray-100)" }}>
              <h2 id="historial-title" className="text-lg font-bold" style={{ color: "var(--regu-gray-900)" }}>
                Historial de cambios
              </h2>
              <button
                type="button"
                onClick={() => { setHistoryNewsId(null); setHistoryError(null); }}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 80px)" }}>
              {historyLoading ? (
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
              ) : historyError ? (
                <p className="text-sm font-medium text-red-600">{historyError}</p>
              ) : historyEntries.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>No hay registros de cambios para esta noticia.</p>
              ) : (
                <ul className="space-y-3">
                  {historyEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-lg border p-3 text-sm"
                      style={{ borderColor: "var(--regu-gray-100)" }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: entry.action === "created" ? "rgba(68,137,198,0.15)" : entry.action === "deleted" ? "rgba(252,145,135,0.2)" : "var(--regu-gray-100)",
                            color: entry.action === "created" ? "var(--regu-blue)" : entry.action === "deleted" ? "var(--regu-salmon)" : "var(--regu-gray-700)",
                          }}
                        >
                          {entry.action === "created" ? "Creado" : entry.action === "updated" ? "Actualizado" : "Eliminado"}
                        </span>
                        <span style={{ color: "var(--regu-gray-600)" }}>
                          {new Date(entry.created_at).toLocaleString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1" style={{ color: "var(--regu-gray-700)" }}>
                        {entry.user_name || entry.user_email}
                      </p>
                      {typeof entry.details?.title === "string" && (
                        <p className="mt-0.5 truncate text-xs" style={{ color: "var(--regu-gray-500)" }}>
                          {entry.details.title}
                        </p>
                      )}
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
