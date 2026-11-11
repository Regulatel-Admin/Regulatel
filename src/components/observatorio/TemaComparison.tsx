import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, FileText, Sparkles } from "lucide-react";
import type { Estado, Instrumento, PerfilPais, TemaDef } from "@/data/observatorio/schema";
import type { FilaComparacion } from "@/lib/observatorio";
import { conteoTema, fmt, hostDe, nombreCorto } from "@/lib/observatorio";
import { COLOR_A, COLOR_A_SOFT, COLOR_B, COLOR_B_SOFT, DotMeter, ESTADO_TEXTO, Flag, StatusIcon, TemaIcon, VerdictChip } from "./ui";

const TIPO_LABEL: Record<Instrumento["tipo"], string> = {
  ley: "Ley",
  decreto: "Decreto",
  reglamento: "Reglamento",
  resolucion: "Resolución",
  plan: "Plan",
  estrategia: "Estrategia",
  norma: "Norma",
  otro: "Documento",
};

function fechaCorta(f: string) {
  const [y, m] = f.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return m ? `${meses[Number(m) - 1]} ${y}` : y;
}

export function CountryColumn({ perfil, tema, color, soft }: { perfil: PerfilPais; tema: TemaDef; color: string; soft: string }) {
  const t = perfil.categorias[tema.id];
  const c = conteoTema(perfil, tema);
  if (!t) return null;
  return (
    <div className="min-w-0 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <Flag iso={perfil.iso} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>{perfil.pais}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <DotMeter si={c.si} parcial={c.parcial} color={color} />
            <span className="text-[0.75rem] font-semibold tabular-nums" style={{ color }}>{fmt(c.valor)} de 5</span>
          </div>
        </div>
      </div>
      <p className="text-[0.9375rem] leading-relaxed" style={{ color: "var(--regu-gray-900)" }}>{t.resumen}</p>

      {t.novedad?.texto && (
        <div className="mt-3 flex gap-2 rounded-xl px-3 py-2.5 text-[0.8125rem] leading-snug" style={{ background: "rgba(197,220,11,0.16)", color: "#3F4A00" }}>
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong className="font-bold">Novedad {fechaCorta(t.novedad.fecha)}:</strong> {t.novedad.texto}
          </span>
        </div>
      )}

      {t.instrumentos?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>Normas clave</p>
          <ul className="space-y-1.5">
            {t.instrumentos.map((ins, i) => {
              const inner = (
                <>
                  <span className="mt-[1px] shrink-0 rounded-md px-1.5 py-[1px] text-[0.625rem] font-bold uppercase tracking-wide" style={{ background: soft, color }}>
                    {TIPO_LABEL[ins.tipo] ?? "Doc."}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.8125rem] leading-snug" style={{ color: "var(--regu-gray-900)" }}>
                    {ins.nombre}
                    {ins.anio ? <span style={{ color: "var(--regu-gray-500)" }}> · {ins.anio}</span> : null}
                  </span>
                  {ins.url && <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50 transition group-hover:opacity-100" />}
                </>
              );
              return (
                <li key={i}>
                  {ins.url ? (
                    <a href={ins.url} target="_blank" rel="noreferrer" className="group flex items-start gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50" title={`Abrir fuente: ${hostDe(ins.url)}`}>
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-start gap-2 px-2 py-1.5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Celda({ perfil, fila, which, expanded }: { perfil: PerfilPais; fila: FilaComparacion; which: "a" | "b"; expanded: boolean }) {
  const estado: Estado = which === "a" ? fila.a : fila.b;
  const val = perfil.categorias[fila.tema.id]?.indicadores?.[fila.ind.id];
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <StatusIcon estado={estado} size={24} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] font-bold" style={{ color: estado === "sin_dato" ? "#94A3B8" : "var(--regu-gray-900)" }}>
          {ESTADO_TEXTO[estado]}
          {val?.anio ? <span className="font-medium" style={{ color: "var(--regu-gray-500)" }}> · {val.anio}</span> : null}
        </p>
        {val?.nota && (
          <p className={`text-[0.75rem] leading-snug ${expanded ? "" : "line-clamp-2"}`} style={{ color: "var(--regu-gray-700)" }}>
            {val.nota}
          </p>
        )}
        {expanded && val?.fuente && (
          <a
            href={val.fuente}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-[0.75rem] font-semibold hover:underline"
            style={{ color: "var(--regu-blue)" }}
          >
            <FileText className="h-3.5 w-3.5" /> Fuente: {hostDe(val.fuente)} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function TemaComparison({
  tema,
  index,
  A,
  B,
  filas,
  soloDiferencias,
}: {
  tema: TemaDef;
  index: number;
  A: PerfilPais;
  B: PerfilPais;
  filas: FilaComparacion[];
  soloDiferencias: boolean;
}) {
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({});
  const difs = filas.filter((f) => f.v === "soloA" || f.v === "soloB");
  const visibles = soloDiferencias ? difs : filas;
  const comunes = filas.filter((f) => f.v === "ambos" || f.v === "ambosParcial").length;

  return (
    <section
      id={`tema-${tema.id}`}
      className="obs-card scroll-mt-[150px] overflow-hidden rounded-[20px] border bg-white"
      style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 1px 2px rgba(22,61,89,0.04), 0 8px 24px -12px rgba(22,61,89,0.12)" }}
      aria-labelledby={`tema-${tema.id}-titulo`}
    >
      {/* Encabezado del tema */}
      <header className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:p-6" style={{ borderColor: "rgba(22,61,89,0.08)", background: "linear-gradient(180deg, #FBFCFE 0%, #FFFFFF 100%)" }}>
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "rgba(68,137,198,0.10)" }}>
            <TemaIcon icono={tema.icono} size={24} color="var(--regu-blue)" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>Tema {index + 1} de 8</p>
            <h3 id={`tema-${tema.id}-titulo`} className="font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1.25rem", lineHeight: 1.25 }}>
              {tema.nombre}
            </h3>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--regu-gray-700)" }}>{tema.pregunta}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <span className="rounded-full px-3 py-1 text-[0.75rem] font-bold" style={{ background: "#DCFCE7", color: "#166534" }}>
            {comunes} en común
          </span>
          <span
            className="rounded-full px-3 py-1 text-[0.75rem] font-bold"
            style={difs.length ? { background: "#FFF7ED", color: "#9A3412" } : { background: "#F1F5F9", color: "#475569" }}
          >
            {difs.length === 0 ? "Sin diferencias" : difs.length === 1 ? "1 diferencia" : `${difs.length} diferencias`}
          </span>
        </div>
      </header>

      {/* Lo que hace cada país */}
      <div className="grid md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r" style={{ borderColor: "rgba(22,61,89,0.08)", boxShadow: `inset 3px 0 0 ${COLOR_A}` }}>
          <CountryColumn perfil={A} tema={tema} color={COLOR_A} soft={COLOR_A_SOFT} />
        </div>
        <div style={{ boxShadow: `inset 3px 0 0 ${COLOR_B}` }}>
          <CountryColumn perfil={B} tema={tema} color={COLOR_B} soft={COLOR_B_SOFT} />
        </div>
      </div>

      {/* Indicadores */}
      <div className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)", background: "#FCFDFE" }}>
        <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_172px] gap-4 border-b px-6 py-2.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] md:grid" style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-gray-500)" }}>
          <span>Indicador</span>
          <span className="flex items-center gap-2"><Flag iso={A.iso} size={18} /> <span className="truncate" style={{ color: COLOR_A }}>{A.pais}</span></span>
          <span className="flex items-center gap-2"><Flag iso={B.iso} size={18} /> <span className="truncate" style={{ color: COLOR_B }}>{B.pais}</span></span>
          <span className="text-right">Resultado</span>
        </div>

        {visibles.length === 0 && (
          <p className="px-6 py-6 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>
            En este tema ambos países están en la misma situación en los 5 indicadores.
          </p>
        )}

        <ul>
          <AnimatePresence initial={false}>
            {visibles.map((f) => {
              const open = !!abiertas[f.ind.id];
              const acento = f.v === "soloA" ? COLOR_A : f.v === "soloB" ? COLOR_B : "transparent";
              return (
                <motion.li
                  key={f.ind.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "rgba(22,61,89,0.06)", boxShadow: `inset 3px 0 0 ${acento}` }}
                >
                  <button
                    type="button"
                    onClick={() => setAbiertas((s) => ({ ...s, [f.ind.id]: !s[f.ind.id] }))}
                    aria-expanded={open}
                    className="grid w-full grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-left transition hover:bg-slate-50/80 focus:outline-none focus-visible:bg-slate-50 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_172px] md:px-6"
                  >
                    <div className="col-span-2 min-w-0 md:col-span-1">
                      <p className="flex items-start gap-1.5 text-[0.875rem] font-bold leading-snug" style={{ color: "var(--regu-navy)" }}>
                        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} style={{ color: "var(--regu-gray-500)" }} />
                        {f.ind.label}
                      </p>
                      <p className={`mt-0.5 pl-[22px] text-[0.75rem] leading-snug ${open ? "" : "line-clamp-1"}`} style={{ color: "var(--regu-gray-500)" }}>
                        {f.ind.ayuda}
                      </p>
                    </div>
                    <Celda perfil={A} fila={f} which="a" expanded={open} />
                    <Celda perfil={B} fila={f} which="b" expanded={open} />
                    <div className="col-span-2 flex items-start md:col-span-1 md:justify-end">
                      <VerdictChip v={f.v} nameA={nombreCorto(A.pais)} nameB={nombreCorto(B.pais)} compact />
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}
