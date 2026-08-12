import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import type { SiteEditTarget } from "@/lib/siteEdit";

const badgeClass =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm";

export function EditableSpot({
  target,
  label,
  children,
  className = "",
}: {
  target: SiteEditTarget;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const { enabled, open } = useSiteEdit();
  if (!enabled) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          open(target);
        }}
        className="absolute inset-0 z-[20] rounded-[inherit] border-2 border-dashed border-transparent transition hover:border-[#0f766e] hover:bg-[rgba(15,118,110,0.08)]"
        aria-label={label}
      />
      <span className={`pointer-events-none absolute right-2 top-2 z-[21] ${badgeClass}`} style={{ backgroundColor: "#0f766e" }}>
        <Pencil className="h-3 w-3" aria-hidden />
        Editar
      </span>
    </div>
  );
}

export function SiteEditBadge({
  target,
  label,
  className = "left-2 top-2",
}: {
  target: SiteEditTarget;
  label: string;
  className?: string;
}) {
  const { enabled, open } = useSiteEdit();
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(target);
      }}
      className={`absolute z-[22] ${badgeClass} ${className}`}
      style={{ backgroundColor: "#0f766e" }}
      aria-label={label}
    >
      <Pencil className="h-3 w-3" aria-hidden />
      Editar
    </button>
  );
}
