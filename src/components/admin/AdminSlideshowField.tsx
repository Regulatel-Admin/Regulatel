import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadAdminFile, type UploadFolder } from "@/lib/uploads";

export default function AdminSlideshowField({
  urls,
  onChange,
  compact = false,
  label = "Fotos del carrusel",
  help,
  folder = "attachments",
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  compact?: boolean;
  label?: string;
  help?: string;
  folder?: UploadFolder;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const addUrl = (url: string) => {
    const next = url.trim();
    if (!next) return;
    onChange([...urls, next]);
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadAdminFile({ file, kind: "image", folder });
      addUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className={compact ? "text-[13px] font-semibold" : "text-sm font-semibold"} style={{ color: "var(--regu-navy)" }}>
          {label}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
          {help ??
            (compact
              ? "Se van turnando detrás del texto. Sube, reordena o quita."
              : "Estas fotos se van turnando detrás del texto de la portada. Sube una imagen o quita las que no quieras.")}
        </p>
      </div>

      <div className={compact ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: "rgba(22,61,89,0.12)" }}
          >
            <div className="relative aspect-[16/10] bg-[rgba(22,61,89,0.04)]">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span
                className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white"
              >
                {index + 1}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 px-2 py-1.5">
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Subir"
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(urls, index, -1))}
                  className="rounded-md p-1 hover:bg-[rgba(68,137,198,0.1)] disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Bajar"
                  disabled={index === urls.length - 1}
                  onClick={() => onChange(moveItem(urls, index, 1))}
                  className="rounded-md p-1 hover:bg-[rgba(68,137,198,0.1)] disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                aria-label="Quitar foto"
                onClick={() => onChange(urls.filter((_, current) => current !== index))}
                className="rounded-md p-1 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold disabled:opacity-60 ${
            compact ? "min-h-[5.5rem] py-4" : "aspect-[16/10]"
          }`}
          style={{ borderColor: "rgba(68,137,198,0.45)", color: "var(--regu-blue)" }}
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          {uploading ? "Subiendo…" : "Añadir foto"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFile}
      />

      {error && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setManualOpen((open) => !open)}
        className="inline-flex items-center gap-1 text-[11px] font-medium"
        style={{ color: "var(--regu-gray-500)" }}
      >
        <Upload className="h-3.5 w-3.5" />
        {manualOpen ? "Ocultar pegar enlace" : "Pegar enlace de una foto"}
      </button>
      {manualOpen && (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="/1a.jpg o https://…"
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--regu-gray-200)" }}
          />
          <button
            type="button"
            onClick={() => {
              addUrl(manualUrl);
              setManualUrl("");
            }}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            Añadir
          </button>
        </div>
      )}
    </div>
  );
}

function moveItem(urls: string[], index: number, direction: -1 | 1) {
  const next = urls.slice();
  const target = index + direction;
  if (target < 0 || target >= next.length) return urls;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
