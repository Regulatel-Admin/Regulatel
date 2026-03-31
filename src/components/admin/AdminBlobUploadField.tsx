import { useRef, useState } from "react";
import { Upload, Loader2, X, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { uploadAdminFile, type UploadFolder } from "@/lib/uploads";

export type AdminBlobKind = "image" | "document";

export interface AdminBlobUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind: AdminBlobKind;
  /** Carpeta en Vercel Blob (p. ej. attachments para contenido CMS). */
  folder?: UploadFolder;
  helpText?: string;
  disabled?: boolean;
}

export function AdminBlobUploadField({
  label,
  value,
  onChange,
  kind,
  folder = "attachments",
  helpText,
  disabled = false,
}: AdminBlobUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const accept =
    kind === "image"
      ? "image/jpeg,image/png,image/webp"
      : ".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || disabled) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadAdminFile({ file, kind, folder });
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
    }
  };

  const showImagePreview =
    kind === "image" && value.trim() && !value.toLowerCase().includes(".pdf");

  return (
    <div
      className="rounded-xl border bg-[rgba(22,61,89,0.02)] p-4 space-y-3"
      style={{ borderColor: "var(--regu-gray-200)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="block text-xs font-semibold" style={{ color: "var(--regu-gray-800)" }}>
            {label}
          </span>
          {helpText && (
            <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--regu-gray-500)" }}>
              {helpText}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled || uploading}
            onChange={handleFile}
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold disabled:opacity-50"
            style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                Subiendo…
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 shrink-0" />
                {kind === "image" ? "Subir imagen" : "Subir archivo"}
              </>
            )}
          </button>
          {value.trim() && (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
              Quitar
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      {showImagePreview && (
        <div
          className="flex justify-center rounded-lg border bg-white p-3 overflow-hidden"
          style={{ borderColor: "var(--regu-gray-100)", maxHeight: "200px" }}
        >
          <img src={value} alt="" className="max-h-[180px] w-auto max-w-full object-contain" />
        </div>
      )}

      {kind === "document" && value.trim() && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
          style={{ color: "var(--regu-blue)" }}
        >
          <FileText className="h-4 w-4 shrink-0" />
          Ver / descargar archivo actual
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      )}

      <button
        type="button"
        onClick={() => setManualOpen((o) => !o)}
        className="flex items-center gap-1 text-[11px] font-medium"
        style={{ color: "var(--regu-gray-500)" }}
      >
        {manualOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {manualOpen ? "Ocultar URL manual" : "Pegar URL manual (ruta local u otra CDN)"}
      </button>
      {manualOpen && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === "image" ? "https://… o /images/…" : "https://… o /documents/…"}
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2 text-xs font-mono"
          style={{ borderColor: "var(--regu-gray-200)" }}
        />
      )}

      {!manualOpen && value.trim() && (
        <p className="text-[10px] font-mono truncate" style={{ color: "var(--regu-gray-400)" }} title={value}>
          {value}
        </p>
      )}
    </div>
  );
}
