import { formatStorageBytes } from "@/lib/blobStorage";
import { useBlobStorage } from "@/contexts/BlobStorageContext";

export function AdminBlobStorageBar({ variant }: { variant: "sidebar" | "field" }) {
  const { usage } = useBlobStorage();
  if (!usage) return null;

  const percent = Math.max(0, Math.min(100, usage.percent));
  const barColor =
    percent >= 95 ? "#b91c1c" : percent >= 80 ? "#d97706" : "var(--regu-blue)";
  const compact = variant === "sidebar";

  return (
    <div className={compact ? "px-2 py-2" : "pt-1"} aria-live="polite">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p
          className={compact ? "text-[10px] font-semibold" : "text-[11px] font-semibold"}
          style={{ color: "var(--regu-gray-700)" }}
        >
          Espacio de archivos
        </p>
        <p className="text-[10px] tabular-nums" style={{ color: "var(--regu-gray-500)" }}>
          {formatStorageBytes(usage.usedBytes)} / {formatStorageBytes(usage.limitBytes)}
        </p>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(22,61,89,0.10)" }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={`Espacio de archivos: ${formatStorageBytes(usage.usedBytes)} de ${formatStorageBytes(usage.limitBytes)}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
      <p
        className={compact ? "mt-1 text-[10px] leading-snug" : "mt-1 text-[11px] leading-snug"}
        style={{ color: percent >= 80 ? barColor : "var(--regu-gray-500)" }}
      >
        {usage.lastAddedBytes
          ? `Este archivo ocupó ${formatStorageBytes(usage.lastAddedBytes)}. Quedan ${formatStorageBytes(usage.remainingBytes)}.`
          : `Quedan ${formatStorageBytes(usage.remainingBytes)} hasta el límite.`}
      </p>
    </div>
  );
}
