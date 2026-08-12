/**
 * Cumbres destacadas — editor visual del carrusel de la portada.
 */
import { useState, useEffect } from "react";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import type { FeaturedCarouselItem } from "@/components/home/FeaturedCarousel";
import type { FeaturedCarouselItemSetting } from "@/types/siteSettings";
import { featuredCarouselItems } from "@/data/home";
import { api } from "@/lib/api";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

function toCarouselItem(item: FeaturedCarouselItemSetting): FeaturedCarouselItem {
  return {
    id: item.id,
    type: item.type ?? "eventos",
    date: item.date,
    title: item.title,
    imageUrl: item.imageUrl,
    href: item.href,
    ctaPrimaryLabel: item.ctaPrimaryLabel,
    location: item.location,
    imagePosition: item.imagePosition,
  };
}

const defaultItems: FeaturedCarouselItemSetting[] = featuredCarouselItems.map((item) => ({
  id: item.id,
  type: item.type,
  date: item.date,
  title: item.title,
  imageUrl: item.imageUrl,
  href: item.href,
  ctaPrimaryLabel: item.ctaPrimaryLabel,
  location: item.location,
  imagePosition: item.imagePosition,
  active: true,
}));

const fieldClass =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--regu-blue)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export default function AdminContentCumbres() {
  const [items, setItems] = useState<FeaturedCarouselItemSetting[]>(defaultItems);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.getAll();
      if (cancelled) return;
      if (res.ok && Array.isArray(res.data?.featured_carousel) && res.data.featured_carousel.length > 0) {
        setItems(
          (res.data.featured_carousel as FeaturedCarouselItemSetting[]).map((item) => ({
            ...item,
            active: item.active ?? true,
          }))
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateItem = (index: number, patch: Partial<FeaturedCarouselItemSetting>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    setSaving(true);
    const res = await api.settings.set("featured_carousel", items);
    setSaving(false);
    setMessage(
      res.ok
        ? { type: "ok", text: "Cumbres guardadas." }
        : { type: "err", text: res.error ?? "No se pudo guardar." }
    );
    window.setTimeout(() => setMessage(null), 4000);
  };

  const previewItems = items.filter((item) => item.active !== false).map(toCarouselItem);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando las cumbres…</p>
      </div>
    );
  }

  return (
    <AdminPreviewPanel
      previewLabel="Así se ven en la portada"
      preview={
        <div className="py-4">
          <div className="mb-4 px-4">
            <h2 className="text-xl font-bold uppercase" style={{ color: "var(--regu-gray-900)" }}>
              Cumbres destacadas
            </h2>
            <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
              Próximas y recientes cumbres de REGULATEL.
            </p>
          </div>
          <FeaturedCarousel items={previewItems.length > 0 ? previewItems : [toCarouselItem(defaultItems[0]!)]} />
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
            Cumbres
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            El carrusel de cumbres de la portada. Sube una foto, pon el título y a dónde lleva.
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

        <div className="space-y-4">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              style={{ borderColor: "rgba(22,61,89,0.10)" }}
            >
              <div className="relative aspect-[16/8] bg-[rgba(22,61,89,0.06)]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--regu-gray-400)" }}>
                    Sin foto todavía
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => setItems((current) => moveItem(current, index, -1))}
                    className="rounded-lg bg-white/90 p-1.5 shadow disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={index === items.length - 1}
                    onClick={() => setItems((current) => moveItem(current, index, 1))}
                    className="rounded-lg bg-white/90 p-1.5 shadow disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Quitar cumbre"
                    onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                    className="rounded-lg bg-white/90 p-1.5 text-red-700 shadow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <AdminBlobUploadField
                  label="Foto de la cumbre"
                  value={item.imageUrl}
                  onChange={(imageUrl) => updateItem(index, { imageUrl })}
                  kind="image"
                  folder="events"
                  helpText="Sube una imagen. Se ve en el carrusel de la portada."
                  showPreview={false}
                />
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                    Título
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) => updateItem(index, { title: event.target.value })}
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                      Fecha
                    </span>
                    <input
                      type="text"
                      value={item.date}
                      onChange={(event) => updateItem(index, { date: event.target.value })}
                      placeholder="11 de diciembre de 2025"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                      Lugar
                    </span>
                    <input
                      type="text"
                      value={item.location ?? ""}
                      onChange={(event) => updateItem(index, { location: event.target.value || undefined })}
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                      Texto del botón
                    </span>
                    <input
                      type="text"
                      value={item.ctaPrimaryLabel ?? ""}
                      onChange={(event) => updateItem(index, { ctaPrimaryLabel: event.target.value || undefined })}
                      placeholder="Leer más"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                      A dónde lleva
                    </span>
                    <input
                      type="text"
                      value={item.href}
                      onChange={(event) => updateItem(index, { href: event.target.value })}
                      placeholder="Página del evento o enlace"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-700)" }}>
                  <input
                    type="checkbox"
                    checked={item.active !== false}
                    onChange={(event) => updateItem(index, { active: event.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Mostrar en la portada
                </label>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setItems((current) => [
              ...current,
              {
                id: `cumbre-${Date.now()}`,
                type: "eventos",
                date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
                title: "Nueva cumbre",
                imageUrl: "",
                href: "#",
                ctaPrimaryLabel: "Leer más",
                active: true,
              },
            ])
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-semibold"
          style={{ borderColor: "rgba(68,137,198,0.45)", color: "var(--regu-blue)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir otra cumbre
        </button>

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar cumbres"}
        </button>
      </div>
    </AdminPreviewPanel>
  );
}
