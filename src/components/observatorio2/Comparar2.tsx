import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, FileText, Search } from "lucide-react";
import type { PerfilPais, TemaId } from "@/data/observatorio/schema";
import { REGION_BY_ISO, TEMAS, TOTAL_INDICADORES } from "@/data/observatorio/schema";
import type { Comparacion, FilaComparacion } from "@/lib/observatorio";
import { fmt, hostDe, nombreCorto } from "@/lib/observatorio";
import { Flag, IndIcon, TemaIcon } from "@/components/observatorio/ui";
import { CODIGO, Caps, P2, Pill2, Toggle } from "./ui2";

const REGIONES = ["Sudamérica", "Centroamérica, México y el Caribe", "Europa"] as const;
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ───────────────────────── Selector de país ───────────────────────── */

function SelectorPais({
  etiqueta,
  valor,
  opciones,
  deshabilitado,
  onCambio,
  alinear = "left",
}: {
  etiqueta: string;
  valor: PerfilPais;
  opciones: PerfilPais[];
  deshabilitado: string;
  onCambio: (iso: string) => void;
  alinear?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    setTimeout(() => input.current?.focus(), 30);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const grupos = useMemo(() => {
    const n = norm(q.trim());
    const lista = opciones.filter((p) => !n || norm(p.pais).includes(n) || norm(p.regulador.sigla).includes(n));
    return REGIONES.map((r) => ({ r, items: lista.filter((p) => REGION_BY_ISO[p.iso] === r) })).filter((g) => g.items.length);
  }, [opciones, q]);

  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="obs2-select flex w-full items-center gap-4 rounded-lg border px-5 py-3.5 text-left"
        style={{ borderColor: open ? P2.teal : P2.line, background: "#F8FAFA" }}
      >
        <Flag iso={valor.iso} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.16em]" style={{ color: P2.muted }}>{etiqueta}</span>
          <span className="block truncate font-bold" style={{ color: P2.navy, fontSize: "clamp(1.15rem, 0.6vw + 1rem, 1.6rem)", lineHeight: 1.2 }}>{valor.pais}</span>
        </span>
        <span className="hidden text-[0.875rem] font-bold uppercase tracking-[0.06em] sm:inline" style={{ color: P2.muted }}>{valor.regulador.sigla}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} style={{ color: P2.navy }} />
      </button>
      {open && (
        <div className={`absolute z-40 mt-2 w-[min(92vw,400px)] overflow-hidden rounded-xl border bg-white shadow-2xl ${alinear === "right" ? "right-0" : "left-0"}`} style={{ borderColor: P2.line }} role="listbox">
          <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: P2.line }}>
            <Search className="h-4 w-4" style={{ color: P2.muted }} />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar país o regulador…" className="w-full bg-transparent py-1 text-sm outline-none" aria-label="Buscar país" />
          </div>
          <div className="max-h-[380px] overflow-y-auto p-2">
            {grupos.map((g) => (
              <div key={g.r} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: P2.muted }}>{g.r}</p>
                {g.items.map((p) => (
                  <button
                    key={p.iso}
                    type="button"
                    role="option"
                    aria-selected={p.iso === valor.iso}
                    disabled={p.iso === deshabilitado}
                    onClick={() => {
                      onCambio(p.iso);
                      setOpen(false);
                      setQ("");
                    }}
                    className="obs2-opcion flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-40"
                    data-activo={p.iso === valor.iso}
                  >
                    <Flag iso={p.iso} size={26} />
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold" style={{ color: P2.navy }}>{p.pais}</span>
                    <span className="text-[0.75rem] font-semibold" style={{ color: P2.muted }}>{p.regulador.sigla}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Selectores({ A, B, perfiles, onPar }: { A: PerfilPais; B: PerfilPais; perfiles: PerfilPais[]; onPar: (a: string, b: string) => void }) {
  return (
    <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-5">
      <SelectorPais etiqueta="País A" valor={A} opciones={perfiles} deshabilitado={B.iso} onCambio={(iso) => onPar(iso, B.iso)} />
      <button
        type="button"
        onClick={() => onPar(B.iso, A.iso)}
        className="obs2-swap mx-auto inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        aria-label="Intercambiar países"
        title="Intercambiar países"
      >
        <ArrowLeftRight className="h-5 w-5" />
      </button>
      <SelectorPais etiqueta="País B" valor={B} opciones={perfiles} deshabilitado={A.iso} onCambio={(iso) => onPar(A.iso, iso)} alinear="right" />
    </div>
  );
}

/* ───────────────────────── Resumen + huella ───────────────────────── */

export function Resumen({ cmp, A, B }: { cmp: Comparacion; A: PerfilPais; B: PerfilPais }) {
  const total = Math.max(1, cmp.union);
  const filas = [
    { label: "En común", n: cmp.enComun.length, color: "#7FB5A9" },
    { label: `Solo ${A.pais}`, n: cmp.soloA.length, color: P2.navy },
    { label: `Solo ${B.pais}`, n: cmp.soloB.length, color: P2.teal },
  ];
  return (
    <div className="rounded-xl p-7 md:p-8" style={{ background: "#EDF3F3" }}>
      <Caps>Resumen de la comparación</Caps>
      <p className="mt-4 flex items-baseline gap-3" style={{ color: P2.navy, fontFamily: P2.serif }}>
        <span className="font-semibold tabular-nums" style={{ fontSize: "clamp(4rem, 4vw + 2rem, 6rem)", lineHeight: 0.95 }}>{cmp.coincidencia}</span>
        <span className="font-semibold" style={{ fontSize: "2.4rem" }}>%</span>
      </p>
      <p className="mt-3 text-[1.5rem] font-semibold" style={{ color: P2.navy }}>de prácticas en común</p>
      <div className="mt-6 flex h-2.5 w-full gap-1 overflow-hidden rounded-full">
        {filas.map((f) => (
          <motion.span key={f.label} className="h-full rounded-full" style={{ background: f.color }} initial={{ width: 0 }} animate={{ width: `${(f.n / total) * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        ))}
      </div>
      <ul className="mt-5">
        {filas.map((f) => (
          <li key={f.label} className="flex items-center gap-3 border-b py-3.5 last:border-b-0" style={{ borderColor: "#D7E2E4" }}>
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
            <span className="min-w-0 flex-1 truncate text-[1.0625rem]" style={{ color: "#3B4B57" }}>{f.label}</span>
            <span className="text-[1.6rem] font-bold tabular-nums" style={{ color: P2.navy }}>{f.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mancuernas: país A = punto relleno, país B = rombo; escala 0–5 por tema */
export function Huella({ cmp, A, B, onTema }: { cmp: Comparacion; A: PerfilPais; B: PerfilPais; onTema: (id: TemaId) => void }) {
  const ca = CODIGO[A.iso] ?? A.iso.toUpperCase();
  const cb = CODIGO[B.iso] ?? B.iso.toUpperCase();
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-bold" style={{ color: P2.navy, fontSize: "clamp(1.6rem, 1vw + 1.1rem, 2.1rem)" }}>Huella regulatoria</h2>
          <p className="mt-1 text-[1rem]" style={{ color: P2.muted }}>Puntuación por tema en una escala de 0 a 5.</p>
        </div>
        <div className="flex items-center gap-6 text-[0.9375rem] font-semibold" style={{ color: P2.navy }}>
          <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: P2.navy }} />{A.pais}</span>
          <span className="inline-flex items-center gap-2" style={{ color: P2.teal }}><span className="inline-block h-3 w-3 rotate-45 border-2 bg-white" style={{ borderColor: P2.teal }} />{B.pais}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className={`${COLS_HUELLA} items-end pb-1`}>
          <span />
          <div className="relative h-5">
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <span key={t} className="absolute -translate-x-1/2 text-[0.75rem] tabular-nums" style={{ left: `${(t / 5) * 100}%`, color: P2.muted }}>{t}</span>
            ))}
          </div>
          <span className="text-center text-[0.75rem] font-bold" style={{ color: P2.navy }}>{ca}</span>
          <span className="text-center text-[0.75rem] font-bold" style={{ color: P2.teal }}>{cb}</span>
        </div>
        {cmp.porTema.map(({ tema, a, b }, i) => (
          <FilaHuella key={tema.id} i={i} nombre={tema.corto} titulo={tema.nombre} a={a.valor} b={b.valor} onClick={() => onTema(tema.id)} />
        ))}
      </div>
    </div>
  );
}

const COLS_HUELLA = "grid grid-cols-[minmax(104px,180px)_minmax(0,1fr)_48px_48px] gap-x-3 sm:gap-x-5";

function FilaHuella({ i, nombre, titulo, a, b, onClick }: { i: number; nombre: string; titulo: string; a: number; b: number; onClick: () => void }) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return (
    <button type="button" onClick={onClick} className={`obs2-fila-huella ${COLS_HUELLA} w-full items-stretch border-b text-left`} style={{ borderColor: "#E6ECEF" }} title={`Ver ${titulo} en el tablero`}>
      <span className="obs2-link-tema truncate py-3 text-[1.0625rem]" style={{ color: "#2E3D49" }}>{nombre}</span>
      <span className="relative block min-h-[48px]">
        {[0, 1, 2, 3, 4, 5].map((t) => (
          <span key={t} className="absolute inset-y-0 w-px" style={{ left: `${(t / 5) * 100}%`, background: "#E9EEF1" }} />
        ))}
        <motion.span
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
          style={{ background: "#9CC7C1" }}
          initial={{ left: `${(min / 5) * 100}%`, width: 0 }}
          animate={{ left: `${(min / 5) * 100}%`, width: `${((max - min) / 5) * 100}%` }}
          transition={{ duration: 0.7, delay: 0.04 * i }}
        />
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${(a / 5) * 100}%`, background: P2.navy }} />
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 bg-white" style={{ left: `${(b / 5) * 100}%`, borderColor: P2.teal }} />
      </span>
      <span className="self-center text-center text-[1.125rem] font-bold tabular-nums" style={{ color: P2.navy }}>{fmt(a)}</span>
      <span className="self-center text-center text-[1.125rem] font-bold tabular-nums" style={{ color: P2.teal }}>{fmt(b)}</span>
    </button>
  );
}

/* ───────────────────────── Tablero comparativo ───────────────────────── */

function DetalleFila({ perfil, fila, which }: { perfil: PerfilPais; fila: FilaComparacion; which: "a" | "b" }) {
  const val = perfil.categorias[fila.tema.id]?.indicadores?.[fila.ind.id];
  const estado = which === "a" ? fila.a : fila.b;
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Flag iso={perfil.iso} size={28} />
        <div className="min-w-0">
          <p className="truncate font-bold" style={{ color: P2.navy }}>{perfil.pais}</p>
          <p className="text-[0.8125rem]" style={{ color: P2.muted }}>{perfil.regulador.sigla}{val?.anio ? ` · ${val.anio}` : ""}</p>
        </div>
      </div>
      <p className="mt-2.5 text-[0.9375rem] leading-relaxed" style={{ color: estado === "sin_dato" ? P2.muted : P2.text }}>
        {val?.nota ?? "No se encontró información pública confirmada para este indicador."}
      </p>
      {val?.fuente && (
        <a href={val.fuente} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold hover:underline" style={{ color: P2.teal }}>
          <FileText className="h-4 w-4" /> Fuente oficial: {hostDe(val.fuente)} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export function Tablero({
  cmp,
  A,
  B,
  tema,
  onTema,
  soloDif,
  setSoloDif,
}: {
  cmp: Comparacion;
  A: PerfilPais;
  B: PerfilPais;
  tema: TemaId;
  onTema: (id: TemaId) => void;
  soloDif: boolean;
  setSoloDif: (v: boolean) => void;
}) {
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  useEffect(() => setAbiertas(new Set()), [tema, A.iso, B.iso]);
  const def = TEMAS.find((t) => t.id === tema)!;
  const filas = cmp.filas.filter((f) => f.tema.id === tema && (!soloDif || f.v === "soloA" || f.v === "soloB"));
  const toggle = (id: string) =>
    setAbiertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section id="obs2-tablero" className="scroll-mt-[100px]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "clamp(2rem, 1.6vw + 1.3rem, 2.9rem)", lineHeight: 1.1 }}>Tablero comparativo</h2>
          <p className="mt-2 text-[1.0625rem]" style={{ color: P2.muted }}>Seleccione un tema y abra un indicador para consultar el detalle y su fuente.</p>
        </div>
        <Toggle checked={soloDif} onChange={setSoloDif} label={`Ver solo diferencias (${cmp.diferencias})`} />
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Temas */}
        <aside className="rounded-xl p-3 lg:self-start" style={{ background: P2.bgSoft }}>
          <p className="px-3 pb-2 pt-1"><Caps>Temas</Caps></p>
          <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {cmp.porTema.map(({ tema: t, diferencias }) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTema(t.id)}
                data-activo={t.id === tema}
                className="obs2-tema flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[1rem]"
              >
                <TemaIcon icono={t.icono} size={17} />
                <span className="flex-1 whitespace-nowrap">{t.corto}</span>
                {diferencias > 0 && <span className="obs2-badge rounded-full px-1.5 text-[0.6875rem] font-bold tabular-nums">{diferencias}</span>}
                <ChevronRight className="obs2-tema-chev hidden h-4 w-4 lg:block" />
              </button>
            ))}
          </div>
        </aside>

        {/* Tabla del tema */}
        <div className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h3 className="font-bold" style={{ color: P2.navy, fontSize: "clamp(1.4rem, 0.8vw + 1.1rem, 1.9rem)" }}>{def.nombre}</h3>
            <span className="text-[0.9375rem]" style={{ color: P2.muted }}>{def.indicadores.length} indicadores</span>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_32px] items-center gap-4 rounded-lg px-4 py-3 text-[0.9375rem] font-semibold md:grid" style={{ background: "#EEF3F4", color: "#3B4B57" }}>
            <span>Indicador</span>
            <span className="flex items-center justify-center gap-2" style={{ color: P2.navy }}><Flag iso={A.iso} size={22} /> {nombreCorto(A.pais)}</span>
            <span className="flex items-center justify-center gap-2" style={{ color: P2.teal }}><Flag iso={B.iso} size={22} /> {nombreCorto(B.pais)}</span>
            <span />
          </div>
          <ul>
            {filas.length === 0 && (
              <li className="px-4 py-8 text-center text-[1rem]" style={{ color: P2.muted }}>En este tema ambos países están en la misma situación.</li>
            )}
            {filas.map((f) => {
              const open = abiertas.has(f.ind.id);
              return (
                <li key={f.ind.id} className="border-b" style={{ borderColor: "#E3EAEE" }}>
                  <button type="button" onClick={() => toggle(f.ind.id)} aria-expanded={open} className="obs2-fila grid w-full grid-cols-2 items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_32px]" data-abierta={open}>
                    <span className="col-span-2 flex min-w-0 items-center gap-2.5 text-[1.0625rem] md:col-span-1" style={{ color: P2.text }}>
                      <IndIcon id={f.ind.id} size={17} color={P2.teal} />
                      {f.ind.label}
                    </span>
                    <span className="flex items-center gap-2 md:justify-center"><span className="md:hidden"><Flag iso={A.iso} size={18} /></span><Pill2 estado={f.a} /></span>
                    <span className="flex items-center gap-2 md:justify-center"><span className="md:hidden"><Flag iso={B.iso} size={18} /></span><Pill2 estado={f.b} /></span>
                    <ChevronDown className={`hidden h-5 w-5 justify-self-end transition md:block ${open ? "rotate-180" : ""}`} style={{ color: P2.navy }} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                        <div className="px-4 pb-5">
                          <p className="pb-3 text-[0.9375rem]" style={{ color: P2.muted }}>{f.ind.ayuda}</p>
                          <div className="grid gap-5 rounded-xl border bg-white p-5 md:grid-cols-2 md:divide-x" style={{ borderColor: P2.line }}>
                            <DetalleFila perfil={A} fila={f} which="a" />
                            <div className="md:pl-5" style={{ borderColor: P2.line }}>
                              <DetalleFila perfil={B} fila={f} which="b" />
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
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Reguladores + metodología ───────────────────────── */

export function Cierre({ A, B, verificado }: { A: PerfilPais; B: PerfilPais; verificado: string }) {
  const [metodo, setMetodo] = useState(false);
  return (
    <section className="mt-16" style={{ background: P2.bgSoft }}>
      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 px-5 py-12 md:px-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h2 className="font-semibold" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "clamp(1.7rem, 1vw + 1.3rem, 2.3rem)" }}>¿Quién regula en cada país?</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:divide-x" style={{ borderColor: P2.line }}>
            {[A, B].map((p, i) => (
              <div key={p.iso} className={i === 1 ? "sm:pl-8" : ""} style={{ borderColor: P2.line }}>
                <p className="flex items-center gap-2.5 text-[0.9375rem] font-semibold" style={{ color: "#3B4B57" }}><Flag iso={p.iso} size={26} /> {p.pais}</p>
                <p className="mt-4 font-bold tracking-tight" style={{ color: P2.navy, fontSize: "1.9rem", lineHeight: 1.1 }}>{p.regulador.sigla}</p>
                <p className="mt-1 text-[1rem]" style={{ color: P2.muted }}>{p.regulador.nombre}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: P2.text }}>{p.resumenPais}</p>
                <a href={p.regulador.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-[1rem] font-bold hover:underline" style={{ color: P2.teal }}>
                  Sitio oficial <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:border-l lg:pl-10" style={{ borderColor: P2.line }}>
          <h2 className="font-semibold" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "clamp(1.6rem, 1vw + 1.2rem, 2.1rem)" }}>Metodología y fuentes</h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed" style={{ color: "#3B4B57" }}>
            Los 23 miembros se comparan con los mismos {TOTAL_INDICADORES} indicadores. Cada ficha reúne el estado de la práctica y su fuente.
          </p>
          <button type="button" onClick={() => setMetodo((m) => !m)} aria-expanded={metodo} className="mt-5 inline-flex items-center gap-1.5 text-[1rem] font-bold hover:underline" style={{ color: P2.teal }}>
            {metodo ? "Ocultar metodología" : "Consultar metodología"} <ArrowRight className={`h-4 w-4 transition ${metodo ? "rotate-90" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {metodo && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed" style={{ color: P2.text }}>
                  <div className="flex flex-wrap gap-2">
                    <Pill2 estado="si" /> <Pill2 estado="parcial" /> <Pill2 estado="no" /> <Pill2 estado="sin_dato" />
                  </div>
                  <p><strong>Sí</strong>: la práctica existe y está vigente. <strong>En proceso</strong>: parcial, piloto o en consulta. <strong>No</strong>: confirmado que no existe. <strong>Sin dato</strong>: no se encontró información pública confirmada.</p>
                  <p>Cada dato se investigó en fuentes oficiales (reguladores, ministerios, gacetas y listas oficiales de tratados) y lo revisó un segundo verificador independiente. El porcentaje <strong>de prácticas en común</strong> indica qué parte de las prácticas presentes en al menos uno de los dos países comparten ambos. Las puntuaciones por tema suman 1 por cada “Sí” y 0,5 por cada “En proceso”.</p>
                  <p style={{ color: P2.muted }}>Información verificada al {verificado}. Herramienta de referencia comparada: no constituye una evaluación oficial de los miembros.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Versión impresa (todo el detalle) ───────────────────────── */

export function ImpresionTablero({ cmp, A, B }: { cmp: Comparacion; A: PerfilPais; B: PerfilPais }) {
  return (
    <div className="obs2-print-only mt-8 space-y-6">
      {TEMAS.map((t) => (
        <div key={t.id} className="obs2-avoid">
          <h3 className="mb-2 text-lg font-bold" style={{ color: P2.navy }}>{t.nombre}</h3>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr style={{ background: "#EEF3F4" }}>
                <th className="p-1.5 text-left">Indicador</th>
                <th className="p-1.5 text-left">{A.pais}</th>
                <th className="p-1.5 text-left">{B.pais}</th>
              </tr>
            </thead>
            <tbody>
              {cmp.filas
                .filter((f) => f.tema.id === t.id)
                .map((f) => {
                  const va = A.categorias[t.id]?.indicadores?.[f.ind.id];
                  const vb = B.categorias[t.id]?.indicadores?.[f.ind.id];
                  return (
                    <tr key={f.ind.id} className="align-top" style={{ borderBottom: "1px solid #E3EAEE" }}>
                      <td className="p-1.5 font-semibold">{f.ind.label}</td>
                      <td className="p-1.5"><Pill2 estado={f.a} /> <div className="mt-1">{va?.nota ?? ""}</div></td>
                      <td className="p-1.5"><Pill2 estado={f.b} /> <div className="mt-1">{vb?.nota ?? ""}</div></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
