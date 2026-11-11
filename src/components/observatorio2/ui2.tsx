/**
 * Panel 2 del Observatorio — piezas visuales compartidas (estilo editorial).
 * Aislado del Panel 1: no modifica ningún componente existente.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Clock3, Minus, X } from "lucide-react";
import type { Estado } from "@/data/observatorio/schema";

export const P2 = {
  navy: "#12344A",
  navyBand: "#163D59",
  teal: "#1F7F8C",
  tealSoft: "#E6F2F3",
  line: "#DDE5EA",
  bgSoft: "#F3F6F7",
  text: "#1E2B36",
  muted: "#5B6B78",
  serif: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
};

/** Carga la tipografía serif solo cuando se visita el Panel 2 */
export function useSerifFont() {
  useEffect(() => {
    const id = "obs2-serif-font";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/** Código corto de país para encabezados compactos (RD y VEN como en el uso regional) */
export const CODIGO: Record<string, string> = {
  ar: "ARG", bo: "BOL", br: "BRA", cl: "CHL", co: "COL", cr: "CRI", cu: "CUB", ec: "ECU", sv: "SLV", es: "ESP", gt: "GTM",
  hn: "HND", it: "ITA", mx: "MEX", ni: "NIC", pa: "PAN", py: "PRY", pe: "PER", pt: "PRT", pr: "PRI", do: "RD", uy: "URY", ve: "VEN",
};

const PILL: Record<Estado, { bg: string; fg: string; texto: string }> = {
  si: { bg: "#E3F3E8", fg: "#2B7A4B", texto: "Sí" },
  parcial: { bg: "#FFF0D2", fg: "#9A5B00", texto: "En proceso" },
  no: { bg: "#FDE6E6", fg: "#B42318", texto: "No" },
  sin_dato: { bg: "#EEF1F3", fg: "#667685", texto: "Sin dato" },
};

export function Pill2({ estado, grande = false }: { estado: Estado; grande?: boolean }) {
  const p = PILL[estado];
  const s = grande ? 18 : 14;
  const Icono = estado === "si" ? Check : estado === "parcial" ? Clock3 : estado === "no" ? X : Minus;
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold"
      style={{ background: p.bg, color: p.fg, padding: grande ? "8px 16px" : "4px 11px", fontSize: grande ? "1.125rem" : "0.8125rem" }}
    >
      <Icono size={s} strokeWidth={2.6} aria-hidden />
      {p.texto}
    </span>
  );
}

export function Eyebrow({ children, color = P2.teal }: { children: ReactNode; color?: string }) {
  return (
    <p className="flex items-center gap-3 text-[0.75rem] font-bold uppercase tracking-[0.18em]" style={{ color }}>
      <span className="inline-block h-[2px] w-10" style={{ background: color }} />
      {children}
    </p>
  );
}

export function Caps({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[0.6875rem] font-bold uppercase tracking-[0.16em] ${className}`} style={{ color: P2.muted }}>
      {children}
    </p>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-3 text-[0.9375rem]" style={{ color: P2.muted }}>
      <span className="relative inline-flex h-6 w-10 items-center rounded-full transition" style={{ background: checked ? P2.teal : "#D5DDE3" }}>
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="inline-block h-5 w-5 rounded-full bg-white shadow transition" style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }} />
      </span>
      {label}
    </label>
  );
}

/** Menú desplegable simple (Exportar, etc.) */
export function Desplegable({ boton, children, align = "right" }: { boton: (abierto: boolean) => ReactNode; children: (cerrar: () => void) => ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{boton(open)}</div>
      {open && (
        <div className={`absolute z-40 mt-2 min-w-[220px] overflow-hidden rounded-xl border bg-white p-1.5 shadow-xl ${align === "right" ? "right-0" : "left-0"}`} style={{ borderColor: P2.line }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function ChevronSelect({ abierto }: { abierto: boolean }) {
  return <ChevronDown className={`h-5 w-5 shrink-0 transition ${abierto ? "rotate-180" : ""}`} style={{ color: P2.navy }} />;
}
