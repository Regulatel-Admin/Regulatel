/**
 * Admin: Portada — texto, botones y fotos del hero.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminPreviewPanel from "@/components/admin/AdminPreviewPanel";
import AdminSlideshowField from "@/components/admin/AdminSlideshowField";
import HomeHeroInstitucional from "@/components/home/HomeHeroInstitucional";
import type { HomeHeroSetting } from "@/types/siteSettings";
import { heroInstitucional } from "@/data/home";
import { api } from "@/lib/api";
import { ArrowRight, Save } from "lucide-react";

const defaultHero: HomeHeroSetting = {
  coverImageUrls: heroInstitucional.coverImageUrls.slice(),
  badge: heroInstitucional.badge,
  title: heroInstitucional.title,
  titleHighlight: heroInstitucional.titleHighlight,
  description: heroInstitucional.description,
  primaryCta: { ...heroInstitucional.primaryCta },
  secondaryCta: { ...heroInstitucional.secondaryCta },
};

const fieldClass = "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--regu-blue)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

export default function AdminContentHome() {
  const [hero, setHero] = useState<HomeHeroSetting>(defaultHero);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            : rawHero && typeof rawHero === "object"
              ? (rawHero as HomeHeroSetting)
              : null;
        if (heroObj) {
          setHero({
            coverImageUrls: Array.isArray(heroObj.coverImageUrls)
              ? heroObj.coverImageUrls
              : defaultHero.coverImageUrls,
            badge: typeof heroObj.badge === "string" ? heroObj.badge : defaultHero.badge,
            title: typeof heroObj.title === "string" ? heroObj.title : defaultHero.title,
            titleHighlight:
              typeof heroObj.titleHighlight === "string"
                ? heroObj.titleHighlight
                : defaultHero.titleHighlight,
            description:
              typeof heroObj.description === "string" ? heroObj.description : defaultHero.description,
            primaryCta:
              heroObj.primaryCta && typeof heroObj.primaryCta.label === "string"
                ? heroObj.primaryCta
                : defaultHero.primaryCta,
            secondaryCta:
              heroObj.secondaryCta && typeof heroObj.secondaryCta.label === "string"
                ? heroObj.secondaryCta
                : defaultHero.secondaryCta,
          });
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveHero = async () => {
    setSaving(true);
    const res = await api.settings.set("home_hero", hero);
    setSaving(false);
    if (res.ok) {
      setMessage({ type: "ok", text: "Portada guardada." });
    } else {
      setMessage({ type: "err", text: res.error ?? "No se pudo guardar." });
    }
    window.setTimeout(() => setMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando la portada…</p>
      </div>
    );
  }

  return (
    <AdminPreviewPanel
      previewLabel="Así se ve la portada"
      preview={
        <HomeHeroInstitucional
          coverImageUrls={hero.coverImageUrls}
          badge={hero.badge}
          title={hero.title}
          titleHighlight={hero.titleHighlight}
          description={hero.description}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
        />
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
            Portada
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Esto es lo primero que ve la gente al entrar a regulatel.org. Cambia el texto, los botones o las fotos.
          </p>
        </div>

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

        <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
            Texto
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Etiqueta pequeña (arriba)
              </span>
              <input
                type="text"
                value={hero.badge}
                onChange={(event) => setHero((current) => ({ ...current, badge: event.target.value }))}
                className={fieldClass}
                style={fieldStyle}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Título
              </span>
              <input
                type="text"
                value={hero.title}
                onChange={(event) => setHero((current) => ({ ...current, title: event.target.value }))}
                className={fieldClass}
                style={fieldStyle}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Palabras en color (dentro del título)
              </span>
              <input
                type="text"
                value={hero.titleHighlight}
                onChange={(event) =>
                  setHero((current) => ({ ...current, titleHighlight: event.target.value }))
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Párrafo
              </span>
              <textarea
                value={hero.description}
                onChange={(event) =>
                  setHero((current) => ({ ...current, description: event.target.value }))
                }
                rows={3}
                className={fieldClass}
                style={fieldStyle}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
            Botones
          </h2>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Botón principal
                </span>
                <input
                  type="text"
                  value={hero.primaryCta.label}
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      primaryCta: { ...current.primaryCta, label: event.target.value },
                    }))
                  }
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
                  value={hero.primaryCta.href}
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      primaryCta: { ...current.primaryCta, href: event.target.value },
                    }))
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                  Botón secundario
                </span>
                <input
                  type="text"
                  value={hero.secondaryCta.label}
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      secondaryCta: { ...current.secondaryCta, label: event.target.value },
                    }))
                  }
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
                  value={hero.secondaryCta.href}
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      secondaryCta: { ...current.secondaryCta, href: event.target.value },
                    }))
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <AdminSlideshowField
            urls={hero.coverImageUrls}
            onChange={(coverImageUrls) => setHero((current) => ({ ...current, coverImageUrls }))}
          />
        </section>

        <Link
          to="/admin/content/accesos"
          className="flex items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-4 text-sm shadow-sm transition hover:border-[var(--regu-blue)]"
          style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-navy)" }}
        >
          <span>
            <span className="block font-semibold">Accesos de debajo de la portada</span>
            <span className="mt-0.5 block text-[12px]" style={{ color: "var(--regu-gray-500)" }}>
              Los cuatro atajos (Miembros, Documentos, etc.) se editan en su propia pantalla.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "var(--regu-blue)" }} />
        </Link>

        <button
          type="button"
          onClick={() => void saveHero()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar portada"}
        </button>
      </div>
    </AdminPreviewPanel>
  );
}
