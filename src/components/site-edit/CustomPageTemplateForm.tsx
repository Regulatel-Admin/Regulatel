import { useMemo, useState, type ReactNode } from "react";
import { Send, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import {
  CUSTOM_PAGES_SETTINGS_KEY,
  CUSTOM_PAGE_TEMPLATES,
  emptyCustomCard,
  emptyCustomDocument,
  type CustomPage,
  type CustomPageCard,
  type CustomPageDocument,
} from "@/data/customPages";
import { deleteCustomCategory, publishCustomPage } from "@/lib/customPagesSave";

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

export function CustomPageTemplateForm({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const { customPages: persistedPages, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange, close } = useSiteEdit();
  const source = persistedPages ?? [];
  const found =
    (preview.customPages ?? source).find((page) => page.slug === slug) ??
    source.find((page) => page.slug === slug);

  const { value: page, setValue: setPage } = useDraftHistory<CustomPage>(() => {
    if (!found) {
      return {
        id: slug,
        slug,
        title: "",
        description: "",
        navItemId: "",
        columnIndex: 0,
        columnUid: "",
        linkUid: "",
        mode: "template",
        content: {
          title: "",
          cards: [],
          documents: [],
          images: [],
        },
        canvas: { backgroundColor: "#FAFBFC", height: 900, blocks: [] },
        published: false,
        createdAt: "",
        updatedAt: "",
      };
    }
    return cloneJson(found);
  });

  const [allEntries, setAllEntries] = useState(() => cloneJson(source));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneJson(allEntries.length ? allEntries : source);
    const idx = list.findIndex((item) => item.id === page.id || item.slug === slug);
    if (idx >= 0) list[idx] = page;
    else list.push(page);
    return list;
  }, [allEntries, source, page, slug]);

  const captureBaseline = usePreviewSync("customPages", previewList, Boolean(found));

  const template = page.templateId || "articulo";
  const templateMeta = CUSTOM_PAGE_TEMPLATES.find((item) => item.id === template);

  const save = async () => {
    if (!page.title.trim()) {
      setError("La página necesita un título.");
      return;
    }
    setSaving(true);
    setError(null);
    const before = cloneJson(persistedPages ?? []);
    const nextPage: CustomPage = {
      ...page,
      title: page.title.trim(),
      description: page.description.trim(),
      published: true,
      updatedAt: new Date().toISOString(),
    };
    const res = await publishCustomPage(nextPage, previewList);
    if (!res.ok) {
      setSaving(false);
      setError(res.error);
      return;
    }
    recordPersistedChange({
      label: "página de categoría",
      undo: async () => {
        const { api } = await import("@/lib/api");
        const r = await api.settings.set(CUSTOM_PAGES_SETTINGS_KEY, before);
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(CUSTOM_PAGES_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await publishCustomPage(nextPage, previewList);
        if (!r.ok) throw new Error(r.error);
      },
    });
    await refetch();
    captureBaseline();
    clearPreview("customPages");
    setPage(nextPage);
    setAllEntries(cloneJson(previewList.map((item) => (item.id === nextPage.id ? nextPage : item))));
    setPublished(true);
    setSaving(false);
  };

  const remove = async () => {
    if (!window.confirm(`¿Quitar «${page.title}» del menú y borrar esta página?`)) return;
    setSaving(true);
    const res = await deleteCustomCategory(page);
    if (!res.ok) {
      setSaving(false);
      setError(res.error);
      return;
    }
    clearPreview("customPages");
    close();
    await refetch();
    navigate("/");
  };

  const setContent = (patch: Partial<CustomPage["content"]>) => {
    setPage({ ...page, content: { ...page.content, ...patch }, published: false });
    setPublished(false);
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Formato: {templateMeta?.name ?? "plantilla"}. Se ve al instante. Publica para que salga en el sitio.
      </p>
      <Field label="Nombre en el menú">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={page.title}
          onChange={(e) => {
            setPage({
              ...page,
              title: e.target.value,
              content: { ...page.content, title: e.target.value },
            });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Texto corto del menú">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={page.description}
          onChange={(e) => {
            setPage({ ...page, description: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Antetítulo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={page.content.kicker ?? ""}
          onChange={(e) => setContent({ kicker: e.target.value })}
        />
      </Field>
      <Field label="Título en la página">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={page.content.title}
          onChange={(e) => setContent({ title: e.target.value })}
        />
      </Field>
      <Field label="Subtítulo">
        <textarea
          className={fieldClass}
          style={fieldStyle}
          rows={2}
          value={page.content.subtitle ?? ""}
          onChange={(e) => setContent({ subtitle: e.target.value })}
        />
      </Field>
      {(template === "articulo" || template === "landing" || template === "multimedia") && (
        <AdminBlobUploadField
          label="Portada"
          value={page.content.coverImageUrl ?? ""}
          onChange={(url) => setContent({ coverImageUrl: url })}
          kind="image"
          folder="attachments"
        />
      )}
      {template === "multimedia" && (
        <Field label="Video (YouTube o MP4)">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={page.content.videoUrl ?? ""}
            onChange={(e) => setContent({ videoUrl: e.target.value })}
            placeholder="https://youtu.be/…"
          />
        </Field>
      )}
      <Field label="Texto">
        <textarea
          className={fieldClass}
          style={fieldStyle}
          rows={7}
          value={page.content.body ?? ""}
          onChange={(e) => setContent({ body: e.target.value })}
        />
      </Field>
      {(template === "hub" || template === "landing") && (
        <CardsEditor
          cards={page.content.cards}
          onChange={(cards) => setContent({ cards })}
        />
      )}
      {template === "documentos" && (
        <DocsEditor
          documents={page.content.documents}
          onChange={(documents) => setContent({ documents })}
        />
      )}
      {template === "multimedia" && (
        <ImagesEditor
          images={page.content.images}
          onChange={(images) => setContent({ images })}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Botón (texto)">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={page.content.ctaLabel ?? ""}
            onChange={(e) => setContent({ ctaLabel: e.target.value })}
          />
        </Field>
        <Field label="Botón (enlace)">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={page.content.ctaHref ?? ""}
            onChange={(e) => setContent({ ctaHref: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Color de acento">
          <input
            type="color"
            value={page.content.accentColor || "#4489C6"}
            onChange={(e) => setContent({ accentColor: e.target.value })}
            className="h-10 w-full cursor-pointer rounded-lg border"
          />
        </Field>
        <Field label="Fondo">
          <input
            type="color"
            value={page.content.backgroundColor || "#fafbfc"}
            onChange={(e) => setContent({ backgroundColor: e.target.value })}
            className="h-10 w-full cursor-pointer rounded-lg border"
          />
        </Field>
      </div>
      {error && (
        <p className="text-sm" style={{ color: "#991b1b" }}>
          {error}
        </p>
      )}
      {published && (
        <p className="text-sm font-medium" style={{ color: "#0f766e" }}>
          Ya está en el sitio público.
        </p>
      )}
      <div
        className="sticky bottom-0 -mx-6 mt-4 border-t bg-white px-6 py-4"
        style={{ borderColor: "rgba(22,61,89,0.08)" }}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            <Send className="h-4 w-4" />
            {saving ? "Publicando…" : published ? "Publicar otra vez" : "Publicar"}
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar del menú
          </button>
        </div>
      </div>
    </div>
  );
}

function CardsEditor({
  cards,
  onChange,
}: {
  cards: CustomPageCard[];
  onChange: (cards: CustomPageCard[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        Cajitas
      </p>
      {cards.map((card, index) => (
        <div key={card.id} className="space-y-2 rounded-xl border p-3" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          <input
            className={fieldClass}
            style={fieldStyle}
            placeholder="Título"
            value={card.title}
            onChange={(e) => {
              const next = cards.slice();
              next[index] = { ...card, title: e.target.value };
              onChange(next);
            }}
          />
          <textarea
            className={fieldClass}
            style={fieldStyle}
            rows={2}
            placeholder="Texto"
            value={card.text}
            onChange={(e) => {
              const next = cards.slice();
              next[index] = { ...card, text: e.target.value };
              onChange(next);
            }}
          />
          <AdminBlobUploadField
            label="Foto"
            value={card.imageUrl ?? ""}
            onChange={(imageUrl) => {
              const next = cards.slice();
              next[index] = { ...card, imageUrl };
              onChange(next);
            }}
            kind="image"
            folder="attachments"
            showPreview={false}
          />
          <input
            className={fieldClass}
            style={fieldStyle}
            placeholder="Enlace (opcional)"
            value={card.href ?? ""}
            onChange={(e) => {
              const next = cards.slice();
              next[index] = { ...card, href: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(cards.filter((_, i) => i !== index))}
            className="text-xs font-semibold text-red-700"
          >
            Quitar cajita
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...cards, emptyCustomCard()])}
        className="inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: "var(--regu-blue)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir cajita
      </button>
    </div>
  );
}

function DocsEditor({
  documents,
  onChange,
}: {
  documents: CustomPageDocument[];
  onChange: (documents: CustomPageDocument[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        Documentos
      </p>
      {documents.map((doc, index) => (
        <div key={doc.id} className="space-y-2 rounded-xl border p-3" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          <input
            className={fieldClass}
            style={fieldStyle}
            placeholder="Título"
            value={doc.title}
            onChange={(e) => {
              const next = documents.slice();
              next[index] = { ...doc, title: e.target.value };
              onChange(next);
            }}
          />
          <textarea
            className={fieldClass}
            style={fieldStyle}
            rows={2}
            placeholder="Descripción"
            value={doc.description ?? ""}
            onChange={(e) => {
              const next = documents.slice();
              next[index] = { ...doc, description: e.target.value };
              onChange(next);
            }}
          />
          <AdminBlobUploadField
            label="Archivo"
            value={doc.url}
            onChange={(url) => {
              const next = documents.slice();
              next[index] = { ...doc, url };
              onChange(next);
            }}
            kind="document"
            folder="attachments"
          />
          <button
            type="button"
            onClick={() => onChange(documents.filter((_, i) => i !== index))}
            className="text-xs font-semibold text-red-700"
          >
            Quitar documento
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...documents, emptyCustomDocument()])}
        className="inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: "var(--regu-blue)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir documento
      </button>
    </div>
  );
}

function ImagesEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        Galería
      </p>
      {images.map((src, index) => (
        <div key={`${src}-${index}`}>
          <AdminBlobUploadField
            label={`Foto ${index + 1}`}
            value={src}
            onChange={(url) => {
              const next = images.slice();
              next[index] = url;
              onChange(next);
            }}
            kind="image"
            folder="attachments"
          />
          <button
            type="button"
            onClick={() => onChange(images.filter((_, i) => i !== index))}
            className="mt-1 text-xs font-semibold text-red-700"
          >
            Quitar foto
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...images, ""])}
        className="inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: "var(--regu-blue)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir foto
      </button>
    </div>
  );
}
