/**
 * Admin: Home content — Hero institucional + Accesos principales (quick links).
 * Live preview on the right; data from API or static defaults.
 */
import { useState, useEffect, useMemo } from "react";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import HomeHeroInstitucional from "@/components/home/HomeHeroInstitucional";
import QuickLinksBar from "@/components/home/QuickLinksBar";
import type { HomeHeroSetting, QuickLinkSettingItem } from "@/types/siteSettings";
import { heroInstitucional, quickLinks } from "@/data/home";
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

const defaultHero: HomeHeroSetting = {
  coverImageUrls: heroInstitucional.coverImageUrls.slice(),
  badge: heroInstitucional.badge,
  title: heroInstitucional.title,
  titleHighlight: heroInstitucional.titleHighlight,
  description: heroInstitucional.description,
  primaryCta: { ...heroInstitucional.primaryCta },
  secondaryCta: { ...heroInstitucional.secondaryCta },
};

const DEFAULT_ICONS = ["Users", "Globe", "BarChart3", "Files"] as const;
const defaultQuickLinks: QuickLinkSettingItem[] = quickLinks.map((q, i) => ({
  label: q.label,
  href: q.href,
  external: (q as { external?: boolean }).external,
  icon: DEFAULT_ICONS[i] ?? "Users",
}));

export default function AdminContentHome() {
  const [hero, setHero] = useState<HomeHeroSetting>(defaultHero);
  const [quickLinksSetting, setQuickLinksSetting] = useState<QuickLinkSettingItem[]>(defaultQuickLinks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.getAll();
      if (cancelled) return;
      if (res.ok && res.data) {
        const rawHero = res.data.home_hero;
        const heroObj =
          typeof rawHero === "string"
            ? (() => {
                try {
                  return JSON.parse(rawHero) as HomeHeroSetting;
                } catch {
                  return null;
                }
              })()
            : rawHero && typeof rawHero === "object" ? (rawHero as HomeHeroSetting) : null;
        if (heroObj) {
          const h = heroObj;
          setHero({
            coverImageUrls: Array.isArray(h.coverImageUrls) ? h.coverImageUrls : defaultHero.coverImageUrls,
            badge: typeof h.badge === "string" ? h.badge : defaultHero.badge,
            title: typeof h.title === "string" ? h.title : defaultHero.title,
            titleHighlight: typeof h.titleHighlight === "string" ? h.titleHighlight : defaultHero.titleHighlight,
            description: typeof h.description === "string" ? h.description : defaultHero.description,
            primaryCta: h.primaryCta && typeof h.primaryCta.label === "string" ? h.primaryCta : defaultHero.primaryCta,
            secondaryCta: h.secondaryCta && typeof h.secondaryCta.label === "string" ? h.secondaryCta : defaultHero.secondaryCta,
          });
        }
        const rawQl = res.data.quick_links;
        const qlArr = typeof rawQl === "string" ? (() => { try { return JSON.parse(rawQl); } catch { return null; } })() : rawQl;
        if (Array.isArray(qlArr) && qlArr.length > 0) {
          setQuickLinksSetting(
            (qlArr as QuickLinkSettingItem[]).map((q) => ({
              label: typeof q.label === "string" ? q.label : "",
              href: typeof q.href === "string" ? q.href : "",
              external: Boolean(q.external),
              icon: typeof q.icon === "string" ? q.icon : undefined,
            }))
          );
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

  const saveHero = async () => {
    setSaving("hero");
    console.warn("[REGULATEL] Guardando hero (PUT /api/route?path=settings)...");
    const res = await api.settings.set("home_hero", hero);
    setSaving(null);
    if (res.ok) {
      const echoed = res.data as { key?: string } | undefined;
      console.warn("[REGULATEL] Save hero: OK. Servidor devolvió key:", echoed?.key ?? "(no key)");
      showMessage("ok", "Hero guardado correctamente.");
    } else {
      console.error("[REGULATEL] Save hero FALLÓ:", res.error);
      showMessage("err", res.error ?? "Error al guardar.");
    }
  };

  const saveQuickLinks = async () => {
    setSaving("quick_links");
    console.warn("[REGULATEL] Guardando accesos (PUT /api/route?path=settings)...");
    const res = await api.settings.set("quick_links", quickLinksSetting);
    setSaving(null);
    if (res.ok) {
      console.warn("[REGULATEL] Save quick_links: OK.");
      showMessage("ok", "Accesos principales guardados.");
    } else {
      console.error("[REGULATEL] Save quick_links FALLÓ:", res.error);
      showMessage("err", res.error ?? "Error al guardar.");
    }
  };

  const previewQuickLinkItems = useMemo(
    () => quickLinkItemsFromSetting(quickLinksSetting),
    [quickLinksSetting]
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
      previewLabel="Vista previa — Home (Hero y Accesos)"
      preview={
        <>
          <HomeHeroInstitucional
            coverImageUrls={hero.coverImageUrls}
            badge={hero.badge}
            title={hero.title}
            titleHighlight={hero.titleHighlight}
            description={hero.description}
            primaryCta={hero.primaryCta}
            secondaryCta={hero.secondaryCta}
          />
          <QuickLinksBar items={previewQuickLinkItems} seeMoreHref="/recursos" />
        </>
      }
    >
      <div className="space-y-10">
        <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Home — Hero y Accesos
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

        {/* Hero */}
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--regu-gray-100)" }}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-600)" }}>
            Hero institucional
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Badge</span>
              <input
                type="text"
                value={hero.badge}
                onChange={(e) => setHero((h) => ({ ...h, badge: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Título</span>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Título destacado</span>
              <input
                type="text"
                value={hero.titleHighlight}
                onChange={(e) => setHero((h) => ({ ...h, titleHighlight: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Descripción</span>
              <textarea
                value={hero.description}
                onChange={(e) => setHero((h) => ({ ...h, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Botón principal (texto)</span>
                <input
                  type="text"
                  value={hero.primaryCta.label}
                  onChange={(e) => setHero((h) => ({ ...h, primaryCta: { ...h.primaryCta, label: e.target.value } }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">URL</span>
                <input
                  type="text"
                  value={hero.primaryCta.href}
                  onChange={(e) => setHero((h) => ({ ...h, primaryCta: { ...h.primaryCta, href: e.target.value } }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Botón secundario (texto)</span>
                <input
                  type="text"
                  value={hero.secondaryCta.label}
                  onChange={(e) => setHero((h) => ({ ...h, secondaryCta: { ...h.secondaryCta, label: e.target.value } }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">URL</span>
                <input
                  type="text"
                  value={hero.secondaryCta.href}
                  onChange={(e) => setHero((h) => ({ ...h, secondaryCta: { ...h.secondaryCta, href: e.target.value } }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--regu-gray-200)" }}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--regu-gray-600)]">Imágenes del slideshow (una URL por línea)</span>
              <textarea
                value={hero.coverImageUrls.join("\n")}
                onChange={(e) =>
                  setHero((h) => ({
                    ...h,
                    coverImageUrls: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
                style={{ borderColor: "var(--regu-gray-200)" }}
                placeholder="/1a.jpg"
              />
            </label>
            <button
              type="button"
              onClick={saveHero}
              disabled={saving === "hero"}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Save className="h-4 w-4" />
              {saving === "hero" ? "Guardando…" : "Guardar hero"}
            </button>
          </div>
        </section>

        {/* Accesos principales */}
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--regu-gray-100)" }}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-600)" }}>
            Accesos principales (quick links)
          </h2>
          <div className="space-y-3">
            {quickLinksSetting.map((q, i) => (
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
                      setQuickLinksSetting((prev) => {
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
                      setQuickLinksSetting((prev) => {
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
                      setQuickLinksSetting((prev) => {
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
                      setQuickLinksSetting((prev) => {
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
                  onClick={() =>
                    setQuickLinksSetting((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="rounded border border-red-200 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setQuickLinksSetting((prev) => [
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
            onClick={saveQuickLinks}
            disabled={saving === "quick_links"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            <Save className="h-4 w-4" />
            {saving === "quick_links" ? "Guardando…" : "Guardar accesos"}
          </button>
        </section>
      </div>
    </AdminPreviewPanel>
  );
}
