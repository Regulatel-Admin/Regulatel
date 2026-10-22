import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, GripVertical, Loader2, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";
import type { EventAttachment } from "@/types/event";
import { moveContentBlock } from "@/types/contentBlocks";

const documentAccept = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const rowButtonClass = "inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-50 disabled:opacity-40";

function newAttachmentId() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export default function EventAttachmentsField({
  value,
  onChange,
  disabled = false,
  folder = "events",
  label = "Documentos (Leer más)",
  hint = "PDF o Word que se muestran al abrir el evento. Puede subir varios y cambiar el título.",
  emptyHint = "Todavía no hay documentos. Suba el boletín o la nota de prensa para que aparezcan en Leer más.",
  onBusyChange,
}: {
  value: EventAttachment[];
  onChange: (next: EventAttachment[]) => void;
  disabled?: boolean;
  folder?: "news" | "events" | "documents" | "attachments";
  label?: string;
  hint?: string;
  emptyHint?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replacementInput = useRef<HTMLInputElement>(null);
  const replacementTarget = useRef<string | null>(null);
  const dragged = useRef<string | null>(null);
  const valueRef = useRef(value);
  const changeRef = useRef(onChange);
  const busyChangeRef = useRef(onBusyChange);
  const disabledRef = useRef(disabled);
  const uploadInFlight = useRef(false);
  valueRef.current = value;
  changeRef.current = onChange;
  busyChangeRef.current = onBusyChange;
  disabledRef.current = disabled;
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controlsDisabled = disabled || uploading;

  const commit = (next: EventAttachment[]) => {
    valueRef.current = next;
    changeRef.current(next);
  };

  const moveAttachment = (sourceId: string, targetId: string) => {
    if (disabledRef.current || uploadInFlight.current) return;
    const current = valueRef.current;
    const from = current.findIndex(item => item.id === sourceId);
    const to = current.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    commit(moveContentBlock(current, from, to));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabledRef.current || uploadInFlight.current) return;
    uploadInFlight.current = true;
    setError(null);
    setUploading(true);
    busyChangeRef.current?.(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const res = await uploadAdminFile({ file, kind: "document", folder });
          const attachment: EventAttachment = {
            id: newAttachmentId(),
            title: titleFromFileName(res.fileName || file.name) || file.name,
            url: res.url,
            fileName: res.fileName || file.name,
            fileType: res.mimeType || file.type,
            fileSize: res.size ?? file.size,
          };
          return attachment;
        })
      );
      commit([...valueRef.current, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      uploadInFlight.current = false;
      busyChangeRef.current?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const replaceFile = async (files: FileList | null) => {
    const file = files?.[0];
    const targetId = replacementTarget.current;
    if (!file || !targetId || disabledRef.current || uploadInFlight.current) return;
    if (!valueRef.current.some(item => item.id === targetId)) return;
    uploadInFlight.current = true;
    setUploading(true);
    setReplacingId(targetId);
    setError(null);
    busyChangeRef.current?.(true);
    try {
      const result = await uploadAdminFile({ file, kind: "document", folder });
      const current = valueRef.current;
      if (!current.some(item => item.id === targetId)) throw new Error("El documento ya no está en esta lista. No se cambió ningún adjunto.");
      commit(current.map(item => item.id === targetId ? {
        ...item,
        url: result.url,
        fileName: result.fileName || file.name,
        fileType: result.mimeType || file.type,
        fileSize: result.size ?? file.size,
      } : item));
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo reemplazar el archivo. El documento anterior se conserva.");
    } finally {
      uploadInFlight.current = false;
      setUploading(false);
      setReplacingId(null);
      replacementTarget.current = null;
      busyChangeRef.current?.(false);
      if (replacementInput.current) replacementInput.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input ref={replacementInput} type="file" accept={documentAccept} className="sr-only" disabled={controlsDisabled}
        aria-label="Seleccionar archivo para reemplazar documento" onChange={event => void replaceFile(event.target.files)} />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
            {label}
          </span>
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--regu-gray-500)" }}>
            {hint}
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={documentAccept}
            multiple
            className="sr-only"
            disabled={controlsDisabled}
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={controlsDisabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold disabled:opacity-50"
            style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Subiendo…" : "Subir archivo"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      {value.length === 0 ? (
        <p
          className="rounded-xl border border-dashed px-4 py-3 text-xs"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-500)" }}
        >
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li
              key={item.id || `${item.url}-${index}`}
              className="rounded-xl border bg-white p-3"
              style={{ borderColor: "var(--regu-gray-200)" }}
              onDragOver={event => {
                if (!dragged.current || controlsDisabled) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={event => {
                event.preventDefault();
                const source = dragged.current;
                dragged.current = null;
                if (source) moveAttachment(source, item.id);
              }}
            >
              <div className="mb-2 flex flex-wrap items-center gap-1 text-xs" style={{ color: "var(--regu-gray-600)" }}>
                <button type="button" disabled={controlsDisabled} draggable={!controlsDisabled}
                  className={`${rowButtonClass} cursor-grab active:cursor-grabbing`} aria-label={`Arrastrar documento ${index + 1}`} title="Arrastrar para ordenar"
                  onDragStart={event => {
                    if (disabledRef.current || uploadInFlight.current) { event.preventDefault(); return; }
                    dragged.current = item.id;
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", item.id);
                  }} onDragEnd={() => { dragged.current = null; }}>
                  <GripVertical className="h-4 w-4" aria-hidden />
                </button>
                <FileText className="h-4 w-4" style={{ color: "var(--regu-blue)" }} aria-hidden />
                <span className="mr-auto">Documento {index + 1}</span>
                <button type="button" disabled={controlsDisabled || index === 0} className={rowButtonClass}
                  onClick={() => moveAttachment(item.id, value[index - 1].id)} aria-label={`Subir documento ${index + 1}`} title="Subir documento">
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" disabled={controlsDisabled || index === value.length - 1} className={rowButtonClass}
                  onClick={() => moveAttachment(item.id, value[index + 1].id)} aria-label={`Bajar documento ${index + 1}`} title="Bajar documento">
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" disabled={controlsDisabled} className={`${rowButtonClass} gap-1 font-semibold`}
                  onClick={() => { replacementTarget.current = item.id; replacementInput.current?.click(); }}
                  aria-label={`Reemplazar archivo de ${item.title || `documento ${index + 1}`}`}>
                  {replacingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden />}
                  {replacingId === item.id ? "Reemplazando…" : "Reemplazar"}
                </button>
                <button type="button" disabled={controlsDisabled} onClick={() => commit(valueRef.current.filter(row => row.id !== item.id))}
                  className={`${rowButtonClass} text-red-700 hover:bg-red-50`} aria-label={`Quitar documento ${index + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.title}
                    disabled={controlsDisabled}
                    onChange={(e) =>
                      commit(valueRef.current.map(row => row.id === item.id ? { ...row, title: e.target.value } : row))
                    }
                    placeholder="Título del documento"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  />
                  {!item.fileName ? (
                    <input
                      type="text"
                      value={item.url}
                      disabled={controlsDisabled}
                      placeholder="https://… o /documents/archivo.pdf"
                      onChange={(e) =>
                        commit(valueRef.current.map(row => row.id === item.id ? { ...row, url: e.target.value } : row))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--regu-gray-100)" }}
                    />
                  ) : (
                    <p className="truncate text-[11px]" style={{ color: "var(--regu-gray-500)" }}>
                      {item.fileName}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={controlsDisabled}
        onClick={() =>
          commit([
            ...valueRef.current,
            { id: newAttachmentId(), title: "", url: "", fileName: "", fileType: "" },
          ])
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: "var(--regu-blue)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        Pegar un enlace
      </button>
    </div>
  );
}
