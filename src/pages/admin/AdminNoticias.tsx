import { useState } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { AdminNewsItem } from "@/contexts/AdminDataContext";
import { Pencil, Trash2, Plus } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";
import type { UploadedFileMeta } from "@/types/uploads";

const emptyItem: Omit<AdminNewsItem, "id" | "published"> = {
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
};

type ImageSlot = {
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
};
type FormState = Omit<AdminNewsItem, "id" | "published"> & { imageSlots: ImageSlot[] };

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

export default function AdminNoticias() {
  const { adminNews, addNews, updateNews, deleteNews } = useAdminData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        await addNews({ ...payload, slug });
      }
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
      {formError && !adding && !editingId && (
        <p className="mb-4 text-sm font-medium text-red-600">{formError}</p>
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
              <p className="font-semibold" style={{ color: "var(--regu-gray-900)" }}>{n.title}</p>
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>{formatDate(n.date)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
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
                  void (async () => {
                    try {
                      await deleteNews(n.id);
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
    </div>
  );
}
