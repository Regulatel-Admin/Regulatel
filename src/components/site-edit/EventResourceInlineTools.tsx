import { useEffect, useRef, useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Settings2, Trash2, Upload, X } from "lucide-react";
import type { EventResources } from "@/types/event";
import { moveContentBlock, safeContentUrl } from "@/types/contentBlocks";
import { useEventInlineEditor } from "@/contexts/EventInlineEditContext";
import { uploadAdminFile } from "@/lib/uploads";
import EventResourcesEditor from "@/components/site-edit/EventResourcesEditor";

export type ResourceSection = "programs" | "documents" | "photos";
const labels = { programs: "Programa", documents: "Documentos", photos: "Galería" };
const itemLabels = { programs: "programa", documents: "documento", photos: "fotografía" };
const dragType = "application/x-regulatel-resource";
const toolClass = "inline-flex h-6 w-6 items-center justify-center rounded bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-teal-800 hover:ring-teal-400 disabled:cursor-not-allowed disabled:opacity-35";
const actionClass = "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 disabled:opacity-40";
const fieldClass = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";
type Target = { section: ResourceSection; index: number | null; original?: string };
type Draft = { title: string; url: string; description: string };

/** Small controls over the published resource rows; the form opens only on demand. */
export function useEventResourceInlineTools(resources: EventResources, order: ResourceSection[]) {
  const inline = useEventInlineEditor();
  const resourcesRef = useRef(resources);
  const inlineRef = useRef(inline);
  resourcesRef.current = resources;
  inlineRef.current = inline;
  const [target, setTarget] = useState<Target | null>(null);
  const [draft, setDraft] = useState<Draft>({ title: "", url: "", description: "" });
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [manager, setManager] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [directFeedback, setDirectFeedback] = useState<{ section: ResourceSection; index: number; message: string; failed: boolean } | null>(null);
  const uploadInFlight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const directFileInput = useRef<HTMLInputElement>(null);
  const directTarget = useRef<{ section: ResourceSection; index: number; original: string } | null>(null);
  const modal = useRef<HTMLDivElement>(null);
  const busy = uploading || Boolean(inline?.busy);
  const modalOpen = Boolean(inline && (target || manager));
  useEffect(() => {
    if (inline?.resourceDraft) { setTarget(inline.resourceDraft.target); setDraft(inline.resourceDraft.draft); }
  }, [inline?.resourceDraft]);
  const updateDialogDraft = (next: Draft) => {
    draftRef.current = next; setDraft(next);
    if (target) inlineRef.current?.setResourceDraft?.({ target, draft: next });
  };
  const closeDialog = () => {
    setTarget(null); setManager(false); inlineRef.current?.setResourceDraft?.(undefined);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const before = document.body.style.overflow;
    const focused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const firstField = modal.current?.querySelector<HTMLElement>("input:not([type='file']), textarea");
    (firstField ?? modal.current?.querySelector<HTMLElement>("button"))?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !uploadInFlight.current && !inlineRef.current?.busy) closeDialog();
      if (event.key === "Tab" && modal.current) {
        const elements = Array.from(modal.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([type='file']):not([disabled]), textarea:not([disabled]), a[href], [tabindex='0']"));
        const first = elements[0]; const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = before; window.removeEventListener("keydown", onKey); focused?.focus(); };
  }, [modalOpen]);

  const change = (next: EventResources) => inline?.patch({ resources: next });
  const moveItem = (section: ResourceSection, from: number, to: number) => {
    if (busy) return;
    const current = resourcesRef.current;
    if (section === "photos") change({ ...current, photos: moveContentBlock(current.photos, from, to) });
    else change({ ...current, [section]: moveContentBlock(current[section], from, to) });
  };
  const moveSection = (from: number, to: number) => {
    if (!busy) change({ ...resourcesRef.current, sectionOrder: moveContentBlock(order, from, to) });
  };
  const edit = (section: ResourceSection, index: number | null) => {
    if (busy) return;
    const item = index === null ? undefined : resourcesRef.current[section][index];
    setDraft(item && "src" in item ? { title: item.caption ?? "", url: item.src, description: "" }
      : item ? { title: item.title, url: item.url, description: item.description ?? "" } : { title: "", url: "", description: "" });
    setError(""); setTarget({ section, index, original: item ? JSON.stringify(item) : undefined });
  };
  const apply = () => {
    if (!target || !inline || busy) return;
    const url = safeContentUrl(draft.url);
    if (!url) { setError("Añade un archivo o un enlace que empiece por https://, http:// o /."); return; }
    if (target.section !== "photos" && !draft.title.trim()) { setError("Escribe el título del archivo."); return; }
    const current = resourcesRef.current;
    const items = current[target.section];
    const targetIndex = target.index === null ? null : JSON.stringify(items[target.index]) === target.original
      ? target.index : items.findIndex(item => JSON.stringify(item) === target.original);
    if (targetIndex === -1) { setError("Este elemento cambió mientras lo editabas. Cierra y vuelve a abrir su edición."); return; }
    if (target.section === "photos") {
      const next = { ...(targetIndex === null ? {} : current.photos[targetIndex]), src: url, caption: draft.title };
      change({ ...current, photos: targetIndex === null ? [...current.photos, next] : current.photos.map((item, index) => index === targetIndex ? next : item) });
    } else {
      const section = target.section;
      const next = { ...(targetIndex === null ? {} : current[section][targetIndex]), title: draft.title, url, description: draft.description };
      change({ ...current, [section]: targetIndex === null ? [...current[section], next] : current[section].map((item, index) => index === targetIndex ? next : item) });
    }
    closeDialog();
  };
  const replaceFile = async (file: File | undefined) => {
    if (!file || !target || busy || uploadInFlight.current) return;
    uploadInFlight.current = true; setUploading(true); setError("");
    inlineRef.current?.onBusyChange(true);
    try {
      const result = await uploadAdminFile({ file, kind: target.section === "photos" ? "image" : "document", folder: "events" });
      const current = draftRef.current;
      updateDialogDraft({ ...current, url: result.url, title: target.index === null && !current.title ? file.name.replace(/\.[^.]+$/, "") : current.title });
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo subir el archivo. El anterior se conserva.");
    } finally {
      uploadInFlight.current = false; setUploading(false); inlineRef.current?.onBusyChange(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };
  const chooseDirectReplacement = (section: ResourceSection, index: number) => {
    if (!inline || busy || uploadInFlight.current || !directFileInput.current) return;
    directTarget.current = { section, index, original: JSON.stringify(resourcesRef.current[section][index]) };
    directFileInput.current.accept = section === "photos" ? "image/jpeg,image/png,image/webp" : ".pdf,.doc,.docx,.xls,.xlsx";
    directFileInput.current.value = "";
    setDirectFeedback(null);
    directFileInput.current.click();
  };
  const replaceDirectFile = async (file: File | undefined) => {
    const selected = directTarget.current;
    if (!file || !selected || !inlineRef.current || busy || uploadInFlight.current) return;
    uploadInFlight.current = true; setUploading(true); setDirectFeedback(null);
    inlineRef.current.onBusyChange(true);
    let currentIndex = selected.index;
    try {
      const result = await uploadAdminFile({ file, kind: selected.section === "photos" ? "image" : "document", folder: "events" });
      const current = resourcesRef.current;
      const items = current[selected.section];
      currentIndex = JSON.stringify(items[selected.index]) === selected.original ? selected.index : items.findIndex(item => JSON.stringify(item) === selected.original);
      if (currentIndex < 0) throw new Error("El elemento cambió durante la subida. Vuelve a elegir el archivo.");
      const next = selected.section === "photos"
        ? { ...current, photos: current.photos.map((item, index) => index === currentIndex ? { ...item, src: result.url } : item) }
        : { ...current, [selected.section]: current[selected.section].map((item, index) => index === currentIndex ? { ...item, url: result.url } : item) };
      inlineRef.current?.patch({ resources: next });
      setDirectFeedback({ section: selected.section, index: currentIndex, message: "Archivo reemplazado. Publica los cambios para guardarlo.", failed: false });
    } catch (error) {
      setDirectFeedback({ section: selected.section, index: Math.max(currentIndex, 0), message: `${error instanceof Error ? error.message : "No se pudo reemplazar el archivo."} El archivo anterior se conserva.`, failed: true });
    } finally {
      uploadInFlight.current = false; setUploading(false); inlineRef.current?.onBusyChange(false);
      directTarget.current = null;
      if (directFileInput.current) directFileInput.current.value = "";
    }
  };
  const startDrag = (event: DragEvent<HTMLElement>, payload: { section: ResourceSection; index?: number }) => {
    if (busy) { event.preventDefault(); return; }
    event.stopPropagation(); event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(dragType, JSON.stringify(payload));
  };
  const dragOver = (event: DragEvent<HTMLElement>) => {
    if (!inline || busy || !event.dataTransfer.types.includes(dragType)) return;
    event.preventDefault(); event.dataTransfer.dropEffect = "move";
  };
  const drop = (event: DragEvent<HTMLElement>, section: ResourceSection, index?: number) => {
    if (!inline || busy) return;
    try {
      const source = JSON.parse(event.dataTransfer.getData(dragType)) as { section: ResourceSection; index?: number };
      if (index !== undefined && source.section === section && typeof source.index === "number") moveItem(section, source.index, index);
      else if (index === undefined && source.index === undefined) moveSection(order.indexOf(source.section), order.indexOf(section));
      else return;
      event.preventDefault(); event.stopPropagation();
    } catch { /* Other draggable elements retain their normal behavior. */ }
  };

  const itemTools = (section: ResourceSection, index: number) => inline && <div className="absolute top-1 right-1 z-10 flex items-center gap-1 opacity-55 transition-opacity group-hover:opacity-100 focus-within:opacity-100" data-inline-resource-tools>
    <button type="button" draggable={!busy} disabled={busy} className={`${toolClass} cursor-grab`} title="Arrastrar" aria-label={`Arrastrar ${itemLabels[section]} ${index + 1}`} onDragStart={event => startDrag(event, { section, index })}><GripVertical size={13}/></button>
    <button type="button" disabled={busy || index === 0} className={toolClass} aria-label={`Subir ${itemLabels[section]} ${index + 1}`} onClick={() => moveItem(section, index, index - 1)}><ArrowUp size={12}/></button>
    <button type="button" disabled={busy || index === resources[section].length - 1} className={toolClass} aria-label={`Bajar ${itemLabels[section]} ${index + 1}`} onClick={() => moveItem(section, index, index + 1)}><ArrowDown size={12}/></button>
    <button type="button" disabled={busy} className={toolClass} title="Editar archivo" aria-label={`Editar ${itemLabels[section]} ${index + 1}`} onClick={() => edit(section, index)}><Pencil size={12}/></button>
    <button type="button" disabled={busy} className={`${toolClass} hover:text-red-700`} aria-label={`Quitar ${itemLabels[section]} ${index + 1}`} onClick={() => change({ ...resources, [section]: resources[section].filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={12}/></button>
  </div>;
  const sectionTools = (section: ResourceSection) => {
    const index = order.indexOf(section);
    return inline && <span className="absolute -top-6 left-0 z-10 flex items-center gap-1 opacity-55 transition-opacity group-hover:opacity-100 focus-within:opacity-100" data-inline-section-tools>
      <button type="button" draggable={!busy} disabled={busy} className={`${toolClass} cursor-grab`} aria-label={`Arrastrar sección ${labels[section]}`} onDragStart={event => startDrag(event, { section })}><GripVertical size={13}/></button>
      <button type="button" disabled={busy || index === 0} className={toolClass} aria-label={`Subir sección ${labels[section]}`} onClick={() => moveSection(index, index - 1)}><ArrowUp size={12}/></button>
      <button type="button" disabled={busy || index === order.length - 1} className={toolClass} aria-label={`Bajar sección ${labels[section]}`} onClick={() => moveSection(index, index + 1)}><ArrowDown size={12}/></button>
      <button type="button" disabled={busy} className={toolClass} aria-label={`Añadir ${itemLabels[section]}`} onClick={() => edit(section, null)}><Plus size={13}/></button>
      <button type="button" disabled={busy || !resources[section].length} className={`${toolClass} hover:text-red-700`} aria-label={`Quitar sección ${labels[section]}`} onClick={() => change({ ...resources, [section]: [] })}><Trash2 size={12}/></button>
    </span>;
  };
  const dialogs = inline && modalOpen && <div className="se-modal-overlay" onClick={() => { if (!busy) closeDialog() }}>
    <div ref={modal} role="dialog" aria-modal="true" aria-label={manager ? "Administrar archivos del evento" : target?.index === null ? "Añadir archivo del evento" : "Editar archivo del evento"} className="max-h-[85dvh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-xl" style={{ maxWidth: manager ? 880 : 480 }} onClick={event => event.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-800">{manager ? "Administrar archivos" : target?.index === null ? `Añadir ${itemLabels[target.section]}` : "Editar archivo"}</h2><button type="button" disabled={busy} className={toolClass} aria-label="Cerrar edición del archivo" onClick={closeDialog}><X size={17}/></button></div>
      {manager ? <EventResourcesEditor value={resources} onChange={change} disabled={Boolean(inline.busy)} onBusyChange={inline.onBusyChange}/> : target && <>
        <div className="space-y-4"><label className="block text-sm text-slate-600">{target.section === "photos" ? "Descripción de la fotografía" : "Título"}<input autoFocus disabled={busy} className={fieldClass} value={draft.title} onChange={event => updateDialogDraft({ ...draft, title: event.target.value })}/></label>
          <label className="block text-sm text-slate-600">Enlace<input disabled={busy} className={fieldClass} value={draft.url} onChange={event => updateDialogDraft({ ...draft, url: event.target.value })} placeholder="https://… o /…"/></label>
          {target.section !== "photos" && <label className="block text-sm text-slate-600">Descripción<textarea disabled={busy} className={`${fieldClass} min-h-20`} value={draft.description} onChange={event => updateDialogDraft({ ...draft, description: event.target.value })}/></label>}
          <input ref={fileInput} type="file" tabIndex={-1} disabled={busy} accept={target.section === "photos" ? "image/jpeg,image/png,image/webp" : ".pdf,.doc,.docx,.xls,.xlsx"} className="sr-only" aria-label="Archivo de reemplazo" onChange={event => void replaceFile(event.target.files?.[0])}/>
          <button type="button" disabled={busy} className={actionClass} onClick={() => fileInput.current?.click()}><Upload size={16}/>{uploading ? "Subiendo…" : target.index === null ? "Subir archivo" : "Reemplazar archivo"}</button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} className={actionClass} onClick={closeDialog}>Cancelar</button><button type="button" disabled={busy} className={`${actionClass} border-teal-700 bg-teal-700 text-white`} onClick={apply}>Aplicar</button></div>
      </>}
    </div>
  </div>;
  return {
    editing: Boolean(inline), itemTools, sectionTools, dialogs,
    replacementInput: inline && <input ref={directFileInput} type="file" tabIndex={-1} disabled={busy} className="sr-only" aria-label="Reemplazo directo del archivo" onChange={event => void replaceDirectFile(event.target.files?.[0])}/>,
    replaceButton: (section: ResourceSection, index: number) => inline && <span className="inline-flex max-w-full flex-col items-start gap-1">
      <button type="button" disabled={busy} className="se-outline" title={`Reemplazar archivo del ${itemLabels[section]} ${index + 1}`} onClick={() => chooseDirectReplacement(section, index)}><Upload size={15}/>{uploading && directTarget.current?.section === section && directTarget.current.index === index ? "Subiendo…" : section === "photos" ? "Cambiar imagen" : "Reemplazar archivo"}</button>
      {directFeedback?.section === section && directFeedback.index === index && <span role={directFeedback.failed ? "alert" : "status"} className={`max-w-[220px] text-xs leading-snug ${directFeedback.failed ? "text-red-700" : "text-teal-700"}`}>{directFeedback.message}</span>}
    </span>,
    itemDragProps: (section: ResourceSection, index: number) => inline ? { onDragOver: dragOver, onDrop: (event: DragEvent<HTMLElement>) => drop(event, section, index) } : {},
    sectionDragProps: (section: ResourceSection) => inline ? { onDragOver: dragOver, onDrop: (event: DragEvent<HTMLElement>) => drop(event, section) } : {},
    manageButton: inline && <button type="button" disabled={busy} className="se-text-link ml-auto opacity-60 hover:opacity-100" onClick={() => setManager(true)}><Settings2 size={14}/>Administrar archivos</button>,
  };
}
