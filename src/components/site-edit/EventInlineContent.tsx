import { useState, type ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { useEventInlineEditor } from "@/contexts/EventInlineEditContext";
import EventDocumentsSection from "@/components/events/EventDocumentsSection";
import EventAttachmentsField from "@/components/admin/EventAttachmentsField";
import ContentBlocksEditor from "@/components/site-edit/ContentBlocksEditor";
import type { Event, EventAttachment } from "@/types/event";

export function EventEditableText({ field, children, label }: { field: "title" | "description"; children: ReactNode; label: string }) {
  const editor = useEventInlineEditor();
  if (!editor) return <>{children}</>;
  return <span role="textbox" aria-label={label} aria-multiline contentEditable={editor.busy ? false : "plaintext-only"} suppressContentEditableWarning className="cursor-text rounded outline-none hover:ring-1 hover:ring-teal-200 focus:ring-2 focus:ring-teal-300" onBlur={event => editor.patch({ [field]: field === "description" ? event.currentTarget.innerText : event.currentTarget.textContent ?? "" })}>{children || "Pulsa aquí para escribir…"}</span>;
}

export function EventInlineBlocks({ event }: { event: Event }) {
  const editor = useEventInlineEditor();
  if (!editor && event.contentBlocks === undefined) return null;
  return <div className="mt-8"><ContentBlocksEditor blocks={event.contentBlocks ?? []} editing={Boolean(editor)} onChange={editor ? contentBlocks => editor.patch({ contentBlocks }) : undefined} disabled={editor?.busy} onBusyChange={editor?.onBusyChange} folder="events" /></div>;
}

export function EventInlineDocuments({ documents }: { documents: EventAttachment[] }) {
  const editor = useEventInlineEditor();
  const [open, setOpen] = useState(false);
  return <div className="relative">
    <EventDocumentsSection documents={documents} />
    {editor && <button type="button" disabled={editor.busy} onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800"><Pencil size={14} />{documents.length ? "Editar documentos" : "Añadir documentos"}</button>}
    {open && editor && <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/35 p-4 md:p-8" role="dialog" aria-modal="true" aria-label="Documentos del evento"><div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--regu-navy)]">Documentos del evento</h2><button type="button" disabled={editor.busy} onClick={() => setOpen(false)} aria-label="Cerrar documentos" className="rounded-lg p-2 hover:bg-slate-50"><X size={18} /></button></div><EventAttachmentsField value={editor.event.attachments ?? documents} onChange={attachments => editor.patch({ attachments })} disabled={editor.busy} onBusyChange={editor.onBusyChange} /><p className="mt-4 text-xs text-slate-500">Arrastra el asa o usa las flechas. Reemplazar conserva el título y la posición del archivo.</p><button type="button" disabled={editor.busy} onClick={() => setOpen(false)} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Listo</button></div></div>}
  </div>;
}
