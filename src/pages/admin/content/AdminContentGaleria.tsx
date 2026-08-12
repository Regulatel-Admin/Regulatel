/**
 * Galería — álbumes y fotos, sin slugs ni URLs a la vista.
 */
import { useState, useEffect, useMemo } from "react";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import { getAlbumCoverUrl } from "@/data/galeria";
import type { GalleryAlbumSetting } from "@/types/siteSettings";
import type { AlbumGaleria } from "@/data/galeria";
import { albumesGaleria } from "@/data/galeria";
import { api } from "@/lib/api";
import { uploadAdminFile } from "@/lib/uploads";
import { slugify } from "@/lib/slugify";
import { Save, Plus, Trash2, ImageIcon, Upload } from "lucide-react";

const defaultAlbums: GalleryAlbumSetting[] = albumesGaleria.map((a) => ({
  slug: a.slug,
  title: a.title,
  date: a.date,
  folder: a.folder,
  images: a.images,
}));

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
    if (res.ok) showMessage("ok", "Galería guardada.");
    else showMessage("err", res.error ?? "No se pudo guardar.");
  };

  const addAlbum = () => {
    const slug = `nuevo-album-${Date.now()}`;
    setAlbums((prev) => [
      ...prev,
      {
        slug,
        title: "Nuevo álbum",
        date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        folder: slug,
        images: [],
      },
    ]);
  };

  const updateAlbum = (index: number, patch: Partial<GalleryAlbumSetting>) => {
    setAlbums((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...patch };
      if (patch.title && (!current.slug || current.slug.startsWith("nuevo-album-"))) {
        const generated = slugify(patch.title);
        if (generated) {
          current.slug = generated;
          current.folder = generated;
        }
      }
      next[index] = current;
      return next;
    });
  };

  const removeAlbum = (index: number) => {
    setAlbums((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (albumIndex: number, imageIndex: number) => {
    setAlbums((prev) => {
      const next = [...prev];
      next[albumIndex] = {
        ...next[albumIndex],
        images: next[albumIndex].images.filter((_, i) => i !== imageIndex),
      };
      return next;
    });
  };

  const handleFileUpload = async (albumIndex: number, file: File) => {
    const slug = albums[albumIndex].slug;
    setUploadingId(slug);
    try {
      const uploaded = await uploadAdminFile({ file, kind: "image", folder: "gallery" });
      setAlbums((prev) => {
        const next = [...prev];
        next[albumIndex] = { ...next[albumIndex], images: [...next[albumIndex].images, uploaded.url] };
        return next;
      });
    } catch (error) {
      showMessage("err", error instanceof Error ? error.message : "No se pudo subir la foto.");
    } finally {
      setUploadingId(null);
    }
  };

  const previewAlbums: AlbumGaleria[] = useMemo(
    () => albums.map((a) => ({ slug: a.slug, title: a.title, date: a.date, folder: a.folder, images: a.images })),
    [albums]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando la galería…</p>
      </div>
    );
  }

  return (
    <AdminPreviewPanel
      previewLabel="Así se ve la galería"
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
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
            Galería
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Álbumes con fotos grandes. El título basta: el enlace se arma solo.
          </p>
        </div>

        {message && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
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
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div className="flex items-start justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Título del álbum"
                  value={album.title}
                  onChange={(e) => updateAlbum(albumIndex, { title: e.target.value })}
                  className="w-full rounded-lg border-0 bg-transparent text-base font-semibold outline-none"
                  style={{ color: "var(--regu-navy)" }}
                />
                <input
                  type="text"
                  placeholder="Fecha (ej. 12 de diciembre de 2025)"
                  value={album.date}
                  onChange={(e) => updateAlbum(albumIndex, { date: e.target.value })}
                  className="w-full rounded-lg border-0 bg-transparent text-sm outline-none"
                  style={{ color: "var(--regu-gray-600)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeAlbum(albumIndex)}
                className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                aria-label="Eliminar álbum"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-3 text-sm font-medium" style={{ color: "var(--regu-gray-600)" }}>
                {album.images.length} {album.images.length === 1 ? "foto" : "fotos"}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {album.images.map((img, imgIndex) => {
                  const url = img.startsWith("http") || img.startsWith("/") ? img : `/images/galeria/${album.folder}/${img}`;
                  return (
                    <div
                      key={`${url}-${imgIndex}`}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-[var(--regu-gray-100)]"
                      style={{ borderColor: "var(--regu-gray-200)" }}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(albumIndex, imgIndex)}
                        className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1.5 text-red-700 shadow"
                        aria-label="Quitar foto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-sm font-medium hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
                  style={{ borderColor: "var(--regu-gray-300)", color: "var(--regu-gray-500)" }}
                >
                  <Upload className="h-6 w-6" />
                  {uploadingId === album.slug ? "Subiendo…" : "Añadir foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingId === album.slug}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFileUpload(albumIndex, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={addAlbum}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-sm font-semibold"
          style={{ borderColor: "rgba(68,137,198,0.45)", color: "var(--regu-blue)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir álbum
        </button>

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar galería"}
        </button>
      </div>
    </AdminPreviewPanel>
  );
}
