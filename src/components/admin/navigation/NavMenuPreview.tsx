import { ChevronRight, ExternalLink, Lock } from "lucide-react";
import type { NavigationItem } from "@/data/navigation";
import { SPECIAL_NAV_IDS } from "@/lib/navigationModel";

export default function NavMenuPreview({ items }: { items: NavigationItem[] }) {
  return (
    <div className="p-5">
      <p
        className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "var(--regu-gray-400)" }}
      >
        Cómo queda el menú
      </p>
      <div
        className="mb-5 flex flex-wrap gap-1 rounded-xl border px-2 py-2"
        style={{ borderColor: "rgba(22,61,89,0.10)", backgroundColor: "#FAFBFC" }}
      >
        {items.map((item) => (
          <span
            key={item.uid || item.id}
            className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em]"
            style={{ color: "var(--regu-navy)", backgroundColor: "rgba(68,137,198,0.10)" }}
          >
            {item.label || "Sin nombre"}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.uid || item.id}
            className="rounded-xl border bg-white px-4 py-3"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                {item.label || "Sin nombre"}
              </p>
              {item.href && (
                <span className="truncate text-[11px]" style={{ color: "var(--regu-gray-400)" }}>
                  {item.href}
                </span>
              )}
            </div>
            {SPECIAL_NAV_IDS[item.id] && (
              <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                Menú especial en el sitio
              </p>
            )}
            {item.columns && item.columns.length > 0 && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {item.columns.map((column) => (
                  <div key={column.uid || column.title}>
                    <p
                      className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                      style={{ color: "var(--regu-blue)" }}
                    >
                      {column.title || "Columna"}
                    </p>
                    <ul className="space-y-1">
                      {column.links.map((link) => (
                        <li
                          key={link.uid || `${link.href}-${link.label}`}
                          className="flex items-start gap-1.5 text-xs"
                          style={{ color: "var(--regu-gray-700)" }}
                        >
                          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" style={{ color: "var(--regu-blue)" }} />
                          <span>
                            {link.label || "Sin etiqueta"}
                            {link.external && <ExternalLink className="ml-1 inline h-3 w-3 opacity-60" />}
                            {link.restricted && <Lock className="ml-1 inline h-3 w-3 opacity-60" />}
                            {link.description && (
                              <span className="mt-0.5 block" style={{ color: "var(--regu-gray-400)" }}>
                                {link.description}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
