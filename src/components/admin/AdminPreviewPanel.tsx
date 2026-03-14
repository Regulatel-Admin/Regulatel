/**
 * Split layout for admin editors: form on the left, live preview on the right.
 * Optional device toggle (desktop / tablet / mobile) for preview width.
 */
import { useState, type ReactNode } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

type DevicePreset = "desktop" | "tablet" | "mobile";

const WIDTHS: Record<DevicePreset, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

interface AdminPreviewPanelProps {
  children: ReactNode;
  preview: ReactNode;
  previewLabel?: string;
  className?: string;
}

export default function AdminPreviewPanel({
  children,
  preview,
  previewLabel = "Vista previa",
  className = "",
}: AdminPreviewPanelProps) {
  const [device, setDevice] = useState<DevicePreset>("desktop");

  return (
    <div
      className={`grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] xl:grid-cols-[minmax(0,480px)_1fr] ${className}`}
      style={{ minHeight: "calc(100vh - 12rem)" }}
    >
      {/* Editor / form */}
      <div className="min-w-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        {children}
      </div>

      {/* Preview */}
      <div
        className="relative rounded-xl border bg-white shadow-sm"
        style={{
          borderColor: "var(--regu-gray-100)",
          backgroundColor: "var(--regu-offwhite)",
        }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--regu-gray-100)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--regu-gray-700)" }}>
            {previewLabel}
          </span>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--regu-gray-100)" }}>
            {(["desktop", "tablet", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className="rounded-md p-2 transition"
                style={{
                  backgroundColor: device === d ? "var(--regu-white)" : "transparent",
                  color: device === d ? "var(--regu-blue)" : "var(--regu-gray-500)",
                  boxShadow: device === d ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
                aria-pressed={device === d}
                aria-label={d === "desktop" ? "Vista escritorio" : d === "tablet" ? "Vista tablet" : "Vista móvil"}
              >
                {d === "desktop" && <Monitor className="h-4 w-4" />}
                {d === "tablet" && <Tablet className="h-4 w-4" />}
                {d === "mobile" && <Smartphone className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex min-h-[420px] items-start justify-center overflow-auto p-6"
          style={{ backgroundColor: "var(--regu-gray-100)" }}
        >
          <div
            className="w-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200"
            style={{
              maxWidth: WIDTHS[device],
              minHeight: device === "mobile" ? 500 : 400,
            }}
          >
            {preview}
          </div>
        </div>
      </div>
    </div>
  );
}
