/**
 * Accesos de la portada — lista compacta: nombre, página e icono.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import type { QuickLinkSettingItem } from "@/types/siteSettings";
import { quickLinks } from "@/data/home";
import { api } from "@/lib/api";
import { QUICK_LINK_ICON_MAP } from "@/lib/quickLinks";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Files,
  Globe,
  ImageIcon,
  Plus,
  Save,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICON_OPTIONS: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "Users", label: "Personas", icon: Users },
  { value: "Globe", label: "Mundo", icon: Globe },
  { value: "BarChart3", label: "Gráficos", icon: BarChart3 },
  { value: "Files", label: "Documentos", icon: Files },
  { value: "ImageIcon", label: "Fotos", icon: ImageIcon },
  { value: "BookOpen", label: "Libro", icon: BookOpen },
];

const DEFAULT_ICONS = ["Users", "Globe", "BarChart3", "Files"] as const;

const SITE_PAGES: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/miembros", label: "Miembros" },
  { href: "/micrositio-buenas-practicas", label: "Buenas prácticas" },
  {
    href: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel",
    label: "Banco de información (SUTEL)",
    external: true,
  },
  { href: "/gestion", label: "Documentos / Gestión" },
  { href: "/galeria", label: "Galería" },
  { href: "/noticias", label: "Noticias" },
  { href: "/eventos", label: "Eventos" },
  { href: "/autoridades", label: "Autoridades" },
  { href: "/convenios", label: "Convenios" },
  { href: "/comite-ejecutivo", label: "Comité Ejecutivo" },
  { href: "/grupos-de-trabajo", label: "Grupos de trabajo" },
  { href: "/boletines-gtai", label: "Boletines GTAI" },
  { href: "/contacto", label: "Contacto" },
  { href: "/que-somos", label: "Quiénes somos" },
  { href: "/", label: "Inicio" },
];

const CUSTOM_HREF = "__custom__";

const defaultQuickLinks: QuickLinkSettingItem[] = quickLinks.map((item, index) => ({
  label: item.label,
  href: item.href,
  external: (item as { external?: boolean }).external,
  icon: DEFAULT_ICONS[index] ?? "Users",
}));

function pageValue(href: string): string {
  return SITE_PAGES.some((page) => page.href === href) ? href : CUSTOM_HREF;
}

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export default function AdminContentAccesos() {
  const [items, setItems] = useState<QuickLinkSettingItem[]>(defaultQuickLinks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [iconPicker, setIconPicker] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.getAll();
      if (cancelled) return;
      if (res.ok && Array.isArray(res.data?.quick_links) && res.data.quick_links.length > 0) {
        setItems(
          (res.data.quick_links as QuickLinkSettingItem[]).map((item) => ({
            label: typeof item.label === "string" ? item.label : "",
            href: typeof item.href === "string" ? item.href : "",
            external: Boolean(item.external),
            icon: typeof item.icon === "string" ? item.icon : "Users",
          }))
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (iconPicker === null) return;
    const close = (event: MouseEvent) => {
      if (!listRef.current?.contains(event.target as Node)) setIconPicker(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [iconPicker]);

  const updateAt = (index: number, patch: Partial<QuickLinkSettingItem>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    setSaving(true);
    const res = await api.settings.set("quick_links", items);
    setSaving(false);
    setMessage(
      res.ok
        ? { type: "ok", text: "Accesos guardados. Ya se ven en la portada." }
        : { type: "err", text: res.error ?? "No se pudo guardar." }
    );
    window.setTimeout(() => setMessage(null), 4000);
  };

  const previewItems = useMemo(() => items.filter((item) => item.label.trim()), [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando los accesos…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Accesos de la portada
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Los atajos de debajo del banner. Arriba ves cómo quedan; abajo los cambias.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: "rgba(15, 118, 110, 0.22)" }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5"
          style={{
            background: "linear-gradient(90deg, #e7f6f3 0%, #f3faf8 55%, #eef6f4 100%)",
            borderBottom: "1px solid rgba(15, 118, 110, 0.16)",
          }}
        >
          <p
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "#0f766e" }}
          >
            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Así lo ve la gente
          </p>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: "rgba(15, 118, 110, 0.12)", color: "#0f766e" }}
          >
            Vista pública
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px p-3 sm:grid-cols-4" style={{ backgroundColor: "rgba(22,61,89,0.08)" }}>
          {(previewItems.length > 0 ? previewItems : items).map((item, index) => {
            const Icon = QUICK_LINK_ICON_MAP[item.icon ?? ""] ?? Users;
            return (
              <div key={`${item.href}-${index}`} className="flex items-center gap-2 bg-white px-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
                  {item.label || "Sin nombre"}
                </span>
              </div>
            );
          })}
        </div>
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

      <div ref={listRef} className="space-y-2">
        {items.map((item, index) => {
          const Icon = QUICK_LINK_ICON_MAP[item.icon ?? ""] ?? Users;
          const selectedPage = pageValue(item.href);
          return (
            <div
              key={`${item.href}-${index}`}
              className="rounded-2xl border bg-white p-3 shadow-sm"
              style={{ borderColor: "rgba(22,61,89,0.10)" }}
            >
              <div className="flex items-start gap-2">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    title="Cambiar icono"
                    onClick={() => setIconPicker((current) => (current === index ? null : index))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:border-[var(--regu-blue)]"
                    style={{
                      borderColor: iconPicker === index ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
                      backgroundColor: "rgba(68,137,198,0.10)",
                      color: "var(--regu-blue)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  {iconPicker === index && (
                    <div
                      className="absolute left-0 top-12 z-20 grid grid-cols-3 gap-1 rounded-xl border bg-white p-2 shadow-lg"
                      style={{ borderColor: "rgba(22,61,89,0.12)" }}
                    >
                      {ICON_OPTIONS.map((option) => {
                        const selected = item.icon === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            onClick={() => {
                              updateAt(index, { icon: option.value });
                              setIconPicker(null);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: selected ? "rgba(68,137,198,0.16)" : "transparent",
                              color: selected ? "var(--regu-blue)" : "var(--regu-gray-600)",
                            }}
                          >
                            <option.icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(event) => updateAt(index, { label: event.target.value })}
                    placeholder="Nombre que se ve"
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--regu-blue)]"
                    style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={selectedPage}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === CUSTOM_HREF) {
                          updateAt(index, { href: item.href.startsWith("http") ? item.href : "https://" });
                          return;
                        }
                        const page = SITE_PAGES.find((entry) => entry.href === value);
                        updateAt(index, { href: value, external: Boolean(page?.external) });
                      }}
                      className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--regu-blue)]"
                      style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                    >
                      {SITE_PAGES.map((page) => (
                        <option key={page.href} value={page.href}>
                          {page.label}
                        </option>
                      ))}
                      <option value={CUSTOM_HREF}>Otro sitio web…</option>
                    </select>
                    <button
                      type="button"
                      title={item.external ? "Se abre en otra pestaña" : "Se abre en esta misma página"}
                      onClick={() => updateAt(index, { external: !item.external })}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold"
                      style={{
                        borderColor: item.external ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
                        backgroundColor: item.external ? "rgba(68,137,198,0.10)" : "white",
                        color: item.external ? "var(--regu-blue)" : "var(--regu-gray-600)",
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {item.external ? "Otra pestaña" : "Misma página"}
                    </button>
                  </div>
                  {selectedPage === CUSTOM_HREF && (
                    <input
                      type="text"
                      value={item.href}
                      onChange={(event) => {
                        const href = event.target.value;
                        updateAt(index, {
                          href,
                          external: href.startsWith("http") ? true : item.external,
                        });
                      }}
                      placeholder="https://…"
                      className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--regu-blue)]"
                      style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                    />
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => setItems((current) => moveItem(current, index, -1))}
                    className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={index === items.length - 1}
                    onClick={() => setItems((current) => moveItem(current, index, 1))}
                    className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Quitar acceso"
                    onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                    className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() =>
          setItems((current) => [
            ...current,
            { label: "Nuevo acceso", href: "/", icon: "Users", external: false },
          ])
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-semibold"
        style={{ borderColor: "rgba(68,137,198,0.45)", color: "var(--regu-blue)" }}
      >
        <Plus className="h-4 w-4" />
        Añadir otro acceso
      </button>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--regu-blue)" }}
      >
        <Save className="h-4 w-4" />
        {saving ? "Guardando…" : "Guardar accesos"}
      </button>
    </div>
  );
}
