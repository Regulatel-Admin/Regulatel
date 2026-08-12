/**
 * Archivos — fotos ya subidas desde Noticias, Eventos y Galería.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Images, FolderOpen, Newspaper, Calendar, Loader2, Check } from "lucide-react";
import { api } from "@/lib/api";
import { AdminBlobStorageBar } from "@/components/admin/AdminBlobStorageBar";
import { AdminLockedScreen, useAdminOnlySection } from "@/components/admin/AdminLockedScreen";

type MediaItem = { url: string; pathname: string; size?: number; uploadedAt?: string };
type FolderFilter = "all" | "news" | "events" | "gallery";

const FOLDER_LABELS: Record<FolderFilter, string> = {
  all: "Todas",
  news: "Noticias",
  events: "Eventos",
  gallery: "Galería",
};

export default function AdminMedia() {
  const { isChecking, allowed, locked } = useAdminOnlySection();
  const [folder, setFolder] = useState<FolderFilter>("all");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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
      setError("No se pudieron cargar las fotos.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    if (!allowed) return;
    void load();
  }, [allowed, load]);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      setError("No se pudo copiar. Prueba de nuevo.");
    }
  };

  if (isChecking) return null;
  if (locked) return <AdminLockedScreen title="Archivos" />;
  if (!allowed) return null;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Archivos
        </h1>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
          Fotos que ya subiste. Si quieres reutilizar una, cópiala y pégala donde haga falta.
        </p>
        <div className="mt-3 max-w-md rounded-xl border bg-white px-3 py-2" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <AdminBlobStorageBar variant="field" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--regu-gray-700)" }}>
          Para subir fotos nuevas, ve a:
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
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--regu-gray-700)" }}>
          <Images className="h-4 w-4" />
          Fotos
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
            Todavía no hay fotos aquí. Súbelas desde Noticias, Eventos o Galería.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.url}
                className="overflow-hidden rounded-xl border bg-[var(--regu-gray-100)]"
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
                    onClick={() => void copyUrl(item.url)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition hover:bg-white/80"
                    style={{ color: copiedUrl === item.url ? "var(--regu-blue)" : "var(--regu-gray-700)" }}
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copiada
                      </>
                    ) : (
                      "Copiar para reutilizar"
                    )}
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
