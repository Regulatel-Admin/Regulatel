import { Redo2, Undo2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";

export function SiteEditUndoRedo({ variant }: { variant: "bar" | "drawer" }) {
  const { undo, redo, canUndo, canRedo, historyBusy } = useSiteEdit();
  const isBar = variant === "bar";

  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40";
  const idle = isBar
    ? "bg-white/15 text-white hover:bg-white/25 disabled:hover:bg-white/15"
    : "border text-[var(--regu-navy)] hover:bg-slate-50 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => void undo()}
        disabled={!canUndo || historyBusy}
        title="Deshacer (Ctrl+Z)"
        aria-label="Deshacer"
        className={`${base} ${idle}`}
        style={isBar ? undefined : { borderColor: "rgba(22,61,89,0.14)" }}
      >
        <Undo2 className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Deshacer</span>
      </button>
      <button
        type="button"
        onClick={() => void redo()}
        disabled={!canRedo || historyBusy}
        title="Rehacer (Ctrl+Y)"
        aria-label="Rehacer"
        className={`${base} ${idle}`}
        style={isBar ? undefined : { borderColor: "rgba(22,61,89,0.14)" }}
      >
        <Redo2 className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Rehacer</span>
      </button>
    </div>
  );
}
