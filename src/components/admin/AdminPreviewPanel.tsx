/**
 * Editor a la izquierda, vista previa a la derecha.
 * Escritorio / tablet / móvil usan un marco con ancho real y container queries,
 * para que el contenido se reorganice como en ese aparato (no como en la ventana del admin).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

type DevicePreset = "desktop" | "tablet" | "mobile";

const DEVICES: Record<
  DevicePreset,
  { width: number; minHeight: number; radius: number; label: string }
> = {
  mobile: { width: 390, minHeight: 720, radius: 28, label: "Móvil · 390 px" },
  tablet: { width: 768, minHeight: 820, radius: 18, label: "Tablet · 768 px" },
  desktop: { width: 1200, minHeight: 640, radius: 12, label: "Escritorio · 1200 px" },
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
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const spec = DEVICES[device];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      const available = Math.max(160, host.clientWidth - 40);
      setScale(Math.min(1, available / spec.width));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [spec.width]);

  return (
    <div
      className={`grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr] xl:grid-cols-[minmax(0,560px)_1fr] ${className}`}
      style={{ minHeight: "calc(100vh - 12rem)" }}
    >
      <div className="min-w-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">{children}</div>

      <div
        className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
        style={{ borderColor: "var(--regu-gray-100)" }}
      >
        <div
          className="flex items-center justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--regu-gray-700)" }}>
              {previewLabel}
            </p>
            <p className="text-[11px]" style={{ color: "var(--regu-gray-400)" }}>
              {spec.label}
              {scale < 0.99 ? ` · vista al ${Math.round(scale * 100)}%` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--regu-gray-100)" }}>
            {(["desktop", "tablet", "mobile"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDevice(item)}
                className="rounded-md p-2 transition"
                style={{
                  backgroundColor: device === item ? "var(--regu-white)" : "transparent",
                  color: device === item ? "var(--regu-blue)" : "var(--regu-gray-500)",
                  boxShadow: device === item ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
                aria-pressed={device === item}
                aria-label={DEVICES[item].label}
              >
                {item === "desktop" && <Monitor className="h-4 w-4" />}
                {item === "tablet" && <Tablet className="h-4 w-4" />}
                {item === "mobile" && <Smartphone className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={hostRef}
          className="min-h-[420px] flex-1 overflow-auto p-5"
          style={{ backgroundColor: "#e8edf2" }}
        >
          <div
            className="mx-auto"
            style={{
              width: spec.width * scale,
              minHeight: spec.minHeight * scale,
            }}
          >
            <div
              className="@container overflow-hidden bg-white shadow-xl"
              style={{
                width: spec.width,
                minHeight: spec.minHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                borderRadius: spec.radius,
                border: device === "mobile" ? "10px solid #1a2330" : "1px solid rgba(22,61,89,0.12)",
                ["--hero-min-height" as string]: device === "mobile" ? "420px" : "520px",
              }}
            >
              {preview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
