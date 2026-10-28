import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, FileText, GripVertical, Images, Lock, Plus, Trash2, Upload } from "lucide-react";
import type { EventResources } from "@/types/event";
import { moveContentBlock, safeContentUrl } from "@/types/contentBlocks";
import { uploadAdminFile } from "@/lib/uploads";

type Section = "programs" | "documents" | "photos";
type DocumentResource = EventResources["documents"][number];
const sections: Section[] = ["programs", "documents", "photos"];
const sectionLabels = { programs: "Programa", documents: "Documentos", photos: "Galería" };
const sectionIcons = { programs: CalendarDays, documents: FileText, photos: Images };
const buttonClass = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40";
const inputClass = "w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-60";

export default function EventResourcesEditor({ value, onChange, disabled = false, onBusyChange }: {
  value: EventResources; onChange: (value: EventResources) => void;
  disabled?: boolean; onBusyChange?: (busy: boolean) => void;
}) {
  const valueRef = useRef(value);
  const changeRef = useRef(onChange);
  const busyChangeRef = useRef(onBusyChange);
  const uploadInFlight = useRef(false);
  valueRef.current = value;
  changeRef.current = onChange;
  busyChangeRef.current = onBusyChange;
  const programsInput = useRef<HTMLInputElement>(null);
  const documentsInput = useRef<HTMLInputElement>(null);
  const photosInput = useRef<HTMLInputElement>(null);
  const replacementInput = useRef<HTMLInputElement>(null);
  const replacementTarget = useRef<{ section: Section; index: number; snapshot: string } | null>(null);
  const draggedSection = useRef<Section | null>(null);
  const draggedItem = useRef<{ section: Section; index: number } | null>(null);
  const [uploading, setUploading] = useState<Section | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controlsDisabled = disabled || uploading !== null;
  const order = [...new Set([...(value.sectionOrder ?? []), ...sections])].filter((section): section is Section => sections.includes(section));
  const moveSection = (from: number, to: number) => onChange({ ...value, sectionOrder: moveContentBlock(order, from, to) });
  const moveItem = (section: Section, from: number, to: number) => {
    if (section === "photos") onChange({ ...value, photos: moveContentBlock(value.photos, from, to) });
    else onChange({ ...value, [section]: moveContentBlock(value[section], from, to) });
  };
  const updateDocument = (section: "programs" | "documents", index: number, patch: Partial<DocumentResource>) =>
    onChange({ ...value, [section]: value[section].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const upload = async (section: Section, files: FileList | null) => {
    if (!files?.length || controlsDisabled || uploadInFlight.current) return;
    uploadInFlight.current = true;
    busyChangeRef.current?.(true);
    setUploading(section); setError(null);
    const additions: { url: string; title: string }[] = [];
    try {
      for (const file of Array.from(files)) {
        const result = await uploadAdminFile({ file, kind: section === "photos" ? "image" : "document", folder: "events" });
        additions.push({ url: result.url, title: file.name.replace(/\.[^.]+$/, "") });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo subir el archivo.");
    } finally {
      const latest = valueRef.current;
      if (additions.length) {
        changeRef.current(section === "photos"
          ? { ...latest, photos: [...latest.photos, ...additions.map(item => ({ src: item.url, caption: item.title }))] }
          : { ...latest, [section]: [...latest[section], ...additions.map(item => ({ title: item.title, url: item.url, description: "" }))] });
      }
      setUploading(null);
      uploadInFlight.current = false;
      busyChangeRef.current?.(false);
      for (const input of [programsInput, documentsInput, photosInput]) if (input.current) input.current.value = "";
    }
  };
  const chooseReplacement = (section: Section, index: number) => {
    if (controlsDisabled || !replacementInput.current) return;
    replacementTarget.current = { section, index, snapshot: JSON.stringify(valueRef.current[section][index]) };
    replacementInput.current.accept = section === "photos" ? "image/jpeg,image/png,image/webp" : ".pdf,.doc,.docx,.xls,.xlsx";
    replacementInput.current.click();
  };
  const replaceFile = async (file: File | undefined) => {
    const target = replacementTarget.current;
    if (!file || !target || controlsDisabled || uploadInFlight.current) return;
    uploadInFlight.current = true; busyChangeRef.current?.(true);
    setUploading(target.section); setError(null);
    try {
      const uploaded = await uploadAdminFile({ file, kind: target.section === "photos" ? "image" : "document", folder: "events" });
      const latest = valueRef.current;
      const items = latest[target.section];
      const index = JSON.stringify(items[target.index]) === target.snapshot
        ? target.index : items.findIndex(item => JSON.stringify(item) === target.snapshot);
      if (index < 0) throw new Error("El recurso cambió mientras subías el archivo. Vuelve a seleccionarlo para reemplazarlo.");
      changeRef.current(target.section === "photos"
        ? { ...latest, photos: latest.photos.map((item, itemIndex) => itemIndex === index ? { ...item, src: uploaded.url } : item) }
        : { ...latest, [target.section]: latest[target.section].map((item, itemIndex) => itemIndex === index ? { ...item, url: uploaded.url } : item) });
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo reemplazar el archivo. El recurso original se conserva."); }
    finally {
      if (replacementInput.current) replacementInput.current.value = "";
      replacementTarget.current = null;
      setUploading(null); uploadInFlight.current = false; busyChangeRef.current?.(false);
    }
  };

  return <div className="space-y-6" data-event-resources-editor="editing">
    <input ref={programsInput} type="file" disabled={controlsDisabled} multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="sr-only" aria-label="Subir programas" onChange={event => void upload("programs", event.target.files)}/>
    <input ref={documentsInput} type="file" disabled={controlsDisabled} multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="sr-only" aria-label="Subir documentos" onChange={event => void upload("documents", event.target.files)}/>
    <input ref={photosInput} type="file" disabled={controlsDisabled} multiple accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Subir fotografías" onChange={event => void upload("photos", event.target.files)}/>
    <input ref={replacementInput} type="file" disabled={controlsDisabled} className="sr-only" aria-label="Reemplazar archivo del recurso" onChange={event => void replaceFile(event.target.files?.[0])}/>
    {order.map((section, sectionIndex) => {
      const Icon = sectionIcons[section];
      const items = value[section];
      return <section key={section} className="rounded-xl border border-teal-200 bg-white p-4 md:p-5" data-edit-resource-section={section} onDragOver={event => {
        if (draggedSection.current) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }
      }} onDrop={event => {
        if (!draggedSection.current) return;
        event.preventDefault();
        const from = order.indexOf(draggedSection.current); draggedSection.current = null;
        moveSection(from, sectionIndex);
      }}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-teal-800">
          <button type="button" draggable={!controlsDisabled} disabled={controlsDisabled} className="cursor-grab rounded p-1 hover:bg-teal-50" aria-label={`Arrastrar sección ${sectionLabels[section]}`} title="Arrastra para mover la sección" onDragStart={event => { draggedSection.current = section; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", section); }} onDragEnd={() => { draggedSection.current = null; }}><GripVertical size={18}/></button>
          <Icon size={19}/><h2 className="mr-auto text-lg font-semibold">{sectionLabels[section]}</h2>
          <button type="button" disabled={controlsDisabled || sectionIndex === 0} className={buttonClass} onClick={() => moveSection(sectionIndex, sectionIndex - 1)} aria-label={`Subir sección ${sectionLabels[section]}`}><ArrowUp size={15}/></button>
          <button type="button" disabled={controlsDisabled || sectionIndex === order.length - 1} className={buttonClass} onClick={() => moveSection(sectionIndex, sectionIndex + 1)} aria-label={`Bajar sección ${sectionLabels[section]}`}><ArrowDown size={15}/></button>
          <button type="button" disabled={controlsDisabled || !items.length} className={`${buttonClass} text-red-700`} onClick={() => onChange({ ...value, [section]: [] })} aria-label={`Quitar sección ${sectionLabels[section]}`}><Trash2 size={15}/></button>
        </div>
        <div className={section === "photos" ? "grid gap-4 sm:grid-cols-2" : "space-y-3"}>
          {items.map((item, index) => <article key={`${section}-${index}`} className="min-w-0 rounded-lg border border-dashed border-teal-200 p-3" onDragOver={event => {
            if (draggedItem.current?.section === section) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }
          }} onDrop={event => {
            if (draggedItem.current?.section !== section) return;
            event.preventDefault(); event.stopPropagation();
            moveItem(section, draggedItem.current.index, index); draggedItem.current = null;
          }}>
            <div className="mb-3 flex items-center gap-1.5 text-xs text-teal-800">
              <button type="button" draggable={!controlsDisabled} disabled={controlsDisabled} className="cursor-grab rounded p-1 hover:bg-teal-50" aria-label={`Arrastrar ${sectionLabels[section]} ${index + 1}`} onDragStart={event => { event.stopPropagation(); draggedItem.current = { section, index }; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", `${section}-${index}`); }} onDragEnd={() => { draggedItem.current = null; }}><GripVertical size={16}/></button>
              <span className="mr-auto font-semibold">{section === "photos" ? "Fotografía" : section === "programs" ? "Programa" : "Documento"} {index + 1}</span>
              <button type="button" disabled={controlsDisabled} className={buttonClass} onClick={() => chooseReplacement(section, index)} aria-label={`Reemplazar ${sectionLabels[section]} ${index + 1}`}><Upload size={14}/>Reemplazar</button>
              <button type="button" disabled={controlsDisabled || index === 0} className={buttonClass} onClick={() => moveItem(section, index, index - 1)} aria-label={`Subir ${sectionLabels[section]} ${index + 1}`}><ArrowUp size={14}/></button>
              <button type="button" disabled={controlsDisabled || index === items.length - 1} className={buttonClass} onClick={() => moveItem(section, index, index + 1)} aria-label={`Bajar ${sectionLabels[section]} ${index + 1}`}><ArrowDown size={14}/></button>
              <button type="button" disabled={controlsDisabled} className={`${buttonClass} text-red-700`} onClick={() => onChange({ ...value, [section]: items.filter((_, itemIndex) => itemIndex !== index) })} aria-label={`Quitar ${sectionLabels[section]} ${index + 1}`}><Trash2 size={14}/></button>
            </div>
            {"src" in item ? <div className="space-y-2">
              {safeContentUrl(item.src) && <img src={safeContentUrl(item.src)} alt={item.caption || `Fotografía ${index + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" loading="lazy"/>}
              <label className="block text-xs text-slate-600">Enlace de la fotografía<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={item.src} onChange={event => onChange({ ...value, photos: value.photos.map((photo, photoIndex) => photoIndex === index ? { ...photo, src: event.target.value } : photo) })} placeholder="https://… o /images/…"/></label>
              <label className="block text-xs text-slate-600">Descripción de la fotografía<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={item.caption ?? ""} onChange={event => onChange({ ...value, photos: value.photos.map((photo, photoIndex) => photoIndex === index ? { ...photo, caption: event.target.value } : photo) })}/></label>
            </div> : <div className="space-y-2">
              <label className="block text-xs text-slate-600">Título<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={item.title} onChange={event => updateDocument(section as "programs" | "documents", index, { title: event.target.value })}/></label>
              <button type="button" disabled={controlsDisabled || (!item.url && !item.comingSoon)} className={buttonClass} onClick={() => updateDocument(section as "programs" | "documents", index, { url: "", comingSoon: false })}>Solo título, sin documento</button><button type="button" disabled={controlsDisabled} className={buttonClass} onClick={() => updateDocument(section as "programs" | "documents", index, { url: "", comingSoon: true })}>Documento próximamente</button>
              <label className="block text-xs text-slate-600">Enlace del archivo (opcional)<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={item.url} onChange={event => updateDocument(section as "programs" | "documents", index, { url: event.target.value })} placeholder="https://… o /documents/…"/></label>
              <label className="block text-xs text-slate-600">Descripción<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={item.description ?? ""} onChange={event => updateDocument(section as "programs" | "documents", index, { description: event.target.value })}/></label>
              <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" disabled={controlsDisabled} checked={Boolean(item.private)} onChange={event => updateDocument(section as "programs" | "documents", index, { private: event.target.checked || undefined })}/><Lock size={13}/>Privado: los visitantes deben solicitar acceso</label>
            </div>}
          </article>)}
        </div>
        {!items.length && <p className="mb-3 text-sm text-slate-500">Esta sección no se mostrará hasta que añadas contenido.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={controlsDisabled} className={buttonClass} onClick={() => (section === "photos" ? photosInput : section === "programs" ? programsInput : documentsInput).current?.click()}><Upload size={15}/>{section === "photos" ? "Subir fotografías" : section === "programs" ? "Subir programa" : "Subir documentos"}</button>
          <button type="button" disabled={controlsDisabled} className={buttonClass} onClick={() => onChange(section === "photos" ? { ...value, photos: [...value.photos, { src: "", caption: "" }] } : { ...value, [section]: [...value[section], { title: section === "programs" ? "Nuevo programa" : "Nuevo documento", url: "", description: "" }] })}><Plus size={15}/>Añadir por enlace</button>
        </div>
      </section>;
    })}
    <section className="rounded-xl border border-teal-200 bg-white p-4 md:p-5"><h2 className="mb-4 text-lg font-semibold text-teal-800">Enlaces prácticos</h2><div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-xs text-slate-600">Encuesta de satisfacción<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={value.survey} onChange={event => onChange({ ...value, survey: event.target.value })} placeholder="https://…"/></label>
      <label className="block text-xs text-slate-600">Transporte<input disabled={controlsDisabled} className={`${inputClass} mt-1`} value={value.taxi} onChange={event => onChange({ ...value, taxi: event.target.value })} placeholder="https://…"/></label>
    </div></section>
    {uploading && <p role="status" className="text-sm text-teal-800">Subiendo archivos a {sectionLabels[uploading].toLowerCase()}…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}

