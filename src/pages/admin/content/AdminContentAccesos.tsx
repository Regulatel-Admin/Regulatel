/**
 * Admin: Accesos principales — edición de los 4 tiles de la home.
 * Misma data que quick_links; preview en vivo de la barra de accesos.
 */
import { useState, useEffect, useMemo } from "react";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import QuickLinksBar from "@/components/home/QuickLinksBar";
import type { QuickLinkSettingItem } from "@/types/siteSettings";
import { quickLinks } from "@/data/home";
import { api } from "@/lib/api";
import { quickLinkItemsFromSetting } from "@/lib/quickLinks";
import { Save } from "lucide-react";

const ICON_OPTIONS = [
  { value: "Users", label: "Miembros" },
  { value: "Globe", label: "Globo" },
  { value: "BarChart3", label: "Gráficos" },
  { value: "Files", label: "Documentos" },
  { value: "ImageIcon", label: "Imagen" },
  { value: "BookOpen", label: "Libro" },
];

const DEFAULT_ICONS = ["Users", "Globe", "BarChart3", "Files"] as const;
const defaultQuickLinks: QuickLinkSettingItem[] = quickLinks.map((q, i) => ({
  label: q.label,
  href: q.href,
  external: (q as { external?: boolean }).external,
  icon: DEFAULT_ICONS[i] ?? "Users",
}));

export default function AdminContentAccesos() {
  const [items, setItems] = useState<QuickLinkSettingItem[]>(defaultQuickLinks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.getAll();
      if (cancelled) return;
      if (res.ok && res.data?.quick_links && Array.isArray(res.data.quick_links) && res.data.quick_links.length > 0) {
        setItems(
          (res.data.quick_links as QuickLinkSettingItem[]).map((q) => ({
            label: typeof q.label === "string" ? q.label : "",
            href: typeof q.href === "string" ? q.href : "",
            external: Boolean(q.external),
            icon: typeof q.icon === "string" ? q.icon : undefined,
          }))
        );
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
    const res = await api.settings.set("quick_links", items);
    setSaving(false);
    if (res.ok) showMessage("ok", "Accesos principales guardados.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  const previewItems = useMemo(() => quickLinkItemsFromSetting(items), [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <AdminPreviewPanel
      previewLabel="Vista previa — Accesos principales"
      preview={<QuickLinksBar items={previewItems} seeMoreHref="/recursos" />}
    >
      <div className="space-y-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Accesos principales
        </h1>
        <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Los 4 tiles que se muestran en la home debajo del hero. Mismo contenido que en Home si lo editas ahí.
        </p>

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
          {items.map((q, i) => (
            <div
              key={i}
              className="flex flex-wrap items-end gap-2 rounded-lg border p-3"
              style={{ borderColor: "var(--regu-gray-100)" }}
            >
              <label className="min-w-[120px] flex-1">
                <span className="mb-1 block text-xs text-[var(--regu-gray-500)]">Etiqueta</span>
                <input
                  type="text"
                  value={q.label}
                  onChange={(e) =>
                    setItems((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], label: e.target.value };
                      return n;
                    })
                  }
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="min-w-[160px] flex-1">
                <span className="mb-1 block text-xs text-[var(--regu-gray-500)]">Enlace</span>
                <input
                  type="text"
                  value={q.href}
                  onChange={(e) =>
                    setItems((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], href: e.target.value };
                      return n;
                    })
                  }
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="w-32">
                <span className="mb-1 block text-xs text-[var(--regu-gray-500)]">Icono</span>
                <select
                  value={q.icon ?? ""}
                  onChange={(e) =>
                    setItems((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], icon: e.target.value || undefined };
                      return n;
                    })
                  }
                  className="w-full rounded border px-2 py-1.5 text-sm"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={q.external ?? false}
                  onChange={(e) =>
                    setItems((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], external: e.target.checked };
                      return n;
                    })
                  }
                />
                <span className="text-xs text-[var(--regu-gray-600)]">Externo</span>
              </label>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                className="rounded border border-red-200 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { label: "Nuevo acceso", href: "/", icon: "Users", external: false },
              ])
            }
            className="rounded-lg border-2 border-dashed px-4 py-2 text-sm font-medium"
            style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-600)" }}
          >
            + Añadir acceso
          </button>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar accesos"}
        </button>
      </div>
    </AdminPreviewPanel>
  );
}
