import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, X, ExternalLink } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAdminData, type AdminNewsItem } from "@/contexts/AdminDataContext";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson, type SiteEditTarget } from "@/lib/siteEdit";
import { slugify } from "@/lib/slugify";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import AdminSlideshowField from "@/components/admin/AdminSlideshowField";
import { SiteEditUndoRedo } from "@/components/site-edit/SiteEditUndoRedo";
import {
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  mergeBoletinesGtaiWithDefaults,
  parseBoletinesGtaiFromSettingValue,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";
import {
  REVISTA_DIGITAL_SETTINGS_KEY,
  defaultRevistaEditions,
  parseRevistaDigitalFromSettingValue,
  type RevistaEdition,
} from "@/data/revistaDigital";
import { heroInstitucional, quickLinks, featuredCarouselItems } from "@/data/home";
import type { HomeHeroSetting, QuickLinkSettingItem, FeaturedCarouselItemSetting } from "@/types/siteSettings";
import { noticiasData } from "@/pages/noticiasData";
import {
  BarChart3,
  BookOpen,
  Files,
  Globe,
  ImageIcon,
  Users,
  type LucideIcon,
} from "lucide-react";

const fieldClass =
  "w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-snug outline-none transition-colors focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

const SITE_PAGES: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/miembros", label: "Miembros" },
  { href: "/micrositio-buenas-practicas", label: "Buenas prácticas" },
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

const ICON_OPTIONS: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "Users", label: "Personas", icon: Users },
  { value: "Globe", label: "Mundo", icon: Globe },
  { value: "BarChart3", label: "Gráficos", icon: BarChart3 },
  { value: "Files", label: "Documentos", icon: Files },
  { value: "ImageIcon", label: "Fotos", icon: ImageIcon },
  { value: "BookOpen", label: "Libro", icon: BookOpen },
];

function drawerTitle(target: SiteEditTarget): string {
  switch (target.kind) {
    case "boletin":
      return target.slug ? "Este boletín" : "Nuevo boletín";
    case "hero":
      return "Texto de la portada";
    case "quick-link":
      return "Este acceso";
    case "cumbre":
      return "Esta cumbre";
    case "noticia":
      return "Esta noticia";
    case "revista":
      return target.id ? "Esta edición" : "Nueva edición";
    case "panel":
      return target.label;
  }
}

export function SiteEditDrawer() {
  const { enabled, target, close, exit } = useSiteEdit();
  if (!enabled || !target) return null;

  return (
    <aside
      className="fixed bottom-0 right-0 z-[90] flex w-full flex-col border-l bg-white sm:w-[26.5rem] sm:rounded-tl-2xl"
      style={{
        top: "var(--site-edit-bar-h, 3.25rem)",
        borderColor: "rgba(22,61,89,0.10)",
        boxShadow: "-18px 0 40px rgba(22, 61, 89, 0.10)",
      }}
      role="complementary"
      aria-labelledby="site-edit-drawer-title"
    >
      <div
        className="flex items-start justify-between gap-3 border-b bg-white px-6 py-5"
        style={{ borderColor: "rgba(22,61,89,0.08)" }}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#0f766e" }}>
            Edición en el sitio
          </p>
          <h2
            id="site-edit-drawer-title"
            className="mt-1.5 text-[1.05rem] font-bold leading-snug"
            style={{ color: "var(--regu-navy)" }}
          >
            {drawerTitle(target)}
          </h2>
        </div>
        <div className="flex shrink-0 items-start gap-1.5">
          <SiteEditUndoRedo variant="drawer" />
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {target.kind === "boletin" && <BoletinForm slug={target.slug} />}
        {target.kind === "hero" && <HeroForm />}
        {target.kind === "quick-link" && <QuickLinkForm index={target.index} />}
        {target.kind === "cumbre" && <CumbreForm id={target.id} />}
        {target.kind === "noticia" && <NoticiaForm slug={target.slug} />}
        {target.kind === "revista" && <RevistaForm id={target.id} />}
        {target.kind === "panel" && <PanelFallback path={target.path} label={target.label} onLeave={exit} />}
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function PublishBar({
  saving,
  error,
  published,
  onPublish,
  extra,
}: {
  saving: boolean;
  error: string | null;
  published?: boolean;
  onPublish: () => void;
  extra?: ReactNode;
}) {
  return (
    <div
      className="sticky bottom-0 -mx-6 mt-8 border-t bg-white px-6 py-4"
      style={{ borderColor: "rgba(22,61,89,0.08)" }}
    >
      {error && (
        <p className="mb-2 text-sm" style={{ color: "#991b1b" }}>
          {error}
        </p>
      )}
      {published && !error && (
        <p className="mb-2 text-sm font-medium" style={{ color: "#0f766e" }}>
          Ya está en el sitio público.
        </p>
      )}
      <p className="mb-3 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Se ve al instante en esta página. Hasta que publiques, el sitio real no cambia.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Send className="h-4 w-4" />
          {saving ? "Publicando…" : published ? "Publicar otra vez" : "Publicar"}
        </button>
        {extra}
      </div>
    </div>
  );
}

function useRecordSettingsChange() {
  const { recordPersistedChange } = useSiteEdit();
  return useCallback(
    (key: string, before: unknown, after: unknown) => {
      const prev = cloneJson(before);
      const next = cloneJson(after);
      recordPersistedChange({
        label: key,
        undo: async () => {
          const res = await api.settings.set(key, prev);
          if (!res.ok) throw new Error(res.error ?? "No se pudo deshacer.");
          notifyCmsSaved(key);
        },
        redo: async () => {
          const res = await api.settings.set(key, next);
          if (!res.ok) throw new Error(res.error ?? "No se pudo rehacer.");
          notifyCmsSaved(key);
        },
      });
    },
    [recordPersistedChange]
  );
}

function emptyBoletin(): BoletinGtaiSerialized {
  const y = new Date().getFullYear();
  return {
    title: "",
    slug: "",
    groupName: "Grupo de Asuntos de Internet (GTAI)",
    issueNumber: 1,
    year: y,
    publicationDate: new Date().toISOString().slice(0, 10),
    shortSummary: "",
    description: "",
    coverImage: "",
    pdfFile: "",
    contentType: "Boletín",
    isPublished: true,
    isFeatured: false,
  };
}

function BoletinForm({ slug }: { slug?: string }) {
  const navigate = useNavigate();
  const recordSettings = useRecordSettingsChange();
  const { clearPreview, preview } = useSiteEdit();
  const previewRef = useRef(preview);
  previewRef.current = preview;
  const { value: row, setValue: setRow, reset } = useDraftHistory(emptyBoletin());
  const [allEntries, setAllEntries] = useState<BoletinGtaiSerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
      if (cancelled) return;
      let list = defaultBoletinesGtai.map((b) => ({ ...b }));
      if (res.ok && res.data?.value != null) {
        const parsed = parseBoletinesGtaiFromSettingValue(res.data.value);
        if (parsed) list = mergeBoletinesGtaiWithDefaults(parsed).map((b) => ({ ...b }));
      }
      const found = slug ? list.find((b) => b.slug === slug) : undefined;
      const fromPreview = previewRef.current.boletines;
      const liveList = fromPreview && fromPreview.length > 0 ? fromPreview.map((b) => ({ ...b })) : list;
      const liveFound = slug ? liveList.find((b) => b.slug === slug) : undefined;
      setAllEntries(liveList);
      reset(liveFound ? { ...liveFound } : found ? { ...found } : emptyBoletin());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, reset]);

  const previewEntries = useMemo(() => {
    const nextSlug = (row.slug.trim() || slugify(row.title) || "preview").toLowerCase();
    const normalized: BoletinGtaiSerialized = { ...row, slug: nextSlug };
    const list = allEntries.map((b) => ({ ...b }));
    const idx = slug ? list.findIndex((b) => b.slug === slug) : -1;
    if (idx >= 0) list[idx] = normalized;
    else if (row.title.trim()) list.unshift(normalized);
    if (normalized.isFeatured) {
      return list.map((b) => ({ ...b, isFeatured: b.slug === nextSlug }));
    }
    return list;
  }, [allEntries, row, slug]);

  const captureBaseline = usePreviewSync("boletines", previewEntries, !loading);

  const save = async () => {
    if (!row.title.trim() || !row.pdfFile.trim()) {
      setError("Hace falta título y PDF.");
      return;
    }
    setSaving(true);
    setError(null);
    const resGet = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
    let list = defaultBoletinesGtai.map((b) => ({ ...b }));
    if (resGet.ok && resGet.data?.value != null) {
      const parsed = parseBoletinesGtaiFromSettingValue(resGet.data.value);
      if (parsed) list = mergeBoletinesGtaiWithDefaults(parsed).map((b) => ({ ...b }));
    }
    const nextSlug = (row.slug.trim() || slugify(row.title) || `boletin-${Date.now()}`).toLowerCase();
    const normalized: BoletinGtaiSerialized = {
      ...row,
      slug: nextSlug,
      title: row.title.trim(),
      pdfFile: row.pdfFile.trim(),
      groupName: row.groupName.trim() || "Grupo de Asuntos de Internet (GTAI)",
      shortSummary: row.shortSummary.trim(),
      description: row.description.trim(),
      coverImage: row.coverImage?.trim() || undefined,
      contentType: row.contentType.trim() || "Boletín",
    };
    const before = list.map((b) => ({ ...b }));
    const idx = slug ? list.findIndex((b) => b.slug === slug) : -1;
    if (idx >= 0) list[idx] = normalized;
    else list.push(normalized);
    if (normalized.isFeatured) {
      list = list.map((b) => ({ ...b, isFeatured: b.slug === nextSlug }));
    }
    const res = await api.settings.set(BOLETINES_GTAI_SETTINGS_KEY, { entries: list });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordSettings(BOLETINES_GTAI_SETTINGS_KEY, { entries: before }, { entries: list });
    notifyCmsSaved(BOLETINES_GTAI_SETTINGS_KEY);
    setAllEntries(list);
    captureBaseline();
    clearPreview("boletines");
    setPublished(true);
    if (!slug) navigate(`/boletines-gtai/${nextSlug}`);
  };

  if (loading) return <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>;

  return (
    <div className="space-y-5">
      <Field label="Título">
        <input className={fieldClass} style={fieldStyle} value={row.title} onChange={(e) => setRow({ ...row, title: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Número">
          <input
            type="number"
            className={fieldClass}
            style={fieldStyle}
            value={row.issueNumber}
            onChange={(e) => setRow({ ...row, issueNumber: Number(e.target.value) || 1 })}
          />
        </Field>
        <Field label="Año">
          <input
            type="number"
            className={fieldClass}
            style={fieldStyle}
            value={row.year}
            onChange={(e) => setRow({ ...row, year: Number(e.target.value) || new Date().getFullYear() })}
          />
        </Field>
      </div>
      <Field label="Fecha">
        <input
          type="date"
          className={fieldClass}
          style={fieldStyle}
          value={row.publicationDate}
          onChange={(e) => setRow({ ...row, publicationDate: e.target.value })}
        />
      </Field>
      <Field label="Resumen corto">
        <textarea
          rows={3}
          className={fieldClass}
          style={fieldStyle}
          value={row.shortSummary}
          onChange={(e) => setRow({ ...row, shortSummary: e.target.value })}
        />
      </Field>
      <Field label="Texto largo">
        <textarea
          rows={5}
          className={fieldClass}
          style={fieldStyle}
          value={row.description}
          onChange={(e) => setRow({ ...row, description: e.target.value })}
        />
      </Field>
      <AdminBlobUploadField
        label="Foto de portada"
        value={row.coverImage ?? ""}
        onChange={(url) => setRow({ ...row, coverImage: url })}
        kind="image"
        folder="attachments"
      />
      <AdminBlobUploadField
        label="PDF"
        value={row.pdfFile}
        onChange={(url) => setRow({ ...row, pdfFile: url })}
        kind="document"
        folder="documents"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRow({ ...row, isPublished: !row.isPublished })}
          className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
          style={{
            borderColor: row.isPublished ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
            backgroundColor: row.isPublished ? "rgba(68,137,198,0.10)" : "white",
            color: row.isPublished ? "var(--regu-blue)" : "var(--regu-gray-600)",
          }}
        >
          {row.isPublished ? "Visible" : "Oculto"}
        </button>
        <button
          type="button"
          onClick={() => setRow({ ...row, isFeatured: !row.isFeatured, isPublished: row.isFeatured ? row.isPublished : true })}
          className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
          style={{
            borderColor: row.isFeatured ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
            backgroundColor: row.isFeatured ? "rgba(68,137,198,0.10)" : "white",
            color: row.isFeatured ? "var(--regu-blue)" : "var(--regu-gray-600)",
          }}
        >
          {row.isFeatured ? "En portada" : "No sale en portada"}
        </button>
      </div>
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}

function HeroForm() {
  const { homeHero, refetch } = useSiteSettings();
  const recordSettings = useRecordSettingsChange();
  const { clearPreview, preview } = useSiteEdit();
  const initial: HomeHeroSetting = preview.homeHero ?? {
    coverImageUrls: homeHero?.coverImageUrls?.slice() ?? heroInstitucional.coverImageUrls.slice(),
    badge: homeHero?.badge ?? heroInstitucional.badge,
    title: homeHero?.title ?? heroInstitucional.title,
    titleHighlight: homeHero?.titleHighlight ?? heroInstitucional.titleHighlight,
    description: homeHero?.description ?? heroInstitucional.description,
    primaryCta: { ...(homeHero?.primaryCta ?? heroInstitucional.primaryCta) },
    secondaryCta: { ...(homeHero?.secondaryCta ?? heroInstitucional.secondaryCta) },
  };
  const { value: hero, setValue: setHero } = useDraftHistory(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const captureBaseline = usePreviewSync("homeHero", hero);

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await api.settings.set("home_hero", hero);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordSettings("home_hero", initial, hero);
    notifyCmsSaved("home_hero");
    await refetch();
    captureBaseline();
    clearPreview("homeHero");
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      <Field label="Etiqueta pequeña">
        <input className={fieldClass} style={fieldStyle} value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
      </Field>
      <Field label="Título">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={hero.title}
          onChange={(e) => setHero({ ...hero, title: e.target.value })}
        />
      </Field>
      <Field label="Palabra destacada">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={hero.titleHighlight}
          onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })}
        />
      </Field>
      <Field label="Texto">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={hero.description}
          onChange={(e) => setHero({ ...hero, description: e.target.value })}
        />
      </Field>
      <Field label="Botón principal">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={hero.primaryCta.label}
          onChange={(e) => setHero({ ...hero, primaryCta: { ...hero.primaryCta, label: e.target.value } })}
        />
      </Field>
      <Field label="Botón secundario">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={hero.secondaryCta.label}
          onChange={(e) => setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, label: e.target.value } })}
        />
      </Field>
      <AdminSlideshowField
        compact
        urls={hero.coverImageUrls}
        onChange={(coverImageUrls) => setHero({ ...hero, coverImageUrls })}
      />
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}

function QuickLinkForm({ index }: { index: number }) {
  const { quickLinks: saved, refetch } = useSiteSettings();
  const recordSettings = useRecordSettingsChange();
  const { clearPreview, preview } = useSiteEdit();
  const defaults: QuickLinkSettingItem[] = quickLinks.map((item, i) => ({
    label: item.label,
    href: item.href,
    external: (item as { external?: boolean }).external,
    icon: (["Users", "Globe", "BarChart3", "Files"] as const)[i] ?? "Users",
  }));
  const { value: items, setValue: setItems } = useDraftHistory<QuickLinkSettingItem[]>(
    preview.quickLinks
      ? preview.quickLinks.map((i) => ({ ...i }))
      : saved && saved.length > 0
        ? saved.map((i) => ({ ...i }))
        : defaults
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const captureBaseline = usePreviewSync("quickLinks", items);
  const item = items[index];

  if (!item) {
    return <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Ese acceso ya no está.</p>;
  }

  const known = SITE_PAGES.some((p) => p.href === item.href);
  const patch = (next: Partial<QuickLinkSettingItem>) => {
    setItems((current) => current.map((row, i) => (i === index ? { ...row, ...next } : row)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await api.settings.set("quick_links", items);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordSettings("quick_links", saved && saved.length > 0 ? saved : defaults, items);
    notifyCmsSaved("quick_links");
    await refetch();
    captureBaseline();
    clearPreview("quickLinks");
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      <Field label="Nombre">
        <input className={fieldClass} style={fieldStyle} value={item.label} onChange={(e) => patch({ label: e.target.value })} />
      </Field>
      <Field label="Página">
        <select
          className={fieldClass}
          style={fieldStyle}
          value={known ? item.href : "__custom__"}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__custom__") {
              patch({ href: item.href.startsWith("http") ? item.href : "", external: true });
              return;
            }
            const page = SITE_PAGES.find((p) => p.href === v);
            patch({ href: v, external: Boolean(page?.external) });
          }}
        >
          {SITE_PAGES.map((p) => (
            <option key={p.href} value={p.href}>
              {p.label}
            </option>
          ))}
          <option value="__custom__">Otra dirección…</option>
        </select>
      </Field>
      {!known && (
        <Field label="Dirección">
          <input className={fieldClass} style={fieldStyle} value={item.href} onChange={(e) => patch({ href: e.target.value, external: e.target.value.startsWith("http") })} />
        </Field>
      )}
      <div>
        <p className="mb-1.5 text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
          Icono
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((opt) => {
            const selected = item.icon === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                onClick={() => patch({ icon: opt.value })}
                className="flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{
                  borderColor: selected ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
                  backgroundColor: selected ? "rgba(68,137,198,0.16)" : "white",
                  color: selected ? "var(--regu-blue)" : "var(--regu-gray-600)",
                }}
              >
                <opt.icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}

function CumbreForm({ id }: { id: string }) {
  const { featuredCarousel, refetch } = useSiteSettings();
  const recordSettings = useRecordSettingsChange();
  const { clearPreview, preview } = useSiteEdit();
  const defaults: FeaturedCarouselItemSetting[] = featuredCarouselItems.map((item) => ({
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
  const { value: items, setValue: setItems } = useDraftHistory<FeaturedCarouselItemSetting[]>(
    preview.featuredCarousel
      ? preview.featuredCarousel.map((i) => ({ ...i }))
      : featuredCarousel && featuredCarousel.length > 0
        ? featuredCarousel.map((i) => ({ ...i }))
        : defaults
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const captureBaseline = usePreviewSync("featuredCarousel", items);
  const idx = items.findIndex((i) => i.id === id);
  const item = idx >= 0 ? items[idx] : null;

  if (!item) {
    return <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Esa cumbre ya no está.</p>;
  }

  const patch = (next: Partial<FeaturedCarouselItemSetting>) => {
    setItems((current) => current.map((row, i) => (i === idx ? { ...row, ...next } : row)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await api.settings.set("featured_carousel", items);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordSettings(
      "featured_carousel",
      featuredCarousel && featuredCarousel.length > 0 ? featuredCarousel : defaults,
      items
    );
    notifyCmsSaved("featured_carousel");
    await refetch();
    captureBaseline();
    clearPreview("featuredCarousel");
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      <Field label="Título">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={item.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </Field>
      <Field label="Fecha">
        <input type="date" className={fieldClass} style={fieldStyle} value={item.date} onChange={(e) => patch({ date: e.target.value })} />
      </Field>
      <Field label="Lugar">
        <input className={fieldClass} style={fieldStyle} value={item.location ?? ""} onChange={(e) => patch({ location: e.target.value })} />
      </Field>
      <Field label="Texto del botón">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={item.ctaPrimaryLabel ?? ""}
          onChange={(e) => patch({ ctaPrimaryLabel: e.target.value })}
        />
      </Field>
      <Field label="Enlace">
        <input className={fieldClass} style={fieldStyle} value={item.href} onChange={(e) => patch({ href: e.target.value })} />
      </Field>
      <AdminBlobUploadField
        label="Foto"
        value={item.imageUrl}
        onChange={(url) => patch({ imageUrl: url })}
        kind="image"
        folder="attachments"
      />
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}

function RevistaForm({ id }: { id?: string }) {
  const { revistaDigital, refetch } = useSiteSettings();
  const recordSettings = useRecordSettingsChange();
  const { clearPreview, preview } = useSiteEdit();
  const { value: row, setValue: setRow } = useDraftHistory<RevistaEdition>(() => {
    const list = preview.revista ?? revistaDigital ?? defaultRevistaEditions;
    const found = id ? list.find((e) => e.id === id) : undefined;
    return found
      ? { ...found }
      : {
          id: `revista-${Date.now()}`,
          title: "",
          url: "",
          year: String(new Date().getFullYear()),
          isPublished: true,
          isFeatured: false,
        };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = (revistaDigital ?? defaultRevistaEditions).map((e) => ({ ...e }));
    const idx = list.findIndex((e) => e.id === row.id);
    if (idx >= 0) list[idx] = row;
    else if (row.title.trim()) list.unshift(row);
    if (row.isFeatured) {
      return list.map((e) => ({ ...e, isFeatured: e.id === row.id }));
    }
    return list;
  }, [revistaDigital, row]);

  const captureBaseline = usePreviewSync("revista", previewList);

  const save = async () => {
    if (!row.title.trim() || !row.url.trim()) {
      setError("Hace falta título y PDF.");
      return;
    }
    setSaving(true);
    setError(null);
    const resGet = await api.settings.get(REVISTA_DIGITAL_SETTINGS_KEY);
    let list = (revistaDigital ?? defaultRevistaEditions).map((e) => ({ ...e }));
    if (resGet.ok && resGet.data?.value != null) {
      const parsed = parseRevistaDigitalFromSettingValue(resGet.data.value);
      if (parsed) list = parsed.map((e) => ({ ...e }));
    }
    const prepared: RevistaEdition = {
      ...row,
      title: row.title.trim(),
      url: row.url.trim(),
      year: row.year.trim() || String(new Date().getFullYear()),
      quarter: row.quarter?.trim() || undefined,
      description: row.description?.trim() || undefined,
      coverEdition: row.coverEdition?.trim() || undefined,
    };
    const idx = list.findIndex((e) => e.id === prepared.id);
    if (idx >= 0) list[idx] = prepared;
    else list.unshift(prepared);
    if (prepared.isFeatured) {
      list = list.map((e) => ({ ...e, isFeatured: e.id === prepared.id }));
    }
    const res = await api.settings.set(REVISTA_DIGITAL_SETTINGS_KEY, { entries: list });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    const beforeList = (revistaDigital ?? defaultRevistaEditions).map((e) => ({ ...e }));
    recordSettings(REVISTA_DIGITAL_SETTINGS_KEY, { entries: beforeList }, { entries: list });
    notifyCmsSaved(REVISTA_DIGITAL_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("revista");
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      <Field label="Título">
        <input className={fieldClass} style={fieldStyle} value={row.title} onChange={(e) => setRow({ ...row, title: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Año">
          <input className={fieldClass} style={fieldStyle} value={row.year} onChange={(e) => setRow({ ...row, year: e.target.value })} />
        </Field>
        <Field label="Trimestre">
          <select
            className={fieldClass}
            style={fieldStyle}
            value={row.quarter ?? ""}
            onChange={(e) => setRow({ ...row, quarter: e.target.value || undefined })}
          >
            <option value="">Ninguno</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </Field>
      </div>
      <Field label="Nombre corto (portada)">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.coverEdition ?? ""}
          onChange={(e) => setRow({ ...row, coverEdition: e.target.value })}
        />
      </Field>
      <Field label="Texto del aviso">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.description ?? ""}
          onChange={(e) => setRow({ ...row, description: e.target.value })}
        />
      </Field>
      <AdminBlobUploadField
        label="PDF"
        value={row.url}
        onChange={(url) => setRow({ ...row, url })}
        kind="document"
        folder="documents"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRow({ ...row, isPublished: !row.isPublished, isFeatured: row.isPublished ? false : row.isFeatured })}
          className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
          style={{
            borderColor: row.isPublished ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
            backgroundColor: row.isPublished ? "rgba(68,137,198,0.10)" : "white",
            color: row.isPublished ? "var(--regu-blue)" : "var(--regu-gray-600)",
          }}
        >
          {row.isPublished ? "Visible" : "Oculta"}
        </button>
        <button
          type="button"
          onClick={() => setRow({ ...row, isFeatured: !row.isFeatured, isPublished: row.isFeatured ? row.isPublished : true })}
          className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
          style={{
            borderColor: row.isFeatured ? "var(--regu-blue)" : "rgba(22,61,89,0.14)",
            backgroundColor: row.isFeatured ? "rgba(68,137,198,0.10)" : "white",
            color: row.isFeatured ? "var(--regu-blue)" : "var(--regu-gray-600)",
          }}
        >
          {row.isFeatured ? "En portada" : "No sale en portada"}
        </button>
      </div>
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}

function NoticiaForm({ slug }: { slug: string }) {
  const { exit, recordPersistedChange, clearPreview, preview } = useSiteEdit();
  const { adminNews, updateNews, addNews } = useAdminData();
  const existing = adminNews.find((n) => (n.slug || n.id).toLowerCase() === slug.toLowerCase());
  const staticNews = noticiasData.find((n) => n.slug.toLowerCase() === slug.toLowerCase());
  const seedBase = existing ?? (staticNews
    ? ({
        id: "",
        slug: staticNews.slug,
        title: staticNews.title,
        date: staticNews.date,
        dateFormatted: staticNews.dateFormatted,
        category: staticNews.category,
        excerpt: staticNews.excerpt,
        imageUrl: staticNews.imageUrl,
        content: staticNews.content.join("\n\n"),
        author: staticNews.author,
        link: staticNews.link,
        videoUrl: staticNews.videoUrl,
        published: true,
      } satisfies AdminNewsItem)
    : null);
  const seed =
    seedBase && preview.news && preview.news.slug.toLowerCase() === slug.toLowerCase()
      ? {
          ...seedBase,
          title: preview.news.title,
          excerpt: preview.news.excerpt,
          date: preview.news.date,
          dateFormatted: preview.news.dateFormatted ?? seedBase.dateFormatted,
          imageUrl: preview.news.imageUrl ?? seedBase.imageUrl,
        }
      : seedBase;

  const { value: row, setValue: setRow } = useDraftHistory<AdminNewsItem | null>(seed ? { ...seed } : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const newsPreview = row
    ? {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        date: row.date,
        dateFormatted: row.dateFormatted,
        imageUrl: row.imageUrl,
      }
    : undefined;
  const captureBaseline = usePreviewSync("news", newsPreview, Boolean(row));

  if (!row) {
    return (
      <PanelFallback
        path="/admin/noticias"
        label="Noticias"
        hint="Esta nota no está en el listado editable. Ábrela en el panel para publicarla."
      />
    );
  }

  const save = async () => {
    if (!row.title.trim()) {
      setError("Hace falta un título.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        const before = {
          title: existing.title,
          excerpt: existing.excerpt,
          date: existing.date,
          imageUrl: existing.imageUrl,
          published: existing.published,
        };
        const after = {
          title: row.title.trim(),
          excerpt: row.excerpt.trim(),
          date: row.date,
          imageUrl: row.imageUrl,
          published: row.published,
        };
        await updateNews(existing.id, after);
        recordPersistedChange({
          label: "noticia",
          undo: async () => {
            await updateNews(existing.id, before);
            notifyCmsSaved("news");
          },
          redo: async () => {
            await updateNews(existing.id, after);
            notifyCmsSaved("news");
          },
        });
      } else {
        await addNews({
          slug: row.slug,
          title: row.title.trim(),
          date: row.date,
          dateFormatted: row.dateFormatted,
          category: row.category,
          excerpt: row.excerpt.trim(),
          imageUrl: row.imageUrl,
          content: row.content,
          author: row.author,
          link: row.link,
          videoUrl: row.videoUrl,
          published: row.published,
        });
      }
      notifyCmsSaved("news");
      captureBaseline();
      clearPreview("news");
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Título">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => setRow({ ...row, title: e.target.value })}
        />
      </Field>
      <Field label="Fecha">
        <input type="date" className={fieldClass} style={fieldStyle} value={row.date} onChange={(e) => setRow({ ...row, date: e.target.value })} />
      </Field>
      <Field label="Resumen">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.excerpt}
          onChange={(e) => setRow({ ...row, excerpt: e.target.value })}
        />
      </Field>
      <AdminBlobUploadField
        label="Foto"
        value={row.imageUrl}
        onChange={(url) => setRow({ ...row, imageUrl: url })}
        kind="image"
        folder="news"
      />
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        El texto largo de la nota se edita en el panel de Noticias.
      </p>
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <Link
            to="/admin/noticias"
            onClick={(event) => {
              if (!exit()) event.preventDefault();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold"
            style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
          >
            Abrir panel
          </Link>
        }
      />
    </div>
  );
}

function PanelFallback({
  path,
  label,
  hint,
  onLeave,
}: {
  path: string;
  label: string;
  hint?: string;
  onLeave?: () => boolean | void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
        {hint ?? `Esto se edita en el formulario de ${label}. El diseño de la página se queda igual.`}
      </p>
      <Link
        to={path}
        onClick={(event) => {
          if (onLeave && onLeave() === false) event.preventDefault();
        }}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--regu-blue)" }}
      >
        <ExternalLink className="h-4 w-4" />
        Ir a {label}
      </Link>
    </div>
  );
}
