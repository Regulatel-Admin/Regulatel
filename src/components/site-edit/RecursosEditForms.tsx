import { useMemo, useState, type ReactNode } from "react";
import { Send, Trash2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { slugify } from "@/lib/slugify";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import AdminSlideshowField from "@/components/admin/AdminSlideshowField";
import {
  CONVENIOS_SETTINGS_KEY,
  convenios as defaultConvenios,
  type Convenio,
} from "@/data/convenios";
import { albumesGaleria } from "@/data/galeria";
import type { GalleryAlbumSetting } from "@/types/siteSettings";
import {
  ESTUDIOS_INVESTIGACION_SETTINGS_KEY,
  defaultEstudiosInvestigacion,
  type EstudioInvestigacion,
} from "@/data/estudiosInvestigacion";
import {
  HABLA_EL_REGULADOR_SETTINGS_KEY,
  hablaElReguladorInterviews as defaultHablaInterviews,
  type HablaElReguladorInterview,
} from "@/data/hablaElRegulador";

const fieldClass =
  "w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-snug outline-none transition-colors focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

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

function cloneConvenios(list: Convenio[]): Convenio[] {
  return list.map((c) => ({ ...c, areas: [...c.areas] }));
}

function emptyConvenio(order: number): Convenio {
  return {
    slug: `convenio-new-${Date.now()}`,
    title: "",
    acronym: "",
    shortDescription: "",
    logoSrc: "",
    areas: [],
    order,
  };
}

export function ConvenioForm({ slug }: { slug?: string }) {
  const { conveniosList, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneConvenios(preview.convenios ?? conveniosList ?? defaultConvenios);

  const { value: row, setValue: setRow } = useDraftHistory<Convenio>(() => {
    const found = slug ? persisted.find((c) => c.slug === slug) : undefined;
    return found ? { ...found, areas: [...found.areas] } : emptyConvenio(persisted.length + 1);
  });

  const [allEntries, setAllEntries] = useState(() => cloneConvenios(persisted));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneConvenios(allEntries);
    if (removed) return list.filter((c) => c.slug !== row.slug);
    const idx = list.findIndex((c) => c.slug === row.slug);
    if (idx >= 0) list[idx] = { ...row, areas: [...row.areas] };
    else list.push({ ...row, areas: [...row.areas] });
    return list.sort((a, b) => a.order - b.order);
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("convenios", previewList);

  const save = async () => {
    if (!removed && !row.title.trim() && !row.acronym.trim()) {
      setError("El convenio necesita un título o un acrónimo.");
      return;
    }
    const next = removed ? previewList : previewList.map((c) => (c.slug === row.slug ? { ...row } : c));
    const prepared = next
      .filter((c) => c.title.trim() || c.acronym.trim())
      .map((c, i) => {
        const acronym = c.acronym.trim() || c.title.trim();
        const nextSlug =
          c.slug.startsWith("convenio-new-") || !c.slug.trim()
            ? slugify(acronym) || `convenio-${i + 1}`
            : c.slug.trim();
        return {
          ...c,
          slug: nextSlug,
          title: c.title.trim() || acronym,
          acronym,
          shortDescription: c.shortDescription.trim(),
          logoSrc: c.logoSrc.trim(),
          downloadUrl: c.downloadUrl?.trim() || undefined,
          informeUrl: c.informeUrl?.trim() || undefined,
          areas: c.areas.map((a) => a.trim()).filter(Boolean),
          order: i + 1,
        };
      });
    const slugs = prepared.map((c) => c.slug.toLowerCase());
    const dup = slugs.find((s, i) => s && slugs.indexOf(s) !== i);
    if (dup) {
      setError("Hay dos convenios con el mismo enlace. Cambia el acrónimo de uno.");
      return;
    }
    setSaving(true);
    setError(null);
    const before = cloneJson(conveniosList ?? defaultConvenios);
    const res = await api.settings.set(CONVENIOS_SETTINGS_KEY, { items: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "convenios",
      undo: async () => {
        const r = await api.settings.set(CONVENIOS_SETTINGS_KEY, { items: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(CONVENIOS_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(CONVENIOS_SETTINGS_KEY, { items: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(CONVENIOS_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(CONVENIOS_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("convenios");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((c) => c.acronym === row.acronym.trim()) ?? prepared[prepared.length - 1];
      if (saved) setRow({ ...saved, areas: [...saved.areas] });
      setAllEntries(cloneConvenios(prepared));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Logo, nombre y texto corto. Se ve en el menú y en la página.
      </p>
      <Field label="Acrónimo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.acronym}
          placeholder="BEREC"
          onChange={(e) => {
            setRow({ ...row, acronym: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Título">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => {
            setRow({ ...row, title: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Descripción corta">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.shortDescription}
          onChange={(e) => {
            setRow({ ...row, shortDescription: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Áreas de cooperación (una por línea)">
        <textarea
          rows={5}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.areas.join("\n")}
          onChange={(e) => {
            setRow({ ...row, areas: e.target.value.split("\n") });
            setPublished(false);
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Logo"
        value={row.logoSrc}
        onChange={(url) => {
          setRow({ ...row, logoSrc: url });
          setPublished(false);
        }}
        kind="image"
        folder="attachments"
      />
      <AdminBlobUploadField
        label="Documento principal (PDF)"
        value={row.downloadUrl ?? ""}
        onChange={(url) => {
          setRow({ ...row, downloadUrl: url || undefined });
          setPublished(false);
        }}
        kind="document"
        folder="attachments"
      />
      <AdminBlobUploadField
        label="Informe o anexo (opcional)"
        value={row.informeUrl ?? ""}
        onChange={(url) => {
          setRow({ ...row, informeUrl: url || undefined });
          setPublished(false);
        }}
        kind="document"
        folder="attachments"
      />
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              setAllEntries((prev) => prev.filter((c) => c.slug !== row.slug));
              setPublished(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        }
      />
    </div>
  );
}

function defaultAlbums(): GalleryAlbumSetting[] {
  return albumesGaleria.map((a) => ({
    slug: a.slug,
    title: a.title,
    date: a.date,
    folder: a.folder,
    images: [...a.images],
  }));
}

function cloneAlbums(list: GalleryAlbumSetting[]): GalleryAlbumSetting[] {
  return list.map((a) => ({ ...a, images: [...a.images] }));
}

function emptyAlbum(): GalleryAlbumSetting {
  const slug = `nuevo-album-${Date.now()}`;
  return {
    slug,
    title: "",
    date: "",
    folder: slug,
    images: [],
  };
}

export function AlbumForm({ slug }: { slug?: string }) {
  const { galleryAlbums, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneAlbums(preview.galleryAlbums ?? galleryAlbums ?? defaultAlbums());

  const { value: row, setValue: setRow } = useDraftHistory<GalleryAlbumSetting>(() => {
    const found = slug ? persisted.find((a) => a.slug === slug) : undefined;
    return found ? { ...found, images: [...found.images] } : emptyAlbum();
  });

  const [allEntries, setAllEntries] = useState(() => cloneAlbums(persisted));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneAlbums(allEntries);
    if (removed) return list.filter((a) => a.slug !== row.slug);
    const idx = list.findIndex((a) => a.slug === row.slug);
    if (idx >= 0) list[idx] = { ...row, images: [...row.images] };
    else list.unshift({ ...row, images: [...row.images] });
    return list;
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("galleryAlbums", previewList);

  const save = async () => {
    if (!removed && !row.title.trim()) {
      setError("El álbum necesita un título.");
      return;
    }
    const next = removed ? previewList : previewList.map((a) => (a.slug === row.slug ? { ...row } : a));
    const prepared = next
      .filter((a) => a.title.trim())
      .map((a, i) => {
        const nextSlug =
          a.slug.startsWith("nuevo-album-") || !a.slug.trim()
            ? slugify(a.title) || `album-${i + 1}`
            : a.slug.trim();
        return {
          ...a,
          title: a.title.trim(),
          date: a.date.trim(),
          slug: nextSlug,
          folder: a.folder.trim() || nextSlug,
          images: a.images.filter(Boolean),
        };
      });
    setSaving(true);
    setError(null);
    const before = cloneJson(galleryAlbums ?? defaultAlbums());
    const res = await api.settings.set("gallery_albums", prepared);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "galería",
      undo: async () => {
        const r = await api.settings.set("gallery_albums", before);
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved("gallery_albums");
      },
      redo: async () => {
        const r = await api.settings.set("gallery_albums", prepared);
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved("gallery_albums");
      },
    });
    notifyCmsSaved("gallery_albums");
    await refetch();
    captureBaseline();
    clearPreview("galleryAlbums");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((a) => a.title === row.title.trim()) ?? prepared[0];
      if (saved) setRow({ ...saved, images: [...saved.images] });
      setAllEntries(cloneAlbums(prepared));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Título, fecha y fotos. La primera foto es la portada.
      </p>
      <Field label="Título">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => {
            setRow({ ...row, title: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Fecha">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.date}
          placeholder="12 de diciembre de 2025"
          onChange={(e) => {
            setRow({ ...row, date: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <AdminSlideshowField
        compact
        urls={row.images}
        onChange={(images) => {
          setRow({ ...row, images });
          setPublished(false);
        }}
        label="Fotos del álbum"
        help="La primera es la portada. Sube, reordena o quita."
        folder="gallery"
      />
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              setAllEntries((prev) => prev.filter((a) => a.slug !== row.slug));
              setPublished(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        }
      />
    </div>
  );
}

function cloneEstudios(list: EstudioInvestigacion[]): EstudioInvestigacion[] {
  return list.map((e) => ({ ...e }));
}

function emptyEstudio(): EstudioInvestigacion {
  return { id: `estudio-new-${Date.now()}`, title: "", description: "", url: "" };
}

export function EstudioForm({ id }: { id?: string }) {
  const { estudiosInvestigacion, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneEstudios(preview.estudios ?? estudiosInvestigacion ?? defaultEstudiosInvestigacion);

  const { value: row, setValue: setRow } = useDraftHistory<EstudioInvestigacion>(() => {
    const found = id ? persisted.find((e) => e.id === id) : undefined;
    return found ? { ...found } : emptyEstudio();
  });

  const [allEntries, setAllEntries] = useState(() => cloneEstudios(persisted));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneEstudios(allEntries);
    if (removed) return list.filter((e) => e.id !== row.id);
    const idx = list.findIndex((e) => e.id === row.id);
    if (idx >= 0) list[idx] = { ...row };
    else list.push({ ...row });
    return list;
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("estudios", previewList);

  const save = async () => {
    if (!removed && !row.title.trim()) {
      setError("El estudio necesita un título.");
      return;
    }
    const next = removed ? previewList : previewList.map((e) => (e.id === row.id ? { ...row } : e));
    const prepared = next
      .filter((e) => e.title.trim())
      .map((e, i) => ({
        ...e,
        title: e.title.trim(),
        description: e.description.trim(),
        url: e.url.trim(),
        id: e.id.startsWith("estudio-new-") || !e.id.trim() ? slugify(e.title) || `estudio-${i + 1}` : e.id.trim(),
      }));
    setSaving(true);
    setError(null);
    const before = cloneJson(estudiosInvestigacion ?? defaultEstudiosInvestigacion);
    const res = await api.settings.set(ESTUDIOS_INVESTIGACION_SETTINGS_KEY, { items: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "estudios",
      undo: async () => {
        const r = await api.settings.set(ESTUDIOS_INVESTIGACION_SETTINGS_KEY, { items: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(ESTUDIOS_INVESTIGACION_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(ESTUDIOS_INVESTIGACION_SETTINGS_KEY, { items: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(ESTUDIOS_INVESTIGACION_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(ESTUDIOS_INVESTIGACION_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("estudios");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((e) => e.title === row.title.trim()) ?? prepared[prepared.length - 1];
      if (saved) setRow({ ...saved });
      setAllEntries(cloneEstudios(prepared));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Título, resumen y PDF. Se ve aquí al instante.
      </p>
      <Field label="Título">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => {
            setRow({ ...row, title: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Descripción">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.description}
          onChange={(e) => {
            setRow({ ...row, description: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Documento (PDF)"
        value={row.url}
        onChange={(url) => {
          setRow({ ...row, url });
          setPublished(false);
        }}
        kind="document"
        folder="attachments"
      />
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              setAllEntries((prev) => prev.filter((e) => e.id !== row.id));
              setPublished(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        }
      />
    </div>
  );
}

function cloneEntrevistas(list: HablaElReguladorInterview[]): HablaElReguladorInterview[] {
  return list.map((e) => ({ ...e }));
}

function emptyEntrevista(): HablaElReguladorInterview {
  return {
    slug: `entrevista-new-${Date.now()}`,
    episode: 0,
    name: "",
    role: "",
    organization: "",
    country: "",
    countryCode: "",
    date: new Date().toISOString().slice(0, 10),
    duration: "",
    poster: "",
  };
}

export function EntrevistaForm({ slug }: { slug?: string }) {
  const { hablaElRegulador, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneEntrevistas(preview.entrevistas ?? hablaElRegulador ?? defaultHablaInterviews);

  const { value: row, setValue: setRow } = useDraftHistory<HablaElReguladorInterview>(() => {
    const found = slug ? persisted.find((e) => e.slug === slug) : undefined;
    return found ? { ...found } : emptyEntrevista();
  });

  const [allEntries, setAllEntries] = useState(() => cloneEntrevistas(persisted));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneEntrevistas(allEntries);
    if (removed) return list.filter((e) => e.slug !== row.slug);
    const idx = list.findIndex((e) => e.slug === row.slug);
    if (idx >= 0) list[idx] = { ...row };
    else list.unshift({ ...row });
    return list;
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("entrevistas", previewList);

  const save = async () => {
    if (!removed && !row.name.trim()) {
      setError("La entrevista necesita el nombre de la persona.");
      return;
    }
    const next = removed ? previewList : previewList.map((e) => (e.slug === row.slug ? { ...row } : e));
    const prepared = next
      .filter((e) => e.name.trim())
      .map((e, i) => {
        const nextSlug =
          e.slug.startsWith("entrevista-new-") || !e.slug.trim()
            ? slugify(e.name) || `entrevista-${i + 1}`
            : e.slug.trim();
        return {
          ...e,
          slug: nextSlug,
          name: e.name.trim(),
          role: e.role.trim(),
          organization: e.organization.trim(),
          country: e.country.trim(),
          countryCode: e.countryCode.trim().toUpperCase(),
          date: e.date?.trim() || undefined,
          duration: e.duration.trim(),
          poster: e.poster.trim(),
          youtubeId: e.youtubeId?.trim() || undefined,
          videoSrc: e.videoSrc?.trim() || undefined,
          episode: e.episode || next.length - i,
        };
      });
    setSaving(true);
    setError(null);
    const before = cloneJson(hablaElRegulador ?? defaultHablaInterviews);
    const res = await api.settings.set(HABLA_EL_REGULADOR_SETTINGS_KEY, { interviews: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "entrevistas",
      undo: async () => {
        const r = await api.settings.set(HABLA_EL_REGULADOR_SETTINGS_KEY, { interviews: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(HABLA_EL_REGULADOR_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(HABLA_EL_REGULADOR_SETTINGS_KEY, { interviews: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(HABLA_EL_REGULADOR_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(HABLA_EL_REGULADOR_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("entrevistas");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((e) => e.name === row.name.trim()) ?? prepared[0];
      if (saved) setRow({ ...saved });
      setAllEntries(cloneEntrevistas(prepared));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Persona, cargo y video. Se ve en la parrilla al instante.
      </p>
      <Field label="Nombre">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.name}
          onChange={(e) => {
            setRow({ ...row, name: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Cargo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.role}
          onChange={(e) => {
            setRow({ ...row, role: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Organismo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.organization}
          onChange={(e) => {
            setRow({ ...row, organization: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="País">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={row.country}
            onChange={(e) => {
              setRow({ ...row, country: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
        <Field label="Código (ES, CO…)">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={row.countryCode}
            onChange={(e) => {
              setRow({ ...row, countryCode: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Episodio">
          <input
            type="number"
            className={fieldClass}
            style={fieldStyle}
            value={row.episode || ""}
            onChange={(e) => {
              setRow({ ...row, episode: parseInt(e.target.value, 10) || 0 });
              setPublished(false);
            }}
          />
        </Field>
        <Field label="Duración">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={row.duration}
            placeholder="16:14"
            onChange={(e) => {
              setRow({ ...row, duration: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
      </div>
      <Field label="Fecha">
        <input
          type="date"
          className={fieldClass}
          style={fieldStyle}
          value={row.date ?? ""}
          onChange={(e) => {
            setRow({ ...row, date: e.target.value || undefined });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="ID de YouTube">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.youtubeId ?? ""}
          placeholder="GfNp-AiYINU"
          onChange={(e) => {
            setRow({ ...row, youtubeId: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Foto / póster"
        value={row.poster}
        onChange={(url) => {
          setRow({ ...row, poster: url });
          setPublished(false);
        }}
        kind="image"
        folder="attachments"
      />
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              setAllEntries((prev) => prev.filter((e) => e.slug !== row.slug));
              setPublished(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        }
      />
    </div>
  );
}
