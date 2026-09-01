import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, X, ExternalLink, Save } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAdminData, type AdminNewsItem } from "@/contexts/AdminDataContext";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson, type SiteEditTarget } from "@/lib/siteEdit";
import { slugify } from "@/lib/slugify";
import { isPdfDocument } from "@/lib/documentPreview";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import { PdfCoverPicker } from "@/components/admin/PdfCoverPicker";
import AdminSlideshowField from "@/components/admin/AdminSlideshowField";
import { NotifySubscribersButton } from "@/components/admin/NotifySubscribersOption";
import type { SubscriberNotifyPayload } from "@/lib/notifySubscribers";
import { SiteEditUndoRedo } from "@/components/site-edit/SiteEditUndoRedo";
import {
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  mergeBoletinesGtaiWithDefaults,
  parseBoletinesGtaiFromSettingValue,
  sortBoletinesByDateDesc,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";
import {
  REVISTA_DIGITAL_SETTINGS_KEY,
  mergeRevistaDigitalWithDefaults,
  sortRevistaEditions,
  type RevistaEdition,
} from "@/data/revistaDigital";
import { heroInstitucional, quickLinks, featuredCarouselItems } from "@/data/home";
import { toDateInputValue } from "@/lib/carouselDate";
import type { HomeHeroSetting, QuickLinkSettingItem, FeaturedCarouselItemSetting } from "@/types/siteSettings";
import { HomeAvisoForm } from "@/components/site-edit/HomeAvisoForm";
import { DirectorioForm, EnteForm } from "@/components/site-edit/MiembrosEditForms";
import { GrupoForm } from "@/components/site-edit/GrupoEditForm";
import { AutoridadForm, ComiteFuncionesForm, ComiteLogoForm } from "@/components/site-edit/OrganizacionEditForms";
import { AlbumForm, ConvenioForm, EntrevistaForm, EstudioForm } from "@/components/site-edit/RecursosEditForms";
import { EventoForm } from "@/components/site-edit/EventoEditForm";
import { CustomPageTemplateForm } from "@/components/site-edit/CustomPageTemplateForm";
import { noticiasData } from "@/pages/noticiasData";
import {
  GESTION_TAB_LABELS,
  gestionDocuments,
  type GestionCategory,
  type GestionDocument,
} from "@/data/gestion";
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
      return target.slug ? "Esta noticia" : "Nueva noticia";
    case "revista":
      return target.id ? "Esta edición" : "Nueva edición";
    case "documento":
      return target.id ? "Este documento" : "Nuevo documento";
    case "home-aviso":
      return target.id ? "Este aviso" : "Nuevo aviso en portada";
    case "ente":
      return target.id ? "Este ente" : "Nuevo ente";
    case "directorio":
      return target.id ? "Este contacto" : "Nuevo contacto";
    case "grupo":
      return target.id ? "Este grupo" : "Nuevo grupo de trabajo";
    case "autoridad":
      return target.id ? "Esta autoridad" : "Nueva autoridad";
    case "comite-logo":
      if (target.slot === "presidente") return "Presidencia";
      if (target.slot === "vice") return target.id ? "Esta vicepresidencia" : "Nueva vicepresidencia";
      return target.id ? "Este miembro del comité" : "Nuevo miembro del comité";
    case "comite-funciones":
      return "Funciones del comité";
    case "convenio":
      return target.slug ? "Este convenio" : "Nuevo convenio";
    case "album":
      return target.slug ? "Este álbum" : "Nuevo álbum";
    case "estudio":
      return target.id ? "Este estudio" : "Nuevo estudio";
    case "entrevista":
      return target.slug ? "Esta entrevista" : "Nueva entrevista";
    case "evento":
      return target.id ? "Este evento" : "Nuevo evento";
    case "custom-page":
      return "Contenido de la categoría";
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
        {target.kind === "noticia" && (
          <NoticiaForm key={target.slug ?? "new-noticia"} slug={target.slug} />
        )}
        {target.kind === "revista" && <RevistaForm id={target.id} />}
        {target.kind === "documento" && (
          <DocumentoForm
            key={target.id ?? `new-${target.category ?? "documentos"}`}
            id={target.id}
            category={target.category}
          />
        )}
        {target.kind === "home-aviso" && (
          <HomeAvisoForm key={target.id ?? "new-aviso"} id={target.id} />
        )}
        {target.kind === "ente" && (
          <EnteForm key={target.id ?? "new-ente"} id={target.id} />
        )}
        {target.kind === "directorio" && (
          <DirectorioForm key={target.id ?? "new-directorio"} id={target.id} />
        )}
        {target.kind === "grupo" && (
          <GrupoForm key={target.id ?? "new-grupo"} id={target.id} />
        )}
        {target.kind === "autoridad" && (
          <AutoridadForm key={target.id ?? "new-autoridad"} id={target.id} />
        )}
        {target.kind === "comite-logo" && (
          <ComiteLogoForm
            key={`${target.slot}-${target.id ?? "new"}`}
            slot={target.slot}
            id={target.id}
          />
        )}
        {target.kind === "comite-funciones" && <ComiteFuncionesForm />}
        {target.kind === "convenio" && (
          <ConvenioForm key={target.slug ?? "new-convenio"} slug={target.slug} />
        )}
        {target.kind === "album" && (
          <AlbumForm key={target.slug ?? "new-album"} slug={target.slug} />
        )}
        {target.kind === "estudio" && (
          <EstudioForm key={target.id ?? "new-estudio"} id={target.id} />
        )}
        {target.kind === "entrevista" && (
          <EntrevistaForm key={target.slug ?? "new-entrevista"} slug={target.slug} />
        )}
        {target.kind === "evento" && (
          <EventoForm key={target.id ?? "new-evento"} id={target.id} />
        )}
        {target.kind === "custom-page" && (
          <CustomPageTemplateForm key={target.slug} slug={target.slug} />
        )}
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
  disabled,
  notifyPayload,
  notifyWarnUnpublished,
  publishedNote,
}: {
  saving: boolean;
  error: string | null;
  published?: boolean;
  onPublish: () => void;
  extra?: ReactNode;
  disabled?: boolean;
  notifyPayload?: SubscriberNotifyPayload;
  notifyWarnUnpublished?: boolean;
  publishedNote?: string;
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
          {publishedNote || "Ya está en el sitio público."}
        </p>
      )}
      <p className="mb-3 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Se ve al instante en esta página. Hasta que publiques, el sitio real no cambia.
      </p>
      {notifyPayload ? (
        <div className="mb-3">
          <NotifySubscribersButton
            payload={notifyPayload}
            disabled={saving || disabled}
            warnUnpublished={notifyWarnUnpublished}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPublish}
          disabled={saving || disabled}
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
  const [publishedNote, setPublishedNote] = useState<string | undefined>();

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
    const idx = list.findIndex(
      (b) => b.slug === nextSlug || (row.slug && b.slug === row.slug) || (slug && b.slug === slug)
    );
    if (idx >= 0) list[idx] = normalized;
    else if (row.title.trim()) list.unshift(normalized);
    if (normalized.isFeatured) {
      return list.map((b) => ({ ...b, isFeatured: b.slug === nextSlug }));
    }
    return list;
  }, [allEntries, row, slug]);

  const boletinChoices = useMemo(
    () => sortBoletinesByDateDesc(allEntries.filter((b) => b.isPublished || b.slug === row.slug)),
    [allEntries, row.slug]
  );

  const selectFeaturedBoletin = (nextSlug: string) => {
    if (!nextSlug) return;
    if (nextSlug === row.slug) {
      setRow({ ...row, isFeatured: true, isPublished: true });
      return;
    }
    const patched = allEntries.map((b) => (b.slug === row.slug ? { ...row } : { ...b }));
    const withFeatured = patched.map((b) => ({
      ...b,
      isFeatured: b.slug === nextSlug,
      isPublished: b.slug === nextSlug ? true : b.isPublished,
    }));
    const next = withFeatured.find((b) => b.slug === nextSlug);
    if (!next) return;
    setAllEntries(withFeatured);
    reset({ ...next, isFeatured: true, isPublished: true });
  };

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
    list = allEntries.map((b) => ({ ...b }));
    const idx = list.findIndex((b) => b.slug === row.slug || b.slug === nextSlug);
    if (idx >= 0) list[idx] = normalized;
    else list.push(normalized);
    if (normalized.isFeatured) {
      list = list.map((b) => ({ ...b, isFeatured: b.slug === nextSlug }));
    }
    const res = await api.settings.set(BOLETINES_GTAI_SETTINGS_KEY, { entries: list });
    if (!res.ok) {
      setSaving(false);
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordSettings(BOLETINES_GTAI_SETTINGS_KEY, { entries: before }, { entries: list });
    notifyCmsSaved(BOLETINES_GTAI_SETTINGS_KEY);
    setAllEntries(list);
    captureBaseline();
    clearPreview("boletines");
    setPublishedNote("Ya está en el sitio público.");
    setSaving(false);
    setPublished(true);
    if (!slug) navigate(`/boletines-gtai/${nextSlug}`);
  };

  if (loading) return <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>;

  return (
    <div className="space-y-5">
      {boletinChoices.length > 1 && (
        <div>
          <Field label="Cuál sale en esta tarjeta">
            <select
              className={fieldClass}
              style={fieldStyle}
              value={row.slug}
              onChange={(e) => selectFeaturedBoletin(e.target.value)}
            >
              {boletinChoices.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.title.trim() || `Boletín ${b.issueNumber}`} · {b.year}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
            Elige otro si quieres que aquí salga, por ejemplo, el 3 en vez del 1. Se ve al instante.
          </p>
        </div>
      )}
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
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        publishedNote={publishedNote}
        notifyPayload={{
          type: "publicación",
          title: row.title,
          excerpt: row.shortSummary || row.description,
          url: `/boletines-gtai/${row.slug.trim() || slugify(row.title)}`,
          date: row.publicationDate,
        }}
        notifyWarnUnpublished={!row.isPublished}
        onPublish={() => void save()}
      />
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
    imageFit: item.imageFit,
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
        <input
          type="date"
          className={fieldClass}
          style={fieldStyle}
          value={toDateInputValue(item.date)}
          onChange={(e) => patch({ date: e.target.value })}
        />
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
  const sourceList = preview.revista ?? mergeRevistaDigitalWithDefaults(revistaDigital);
  const { value: row, setValue: setRow, reset } = useDraftHistory<RevistaEdition>(() => {
    const found = id ? sourceList.find((e) => e.id === id) : undefined;
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
  const [allEntries, setAllEntries] = useState<RevistaEdition[]>(() =>
    sourceList.map((e) => ({ ...e }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishedNote, setPublishedNote] = useState<string | undefined>();

  const previewList = useMemo(() => {
    const list = allEntries.map((e) => ({ ...e }));
    const idx = list.findIndex((e) => e.id === row.id);
    if (idx >= 0) list[idx] = row;
    else if (row.title.trim()) list.unshift(row);
    if (row.isFeatured) {
      return list.map((e) => ({ ...e, isFeatured: e.id === row.id }));
    }
    return list;
  }, [allEntries, row]);

  const revistaChoices = useMemo(
    () => sortRevistaEditions(allEntries.filter((e) => e.isPublished || e.id === row.id)),
    [allEntries, row.id]
  );

  const selectFeaturedRevista = (nextId: string) => {
    if (!nextId) return;
    if (nextId === row.id) {
      setRow({ ...row, isFeatured: true, isPublished: true });
      return;
    }
    const patched = allEntries.map((e) => (e.id === row.id ? { ...row } : { ...e }));
    const withFeatured = patched.map((e) => ({
      ...e,
      isFeatured: e.id === nextId,
      isPublished: e.id === nextId ? true : e.isPublished,
    }));
    const next = withFeatured.find((e) => e.id === nextId);
    if (!next) return;
    setAllEntries(withFeatured);
    reset({ ...next, isFeatured: true, isPublished: true });
  };

  const captureBaseline = usePreviewSync("revista", previewList);

  const save = async () => {
    if (!row.title.trim() || !row.url.trim()) {
      setError("Hace falta título y PDF.");
      return;
    }
    setSaving(true);
    setError(null);
    const prepared: RevistaEdition = {
      ...row,
      title: row.title.trim(),
      url: row.url.trim(),
      year: row.year.trim() || String(new Date().getFullYear()),
      quarter: row.quarter?.trim() || undefined,
      description: row.description?.trim() || undefined,
      coverEdition: row.coverEdition?.trim() || undefined,
      coverImage: row.coverImage?.trim() || undefined,
    };
    const beforeList = mergeRevistaDigitalWithDefaults(revistaDigital).map((e) => ({ ...e }));
    let list = allEntries.map((e) => ({ ...e }));
    const idx = list.findIndex((e) => e.id === prepared.id);
    if (idx >= 0) list[idx] = prepared;
    else list.unshift(prepared);
    if (prepared.isFeatured) {
      list = list.map((e) => ({ ...e, isFeatured: e.id === prepared.id }));
    }
    const res = await api.settings.set(REVISTA_DIGITAL_SETTINGS_KEY, { entries: list });
    if (!res.ok) {
      setSaving(false);
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordSettings(REVISTA_DIGITAL_SETTINGS_KEY, { entries: beforeList }, { entries: list });
    notifyCmsSaved(REVISTA_DIGITAL_SETTINGS_KEY);
    setAllEntries(list);
    await refetch();
    captureBaseline();
    clearPreview("revista");
    setPublishedNote("Ya está en el sitio público.");
    setSaving(false);
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      {revistaChoices.length > 1 && (
        <div>
          <Field label="Cuál sale en esta tarjeta">
            <select
              className={fieldClass}
              style={fieldStyle}
              value={row.id}
              onChange={(e) => selectFeaturedRevista(e.target.value)}
            >
              {revistaChoices.map((edition) => (
                <option key={edition.id} value={edition.id}>
                  {edition.title.trim() || edition.coverEdition || edition.year}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
            Elige otra edición si quieres que aquí salga, por ejemplo, la primera en vez de la segunda. Se ve al instante.
          </p>
        </div>
      )}
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
        onChange={(url) => setRow({ ...row, url, ...(url.trim() ? {} : { coverImage: undefined }) })}
        kind="document"
        folder="documents"
      />
      <PdfCoverPicker
        pdfUrl={row.url}
        coverUrl={row.coverImage}
        onCoverChange={(coverImage) => setRow({ ...row, coverImage: coverImage || undefined })}
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
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        publishedNote={publishedNote}
        notifyPayload={{
          type: "publicación",
          title: row.title,
          excerpt: row.description,
          url: row.url.startsWith("http") || row.url.startsWith("/") ? row.url : "/gestion",
          date: row.year,
        }}
        notifyWarnUnpublished={!row.isPublished}
        onPublish={() => void save()}
      />
    </div>
  );
}

const DOC_CATEGORY_OPTIONS: Array<{
  value: Exclude<GestionCategory, "revista" | "banco">;
  label: string;
}> = [
  { value: "planes-actas", label: GESTION_TAB_LABELS["planes-actas"] },
  { value: "comite-ejecutivo", label: GESTION_TAB_LABELS["comite-ejecutivo"] },
  { value: "documentos", label: GESTION_TAB_LABELS.documentos },
  { value: "otros", label: GESTION_TAB_LABELS.otros },
];

const DOC_YEAR_OPTIONS = Array.from(
  new Set(["2024", "2025", "2026", "2027", String(new Date().getFullYear())])
).sort();

function uploadableCategory(
  category?: string
): Exclude<GestionCategory, "revista" | "banco"> {
  if (
    category === "planes-actas" ||
    category === "comite-ejecutivo" ||
    category === "documentos" ||
    category === "otros"
  ) {
    return category;
  }
  return "documentos";
}

function fileNameFromUrl(url: string): string | undefined {
  const name = url.split("/").pop()?.split("?")[0];
  return name ? decodeURIComponent(name) : undefined;
}

function DocumentoForm({
  id,
  category,
}: {
  id?: string;
  category?: Exclude<GestionCategory, "revista" | "banco">;
}) {
  const { adminDocuments, addDocument, updateDocument, deleteDocument } = useAdminData();
  const { recordPersistedChange, clearPreview, preview } = useSiteEdit();
  const found =
    (id && adminDocuments.find((d) => d.id === id)) ||
    (id && gestionDocuments.find((d) => d.id === id)) ||
    (id && preview.document?.id === id ? preview.document : undefined);

  const { value: row, setValue: setRow } = useDraftHistory<GestionDocument>(() => {
    if (found) {
      return {
        ...found,
        category: uploadableCategory(found.category),
        year: found.year ?? String(new Date().getFullYear()),
        quarter: found.quarter ?? "",
      };
    }
    return {
      id: `preview-doc-${Date.now()}`,
      title: "",
      url: "",
      category: category ?? "documentos",
      year: String(new Date().getFullYear()),
      quarter: "",
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewDoc = useMemo<GestionDocument>(
    () => ({
      ...row,
      title: row.title.trim() || "Nuevo documento",
      category: uploadableCategory(row.category),
      quarter: row.quarter?.trim() || undefined,
      year: row.year?.trim() || undefined,
    }),
    [row]
  );
  const captureBaseline = usePreviewSync("document", previewDoc);

  const isNew = !id || row.id.startsWith("preview-doc-");

  const save = async () => {
    if (!row.title.trim()) {
      setError("Hace falta un título.");
      return;
    }
    if (!row.url.trim()) {
      setError("Debes adjuntar un documento o pegar un enlace.");
      return;
    }
    const payload = {
      title: row.title.trim(),
      url: row.url.trim(),
      fileName: row.fileName || fileNameFromUrl(row.url),
      fileType: row.fileType,
      fileSize: row.fileSize,
      year: row.year?.trim() || undefined,
      quarter: row.quarter?.trim() || undefined,
      category: uploadableCategory(row.category),
      coverImage: row.coverImage?.trim() || undefined,
    };
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await addDocument(payload);
        recordPersistedChange({
          label: "documento",
          undo: async () => {
            await deleteDocument(created.id);
            notifyCmsSaved("documents");
          },
          redo: async () => {
            await addDocument({ ...payload, id: created.id });
            notifyCmsSaved("documents");
          },
        });
      } else if (adminDocuments.some((d) => d.id === row.id)) {
        const existing = adminDocuments.find((d) => d.id === row.id)!;
        const before = {
          title: existing.title,
          url: existing.url,
          fileName: existing.fileName,
          fileType: existing.fileType,
          fileSize: existing.fileSize,
          year: existing.year,
          quarter: existing.quarter,
          category: uploadableCategory(existing.category),
          coverImage: existing.coverImage,
        };
        await updateDocument(row.id, payload);
        recordPersistedChange({
          label: "documento",
          undo: async () => {
            await updateDocument(row.id, before);
            notifyCmsSaved("documents");
          },
          redo: async () => {
            await updateDocument(row.id, payload);
            notifyCmsSaved("documents");
          },
        });
      } else {
        try {
          await updateDocument(row.id, payload);
        } catch {
          await addDocument({ ...payload, id: row.id });
        }
        recordPersistedChange({
          label: "documento",
          undo: async () => {
            await deleteDocument(row.id);
            notifyCmsSaved("documents");
          },
          redo: async () => {
            await addDocument({ ...payload, id: row.id });
            notifyCmsSaved("documents");
          },
        });
      }
      notifyCmsSaved("documents");
      captureBaseline();
      clearPreview("document");
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Se añade en esta categoría. Lo ves en la cuadrícula al instante; el sitio público cambia al publicar.
      </p>
      <Field label="Título">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => setRow({ ...row, title: e.target.value })}
        />
      </Field>
      <Field label="Categoría">
        <select
          className={fieldClass}
          style={fieldStyle}
          value={uploadableCategory(row.category)}
          onChange={(e) =>
            setRow({ ...row, category: e.target.value as Exclude<GestionCategory, "revista" | "banco"> })
          }
        >
          {DOC_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Año">
          <select
            className={fieldClass}
            style={fieldStyle}
            value={row.year ?? ""}
            onChange={(e) => setRow({ ...row, year: e.target.value })}
          >
            {DOC_YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Trimestre (opcional)">
          <select
            className={fieldClass}
            style={fieldStyle}
            value={row.quarter ?? ""}
            onChange={(e) => setRow({ ...row, quarter: e.target.value })}
          >
            <option value="">Ninguno</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </Field>
      </div>
      <AdminBlobUploadField
        label="Documento"
        value={row.url}
        onChange={(url) =>
          setRow({
            ...row,
            url,
            fileName: url ? fileNameFromUrl(url) : undefined,
            fileType: undefined,
            fileSize: undefined,
            ...(url.trim() ? {} : { coverImage: undefined }),
          })
        }
        kind="document"
        folder="documents"
        helpText="Sube el archivo, o pega un enlace si ya está publicado."
      />
      {isPdfDocument(row.url, row.fileType, row.fileName) ? (
        <PdfCoverPicker
          pdfUrl={row.url}
          coverUrl={row.coverImage}
          onCoverChange={(coverImage) => setRow({ ...row, coverImage: coverImage || undefined })}
          usageHint="Así se ve en la ficha de Gestión."
        />
      ) : null}
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}

function formatNewsDateLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function emptyNoticia(): AdminNewsItem {
  const date = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    slug: `preview-news-${Date.now()}`,
    title: "",
    date,
    dateFormatted: formatNewsDateLabel(date),
    category: "Noticias",
    excerpt: "",
    imageUrl: "",
    content: "",
    author: "REGULATEL",
    published: true,
  };
}

function NoticiaForm({ slug }: { slug?: string }) {
  const navigate = useNavigate();
  const { exit, recordPersistedChange, clearPreview, preview } = useSiteEdit();
  const { adminNews, updateNews, addNews } = useAdminData();
  const existing = slug
    ? adminNews.find((n) => (n.slug || n.id).toLowerCase() === slug.toLowerCase())
    : undefined;
  const staticNews = slug
    ? noticiasData.find((n) => n.slug.toLowerCase() === slug.toLowerCase())
    : undefined;
  const seedBase = existing
    ? existing
    : staticNews
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
      : slug
        ? null
        : emptyNoticia();
  const seed =
    seedBase && preview.news && preview.news.slug.toLowerCase() === (seedBase.slug || slug || "").toLowerCase()
      ? {
          ...seedBase,
          title: preview.news.title,
          excerpt: preview.news.excerpt,
          date: preview.news.date,
          dateFormatted: preview.news.dateFormatted ?? seedBase.dateFormatted,
          imageUrl: preview.news.imageUrl ?? seedBase.imageUrl,
          category: preview.news.category ?? seedBase.category,
        }
      : seedBase;

  const { value: row, setValue: setRow } = useDraftHistory<AdminNewsItem | null>(seed ? { ...seed } : null);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishedNote, setPublishedNote] = useState<string | undefined>();

  const newsPreview = row
    ? {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        date: row.date,
        dateFormatted: row.dateFormatted,
        imageUrl: row.imageUrl,
        category: row.category,
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

  const persistNoticia = async (asDraft: boolean): Promise<{ id: string; slug: string }> => {
    if (!row.title.trim()) {
      throw new Error("Hace falta un título.");
    }
    const publishedFlag = asDraft ? (existing ? existing.published !== false : false) : true;
    if (existing) {
      const before = {
        title: existing.title,
        excerpt: existing.excerpt,
        date: existing.date,
        imageUrl: existing.imageUrl,
        published: existing.published,
        category: existing.category,
      };
      const after = {
        title: row.title.trim(),
        excerpt: row.excerpt.trim(),
        date: row.date,
        dateFormatted: formatNewsDateLabel(row.date),
        imageUrl: row.imageUrl,
        published: publishedFlag,
        category: row.category,
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
      return { id: existing.id, slug: existing.slug || row.slug };
    }
    const nextSlug = row.slug.startsWith("preview-news-")
      ? slugify(row.title) || `noticia-${Date.now()}`
      : row.slug || slugify(row.title);
    const created = await addNews({
      slug: nextSlug,
      title: row.title.trim(),
      date: row.date,
      dateFormatted: formatNewsDateLabel(row.date) || row.dateFormatted,
      category: row.category || "Noticias",
      excerpt: row.excerpt.trim(),
      imageUrl: row.imageUrl,
      content: row.content,
      author: row.author,
      link: row.link,
      videoUrl: row.videoUrl,
      published: publishedFlag,
    });
    if (!created.id) throw new Error("No se pudo guardar el borrador.");
    return { id: created.id, slug: created.slug || nextSlug };
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await persistNoticia(false);
      notifyCmsSaved("news");
      captureBaseline();
      clearPreview("news");
      setPublishedNote("Ya está en el sitio público.");
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  };

  const saveDraftAndOpen = async () => {
    setDrafting(true);
    setError(null);
    try {
      const saved = await persistNoticia(true);
      notifyCmsSaved("news");
      captureBaseline();
      clearPreview("news");
      navigate(`/admin/noticias?edit=${encodeURIComponent(saved.id)}&borrador=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el borrador.");
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Se ve al instante en el listado. Hasta que publiques, el sitio real no cambia.
      </p>
      <Field label="Título">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => setRow({ ...row, title: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha">
          <input
            type="date"
            className={fieldClass}
            style={fieldStyle}
            value={row.date}
            onChange={(e) =>
              setRow({
                ...row,
                date: e.target.value,
                dateFormatted: formatNewsDateLabel(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Categoría">
          <select
            className={fieldClass}
            style={fieldStyle}
            value={row.category}
            onChange={(e) => setRow({ ...row, category: e.target.value })}
          >
            <option value="Noticias">Noticias</option>
            <option value="Reuniones">Reuniones</option>
            <option value="Mesas">Mesas</option>
            <option value="Eventos">Eventos</option>
          </select>
        </Field>
      </div>
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
        label="Imagen del listado (se ve entera)"
        value={row.imageUrl}
        onChange={(url) => setRow({ ...row, imageUrl: url })}
        kind="image"
        folder="news"
        helpText="Esta es la foto de afuera, en Noticias y en la portada. Se muestra completa, sin recortar. Las fotos extra del artículo se suben en el panel."
      />
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Semiguardar deja un borrador y te lleva al panel para el texto largo. Publicar la pone en el sitio.
      </p>
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        publishedNote={publishedNote}
        notifyPayload={{
          type: "noticia",
          title: row.title,
          excerpt: row.excerpt,
          url: `/noticias/${row.slug || slugify(row.title)}`,
          date: row.dateFormatted || row.date,
        }}
        notifyWarnUnpublished={existing ? row.published === false : !published}
        disabled={drafting}
        onPublish={() => void save()}
        extra={
          <>
            <button
              type="button"
              onClick={() => void saveDraftAndOpen()}
              disabled={saving || drafting}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{
                borderColor: "rgba(22,61,89,0.18)",
                backgroundColor: "#f0f7fb",
                color: "var(--regu-navy)",
              }}
            >
              <Save className="h-4 w-4" />
              {drafting ? "Guardando…" : "Semiguardar y completar"}
            </button>
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
          </>
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
