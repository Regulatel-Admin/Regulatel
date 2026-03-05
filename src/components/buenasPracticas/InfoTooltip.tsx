import { useState, useEffect, useRef, type ReactNode } from "react";

interface InfoTooltipProps {
  content: ReactNode;
  children: ReactNode;
  hideFooter?: boolean;
}

export default function InfoTooltip({
  content,
  children,
  hideFooter = false,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const node = containerRef.current;
      if (!node?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <span
      ref={containerRef}
      className="relative inline-flex cursor-pointer"
      tabIndex={0}
      onClick={() => setOpen((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          return;
        }
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }}
    >
      {children}
      {open && (
        <div
          className="absolute z-50 top-0 right-full mr-3 w-[360px] max-w-[90vw] rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800 shadow-lg"
          style={{ borderColor: "var(--regu-gray-100)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">{content}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar tooltip"
              >
                ×
              </button>
            </div>
            {!hideFooter && (
              <div
                className="pt-2 mt-1 border-t text-[0.68rem]"
                style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-500)" }}
              >
                Para profundizar, use el módulo de recomendaciones en la página.
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
