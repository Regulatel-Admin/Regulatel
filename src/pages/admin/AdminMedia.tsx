/**
 * Admin: Media library — listar y reutilizar imágenes subidas a Vercel Blob.
 * Las imágenes se suben desde Noticias, Eventos y Galería (api/uploads).
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Images, FolderOpen, Newspaper, Calendar, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type MediaItem = { url: string; pathname: string; size?: number; uploadedAt?: string };
type FolderFilter = "all" | "news" | "events" | "gallery";

const FOLDER_LABELS: Record<FolderFilter, string> = {
  all: "Todas",
  news: "Noticias",
  events: "Eventos",
  gallery: "Galería",
};

export default function AdminMedia() {
  const [folder, setFolder] = useState<FolderFilter>("all");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.media.list({ prefix: folder, limit: 150 });
      if (!res.ok) {
        setError(res.error ?? "No se pudieron cargar las imágenes.");
        setItems([]);
      } else {
        setItems(res.data?.items ?? []);
      }
    } catch {
      setError("Error al cargar la biblioteca de medios.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
        Media library
      </h1>
      <p className="text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
        Imágenes subidas desde Noticias, Eventos y Galería (Vercel Blob). Puedes copiar la URL para reutilizarlas.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium" style={{ color: "var(--regu-gray-600)" }}>Carpeta:</span>
        {(Object.keys(FOLDER_LABELS) as FolderFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFolder(f)}
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: folder === f ? "var(--regu-blue)" : "var(--regu-gray-100)",
              color: folder === f ? "#fff" : "var(--regu-gray-700)",
            }}
          >
            {FOLDER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--regu-gray-100)" }}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
          Dónde subir nuevos medios
        </p>
        <ul className="flex flex-wrap gap-3">
          <li>
            <Link
              to="/admin/noticias"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:border-[var(--regu-blue)] hover:bg-[rgba(68,137,198,0.04)]"
              style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
            >
              <Newspaper className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              Noticias
            </Link>
          </li>
          <li>
            <Link
              to="/admin/eventos"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:border-[var(--regu-blue)] hover:bg-[rgba(68,137,198,0.04)]"
              style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
            >
              <Calendar className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              Eventos
            </Link>
          </li>
          <li>
            <Link
              to="/admin/content/galeria"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:border-[var(--regu-blue)] hover:bg-[rgba(68,137,198,0.04)]"
              style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
            >
              <FolderOpen className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              Galería
            </Link>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--regu-gray-100)" }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-600)" }}>
          <Images className="h-4 w-4" />
          Imágenes subidas
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando…
          </div>
        ) : error ? (
          <p className="py-4 text-sm font-medium text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            No hay imágenes en esta carpeta. Sube imágenes desde Noticias, Eventos o Galería.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.url}
                className="group overflow-hidden rounded-lg border bg-[var(--regu-gray-100)]"
                style={{ borderColor: "var(--regu-gray-100)" }}
              >
                <div className="aspect-square w-full bg-[var(--regu-gray-100)]">
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="w-full truncate rounded px-2 py-1 text-left text-xs font-medium transition hover:bg-white/80"
                    style={{ color: "var(--regu-gray-700)" }}
                    title="Copiar URL"
                  >
                    Copiar URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
