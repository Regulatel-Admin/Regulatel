import { useState } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { AdminNewsItem } from "@/contexts/AdminDataContext";
import { Pencil, Trash2, Plus } from "lucide-react";

const emptyItem: Omit<AdminNewsItem, "id" | "published"> = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  dateFormatted: "",
  category: "Noticias",
  excerpt: "",
  imageUrl: "",
  content: "",
  author: "REGULATEL",
};

function formatDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminNoticias() {
  const { adminNews, addNews, updateNews, deleteNews } = useAdminData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyItem);

  const resetForm = () => {
    setForm({ ...emptyItem, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateFormatted = formatDate(form.date);
    if (editingId) {
      updateNews(editingId, { ...form, dateFormatted });
    } else {
      const slug =
        form.slug ||
        form.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      addNews({ ...form, slug, dateFormatted });
    }
    resetForm();
  };

  const startEdit = (n: AdminNewsItem) => {
    setForm({
      slug: n.slug,
      title: n.title,
      date: n.date,
      dateFormatted: n.dateFormatted,
      category: n.category,
      excerpt: n.excerpt,
      imageUrl: n.imageUrl,
      content: n.content,
      author: n.author,
      link: n.link,
      videoUrl: n.videoUrl,
    });
    setEditingId(n.id);
    setAdding(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Noticias
      </h1>

      {!adding && !editingId && (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setForm({ ...emptyItem, date: new Date().toISOString().slice(0, 10) });
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
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>URL de imagen</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="/images/noticias/mi-foto.jpg"
                className="w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--regu-gray-100)" }}
              />
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
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              {editingId ? "Guardar" : "Publicar"}
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
                onClick={() => deleteNews(n.id)}
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
