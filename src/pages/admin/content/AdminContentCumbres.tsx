/**
 * Admin: Cumbres destacadas — CRUD del carrusel de cumbres en home.
 * Preview en vivo del carrusel.
 */
import { useState, useEffect } from "react";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import type { FeaturedCarouselItem } from "@/components/home/FeaturedCarousel";
import type { FeaturedCarouselItemSetting } from "@/types/siteSettings";
import { featuredCarouselItems } from "@/data/home";
import { api } from "@/lib/api";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";

function toCarouselItem(s: FeaturedCarouselItemSetting): FeaturedCarouselItem {
  return {
    id: s.id,
    type: s.type ?? "eventos",
    date: s.date,
    title: s.title,
    imageUrl: s.imageUrl,
    href: s.href,
    ctaPrimaryLabel: s.ctaPrimaryLabel,
    location: s.location,
    imagePosition: s.imagePosition,
  };
}

const defaultItems: FeaturedCarouselItemSetting[] = featuredCarouselItems.map((it) => ({
  id: it.id,
  type: it.type,
  date: it.date,
  title: it.title,
  imageUrl: it.imageUrl,
  href: it.href,
  ctaPrimaryLabel: it.ctaPrimaryLabel,
  location: it.location,
  imagePosition: it.imagePosition,
  active: true,
}));

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
      if (res.ok && res.data?.featured_carousel && Array.isArray(res.data.featured_carousel)) {
        const arr = res.data.featured_carousel as FeaturedCarouselItemSetting[];
        if (arr.length > 0) {
          setItems(arr.map((s) => ({ ...s, active: s.active ?? true })));
        }
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
    const res = await api.settings.set("featured_carousel", items);
    setSaving(false);
    if (res.ok) showMessage("ok", "Cumbres guardadas correctamente.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  const addItem = () => {
    const id = `cumbre-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id,
        type: "eventos",
        date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        title: "Nueva cumbre",
        imageUrl: "/images/cumbre-regulatel-ASIET.jpg",
        href: "#",
        ctaPrimaryLabel: "Leer más",
        active: true,
      },
    ]);
  };

  const updateItem = (index: number, patch: Partial<FeaturedCarouselItemSetting>) => {
    setItems((prev) => {
      const n = [...prev];
      n[index] = { ...n[index], ...patch };
      return n;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const previewItems = items.filter((i) => i.active !== false).map(toCarouselItem);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <AdminPreviewPanel
      previewLabel="Vista previa — Cumbres destacadas"
      preview={
        <div className="py-4">
          <div className="mb-4 px-4">
            <h2 className="text-xl font-bold uppercase" style={{ color: "var(--regu-gray-900)" }}>
              CUMBRES DESTACADAS
            </h2>
            <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
              Próximas y recientes cumbres de REGULATEL.
            </p>
          </div>
          <FeaturedCarousel items={previewItems.length > 0 ? previewItems : [toCarouselItem(defaultItems[0]!)]} />
        </div>
      }
    >
      <div className="space-y-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Cumbres destacadas
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

        <div className="space-y-3">
          {items.map((it, i) => (
            <div
              key={it.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
              style={{ borderColor: "var(--regu-gray-100)" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  className="touch-none cursor-grab text-[var(--regu-gray-400)]"
                  aria-label="Reordenar"
                  onMouseDown={() => {}}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-[var(--regu-gray-500)]">#{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="ml-auto rounded p-1 text-red-600 hover:bg-red-50"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-2">
                <input
                  type="text"
                  placeholder="Título"
                  value={it.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
                <input
                  type="text"
                  placeholder="Fecha (ej. 11 de diciembre de 2025)"
                  value={it.date}
                  onChange={(e) => updateItem(i, { date: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
                <input
                  type="text"
                  placeholder="URL de imagen"
                  value={it.imageUrl}
                  onChange={(e) => updateItem(i, { imageUrl: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
                <input
                  type="text"
                  placeholder="Enlace"
                  value={it.href}
                  onChange={(e) => updateItem(i, { href: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
                <input
                  type="text"
                  placeholder="Ubicación (opcional)"
                  value={it.location ?? ""}
                  onChange={(e) => updateItem(i, { location: e.target.value || undefined })}
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
                <input
                  type="text"
                  placeholder="Texto del botón (ej. Leer más)"
                  value={it.ctaPrimaryLabel ?? ""}
                  onChange={(e) => updateItem(i, { ctaPrimaryLabel: e.target.value || undefined })}
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-600)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir cumbre
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar cumbres"}
        </button>
      </div>
    </AdminPreviewPanel>
  );
}
