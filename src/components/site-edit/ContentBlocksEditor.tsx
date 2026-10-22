import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, FileText, GripVertical, ImagePlus, Pencil, Plus, Replace, Trash2, Type, Upload } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";
import { moveContentBlock, newContentBlock, safeContentUrl, type ContentBlock, type ContentBlockType } from "@/types/contentBlocks";

const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-40";
const input = "w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-200";

export default function ContentBlocksEditor({ blocks, onChange, editing = false, folder = "events", renderText, disabled = false, onBusyChange }: {
  blocks: ContentBlock[]; onChange?: (blocks: ContentBlock[]) => void; editing?: boolean;
  folder?: "news" | "events"; renderText?: (text: string) => ReactNode;
  disabled?: boolean; onBusyChange?: (busy: boolean) => void;
}) {
  const dragged = useRef<string | null>(null);
  const images = useRef<HTMLInputElement>(null), documents = useRef<HTMLInputElement>(null), replacement = useRef<HTMLInputElement>(null);
  const replaceId = useRef<string | null>(null), uploadLock = useRef(false);
  const [uploading, setUploading] = useState(false), [activeId, setActiveId] = useState<string | null>(null), [adding, setAdding] = useState(false), [error, setError] = useState<string | null>(null);
  const latest = useRef(blocks); latest.current = blocks;
  const changeRef = useRef(onChange); changeRef.current = onChange;
  const editable = editing && Boolean(onChange), busy = disabled || uploading;
  const patch = (id: string, values: Partial<ContentBlock>) => changeRef.current?.(latest.current.map(block => block.id === id ? { ...block, ...values } : block));
  const add = (type: ContentBlockType) => { const block = newContentBlock(type); onChange?.([...blocks, block]); setActiveId(block.id); setAdding(false); };
  const move = (from: number, to: number) => onChange?.(moveContentBlock(blocks, from, to));
  const upload = async (files: FileList | null, type: "image" | "document", target?: string) => {
    if (!files?.length || uploadLock.current || disabled) return;
    uploadLock.current = true; setUploading(true); onBusyChange?.(true); setError(null);
    const added: ContentBlock[] = [];
    try {
      for (const file of Array.from(files)) {
        const result = await uploadAdminFile({ file, kind: type, folder });
        const values = { url: result.url, fileName: result.fileName || file.name, fileType: result.mimeType || file.type, fileSize: result.size ?? file.size };
        if (target) { patch(target, values); break; }
        added.push(newContentBlock(type, { ...values, title: file.name.replace(/\.[^.]+$/, ""), caption: "" }));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo subir. Se conserva el archivo anterior."); }
    finally { if (added.length) changeRef.current?.([...latest.current, ...added]); uploadLock.current = false; setUploading(false); onBusyChange?.(false); replaceId.current = null; for (const ref of [images, documents, replacement]) if (ref.current) ref.current.value = ""; }
  };
  return <div className="space-y-6" data-content-editor={editable ? "editing" : "published"}>
    {editable && <input ref={replacement} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,.pdf,.doc,.docx,.xls,.xlsx" onChange={event => { const id = replaceId.current; const block = latest.current.find(item => item.id === id); if (block && id) void upload(event.target.files, block.type === "image" ? "image" : "document", id); }} />}
    {blocks.map((block, index) => {
      const url = safeContentUrl(block.url), active = editable && activeId === block.id, text = block.type === "text" || block.type === "heading";
      const content = block.type === "text" ? active
        ? <textarea autoFocus aria-label={`Texto del bloque ${index + 1}`} disabled={busy} className="min-h-[100px] w-full resize-y rounded-lg border border-teal-200 bg-transparent p-2 text-base leading-relaxed outline-none" value={block.text ?? ""} onChange={event => patch(block.id, { text: event.target.value })} placeholder="Escribe aquí…" />
        : renderText ? renderText(block.text ?? "") : <p className="whitespace-pre-wrap text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>{block.text || (editable ? "Pulsa aquí para escribir…" : "")}</p>
        : block.type === "heading" ? active
          ? <input autoFocus aria-label={`Título del bloque ${index + 1}`} disabled={busy} className={`${input} text-xl font-bold`} value={block.text ?? ""} onChange={event => patch(block.id, { text: event.target.value })} placeholder="Título de sección" />
          : <h2 className="text-xl font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>{block.text || (editable ? "Pulsa para escribir un título…" : "")}</h2>
        : block.type === "image" ? <figure>{url ? <img src={url} alt={block.caption || block.title || "Imagen del artículo"} className="mx-auto h-auto max-w-full rounded-xl" loading="lazy" /> : editable && <div className="rounded-xl border border-dashed border-teal-200 p-8 text-center text-sm text-teal-700">Sube una imagen o pega su enlace.</div>}{block.caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{block.caption}</figcaption>}</figure>
        : <a href={url || undefined} target="_blank" rel="noopener noreferrer" onClick={event => { if (editable) { event.preventDefault(); if (!busy) setActiveId(active ? null : block.id); } }} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 font-semibold hover:border-sky-400" style={{ color: "var(--regu-blue)" }}><FileText size={21} /><span className="min-w-0 flex-1">{block.title || "Documento"}</span>{editable && <Pencil size={15} />}</a>;
      if (!editable) return <div key={block.id}>{content}</div>;
      return <section key={block.id} className="group relative min-w-0 rounded-xl outline outline-1 outline-transparent hover:outline-teal-200 focus-within:outline-teal-300" onDragOver={event => { if (dragged.current) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }} onDrop={event => { event.preventDefault(); const from = blocks.findIndex(item => item.id === dragged.current); dragged.current = null; if (from >= 0) move(from, index); }}>
        <div className={`relative z-10 mb-1 flex items-center justify-end gap-1 text-xs text-teal-700 md:absolute md:-top-8 md:right-0 md:mb-0 ${active ? "" : "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"}`}>
          <button type="button" disabled={busy} draggable={!busy} onDragStart={event => { dragged.current = block.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", block.id); }} onDragEnd={() => { dragged.current = null; }} aria-label={`Arrastrar bloque ${index + 1}`} title="Arrastrar para mover" className={`${btn} cursor-grab`}><GripVertical size={15} /></button>
          <button type="button" disabled={busy} onClick={() => setActiveId(active ? null : block.id)} className={btn} aria-label={`${active ? "Terminar" : "Editar"} bloque ${index + 1}`}>{active ? <Check size={14} /> : <Pencil size={14} />}</button>
          {!text && block.type !== "document" && <button type="button" disabled={busy} onClick={() => { replaceId.current = block.id; replacement.current?.click(); }} className={btn} aria-label={`Reemplazar archivo del bloque ${index + 1}`}><Replace size={14} />Reemplazar</button>}
          <button type="button" disabled={busy || index === 0} onClick={() => move(index, index - 1)} className={btn} aria-label={`Subir bloque ${index + 1}`}><ArrowUp size={14} /></button><button type="button" disabled={busy || index === blocks.length - 1} onClick={() => move(index, index + 1)} className={btn} aria-label={`Bajar bloque ${index + 1}`}><ArrowDown size={14} /></button><button type="button" disabled={busy} onClick={() => onChange?.(blocks.filter(item => item.id !== block.id))} className={btn} style={{ color: "#b91c1c" }} aria-label={`Quitar bloque ${index + 1}`}><Trash2 size={14} /></button>
        </div>
        <div onClick={() => { if (text && !busy && !active) setActiveId(block.id); }} className={text && !active ? "cursor-text" : undefined}>{content}</div>
        {block.type === "document" && <button type="button" disabled={busy} onClick={() => { replaceId.current = block.id; replacement.current?.click(); }} className={`${btn} mt-2`} aria-label={`Reemplazar archivo del bloque ${index + 1}`}><Replace size={14} />Reemplazar archivo</button>}
        {active && !text && <div className="mt-2 space-y-2 rounded-xl border border-teal-200 bg-white p-3"><input aria-label={`${block.type === "image" ? "Enlace de imagen" : "Enlace de documento"} ${index + 1}`} disabled={busy} className={input} value={block.url ?? ""} onChange={event => patch(block.id, { url: event.target.value })} placeholder="https://… o /documents/…" /><input aria-label={`${block.type === "image" ? "Descripción de imagen" : "Título de documento"} ${index + 1}`} disabled={busy} className={input} value={block.type === "image" ? block.caption ?? "" : block.title ?? ""} onChange={event => patch(block.id, block.type === "image" ? { caption: event.target.value } : { title: event.target.value })} placeholder={block.type === "image" ? "Descripción de la imagen" : "Título del documento"} /><button type="button" className={btn} onClick={() => setActiveId(null)}><Check size={14} />Listo</button></div>}
      </section>;
    })}
    {editable && <div className="relative border-t border-dashed border-teal-200 pt-4"><input ref={images} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => void upload(event.target.files, "image")} /><input ref={documents} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="sr-only" onChange={event => void upload(event.target.files, "document")} /><button type="button" disabled={busy} onClick={() => setAdding(!adding)} className={btn}><Plus size={15} />Añadir contenido</button>
      {adding && <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-teal-100 bg-white p-3"><button type="button" disabled={busy} onClick={() => add("text")} className={btn}><Plus size={15} />Texto</button><button type="button" disabled={busy} onClick={() => add("heading")} className={btn}><Type size={15} />Título</button><button type="button" disabled={busy} onClick={() => images.current?.click()} className={btn}><ImagePlus size={15} />Imágenes</button><button type="button" disabled={busy} onClick={() => documents.current?.click()} className={btn}><Upload size={15} />Documentos</button><details className="w-full text-xs text-teal-800"><summary className="cursor-pointer">Añadir mediante un enlace</summary><div className="mt-2 flex gap-2"><button type="button" disabled={busy} onClick={() => add("image")} className={btn}>Imagen por enlace</button><button type="button" disabled={busy} onClick={() => add("document")} className={btn}>Documento por enlace</button></div></details></div>}{uploading && <p role="status" className="mt-3 text-sm text-teal-800">Subiendo archivo…</p>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>}
  </div>;
}
