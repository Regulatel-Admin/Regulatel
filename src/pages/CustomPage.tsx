import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutTemplate, MousePointer2, Send, Trash2 } from "lucide-react";
import NotFound from "@/pages/NotFound";
import { ModePicker, TemplateGallery } from "@/components/custom-pages/TemplatePicker";
import { TemplateRenderer } from "@/components/custom-pages/TemplateRenderer";
import { FreeCanvasEditor } from "@/components/custom-pages/FreeCanvasEditor";
import { EditableSpot } from "@/components/site-edit/EditableSpot";
import { useCustomPages, useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import {
  cloneCanvas,
  defaultCanvasForTitle,
  hasUnpublishedCanvasChanges,
  publicCanvasOf,
  type CustomPage,
  type CustomPageCanvas,
  type CustomPageTemplateId,
} from "@/data/customPages";
import { deleteCustomCategory, patchCustomPage, publishCustomPage } from "@/lib/customPagesSave";

const btn =
  "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold";

export default function CustomPageView() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const pages = useCustomPages();
  const { loading, refetch } = useSiteSettings();
  const { enabled, open, close, setPreview, clearPreview } = useSiteEdit();
  const [gallery, setGallery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>("");

  const page = useMemo(
    () => pages.find((item) => item.slug === slug) ?? null,
    [pages, slug]
  );

  useEffect(() => {
    lastSaved.current = page ? JSON.stringify(page.canvas) : "";
    setSaveStatus("idle");
  }, [slug, page?.id]);

  if (loading && !page) {
    return (
      <div className="px-4 py-24 text-center" style={{ color: "var(--regu-gray-500)" }}>
        Cargando…
      </div>
    );
  }

  if (!page) {
    if (enabled) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
            Esta categoría aún no existe
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
            Créala con el + del menú, en el desplegable donde quieras colocarla.
          </p>
        </div>
      );
    }
    return <NotFound />;
  }

  if (!page.published && !enabled) {
    return <NotFound />;
  }

  const replaceInList = (next: CustomPage) =>
    pages.map((item) => (item.id === next.id ? next : item));

  const chooseTemplate = async (templateId: CustomPageTemplateId) => {
    setBusy(true);
    setError(null);
    const next: CustomPage = {
      ...page,
      mode: "template",
      templateId,
      updatedAt: new Date().toISOString(),
    };
    const res = await patchCustomPage(next);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await refetch();
    setGallery(false);
    open({ kind: "custom-page", slug: page.slug });
  };

  const chooseFree = async () => {
    setBusy(true);
    setError(null);
    const next: CustomPage = {
      ...page,
      mode: "free",
      canvas: page.canvas.blocks.length ? page.canvas : defaultCanvasForTitle(page.title, page.description),
      updatedAt: new Date().toISOString(),
    };
    const res = await patchCustomPage(next);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await refetch();
    close();
  };

  const handleCanvas = (canvas: CustomPageCanvas) => {
    const next: CustomPage = {
      ...page,
      canvas,
      publishedCanvas: page.published ? page.publishedCanvas ?? cloneCanvas(page.canvas) : page.publishedCanvas,
    };
    setPreview({ customPages: replaceInList(next) });
    const sig = JSON.stringify(canvas);
    if (sig === lastSaved.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      void (async () => {
        const res = await patchCustomPage({ ...next, updatedAt: new Date().toISOString() });
        if (res.ok) {
          lastSaved.current = sig;
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
          setNote(res.error);
        }
      })();
    }, 900);
  };

  const publishFree = async () => {
    setSaving(true);
    setNote(null);
    const next: CustomPage = { ...page, published: true, updatedAt: new Date().toISOString() };
    const res = await publishCustomPage(next, replaceInList(next));
    setSaving(false);
    if (!res.ok) {
      setNote(res.error);
      return;
    }
    lastSaved.current = JSON.stringify(next.canvas);
    await refetch();
    clearPreview("customPages");
    setSaveStatus("idle");
    setNote("Ya está en el sitio público.");
  };

  const remove = async () => {
    if (!window.confirm(`¿Quitar «${page.title}» del menú y borrar esta página?`)) return;
    const res = await deleteCustomCategory(page);
    if (!res.ok) {
      setNote(res.error);
      return;
    }
    clearPreview("customPages");
    close();
    await refetch();
    navigate("/");
  };

  if (enabled && (page.mode === "unset" || gallery)) {
    return (
      <div style={{ backgroundColor: "#FAFBFC", minHeight: "60vh" }}>
        {busy && (
          <p className="px-4 pt-6 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Guardando…
          </p>
        )}
        {error && (
          <p className="px-4 pt-6 text-center text-sm" style={{ color: "#991b1b" }}>
            {error}
          </p>
        )}
        {gallery ? (
          <TemplateGallery onPick={(id) => void chooseTemplate(id)} onBack={() => setGallery(false)} />
        ) : (
          <ModePicker onTemplates={() => setGallery(true)} onFree={() => void chooseFree()} />
        )}
      </div>
    );
  }

  const liveDirty = hasUnpublishedCanvasChanges(page);

  const pageActions = (
    <>
      <button
        type="button"
        onClick={() => {
          if (page.mode === "free") setGallery(true);
          else void chooseFree();
        }}
        className={btn}
        style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
      >
        {page.mode === "free" ? (
          <>
            <LayoutTemplate className="h-3.5 w-3.5" />
            Usar plantilla
          </>
        ) : (
          <>
            <MousePointer2 className="h-3.5 w-3.5" />
            Edición libre
          </>
        )}
      </button>
      {page.mode === "free" && (
        <button
          type="button"
          onClick={() => void publishFree()}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Send className="h-3.5 w-3.5" />
          {saving ? "Publicando…" : page.published && liveDirty ? "Actualizar sitio" : "Publicar"}
        </button>
      )}
      <button
        type="button"
        onClick={() => void remove()}
        className={`${btn} text-red-700`}
        style={{ borderColor: "rgba(22,61,89,0.14)" }}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Quitar
      </button>
    </>
  );

  return (
    <div>
      {enabled && page.mode !== "free" && (
        <div
          className="flex flex-wrap items-center gap-2 border-b px-4 py-2"
          style={{ backgroundColor: "#F8FAFB", borderColor: "rgba(22,61,89,0.08)" }}
        >
          <p className="mr-auto text-xs font-semibold" style={{ color: "var(--regu-navy)" }}>
            {page.title}
            {!page.published && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Borrador
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => open({ kind: "custom-page", slug: page.slug })}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
            style={{ backgroundColor: "#0f766e" }}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Rellenar datos
          </button>
          {pageActions}
        </div>
      )}
      {note && (
        <p
          className="px-4 py-2 text-center text-sm"
          style={{ color: note.includes("pudo") || note.startsWith("No") ? "#991b1b" : "#0f766e" }}
        >
          {note}
        </p>
      )}
      {page.mode === "free" ? (
        <FreeCanvasEditor
          key={page.slug}
          canvas={enabled ? page.canvas : publicCanvasOf(page)}
          editing={enabled}
          onChange={enabled ? handleCanvas : undefined}
          saveStatus={enabled ? saveStatus : undefined}
          liveDirty={enabled ? liveDirty : undefined}
          toolbarExtra={
            enabled ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="hidden text-xs font-semibold sm:inline" style={{ color: "var(--regu-navy)" }}>
                  {page.title}
                  {!page.published && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Borrador
                    </span>
                  )}
                  {page.published && liveDirty && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Cambios sin publicar
                    </span>
                  )}
                </span>
                {pageActions}
              </div>
            ) : undefined
          }
        />
      ) : enabled ? (
        <EditableSpot target={{ kind: "custom-page", slug: page.slug }} label="Editar el contenido de esta página">
          <TemplateRenderer page={page} />
        </EditableSpot>
      ) : (
        <TemplateRenderer page={page} />
      )}
    </div>
  );
}
