import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, ChevronDown, ExternalLink, FileText, Minus, X } from "lucide-react";
import type { Estado, PerfilPais, TemaDef } from "@/data/observatorio/schema";
import { TEMAS } from "@/data/observatorio/schema";
import type { Comparacion, FilaComparacion } from "@/lib/observatorio";
import { fmt, hostDe, veredictoTexto } from "@/lib/observatorio";
import { CountryColumn } from "./TemaComparison";
import { COLOR_A, COLOR_A_SOFT, COLOR_B, COLOR_B_SOFT, Flag, IndIcon, StatusIcon, TemaIcon } from "./ui";

/* ───────────────────────── Resaltado (en común / solo A / solo B) ───────────────────────── */

export type Resaltado = "comun" | "soloA" | "soloB" | null;
export const RESALTE: Record<Exclude<Resaltado, null>, { bg: string; borde: string; texto: string }> = {
  comun: { bg: "#DCFCE7", borde: "#15803D", texto: "#166534" },
  soloA: { bg: "rgba(22,61,89,0.11)", borde: COLOR_A, texto: COLOR_A },
  soloB: { bg: "rgba(31,127,140,0.15)", borde: COLOR_B, texto: COLOR_B },
};

function coincideResaltado(f: FilaComparacion, r: Resaltado) {
  return r === "comun" ? f.v === "ambos" || f.v === "ambosParcial" : r === "soloA" ? f.v === "soloA" : r === "soloB" ? f.v === "soloB" : false;
}

/** Panel abierto: tema + indicador desplegado (o null para abrir en el resumen del tema) */
export interface Abierto {
  temaId: string;
  indId: string | null;
  k: number;
}

/* ───────────────────────── Piezas ───────────────────────── */

function MiniBarras({ a, b, isoA, isoB }: { a: number; b: number; isoA: string; isoB: string }) {
  return (
    <div className="space-y-1.5">
      {[
        { iso: isoA, v: a, c: COLOR_A },
        { iso: isoB, v: b, c: COLOR_B },
      ].map((x) => (
        <div key={x.iso} className="flex items-center gap-2">
          <Flag iso={x.iso} size={16} />
          <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: x.c }}
              initial={{ width: 0 }}
              animate={{ width: `${(x.v / 5) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className="w-7 text-right text-[0.75rem] font-bold tabular-nums" style={{ color: x.c }}>{fmt(x.v)}</span>
        </div>
      ))}
    </div>
  );
}

const PILL: Record<Estado, { bg: string; fg: string; texto: string }> = {
  si: { bg: "#DCFCE7", fg: "#166534", texto: "Sí" },
  parcial: { bg: "#FEF3C7", fg: "#92400E", texto: "En proceso" },
  no: { bg: "#FEE2E2", fg: "#991B1B", texto: "No" },
  sin_dato: { bg: "#F1F5F9", fg: "#64748B", texto: "Sin dato" },
};

/** Etiqueta de estado con ícono + texto (se lee aún más rápido que el ícono solo) */
export function EstadoPill({ estado }: { estado: Estado }) {
  const p = PILL[estado];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[0.8125rem] font-bold" style={{ background: p.bg, color: p.fg }}>
      {estado === "sin_dato" ? (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ border: "2px dashed #CBD5E1", color: "#94A3B8", background: "#fff" }}>
          <Minus size={11} strokeWidth={3} />
        </span>
      ) : (
        <StatusIcon estado={estado} size={20} />
      )}
      {p.texto}
    </span>
  );
}

function DetallePais({ perfil, fila, which, color }: { perfil: PerfilPais; fila: FilaComparacion; which: "a" | "b"; color: string }) {
  const estado = which === "a" ? fila.a : fila.b;
  const val = perfil.categorias[fila.tema.id]?.indicadores?.[fila.ind.id];
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Flag iso={perfil.iso} size={30} />
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>{perfil.pais}</p>
          <p className="text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>
            {perfil.regulador.sigla}
            {val?.anio ? ` · ${val.anio}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-2.5 text-[0.9rem] leading-relaxed" style={{ color: estado === "sin_dato" ? "var(--regu-gray-500)" : "var(--regu-gray-900)" }}>
        {val?.nota ?? "No se encontró información pública confirmada para este indicador."}
      </p>
      {val?.fuente && (
        <a href={val.fuente} target="_blank" rel="noreferrer" className="mt-2.5 inline-flex items-start gap-1.5 text-[0.8125rem] font-semibold hover:underline" style={{ color }}>
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Ver fuente oficial <ExternalLink className="inline h-3 w-3" />
            <span className="block text-[0.75rem] font-medium" style={{ color: "var(--regu-gray-500)" }}>{hostDe(val.fuente)}</span>
          </span>
        </a>
      )}
    </div>
  );
}

/* ───────────────────────── Tarjeta compacta de tema ───────────────────────── */

function TemaCard({
  tema,
  index,
  A,
  B,
  filas,
  conteo,
  soloDiferencias,
  resaltado,
  flashKey,
  activo,
  onAbrir,
}: {
  tema: TemaDef;
  index: number;
  A: PerfilPais;
  B: PerfilPais;
  filas: FilaComparacion[];
  conteo: Comparacion["porTema"][number];
  soloDiferencias: boolean;
  resaltado: Resaltado;
  flashKey: number | null;
  activo: boolean;
  onAbrir: (temaId: string, indId: string | null) => void;
}) {
  const visibles = soloDiferencias ? filas.filter((f) => f.v === "soloA" || f.v === "soloB") : filas;
  return (
    <motion.section
      id={`tema-${tema.id}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      className="obs-card relative flex scroll-mt-[170px] flex-col overflow-hidden rounded-[20px] border bg-white"
      style={{
        borderColor: activo ? "var(--regu-blue)" : "rgba(22,61,89,0.10)",
        boxShadow: activo ? "0 0 0 3px rgba(68,137,198,0.25), 0 10px 28px -16px rgba(22,61,89,0.25)" : "0 1px 2px rgba(22,61,89,0.04), 0 10px 28px -16px rgba(22,61,89,0.18)",
      }}
    >
      {flashKey != null && <span key={flashKey} className="obs-flash" aria-hidden />}
      <header className="px-4 pb-3 pt-4">
        <button type="button" onClick={() => onAbrir(tema.id, null)} className="flex w-full items-start gap-3 text-left" title="Abrir el tema completo">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(68,137,198,0.10)" }}>
            <TemaIcon icono={tema.icono} size={20} color="var(--regu-blue)" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold leading-tight" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1rem" }}>
              {tema.nombre}
            </h3>
            <p className="mt-0.5 text-[0.75rem] font-semibold" style={{ color: conteo.diferencias ? "#9A3412" : "#166534" }}>
              {conteo.diferencias === 0 ? "Misma situación" : conteo.diferencias === 1 ? "1 diferencia" : `${conteo.diferencias} diferencias`}
            </p>
          </div>
        </button>
        <div className="mt-3">
          <MiniBarras a={conteo.a.valor} b={conteo.b.valor} isoA={A.iso} isoB={B.iso} />
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_36px_36px] items-center gap-x-2 border-y px-4 py-1.5" style={{ borderColor: "rgba(22,61,89,0.07)", background: "#FBFCFE" }}>
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>Indicador</span>
        <span className="flex justify-center" title={A.pais}><Flag iso={A.iso} size={20} /></span>
        <span className="flex justify-center" title={B.pais}><Flag iso={B.iso} size={20} /></span>
      </div>

      <ul className="flex-1">
        {visibles.length === 0 && (
          <li className="px-4 py-5 text-center text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>Sin diferencias en este tema ✓</li>
        )}
        {visibles.map((f) => {
          const acento = f.v === "soloA" ? COLOR_A : f.v === "soloB" ? COLOR_B : "transparent";
          const coincide = coincideResaltado(f, resaltado);
          const r = resaltado ? RESALTE[resaltado] : null;
          return (
            <li key={f.ind.id}>
              <button
                type="button"
                onClick={() => onAbrir(tema.id, f.ind.id)}
                className="obs-row-hl group grid w-full grid-cols-[minmax(0,1fr)_36px_36px] items-center gap-x-2 px-4 py-2 text-left hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
                style={{ boxShadow: `inset 3px 0 0 ${coincide && r ? r.borde : acento}`, background: coincide && r ? r.bg : undefined, opacity: resaltado && !coincide ? 0.42 : 1 }}
                title={`${f.ind.label}: ${veredictoTexto(f.v, A.pais, B.pais)}. Clic para ver el detalle.`}
              >
                <span className="flex min-w-0 items-center gap-2 text-[0.8125rem] font-semibold leading-snug" style={{ color: "var(--regu-navy)" }}>
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(68,137,198,0.09)" }}>
                    <IndIcon id={f.ind.id} size={13} color="var(--regu-blue)" />
                  </span>
                  <span className="min-w-0">{f.ind.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-60" />
                </span>
                <span className="flex justify-center"><StatusIcon estado={f.a} size={24} /></span>
                <span className="flex justify-center"><StatusIcon estado={f.b} size={24} /></span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => onAbrir(tema.id, null)}
        className="flex items-center justify-center gap-1.5 border-t px-4 py-2.5 text-[0.75rem] font-bold transition hover:bg-slate-50"
        style={{ borderColor: "rgba(22,61,89,0.07)", color: "var(--regu-blue)" }}
      >
        <BookOpen className="h-3.5 w-3.5" /> {activo ? "Abierto abajo ↓" : "Ver detalle del tema"}
      </button>
    </motion.section>
  );
}

/* ───────────────────────── Panel a todo el ancho (detalle en línea) ───────────────────────── */

function TemaPanel({
  tema,
  A,
  B,
  filas,
  conteo,
  soloDiferencias,
  resaltado,
  abierto,
  onCerrar,
}: {
  tema: TemaDef;
  A: PerfilPais;
  B: PerfilPais;
  filas: FilaComparacion[];
  conteo: Comparacion["porTema"][number];
  soloDiferencias: boolean;
  resaltado: Resaltado;
  abierto: Abierto;
  onCerrar: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [filasAbiertas, setFilasAbiertas] = useState<Set<string>>(() => new Set(abierto.indId ? [abierto.indId] : []));
  const [resumen, setResumen] = useState(abierto.indId === null);
  const visibles = soloDiferencias ? filas.filter((f) => f.v === "soloA" || f.v === "soloB") : filas;

  useEffect(() => {
    const t = window.setTimeout(() => {
      const objetivo = abierto.indId ? document.getElementById(`fila-${abierto.indId}`) : ref.current;
      objetivo?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [abierto]);

  const toggle = (id: string) =>
    setFilasAbiertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="relative col-span-full scroll-mt-[250px] overflow-hidden rounded-[22px] border bg-white md:scroll-mt-[170px]"
      style={{ borderColor: "var(--regu-blue)", boxShadow: "0 0 0 3px rgba(68,137,198,0.15), 0 18px 40px -20px rgba(22,61,89,0.30)" }}
      role="region"
      aria-label={`Detalle de ${tema.nombre}`}
    >
      <span key={abierto.k} className="obs-flash obs-flash--marca" aria-hidden />

      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-4 border-b px-5 py-4 sm:px-6" style={{ borderColor: "rgba(22,61,89,0.08)", background: "linear-gradient(180deg,#F7FAFD,#fff)" }}>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "rgba(68,137,198,0.12)" }}>
          <TemaIcon icono={tema.icono} size={24} color="var(--regu-blue)" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1.375rem", lineHeight: 1.2 }}>{tema.nombre}</h3>
          <p className="mt-0.5 text-[0.9375rem]" style={{ color: "var(--regu-gray-700)" }}>
            {tema.indicadores.length} indicadores ·{" "}
            <strong style={{ color: conteo.diferencias ? "#C2410C" : "#166534" }}>
              {conteo.diferencias === 0 ? "misma situación" : conteo.diferencias === 1 ? "1 diferencia" : `${conteo.diferencias} diferencias`}
            </strong>
            <span className="hidden sm:inline" style={{ color: "var(--regu-gray-500)" }}> · {tema.pregunta}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-2 text-[0.8125rem] font-bold transition hover:bg-slate-50"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
        >
          <X className="h-4 w-4" /> Cerrar
        </button>
      </div>

      {/* Resumen y normas (plegable) */}
      <div className="border-b" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
        <button type="button" onClick={() => setResumen((r) => !r)} aria-expanded={resumen} className="flex w-full items-center gap-2 px-5 py-3 text-left text-[0.875rem] font-bold transition hover:bg-slate-50 sm:px-6" style={{ color: "var(--regu-blue)" }}>
          <BookOpen className="h-4 w-4" /> Resumen y normas clave de cada país
          <ChevronDown className={`ml-auto h-4 w-4 transition ${resumen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {resumen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="border-t md:border-r" style={{ borderColor: "rgba(22,61,89,0.08)", boxShadow: `inset 3px 0 0 ${COLOR_A}` }}>
                  <CountryColumn perfil={A} tema={tema} color={COLOR_A} soft={COLOR_A_SOFT} />
                </div>
                <div className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)", boxShadow: `inset 3px 0 0 ${COLOR_B}` }}>
                  <CountryColumn perfil={B} tema={tema} color={COLOR_B} soft={COLOR_B_SOFT} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabla de indicadores */}
      <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_32px] items-center gap-4 border-b px-6 py-2.5 text-[0.75rem] font-bold md:grid" style={{ borderColor: "rgba(22,61,89,0.08)", background: "#F7FAFD", color: "var(--regu-gray-500)" }}>
        <span className="uppercase tracking-[0.12em]">Indicador</span>
        <span className="flex items-center gap-2" style={{ color: COLOR_A }}><Flag iso={A.iso} size={20} /> {A.pais}</span>
        <span className="flex items-center gap-2" style={{ color: COLOR_B }}><Flag iso={B.iso} size={20} /> {B.pais}</span>
        <span />
      </div>

      <ul>
        {visibles.length === 0 && (
          <li className="px-6 py-6 text-center text-[0.875rem]" style={{ color: "var(--regu-gray-500)" }}>Sin diferencias en este tema ✓</li>
        )}
        {visibles.map((f) => {
          const open = filasAbiertas.has(f.ind.id);
          const coincide = coincideResaltado(f, resaltado);
          const r = resaltado ? RESALTE[resaltado] : null;
          const acento = open ? "var(--regu-blue)" : coincide && r ? r.borde : f.v === "soloA" ? COLOR_A : f.v === "soloB" ? COLOR_B : "transparent";
          return (
            <li key={f.ind.id} id={`fila-${f.ind.id}`} className="scroll-mt-[250px] border-b last:border-b-0 md:scroll-mt-[190px]" style={{ borderColor: "rgba(22,61,89,0.07)" }}>
              <button
                type="button"
                onClick={() => toggle(f.ind.id)}
                aria-expanded={open}
                className="obs-row-hl grid w-full grid-cols-2 items-center gap-x-4 gap-y-2.5 px-5 py-3.5 text-left hover:bg-slate-50 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_32px] md:px-6"
                style={{
                  boxShadow: `inset 4px 0 0 ${acento}`,
                  background: open ? "#F4F8FC" : coincide && r ? r.bg : undefined,
                  opacity: resaltado && !coincide && !open ? 0.5 : 1,
                }}
              >
                <span className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                  <IndIcon id={f.ind.id} size={20} color="var(--regu-blue)" />
                  <span className="text-[0.975rem] font-bold leading-snug" style={{ color: "var(--regu-navy)" }}>{f.ind.label}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="md:hidden"><Flag iso={A.iso} size={18} /></span>
                  <EstadoPill estado={f.a} />
                </span>
                <span className="flex items-center gap-2">
                  <span className="md:hidden"><Flag iso={B.iso} size={18} /></span>
                  <EstadoPill estado={f.b} />
                </span>
                <span className="hidden justify-end md:flex">
                  <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} style={{ color: "var(--regu-blue)" }} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <div className="px-5 pb-5 md:px-6" style={{ background: "#F4F8FC", boxShadow: "inset 4px 0 0 var(--regu-blue)" }}>
                      <p className="pb-3 text-[0.875rem]" style={{ color: "var(--regu-gray-700)" }}>{f.ind.ayuda}</p>
                      <div className="grid gap-5 rounded-2xl border bg-white p-4 md:grid-cols-2 md:divide-x" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        <DetallePais perfil={A} fila={f} which="a" color={COLOR_A} />
                        <div className="md:pl-5" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                          <DetallePais perfil={B} fila={f} which="b" color={COLOR_B} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center border-t px-5 py-3" style={{ borderColor: "rgba(22,61,89,0.08)", background: "#FBFCFE" }}>
        <button type="button" onClick={onCerrar} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold hover:underline" style={{ color: "var(--regu-blue)" }}>
          <Check className="h-4 w-4" /> Listo, cerrar este tema
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Tablero ───────────────────────── */

/** Columnas según el ancho real del contenedor (para abrir el detalle justo debajo de la fila tocada) */
function useColumnas(ref: React.RefObject<HTMLDivElement>) {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setCols(w < 640 ? 1 : w < 1060 ? 2 : w < 1380 ? 3 : 4);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return cols;
}

export default function TemaBoard({
  A,
  B,
  cmp,
  soloDiferencias,
  resaltado = null,
  flash = null,
  abierto,
  onAbrir,
  onCerrar,
}: {
  A: PerfilPais;
  B: PerfilPais;
  cmp: Comparacion;
  soloDiferencias: boolean;
  resaltado?: Resaltado;
  flash?: { id: string; k: number } | null;
  abierto: Abierto | null;
  onAbrir: (temaId: string, indId: string | null) => void;
  onCerrar: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cols = useColumnas(ref);
  const idxAbierto = abierto ? TEMAS.findIndex((t) => t.id === abierto.temaId) : -1;
  // El panel se inserta después de la última tarjeta de la fila donde está el tema abierto
  const insertarTras = idxAbierto >= 0 ? Math.min(TEMAS.length - 1, Math.floor(idxAbierto / cols) * cols + cols - 1) : -1;

  return (
    <div ref={ref} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {TEMAS.map((tema, i) => (
        <Fragment key={tema.id}>
          <TemaCard
            tema={tema}
            index={i}
            A={A}
            B={B}
            filas={cmp.filas.filter((f) => f.tema.id === tema.id)}
            conteo={cmp.porTema[i]}
            soloDiferencias={soloDiferencias}
            resaltado={resaltado}
            flashKey={flash && flash.id === tema.id ? flash.k : null}
            activo={abierto?.temaId === tema.id}
            onAbrir={onAbrir}
          />
          {i === insertarTras && abierto && idxAbierto >= 0 && (
            <TemaPanel
              key={`${abierto.temaId}-${abierto.k}`}
              tema={TEMAS[idxAbierto]}
              A={A}
              B={B}
              filas={cmp.filas.filter((f) => f.tema.id === abierto.temaId)}
              conteo={cmp.porTema[idxAbierto]}
              soloDiferencias={soloDiferencias}
              resaltado={resaltado}
              abierto={abierto}
              onCerrar={onCerrar}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
