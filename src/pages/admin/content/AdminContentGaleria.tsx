/**
 * Admin: Galería — crear/editar álbumes, subir y reordenar fotos.
 * Persiste en site_settings con clave gallery_albums.
 */
import { useState, useEffect, useMemo } from "react";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import { getAlbumCoverUrl } from "@/data/galeria";
import type { GalleryAlbumSetting } from "@/types/siteSettings";
import type { AlbumGaleria } from "@/data/galeria";
import { albumesGaleria } from "@/data/galeria";
import { api } from "@/lib/api";
import { Save, Plus, Trash2, ImageIcon, FolderOpen, Upload } from "lucide-react";

const defaultAlbums: GalleryAlbumSetting[] = albumesGaleria.map((a) => ({
  slug: a.slug,
  title: a.title,
  date: a.date,
  folder: a.folder,
  images: a.images,
}));

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminContentGaleria() {
  const [albums, setAlbums] = useState<GalleryAlbumSetting[]>(defaultAlbums);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.getAll();
      if (cancelled) return;
      if (res.ok && res.data?.gallery_albums && Array.isArray(res.data.gallery_albums)) {
        const arr = res.data.gallery_albums as GalleryAlbumSetting[];
        if (arr.length > 0) setAlbums(arr);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const save = async () => {
    setSaving(true);
    const res = await api.settings.set("gallery_albums", albums);
    setSaving(false);
    if (res.ok) showMessage("ok", "Galería guardada correctamente.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  const addAlbum = () => {
    const slug = `nuevo-album-${Date.now()}`;
    setAlbums((prev) => [
      ...prev,
      { slug, title: "Nuevo álbum", date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }), folder: slug, images: [] },
    ]);
  };

  const updateAlbum = (index: number, patch: Partial<GalleryAlbumSetting>) => {
    setAlbums((prev) => {
      const n = [...prev];
      n[index] = { ...n[index], ...patch };
      if (patch.title && !patch.slug) n[index].slug = slugify(patch.title);
      if (patch.slug) n[index].folder = patch.slug;
      return n;
    });
  };

  const removeAlbum = (index: number) => {
    setAlbums((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (albumIndex: number, imageIndex: number) => {
    setAlbums((prev) => {
      const n = [...prev];
      n[albumIndex] = { ...n[albumIndex], images: n[albumIndex].images.filter((_, i) => i !== imageIndex) };
      return n;
    });
  };

  const handleFileUpload = async (albumIndex: number, file: File) => {
    const slug = albums[albumIndex].slug;
    setUploadingId(slug);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          kind: "image",
          folder: "gallery",
          fileName: file.name,
          dataUrl,
        }),
      });
      setUploadingId(null);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setAlbums((prev) => {
          const n = [...prev];
          n[albumIndex] = { ...n[albumIndex], images: [...n[albumIndex].images, data.url] };
          return n;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const previewAlbums: AlbumGaleria[] = useMemo(
    () => albums.map((a) => ({ slug: a.slug, title: a.title, date: a.date, folder: a.folder, images: a.images })),
    [albums]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <AdminPreviewPanel
      previewLabel="Vista previa — Galería"
      preview={
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold uppercase" style={{ color: "var(--regu-gray-900)" }}>
            Galería fotográfica
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {previewAlbums.map((album) => {
              const coverUrl = getAlbumCoverUrl(album);
              return (
                <div
                  key={album.slug}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  style={{ borderColor: "var(--regu-gray-100)" }}
                >
                  <div
                    className="aspect-[4/3] w-full bg-[var(--regu-gray-100)]"
                    style={{
                      backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!coverUrl && (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-12 w-12" style={{ color: "var(--regu-gray-400)" }} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold" style={{ color: "var(--regu-navy)" }}>
                      {album.title}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                      {album.date} · {album.images.length} fotos
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Galería fotográfica
        </h1>

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

        {albums.map((album, albumIndex) => (
          <section
            key={album.slug}
            className="rounded-xl border bg-white p-5 shadow-sm"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <FolderOpen className="h-5 w-5" style={{ color: "var(--regu-blue)" }} />
              <span className="font-semibold" style={{ color: "var(--regu-gray-900)" }}>
                Álbum #{albumIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAlbum(albumIndex)}
                className="ml-auto rounded p-1 text-red-600 hover:bg-red-50"
                aria-label="Eliminar álbum"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Título del álbum"
                value={album.title}
                onChange={(e) => updateAlbum(albumIndex, { title: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
              <input
                type="text"
                placeholder="Fecha (ej. 12 de diciembre de 2025)"
                value={album.date}
                onChange={(e) => updateAlbum(albumIndex, { date: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
              <input
                type="text"
                placeholder="Slug (URL)"
                value={album.slug}
                onChange={(e) => updateAlbum(albumIndex, { slug: e.target.value, folder: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm font-mono"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--regu-gray-500)]">
                Fotos ({album.images.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {album.images.map((img, imgIndex) => {
                  const url = img.startsWith("http") ? img : `/images/galeria/${album.folder}/${img}`;
                  return (
                    <div
                      key={imgIndex}
                      className="relative inline-block h-16 w-16 overflow-hidden rounded-lg border bg-[var(--regu-gray-100)]"
                      style={{ borderColor: "var(--regu-gray-200)" }}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(albumIndex, imgIndex)}
                        className="absolute right-1 top-1 rounded bg-red-600 p-0.5 text-white hover:bg-red-700"
                        aria-label="Quitar foto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--regu-gray-300)] text-[var(--regu-gray-500)] hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]">
                  <Upload className="h-6 w-6" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === album.slug}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(albumIndex, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {uploadingId === album.slug && (
                <p className="mt-2 text-xs text-[var(--regu-gray-500)]">Subiendo…</p>
              )}
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={addAlbum}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-600)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir álbum
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar galería"}
        </button>
      </div>
    </AdminPreviewPanel>
  );
}
