import { useRef, useState } from "react";
import { FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadAdminFile } from "@/lib/uploads";
import type { EventAttachment } from "@/types/event";

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
}: {
  value: EventAttachment[];
  onChange: (next: EventAttachment[]) => void;
  disabled?: boolean;
  folder?: "news" | "events" | "documents" | "attachments";
  label?: string;
  hint?: string;
  emptyHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;
    setError(null);
    setUploading(true);
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
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
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
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={disabled || uploading}
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
            >
              <div className="flex items-start gap-2">
                <FileText className="mt-2 h-4 w-4 shrink-0" style={{ color: "var(--regu-blue)" }} />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.title}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange(value.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)))
                    }
                    placeholder="Título del documento"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  />
                  {!item.fileName ? (
                    <input
                      type="text"
                      value={item.url}
                      disabled={disabled}
                      placeholder="https://… o /documents/archivo.pdf"
                      onChange={(e) =>
                        onChange(value.map((row, i) => (i === index ? { ...row, url: e.target.value } : row)))
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
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                  aria-label="Quitar documento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onChange([
            ...value,
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
