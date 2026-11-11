import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { PerfilPais } from "@/data/observatorio/schema";
import { REGION_BY_ISO } from "@/data/observatorio/schema";
import { nombreCorto } from "@/lib/observatorio";
import { Flag } from "./ui";

const REGIONES = ["Sudamérica", "Centroamérica, México y el Caribe", "Europa"] as const;

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

interface Props {
  label: string;
  color: string;
  value: PerfilPais | null;
  options: PerfilPais[];
  disabledIso?: string;
  onChange: (iso: string) => void;
  align?: "left" | "right";
  /** Versión compacta para la barra de comparación */
  compact?: boolean;
}

export default function CountryPicker({ label, color, value, options, disabledIso, onChange, align = "left", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const grouped = useMemo(() => {
    const n = norm(q.trim());
    const list = options.filter((p) => !n || norm(p.pais).includes(n) || norm(p.regulador.sigla).includes(n));
    return REGIONES.map((r) => ({ region: r, items: list.filter((p) => REGION_BY_ISO[p.iso] === r) })).filter((g) => g.items.length);
  }, [options, q]);

  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <p className={`flex items-center gap-2 font-bold uppercase tracking-[0.14em] ${compact ? "mb-1 text-[0.625rem]" : "mb-2 text-[0.6875rem]"}`} style={{ color }}>
        <span className={`inline-block rounded-full ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} style={{ background: color }} />
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group flex w-full items-center gap-3 rounded-2xl border-2 bg-white text-left transition hover:shadow-md focus:outline-none focus-visible:ring-4 ${compact ? "px-3 py-2" : "min-h-[84px] px-4 py-3"}`}
        style={{ borderColor: open ? color : "rgba(22,61,89,0.14)", boxShadow: open ? `0 0 0 4px ${color}22` : undefined }}
      >
        {value ? <Flag iso={value.iso} size={compact ? 32 : 40} /> : <span className="h-8 w-10 rounded bg-slate-100" />}
        <span className="min-w-0 flex-1">
          <span
            className={`block font-bold leading-tight ${compact ? "truncate" : ""}`}
            style={{ color: "var(--regu-navy)", fontSize: compact ? "1rem" : "1.0625rem", fontFamily: "var(--token-font-heading)" }}
            title={value?.pais}
          >
            {value ? (compact ? nombreCorto(value.pais) : value.pais) : "Elegir país"}
          </span>
          <span className="block truncate text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>
            {value ? (compact ? value.regulador.sigla : `${value.regulador.sigla} · ${value.regulador.nombre}`) : "Seleccione un miembro"}
          </span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} style={{ color }} />
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border bg-white shadow-2xl ${align === "right" ? "right-0" : "left-0"}`}
          style={{ borderColor: "rgba(22,61,89,0.12)" }}
          role="listbox"
        >
          <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--regu-gray-500)" }} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar país o regulador…"
              className="w-full bg-transparent py-1 text-sm outline-none"
              aria-label="Buscar país"
            />
          </div>
          <div className="max-h-[360px] overflow-y-auto p-2">
            {grouped.length === 0 && <p className="px-3 py-6 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>Sin resultados</p>}
            {grouped.map((g) => (
              <div key={g.region} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>
                  {g.region}
                </p>
                {g.items.map((p) => {
                  const disabled = p.iso === disabledIso;
                  const selected = p.iso === value?.iso;
                  return (
                    <button
                      key={p.iso}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={disabled}
                      onClick={() => {
                        onChange(p.iso);
                        setOpen(false);
                        setQ("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ background: selected ? `${color}14` : undefined }}
                      onMouseEnter={(e) => !disabled && !selected && (e.currentTarget.style.background = "rgba(22,61,89,0.05)")}
                      onMouseLeave={(e) => !selected && (e.currentTarget.style.background = "")}
                    >
                      <Flag iso={p.iso} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>{p.pais}</span>
                        <span className="block truncate text-xs" style={{ color: "var(--regu-gray-500)" }}>{p.regulador.sigla}</span>
                      </span>
                      {disabled && <span className="text-[0.6875rem]" style={{ color: "var(--regu-gray-500)" }}>ya elegido</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
