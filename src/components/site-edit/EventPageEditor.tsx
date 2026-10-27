import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Eye, Pencil, RotateCcw, Send, Settings2, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { useRecoverableDraft } from "@/hooks/useRecoverableDraft";
import { DraftRecoveryNotice } from "@/components/site-edit/DraftRecoveryNotice";
import { cloneJson, notifyCmsSaved } from "@/lib/siteEdit";
import { getEventStatus, getEventYear, type Event } from "@/types/event";
import { safeContentUrl } from "@/types/contentBlocks";
import type { ContentBlock } from "@/types/contentBlocks";
import ContentBlocksEditor from "@/components/site-edit/ContentBlocksEditor";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import EventAttachmentsField from "@/components/admin/EventAttachmentsField";
import EventResourcesEditor from "@/components/site-edit/EventResourcesEditor";
import { EventInlineEditContext, type EventResourceDraft } from "@/contexts/EventInlineEditContext";
import { getSemanaResources } from "@/components/events/SemanaRegulatelResources";
import { SEMANA_REGULATEL_2026_ATTACHMENTS, SEMANA_REGULATEL_2026_EVENT_ID, SEMANA_REGULATEL_2026_IMAGE } from "@/data/semanaRegulatel2026";

const buttonClass = "inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 disabled:opacity-50";
const fieldClass = "w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-200";

function editableSeed(event: Event): Event {
  const isAsiet = event.id === SEMANA_REGULATEL_2026_EVENT_ID || (event.startDate === "2026-10-16" && /asiet/i.test(event.title) && /comtelca/i.test(event.title));
  return cloneJson({
    ...event,
    attachments: event.attachments ?? (isAsiet ? SEMANA_REGULATEL_2026_ATTACHMENTS : []),
    imageUrl: event.imageUrl ?? (isAsiet ? SEMANA_REGULATEL_2026_IMAGE : undefined),
  });
}

export default function EventPageEditor({ event, children }: {
  event: Event;
  children: (event: Event, editor?: ReactNode) => ReactNode;
}) {
  const { events, addEvent, updateEvent, deleteEvent } = useAdminData();
  const { enabled, recordPersistedChange, clearPreview } = useSiteEdit();
  const seed = useRef(editableSeed(event));
  const { value: row, setValue: setRow, reset } = useDraftHistory<Event>(seed.current);
  const rowRef = useRef(row);
  rowRef.current = row;
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Event>(seed.current);
  const [removed, setRemoved] = useState(event.published === false);
  const [resourceDraft, setResourceDraft] = useState<EventResourceDraft>();
  const captureBaseline = usePreviewSync("evento", row, enabled);
  const draft = useRecoverableDraft<Event & { resourceDraft?: EventResourceDraft }>({ identity: `event:${event.id}`, kind: "event", path: `/eventos/${encodeURIComponent(event.id)}`, label: row.title,
    value: { ...row, resourceDraft }, baseline: saved, enabled, onRestore: ({ resourceDraft: dialog, ...next }) => { setResourceDraft(dialog); rowRef.current = next; reset(next); } });
  const busyRef = useRef(false);
  const patch = (values: Partial<Event>) => {
    const next = { ...rowRef.current, ...values };
    rowRef.current = { ...next, year: getEventYear(next.startDate), status: getEventStatus(next) };
    setRow(rowRef.current);
    setMessage("");
  };
  const persist = async (published: boolean) => {
    if (busyRef.current || uploadBusy) return;
    busyRef.current = true; setSaving(true); setError(""); setMessage("");
    const row = rowRef.current;
    const previous = events.find(item => item.id === row.id);
    const payload = published ? { ...row, published: true } : { ...(previous ?? saved), published: false };
    try {
      if (published && !row.title.trim()) throw new Error("Escribe el título del evento.");
      if (published && (!row.startDate || (row.endDate && row.endDate < row.startDate))) throw new Error("Revisa las fechas del evento.");
      if (published && row.contentBlocks?.some(block => (block.type === "image" || block.type === "document") && !safeContentUrl(block.url))) throw new Error("Completa el enlace de cada imagen y documento o quita el bloque vacío.");
      if (published && row.attachments?.some(document => !safeContentUrl(document.url))) throw new Error("Completa el enlace de cada documento adjunto o quita la fila vacía.");
      if (published && row.resources) {
        const resources = row.resources;
        if ([...resources.programs, ...resources.documents].some(document => !document.title.trim() || (document.url.trim() && !safeContentUrl(document.url))) || resources.photos.some(photo => !safeContentUrl(photo.src))) throw new Error("Completa los enlaces de los programas, documentos y fotografías o quita las filas vacías.");
        if ([resources.survey, resources.taxi].some(url => url && !safeContentUrl(url))) throw new Error("Revisa los enlaces de encuesta y transporte.");
      }
      for (const value of [payload.registrationUrl, payload.detailsUrl, payload.imageUrl]) {
        if (value && !/^(https?:\/\/|\/(?!\/))/i.test(value)) throw new Error("Los enlaces deben empezar por https://, http:// o /.");
      }
      if (previous) await updateEvent(row.id, payload);
      else await addEvent(payload);
      let existsInDatabase = true;
      const restore = async (value: Event | undefined) => {
        if (value) {
          if (existsInDatabase) await updateEvent(row.id, value);
          else await addEvent(value);
          existsInDatabase = true;
        } else {
          if (existsInDatabase) await deleteEvent(row.id);
          existsInDatabase = false;
        }
        notifyCmsSaved("events");
        const next = editableSeed(value ?? event);
        draft.clear(next); setResourceDraft(undefined); setSaved(next); reset(next); captureBaseline(next); clearPreview("evento");
        setRemoved(next.published === false); setMessage("");
      };
      recordPersistedChange({ label: published ? "publicar evento" : "despublicar evento", undo: () => restore(previous), redo: () => restore(payload) });
      const next = editableSeed(payload);
      const editingNext = !published ? { ...rowRef.current, published: false } : next;
      if (published) { draft.clear(next); setResourceDraft(undefined); }
      setSaved(next); reset(editingNext); rowRef.current = editingNext; captureBaseline(next); clearPreview("evento");
      setRemoved(!published);
      setMessage(published ? "Evento publicado. Los cambios ya están en el sitio." : "Evento despublicado. Los documentos y fotografías se conservan.");
      notifyCmsSaved("events");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo guardar el evento."); }
    finally { setSaving(false); busyRef.current = false; }
  };
  if (!enabled) return <>{children(event)}</>;
  const resources = row.resources ?? getSemanaResources(row.id);
  const blocks: ContentBlock[] = row.contentBlocks ?? [];
  const editor = previewing ? undefined : <fieldset disabled={saving || uploadBusy} className="min-w-0 space-y-6 rounded-2xl border border-teal-200 bg-white p-5 md:p-7" data-event-page-editor>
    <label className="block text-xs font-bold uppercase tracking-wide text-teal-700">Título del evento<textarea aria-label="Título del evento" rows={2} className="mt-2 w-full resize-y bg-transparent text-2xl font-bold leading-tight text-[var(--regu-navy)] outline-none" style={{ fontFamily: "var(--token-font-heading)" }} value={row.title} onChange={e => patch({ title: e.target.value })} disabled={saving || uploadBusy} /></label>
    <details><summary className="cursor-pointer text-sm font-semibold text-teal-800">Fechas, lugar, inscripción e imagen principal</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Organizador<input className={fieldClass} value={row.organizer} onChange={e => patch({ organizer: e.target.value })} /></label><label className="text-sm">Lugar<input className={fieldClass} value={row.location} onChange={e => patch({ location: e.target.value })} /></label>
      <label className="text-sm">Fecha de inicio<input type="date" className={fieldClass} value={row.startDate} onChange={e => patch({ startDate: e.target.value })} /></label><label className="text-sm">Fecha de fin<input type="date" className={fieldClass} value={row.endDate ?? ""} onChange={e => patch({ endDate: e.target.value || null })} /></label>
      <label className="text-sm">Enlace de inscripción<input className={fieldClass} value={row.registrationUrl ?? ""} onChange={e => patch({ registrationUrl: e.target.value || null })} /></label><label className="text-sm">Más información<input className={fieldClass} value={row.detailsUrl ?? ""} onChange={e => patch({ detailsUrl: e.target.value || null })} /></label>
      <div className="sm:col-span-2"><AdminBlobUploadField label="Imagen principal" value={row.imageUrl ?? ""} onChange={url => patch({ imageUrl: url })} kind="image" folder="events" onBusyChange={setUploadBusy} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.isFeatured} onChange={e => patch({ isFeatured: e.target.checked })} />Destacar en portada</label>
    </div></details>
    <label className="block text-sm font-semibold text-teal-800">Descripción<textarea aria-label="Descripción del evento" className={`${fieldClass} mt-2 min-h-[120px] resize-y leading-relaxed`} value={row.description ?? ""} onChange={e => patch({ description: e.target.value })} /></label>
    <section><h2 className="mb-2 text-lg font-bold text-[var(--regu-navy)]">Contenido del evento</h2><p className="mb-4 text-xs text-slate-500">Escribe, añade archivos y arrastra el asa de cada bloque para moverlo. También puedes usar las flechas.</p><ContentBlocksEditor blocks={blocks} onChange={contentBlocks => patch({ contentBlocks })} editing folder="events" disabled={saving || uploadBusy} onBusyChange={setUploadBusy} /></section>
    {resources && <EventResourcesEditor value={resources} onChange={value => patch({ resources: value })} disabled={saving || uploadBusy} onBusyChange={setUploadBusy} />}
    <EventAttachmentsField value={row.attachments ?? []} onChange={attachments => patch({ attachments })} disabled={saving || uploadBusy} label="Documentos adjuntos del evento" onBusyChange={setUploadBusy} />
  </fieldset>;
  return <EventInlineEditContext.Provider value={previewing ? null : { event: row, patch, busy: saving || uploadBusy, onBusyChange: setUploadBusy, resourceDraft, setResourceDraft }}>
    <div role="region" aria-label="Acciones del evento" className="sticky z-50 border-b border-teal-200 bg-white px-4 py-3 shadow-sm" style={{ top: "var(--site-edit-bar-h, 3.25rem)" }}><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2"><Link className={`${buttonClass} mr-auto`} to="/eventos?tab=todos"><ArrowLeft size={16} />Eventos</Link><button className={buttonClass} disabled={saving || uploadBusy} onClick={() => setOptionsOpen(true)}><Settings2 size={16} />Opciones</button><button className={buttonClass} disabled={saving || uploadBusy} onClick={() => setPreviewing(!previewing)}>{previewing ? <Pencil size={16} /> : <Eye size={16} />}{previewing ? "Editar" : "Vista previa"}</button><button className={buttonClass} disabled={saving || uploadBusy} onClick={() => { draft.clear(saved); setResourceDraft(undefined); reset(saved); captureBaseline(saved); clearPreview("evento"); setMessage(""); }}><RotateCcw size={16} />Revertir</button><button className={buttonClass} style={{ color: "#b91c1c" }} disabled={saving || uploadBusy || removed} onClick={() => void persist(false)}><Trash2 size={16} />{removed ? "Despublicado" : "Despublicar"}</button><button className={buttonClass} style={{ backgroundColor: "#0f766e", color: "#fff", borderColor: "#0f766e" }} disabled={saving || uploadBusy} onClick={() => void persist(true)}><Send size={16} />{saving ? "Guardando…" : removed ? "Volver a publicar" : "Publicar cambios"}</button></div>{message && <p role="status" className="mx-auto mt-2 max-w-6xl text-sm text-teal-800">{message}</p>}{error && <p role="alert" className="mx-auto mt-2 max-w-6xl text-sm text-red-700">{error}</p>}</div>
    <div className="mx-auto max-w-6xl px-4 pt-3"><DraftRecoveryNotice draft={draft} disabled={saving || uploadBusy} /></div>
    {!previewing && <p className="mx-auto max-w-6xl px-4 pt-4 text-xs text-teal-700">Pulsa el título o el texto para escribir. Usa el asa para mover archivos y bloques. Publica cuando termines.</p>}
    {children(row)}
    {optionsOpen && <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/35 p-4 md:p-8" role="dialog" aria-modal="true" aria-label="Opciones del evento"><div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--regu-navy)]">Opciones del evento</h2><button className={buttonClass} disabled={saving || uploadBusy} onClick={() => setOptionsOpen(false)} aria-label="Cerrar opciones"><X size={18} /></button></div>{editor}<button className={`${buttonClass} mt-4`} disabled={saving || uploadBusy} onClick={() => setOptionsOpen(false)}>Volver a la página</button></div></div>}
  </EventInlineEditContext.Provider>;
}
