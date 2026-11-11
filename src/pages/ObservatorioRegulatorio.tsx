import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Fingerprint,
  Home,
  Landmark,
  Languages,
  Layers,
  Link2,
  Map as MapIcon,
  MousePointerClick,
  PieChart,
  Printer,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import CountryPicker from "@/components/observatorio/CountryPicker";
import { CoincidenceRing, GroupedBars, RadarChart } from "@/components/observatorio/Charts";
import TemaBoard, { RESALTE, type Abierto, type Resaltado } from "@/components/observatorio/TemaBoard";
import TemaComparison from "@/components/observatorio/TemaComparison";
import RegionalView, { type SeleccionRegional } from "@/components/observatorio/RegionalView";
import RegionalMatrix from "@/components/observatorio/RegionalMatrix";
import { COLOR_A, COLOR_B, Flag, IND_META, IndIcon, SectionTitle, StatusIcon, TemaIcon } from "@/components/observatorio/ui";
import { ESTADO_LABEL, TEMAS, TOTAL_INDICADORES, type PerfilPais } from "@/data/observatorio/schema";
import {
  PERFILES,
  PERFIL_BY_ISO,
  ULTIMA_VERIFICACION,
  comparar,
  conteoTotal,
  fechaLarga,
  nombreCorto,
  unirLista,
  veredictoTexto,
  type Comparacion,
  type FilaComparacion,
} from "@/lib/observatorio";
import "@/styles/observatorio.css";

const PARES_SUGERIDOS: [string, string][] = [
  ["do", "cr"],
  ["mx", "co"],
  ["cl", "pe"],
  ["es", "pt"],
  ["br", "ar"],
  ["pa", "sv"],
];

const BORDE = "rgba(22,61,89,0.10)";
const SOMBRA = "0 1px 2px rgba(22,61,89,0.04), 0 10px 28px -18px rgba(22,61,89,0.22)";

function useHeaderHeight() {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = document.querySelector("header.header-font-fixed") as HTMLElement | null;
    if (!el) return;
    const update = () => setH(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);
  return h;
}

/* ───────────── Piezas visuales ───────────── */

function Tarjeta({ icon, titulo, extra, children, className = "" }: { icon: ReactNode; titulo: string; extra?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`obs-card min-w-0 rounded-[20px] border bg-white p-5 ${className}`} style={{ borderColor: BORDE, boxShadow: SOMBRA }}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}>
          {icon}
        </span>
        <h3 className="truncate font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1rem" }}>{titulo}</h3>
        {extra && <div className="ml-auto shrink-0">{extra}</div>}
      </div>
      {children}
    </div>
  );
}

function Chip({ f, color, bg, onFila }: { f: FilaComparacion; color: string; bg: string; onFila: (f: FilaComparacion) => void }) {
  return (
    <button
      type="button"
      onClick={() => onFila(f)}
      title={`${f.tema.nombre} · ${f.ind.label}`}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold transition hover:-translate-y-px hover:shadow-sm"
      style={{ borderColor: `${color}40`, background: bg, color: "var(--regu-navy)" }}
    >
      <IndIcon id={f.ind.id} size={14} color={color} />
      {IND_META[f.ind.id]?.corto ?? f.ind.label}
    </button>
  );
}

function Plegable({
  iso,
  titulo,
  filas,
  color,
  bg,
  onFila,
  vacio,
  activo,
  onResaltar,
}: {
  iso: string;
  titulo: string;
  filas: FilaComparacion[];
  color: string;
  bg: string;
  onFila: (f: FilaComparacion) => void;
  vacio: string;
  activo: boolean;
  onResaltar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: activo ? color : `${color}30`, boxShadow: activo ? `0 0 0 1px ${color}` : undefined }}>
      <button type="button" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:brightness-[0.98]" style={{ background: bg }}>
        <Flag iso={iso} size={22} />
        <span className="min-w-0 flex-1 truncate text-[0.875rem] font-bold" style={{ color: "var(--regu-navy)" }}>{titulo}</span>
        <span className="text-[0.9375rem] font-extrabold tabular-nums" style={{ color }}>{filas.length}</span>
        <ChevronRight className={`h-4 w-4 transition ${abierto ? "rotate-90" : ""}`} style={{ color }} />
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 p-3">
              {filas.length === 0 ? (
                <p className="text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>{vacio}</p>
              ) : (
                filas.map((f) => <Chip key={f.ind.id} f={f} color={color} bg="#fff" onFila={onFila} />)
              )}
              {filas.length > 0 && (
                <button type="button" onClick={onResaltar} className="mt-1 w-full text-left text-[0.75rem] font-bold hover:underline" style={{ color }}>
                  {activo ? "Quitar resaltado del tablero" : "Resaltar en el tablero ↓"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IndicadoresComun({
  cmp,
  A,
  B,
  onFila,
  resaltado,
  onResaltar,
}: {
  cmp: Comparacion;
  A: PerfilPais;
  B: PerfilPais;
  onFila: (f: FilaComparacion) => void;
  resaltado: Resaltado;
  onResaltar: (r: Exclude<Resaltado, null>) => void;
}) {
  const [todos, setTodos] = useState(false);
  const LIM = 6;
  const visibles = todos ? cmp.enComun : cmp.enComun.slice(0, LIM);
  return (
    <div>
      {cmp.enComun.length === 0 ? (
        <p className="text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>No comparten prácticas identificadas.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {visibles.map((f) => (
            <Chip key={f.ind.id} f={f} color="#15803D" bg="#F0FDF4" onFila={onFila} />
          ))}
        </div>
      )}
      {cmp.enComun.length > LIM && (
        <button type="button" onClick={() => setTodos((t) => !t)} className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-bold hover:underline" style={{ color: "var(--regu-blue)" }}>
          {todos ? "Ver menos" : `Ver todos (${cmp.enComun.length})`} <ArrowRight className={`h-3.5 w-3.5 transition ${todos ? "-rotate-90" : ""}`} />
        </button>
      )}
      <div className="mt-4 space-y-2">
        <Plegable iso={A.iso} titulo={`Solo ${nombreCorto(A.pais)}`} filas={cmp.soloA} color={COLOR_A} bg="rgba(22,61,89,0.05)" onFila={onFila} vacio={`Todo lo de ${A.pais} también existe en ${B.pais}.`} activo={resaltado === "soloA"} onResaltar={() => onResaltar("soloA")} />
        <Plegable iso={B.iso} titulo={`Solo ${nombreCorto(B.pais)}`} filas={cmp.soloB} color={COLOR_B} bg="rgba(31,127,140,0.07)" onFila={onFila} vacio={`Todo lo de ${B.pais} también existe en ${A.pais}.`} activo={resaltado === "soloB"} onResaltar={() => onResaltar("soloB")} />
      </div>
    </div>
  );
}

const TEMA_FRASE: Record<string, string> = {
  espectro: "espectro",
  competencia: "competencia",
  ciberseguridad: "ciberseguridad",
  usuario: "protección del usuario",
  emergentes: "tecnologías emergentes",
  infraestructura: "infraestructura",
  emergencia: "emergencias",
  homologacion: "homologación",
};

/** Frase del resumen ejecutivo generada a partir de los datos */
function FraseResumen({ cmp, A, B }: { cmp: Comparacion; A: PerfilPais; B: PerfilPais }) {
  const plenos = cmp.porTema
    .filter((t) => t.diferencias === 0 && t.a.valor >= 3.5 && t.b.valor >= 3.5)
    .sort((x, y) => Math.min(y.a.valor, y.b.valor) - Math.min(x.a.valor, x.b.valor))
    .slice(0, 3)
    .map((t) => TEMA_FRASE[t.tema.id]);
  const difs = cmp.porTema
    .filter((t) => t.diferencias > 0)
    .sort((x, y) => y.diferencias - x.diferencias)
    .slice(0, 2)
    .map((t) => TEMA_FRASE[t.tema.id]);
  return (
    <>
      <strong>{A.pais}</strong> y <strong>{B.pais}</strong> comparten el <strong>{cmp.coincidencia} %</strong> de sus prácticas regulatorias
      {plenos.length ? <>, con plena coincidencia en {unirLista(plenos)}</> : null}.{" "}
      {cmp.diferencias === 0 ? (
        <>No se identifican diferencias.</>
      ) : (
        <>
          Se identifican <strong>{cmp.diferencias} {cmp.diferencias === 1 ? "diferencia" : "diferencias"}</strong>
          {difs.length ? <>, sobre todo en {unirLista(difs)}</> : null}.
        </>
      )}
    </>
  );
}

function SugeridasMenu({ A, B, onPick }: { A: PerfilPais; B: PerfilPais; onPick: (a: string, b: string) => void }) {
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-[52px] items-center gap-2 rounded-2xl border-2 bg-white px-4 text-[0.875rem] font-bold transition hover:shadow-md"
        style={{ borderColor: open ? "var(--regu-blue)" : "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
      >
        <Sparkles className="h-4 w-4" style={{ color: "var(--regu-blue)" }} /> Sugeridas <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[290px] overflow-hidden rounded-2xl border bg-white p-2 shadow-2xl" style={{ borderColor: "rgba(22,61,89,0.12)" }}>
          <p className="px-3 pb-1 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>Comparaciones sugeridas</p>
          {PARES_SUGERIDOS.filter(([a, b]) => PERFIL_BY_ISO[a] && PERFIL_BY_ISO[b]).map(([a, b]) => {
            const activo = (a === A.iso && b === B.iso) || (a === B.iso && b === A.iso);
            return (
              <button
                key={a + b}
                type="button"
                onClick={() => {
                  onPick(a, b);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.8125rem] font-semibold transition hover:bg-slate-50"
                style={{ color: "var(--regu-navy)", background: activo ? "rgba(68,137,198,0.08)" : undefined }}
              >
                <Flag iso={a} size={20} /> <Flag iso={b} size={20} />
                <span className="truncate">{PERFIL_BY_ISO[a].pais} · {PERFIL_BY_ISO[b].pais}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReguladorCol({ p, color, label }: { p: PerfilPais; color: string; label: string }) {
  const total = conteoTotal(p);
  return (
    <div className="min-w-0">
      <div className="flex items-start gap-3">
        <Flag iso={p.iso} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color }}>{label}</p>
          <p className="truncate font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1.125rem" }}>{p.pais}</p>
          <p className="truncate text-[0.8125rem] font-semibold" style={{ color }}>{p.regulador.sigla} · {p.regulador.nombre}</p>
        </div>
      </div>
      <p className="mt-3 text-[0.875rem] leading-relaxed" style={{ color: "var(--regu-gray-900)" }}>{p.resumenPais}</p>
      <dl className="mt-3 space-y-1.5 text-[0.8125rem]">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold" style={{ color: "var(--regu-gray-500)" }}>Marco legal</dt>
          <dd style={{ color: "var(--regu-gray-900)" }}>
            {p.marcoLegal.url ? <a href={p.marcoLegal.url} target="_blank" rel="noreferrer" className="hover:underline">{p.marcoLegal.nombre}</a> : p.marcoLegal.nombre}
          </dd>
        </div>
        {p.regulador.naturaleza && (
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-semibold" style={{ color: "var(--regu-gray-500)" }}>Naturaleza</dt>
            <dd style={{ color: "var(--regu-gray-900)" }}>{p.regulador.naturaleza}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold" style={{ color: "var(--regu-gray-500)" }}>Prácticas</dt>
          <dd style={{ color: "var(--regu-gray-900)" }}>
            <strong style={{ color }}>{total.si}</strong> de {TOTAL_INDICADORES} identificadas{total.parcial ? ` · ${total.parcial} en proceso` : ""}
          </dd>
        </div>
      </dl>
      {p.otrasAutoridades?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.otrasAutoridades.slice(0, 5).map((o, i) => (
            <a key={i} href={o.url} target="_blank" rel="noreferrer" title={o.rol ? `${o.nombre} — ${o.rol}` : o.nombre} className="rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold transition hover:bg-slate-50" style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }}>
              {o.sigla || o.nombre}
            </a>
          ))}
        </div>
      )}
      <a href={p.regulador.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[0.8125rem] font-bold transition hover:bg-slate-50" style={{ borderColor: `${color}55`, color }}>
        Sitio oficial de {p.regulador.sigla} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ───────────── Página ───────────── */

export default function ObservatorioRegulatorio() {
  const [params, setParams] = useSearchParams();
  const headerH = useHeaderHeight();
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? "es").split("-")[0];
  const avisoIdioma: Record<string, string> = {
    en: "The verified content of this Observatory is available in Spanish.",
    pt: "O conteúdo verificado deste Observatório está disponível em espanhol.",
    it: "Il contenuto verificato di questo Osservatorio è disponibile in spagnolo.",
  };

  const isoA = PERFIL_BY_ISO[params.get("a") ?? ""] ? (params.get("a") as string) : PERFIL_BY_ISO.do ? "do" : PERFILES[0]?.iso;
  const fallbackB = ["cr", "cl", "co"].find((x) => PERFIL_BY_ISO[x] && x !== isoA) ?? PERFILES.find((p) => p.iso !== isoA)?.iso;
  const isoBParam = params.get("b") ?? "";
  const isoB = PERFIL_BY_ISO[isoBParam] && isoBParam !== isoA ? isoBParam : fallbackB;
  const vista = params.get("vista") === "region" ? "region" : "comparar";
  const [soloDiferencias, setSoloDiferencias] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [temaActivo, setTemaActivo] = useState<string>(TEMAS[0].id);
  const [abierto, setAbierto] = useState<Abierto | null>(null);
  const [resaltado, setResaltado] = useState<Resaltado>(null);
  // Navegación de ida y vuelta entre el panorama regional y la comparación
  const [selRegion, setSelRegion] = useState<SeleccionRegional>({ temaId: "usuario", indId: "usu_portabilidad" });
  const [volverY, setVolverY] = useState<number | null>(null);
  const volverYRef = useRef<number | null>(null);
  volverYRef.current = volverY;
  const scrollPendiente = useRef<{ tipo: "inicio" } | { tipo: "y"; y: number } | null>(null);
  const vistaRef = useRef<"comparar" | "region">("comparar");
  const vistaPrev = useRef<"comparar" | "region">("comparar");
  const [mostrarSubir, setMostrarSubir] = useState(false);
  const [flash, setFlash] = useState<{ id: string; k: number } | null>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const A = isoA ? PERFIL_BY_ISO[isoA] : null;
  const B = isoB ? PERFIL_BY_ISO[isoB] : null;
  const cmp = useMemo(() => (A && B ? comparar(A, B) : null), [A, B]);

  useEffect(() => {
    document.title = A && B ? `Observatorio Regulatorio · ${A.pais} vs ${B.pais} · REGULATEL` : "Observatorio Regulatorio · REGULATEL";
  }, [A, B]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const setPar = useCallback(
    (a: string, b: string) => {
      const next = new URLSearchParams(params);
      next.set("a", a);
      next.set("b", b);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const setVista = (v: "comparar" | "region", extra?: Record<string, string>) => {
    // Si se vuelve al mapa con la pestaña, también se regresa a la posición donde se estaba
    if (v === "region" && volverYRef.current != null) {
      scrollPendiente.current = { tipo: "y", y: volverYRef.current };
      setVolverY(null);
    }
    const next = new URLSearchParams(params);
    if (v === "region") next.set("vista", "region");
    else next.delete("vista");
    if (extra) Object.entries(extra).forEach(([k, val]) => next.set(k, val));
    setParams(next, { replace: true });
  };

  vistaRef.current = vista;

  // Botón "Atrás" del navegador: al regresar al panorama, se restaura la posición exacta
  useEffect(() => {
    if (vistaPrev.current === "comparar" && vista === "region" && volverYRef.current != null && !scrollPendiente.current) {
      scrollPendiente.current = { tipo: "y", y: volverYRef.current };
      setVolverY(null);
    }
    vistaPrev.current = vista;
  }, [vista]);

  /** Se ejecuta cuando la vista nueva ya está en pantalla: aplica el desplazamiento pendiente */
  const procesarScroll = (v: "comparar" | "region") => {
    const p = scrollPendiente.current;
    if (!p || v !== vistaRef.current) return;
    scrollPendiente.current = null;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (p.tipo === "y") window.scrollTo({ top: p.y });
        else document.getElementById("obs-vista-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
  };

  // Botón discreto para subir, visible solo cuando se bajó bastante
  useEffect(() => {
    const on = () => setMostrarSubir(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  /** Lleva al tema y lo ilumina en amarillo unos segundos para ubicarlo de inmediato */
  const bloqueoObs = useRef(0);
  const irATema = (id: string) => {
    document.getElementById(`tema-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const k = Date.now();
    bloqueoObs.current = k + 1400; // el tema elegido manda mientras termina el desplazamiento
    setTemaActivo(id);
    setFlash({ id, k });
    window.setTimeout(() => setFlash((f) => (f && f.k === k ? null : f)), 3000);
  };

  /** Resalta en el tablero lo que se eligió (en común / solo A / solo B) */
  const resaltar = (r: Exclude<Resaltado, null>) => {
    setResaltado((prev) => (prev === r ? null : r));
    if (resaltado !== r) document.getElementById("tablero")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Abre el detalle del tema en línea (debajo de su fila), con el indicador elegido desplegado */
  const abrir = useCallback((temaId: string, indId: string | null) => {
    setAbierto({ temaId, indId, k: Date.now() });
  }, []);
  const abrirFila = useCallback((f: FilaComparacion) => abrir(f.tema.id, f.ind.id), [abrir]);
  const cerrar = useCallback(() => {
    const id = abierto?.temaId;
    setAbierto(null);
    if (id) window.setTimeout(() => document.getElementById(`tema-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  }, [abierto]);

  // Al cambiar de países, se limpian el resaltado y el detalle abierto
  useEffect(() => {
    setResaltado(null);
    setAbierto(null);
  }, [isoA, isoB]);

  useEffect(() => {
    if (vista !== "comparar") return;
    const els = TEMAS.map((t) => document.getElementById(`tema-${t.id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < bloqueoObs.current) return;
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setTemaActivo(vis.target.id.replace("tema-", ""));
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [vista, isoA, isoB, soloDiferencias]);

  const descargarCSV = () => {
    if (!A || !B || !cmp) return;
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const head = ["Tema", "Indicador", `${A.pais} — estado`, `${A.pais} — detalle`, `${A.pais} — fuente`, `${B.pais} — estado`, `${B.pais} — detalle`, `${B.pais} — fuente`, "Resultado"];
    const rows = cmp.filas.map((f) => {
      const va = A.categorias[f.tema.id]?.indicadores?.[f.ind.id];
      const vb = B.categorias[f.tema.id]?.indicadores?.[f.ind.id];
      return [f.tema.nombre, f.ind.label, ESTADO_LABEL[f.a], va?.nota ?? "", va?.fuente ?? "", ESTADO_LABEL[f.b], vb?.nota ?? "", vb?.fuente ?? "", veredictoTexto(f.v, A.pais, B.pais)];
    });
    const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `observatorio-regulatel-${A.iso}-vs-${B.iso}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const compartir = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      /* noop */
    }
  };

  if (!A || !B || !cmp) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center" style={{ color: "var(--regu-gray-700)" }}>Cargando el Observatorio…</div>;
  }

  const kpis: [string, string, typeof Users][] = [
    [String(PERFILES.length), "países miembros", Users],
    ["8", "temas", Layers],
    [String(TOTAL_INDICADORES), "indicadores", BarChart3],
    [String(PERFILES.length * TOTAL_INDICADORES), "datos verificados", Database],
  ];

  /** Desde el mapa o la matriz: compara con el país elegido y recuerda dónde estaba el usuario */
  const irAComparar = (iso: string) => {
    if (iso === A.iso) return;
    setVolverY(window.scrollY);
    scrollPendiente.current = { tipo: "inicio" };
    const next = new URLSearchParams(params);
    next.delete("vista");
    next.set("a", A.iso);
    next.set("b", iso);
    setParams(next); // nueva entrada en el historial: "Atrás" del navegador regresa al panorama
  };

  const volverAlPanorama = () => {
    scrollPendiente.current = { tipo: "y", y: volverY ?? 0 };
    setVolverY(null);
    window.history.back();
  };

  return (
    <div className="obs-page min-h-screen" style={{ background: "var(--token-page-bg, #FAFCF6)" }}>
      {/* ───── Encabezado (estilo PageHero del sitio) ───── */}
      <section className="page-hero relative w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/images/breadcrumb.png')" }}>
        <div className="relative z-[2] mx-auto w-full max-w-[1500px] px-4 pb-20 pt-7 md:px-8 md:pt-9">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-[0.9375rem] text-white/90" aria-label="Ruta de navegación">
            <Link to="/" className="flex items-center gap-1.5 font-medium transition hover:text-white">
              <Home className="h-4 w-4" /> INICIO
            </Link>
            <ChevronRight className="h-4 w-4 text-white/70" />
            <Link to="/gestion" className="font-medium transition hover:text-white">Recursos</Link>
            <ChevronRight className="h-4 w-4 text-white/70" />
            <span className="border-b-2 pb-0.5 font-semibold text-white" style={{ borderColor: "var(--regu-lime)" }}>Observatorio Regulatorio</span>
          </nav>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
              <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-white/80">Regulación comparada · REGULATEL</p>
              <h1 className="font-bold tracking-tight text-white" style={{ fontSize: "clamp(1.9rem, 2.4vw + 1rem, 3.1rem)", lineHeight: 1.1, fontFamily: "var(--token-font-heading)" }}>
                Observatorio Regulatorio
              </h1>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-white/90 md:text-[1.15rem]">
                Compare en segundos cómo regulan las telecomunicaciones los miembros de REGULATEL, con datos verificados en fuentes oficiales.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4">
              {kpis.map(([n, l, Icono]) => (
                <div key={l} className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-white" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}>
                  <Icono className="h-6 w-6 shrink-0 text-white/85" strokeWidth={1.75} />
                  <div>
                    <p className="font-extrabold tabular-nums" style={{ fontSize: "1.5rem", lineHeight: 1, fontFamily: "var(--token-font-heading)" }}>{n}</p>
                    <p className="mt-1 text-[0.75rem] text-white/80">{l}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 w-full max-w-[1500px] px-4 md:px-8">
        {avisoIdioma[lang] && (
          <div className="obs-noprint mb-3 flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-[0.8125rem] font-semibold shadow-sm" style={{ borderColor: "rgba(68,137,198,0.35)", color: "var(--regu-navy)" }}>
            <Languages className="h-4 w-4 shrink-0" style={{ color: "var(--regu-blue)" }} /> {avisoIdioma[lang]}
          </div>
        )}

        {/* ───── Barra de comparación (una sola línea) ───── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="obs-noprint rounded-[22px] border bg-white p-4 sm:px-5"
          style={{ borderColor: BORDE, boxShadow: "0 24px 60px -24px rgba(22,61,89,0.35), 0 2px 6px rgba(22,61,89,0.06)" }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="hidden shrink-0 items-center gap-3 self-center pr-3 xl:flex" style={{ borderRight: "1px solid rgba(22,61,89,0.08)" }}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "rgba(68,137,198,0.10)" }}>
                <ArrowLeftRight className="h-5 w-5" style={{ color: "var(--regu-blue)" }} />
              </span>
              <div className="pr-2">
                <p className="font-bold leading-tight" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1.0625rem" }}>Comparar países</p>
                <p className="text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>Elija dos miembros</p>
              </div>
            </div>
            <CountryPicker compact label="País A" color={COLOR_A} value={A} options={PERFILES} disabledIso={B.iso} onChange={(iso) => setPar(iso, B.iso)} />
            <div className="flex items-center justify-center lg:pb-1">
              <button
                type="button"
                onClick={() => setPar(B.iso, A.iso)}
                className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition hover:scale-105 focus:outline-none focus-visible:ring-4"
                style={{ background: `linear-gradient(135deg, ${COLOR_A}, ${COLOR_B})` }}
                aria-label="Intercambiar países"
                title="Intercambiar países"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
            </div>
            <CountryPicker compact label="País B" color={COLOR_B} value={B} options={PERFILES} disabledIso={A.iso} onChange={(iso) => setPar(A.iso, iso)} align="right" />
            <div className="flex items-center justify-between gap-2 lg:justify-end">
              <SugeridasMenu A={A} B={B} onPick={setPar} />
              <span className="hidden h-[52px] items-center gap-1.5 rounded-2xl px-3.5 text-[0.75rem] font-semibold 2xl:inline-flex" style={{ background: "rgba(21,128,61,0.08)", color: "#166534" }} title="Fecha de la última verificación de los datos">
                <ShieldCheck className="h-4 w-4" /> Verificado: {fechaLarga(ULTIMA_VERIFICACION)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ───── Pestañas y acciones ───── */}
        <div id="obs-vista-top" className="obs-noprint mt-5 flex scroll-mt-[90px] flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex w-full rounded-full border bg-white p-1 sm:w-auto" role="tablist" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
            {[
              { id: "comparar", label: "Comparar dos países", icon: <ArrowLeftRight className="h-4 w-4" /> },
              { id: "region", label: "Mapa regional", icon: <MapIcon className="h-4 w-4" /> },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={vista === t.id}
                data-activo={vista === t.id}
                onClick={() => setVista(t.id as "comparar" | "region")}
                className="obs-tab inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[0.875rem] font-bold sm:flex-none"
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 sm:ml-auto">
            {[
              { k: "csv", onClick: descargarCSV, icon: <FileSpreadsheet className="h-4 w-4" />, label: "Excel", t: "Descargar la comparación (CSV para Excel)" },
              { k: "pdf", onClick: () => window.print(), icon: <Printer className="h-4 w-4" />, label: "PDF", t: "Imprimir o guardar como PDF con todo el detalle" },
              { k: "link", onClick: compartir, icon: copiado ? <CheckCircle2 className="h-4 w-4 text-green-700" /> : <Link2 className="h-4 w-4" />, label: copiado ? "¡Copiado!" : "Compartir", t: "Copiar el enlace de esta comparación" },
            ].map((b) => (
              <button key={b.k} type="button" onClick={b.onClick} title={b.t} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border bg-white px-3.5 py-2 text-[0.8125rem] font-semibold transition hover:bg-slate-50 sm:flex-none" style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {vista === "region" ? (
            <motion.section key="region" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6" onAnimationStart={() => procesarScroll("region")}>
              <SectionTitle eyebrow="Vista regional" title="¿Qué tan extendida está cada práctica en la región?">
                Elija un tema y un indicador: el mapa muestra al instante qué miembros lo tienen. Haga clic en una bandera para compararla.
              </SectionTitle>
              <RegionalView perfiles={PERFILES} isoA={A.iso} isoB={B.iso} onPick={irAComparar} sel={selRegion} onSel={setSelRegion} />
              <div className="mt-6">
                <RegionalMatrix perfiles={PERFILES} isoA={A.iso} isoB={B.iso} onPick={irAComparar} />
              </div>
            </motion.section>
          ) : (
            <motion.div key={`cmp-${A.iso}-${B.iso}`} ref={compareRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onAnimationStart={() => procesarScroll("comparar")}>
              {/* Encabezado de impresión */}
              <div className="obs-print-only mb-4">
                <p className="text-sm font-bold">REGULATEL · Observatorio Regulatorio</p>
                <p className="text-xl font-bold">{A.pais} vs {B.pais}</p>
                <p className="text-xs">Información verificada al {fechaLarga(ULTIMA_VERIFICACION)}</p>
              </div>

              {/* ───── Resumen ejecutivo: 4 tarjetas ───── */}
              <section className="mt-6" aria-label="Resumen ejecutivo">
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <Tarjeta icon={<PieChart className="h-4 w-4" />} titulo="Similitud regulatoria">
                    <div className="flex items-center gap-4">
                      <CoincidenceRing value={cmp.coincidencia} size={124} />
                      <ul className="min-w-0 flex-1 divide-y" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        {(
                          [
                            { k: "comun", n: cmp.enComun.length, label: "En común", color: "#15803D", t: "Resaltar abajo las prácticas que tienen ambos países" },
                            { k: "soloA", n: cmp.soloA.length, label: "Solo", color: COLOR_A, iso: A.iso, t: `Resaltar abajo lo que solo tiene ${A.pais}` },
                            { k: "soloB", n: cmp.soloB.length, label: "Solo", color: COLOR_B, iso: B.iso, t: `Resaltar abajo lo que solo tiene ${B.pais}` },
                          ] as const
                        ).map((r) => {
                          const activo = resaltado === r.k;
                          return (
                            <li key={r.k} style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                              <button
                                type="button"
                                onClick={() => resaltar(r.k)}
                                title={r.t}
                                aria-pressed={activo}
                                className="group my-0.5 flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-slate-50"
                                style={activo ? { background: RESALTE[r.k].bg, boxShadow: `inset 0 0 0 1.5px ${RESALTE[r.k].borde}` } : undefined}
                              >
                                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                                <strong className="w-7 tabular-nums" style={{ color: r.color, fontSize: "1rem", fontFamily: "var(--token-font-heading)" }}>{r.n}</strong>
                                <span className="text-[0.8125rem] font-semibold" style={{ color: "var(--regu-navy)" }}>{r.label}</span>
                                {"iso" in r && <Flag iso={r.iso} size={18} />}
                                <MousePointerClick className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:opacity-50" style={{ color: r.color }} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <p className="mt-4 text-[0.875rem] leading-relaxed" style={{ color: "var(--regu-gray-900)" }}>
                      <FraseResumen cmp={cmp} A={A} B={B} />
                    </p>
                  </Tarjeta>

                  <Tarjeta
                    icon={<Fingerprint className="h-4 w-4" />}
                    titulo="Huella regulatoria"
                    extra={
                      <span className="flex items-center gap-2.5 text-[0.75rem] font-semibold">
                        <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-4" style={{ background: COLOR_A }} /><Flag iso={A.iso} size={14} /></span>
                        <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-4" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${COLOR_B} 0 5px, transparent 5px 8px)` }} /><Flag iso={B.iso} size={14} /></span>
                      </span>
                    }
                  >
                    <RadarChart cmp={cmp} onSelectTema={irATema} size={320} />
                    <p className="mt-1 text-center text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>Cuanto más grande la figura, más prácticas tiene el país.</p>
                  </Tarjeta>

                  <Tarjeta
                    icon={<BarChart3 className="h-4 w-4" />}
                    titulo="Prácticas por tema"
                    extra={
                      <span className="flex items-center gap-2.5 text-[0.6875rem] font-semibold">
                        <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_A }} /><Flag iso={A.iso} size={14} /></span>
                        <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_B }} /><Flag iso={B.iso} size={14} /></span>
                      </span>
                    }
                  >
                    <GroupedBars cmp={cmp} onSelectTema={irATema} />
                    <p className="mt-3 text-center text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>Prácticas identificadas de 5 por tema (◐ suma 0,5).</p>
                  </Tarjeta>

                  <Tarjeta
                    icon={<CircleCheck className="h-4 w-4" />}
                    titulo="Indicadores en común"
                    extra={
                      <button
                        type="button"
                        onClick={() => resaltar("comun")}
                        title="Resaltar abajo las prácticas en común"
                        className="rounded-full px-2.5 py-0.5 text-[0.875rem] font-extrabold tabular-nums transition hover:brightness-95"
                        style={{ background: resaltado === "comun" ? "#BBF7D0" : "#F0FDF4", color: "#15803D", boxShadow: resaltado === "comun" ? "inset 0 0 0 1.5px #15803D" : undefined }}
                      >
                        {cmp.enComun.length}
                      </button>
                    }
                  >
                    <IndicadoresComun cmp={cmp} A={A} B={B} onFila={abrirFila} resaltado={resaltado} onResaltar={resaltar} />
                  </Tarjeta>
                </div>
              </section>

              {/* ───── Tablero por tema ───── */}
              <section id="tablero" className="mt-10 scroll-mt-[90px]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <SectionTitle eyebrow="Tema por tema" title="Tablero comparativo">
                    <span className="inline-flex items-center gap-1.5">
                      <MousePointerClick className="h-4 w-4" style={{ color: "var(--regu-blue)" }} /> Toque cualquier fila para ver el detalle y la fuente oficial.
                    </span>
                  </SectionTitle>
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    {(["si", "parcial", "no", "sin_dato"] as const).map((e) => (
                      <span key={e} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[0.8125rem] font-semibold" style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-navy)" }}>
                        <StatusIcon estado={e} size={16} /> {e === "si" ? "Sí" : e === "parcial" ? "En proceso" : e === "no" ? "No" : "Sin dato"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Barra fija */}
                <div className="obs-noprint obs-sticky sticky z-30 -mx-4 mb-5 border-y px-4 py-2.5 md:-mx-8 md:px-8" style={{ top: headerH, borderColor: "rgba(22,61,89,0.08)" }}>
                  <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 xl:justify-start">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[0.875rem] font-bold" style={{ color: COLOR_A }}>
                          <Flag iso={A.iso} size={22} /> <span className="truncate">{A.pais}</span>
                        </span>
                        <button type="button" onClick={() => setPar(B.iso, A.iso)} className="shrink-0 rounded-full p-1.5 transition hover:bg-slate-100" aria-label="Intercambiar países" title="Intercambiar">
                          <ArrowLeftRight className="h-4 w-4" style={{ color: "var(--regu-gray-500)" }} />
                        </button>
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[0.875rem] font-bold" style={{ color: COLOR_B }}>
                          <Flag iso={B.iso} size={22} /> <span className="truncate">{B.pais}</span>
                        </span>
                      </div>
                      <label className="inline-flex shrink-0 cursor-pointer select-none items-center gap-2 text-[0.8125rem] font-semibold xl:order-last" style={{ color: "var(--regu-navy)" }}>
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full transition" style={{ background: soloDiferencias ? "var(--regu-blue)" : "#CBD5E1" }}>
                          <input type="checkbox" className="sr-only" checked={soloDiferencias} onChange={(e) => setSoloDiferencias(e.target.checked)} />
                          <span className="inline-block h-5 w-5 rounded-full bg-white shadow transition" style={{ transform: soloDiferencias ? "translateX(22px)" : "translateX(2px)" }} />
                        </span>
                        <Filter className="h-3.5 w-3.5" /> Ver solo diferencias ({cmp.diferencias})
                      </label>
                      <AnimatePresence>
                        {resaltado && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-3 pr-1 text-[0.75rem] font-bold xl:order-last"
                            style={{ background: RESALTE[resaltado].bg, color: RESALTE[resaltado].texto, boxShadow: `inset 0 0 0 1.5px ${RESALTE[resaltado].borde}` }}
                          >
                            Resaltando: {resaltado === "comun" ? `En común (${cmp.enComun.length})` : resaltado === "soloA" ? `Solo ${nombreCorto(A.pais)} (${cmp.soloA.length})` : `Solo ${nombreCorto(B.pais)} (${cmp.soloB.length})`}
                            <button type="button" onClick={() => setResaltado(null)} className="rounded-full p-1 transition hover:bg-white/60" aria-label="Quitar resaltado" title="Quitar resaltado">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <nav className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1" aria-label="Temas">
                      <div className="flex w-max gap-1 py-0.5 xl:ml-auto">
                        {cmp.porTema.map(({ tema, diferencias }) => (
                          <button
                            key={tema.id}
                            type="button"
                            onClick={() => irATema(tema.id)}
                            data-activo={temaActivo === tema.id}
                            title={`Ir a ${tema.nombre}`}
                            className="obs-pill inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.75rem] font-semibold"
                          >
                            <TemaIcon icono={tema.icono} size={14} />
                            {tema.corto}
                            {diferencias > 0 && (
                              <span className="rounded-full px-1.5 text-[0.625rem] font-bold" style={temaActivo === tema.id ? { background: "rgba(255,255,255,0.2)" } : { background: "#FFEDD5", color: "#9A3412" }}>
                                {diferencias}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </nav>
                  </div>
                </div>

                <div className="obs-noprint">
                  <TemaBoard
                    A={A}
                    B={B}
                    cmp={cmp}
                    soloDiferencias={soloDiferencias}
                    resaltado={resaltado}
                    flash={flash}
                    abierto={abierto}
                    onAbrir={abrir}
                    onCerrar={cerrar}
                  />
                </div>

                {/* Versión de impresión: detalle completo */}
                <div className="obs-print-only space-y-6">
                  {TEMAS.map((tema, i) => (
                    <TemaComparison key={tema.id} tema={tema} index={i} A={A} B={B} filas={cmp.filas.filter((f) => f.tema.id === tema.id)} soloDiferencias={false} />
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───── Cierre: reguladores, metodología y fuentes ───── */}
        <section className={`mt-12 grid gap-4 ${vista === "comparar" ? "xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" : "lg:grid-cols-2"}`}>
          {vista === "comparar" && (
            <Tarjeta icon={<Landmark className="h-4 w-4" />} titulo="¿Quién regula en cada país?">
              <div className="grid gap-6 md:grid-cols-2 md:divide-x" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                <ReguladorCol p={A} color={COLOR_A} label="País A" />
                <div className="md:pl-6" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                  <ReguladorCol p={B} color={COLOR_B} label="País B" />
                </div>
              </div>
            </Tarjeta>
          )}

          <div className={vista === "comparar" ? "flex min-w-0 flex-col gap-4" : "contents"}>
          <Tarjeta icon={<BookOpenCheck className="h-4 w-4" />} titulo="Metodología">
            <ul className="mb-4 grid grid-cols-2 gap-2 text-[0.8125rem]" style={{ color: "var(--regu-gray-900)" }}>
              <li className="flex items-center gap-2"><StatusIcon estado="si" size={20} /> <span><strong>Sí</strong>: vigente</span></li>
              <li className="flex items-center gap-2"><StatusIcon estado="parcial" size={20} /> <span><strong>En proceso</strong></span></li>
              <li className="flex items-center gap-2"><StatusIcon estado="no" size={20} /> <span><strong>No</strong>: confirmado</span></li>
              <li className="flex items-center gap-2"><StatusIcon estado="sin_dato" size={20} /> <span><strong>Sin dato</strong> público</span></li>
            </ul>
            <p className="text-[0.875rem] leading-relaxed" style={{ color: "var(--regu-gray-900)" }}>
              Los {PERFILES.length} miembros se evalúan con los mismos {TOTAL_INDICADORES} indicadores en 8 temas, definidos de forma objetiva para que la comparación sea justa. El porcentaje <strong>en común</strong> indica qué parte de las prácticas presentes en al menos uno de los dos países comparten ambos (◐ cuenta como presente).
            </p>
          </Tarjeta>

          <Tarjeta icon={<ShieldCheck className="h-4 w-4" />} titulo="Fuentes y alcance">
            <ul className="space-y-2.5 text-[0.875rem]" style={{ color: "var(--regu-gray-900)" }}>
              {[
                <>Información verificada al <strong>{fechaLarga(ULTIMA_VERIFICACION)}</strong>.</>,
                <>Fuentes oficiales: reguladores, ministerios, gacetas y listas oficiales de tratados.</>,
                <>Cada país, revisado por un segundo verificador independiente.</>,
                <>Cobertura: {PERFILES.length} países miembros de REGULATEL.</>,
              ].map((t, i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#15803D" }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.75rem] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
              Herramienta de referencia comparada: no constituye una evaluación oficial de los miembros ni sustituye la normativa de cada regulador. Documentos completos en{" "}
              <Link to="/micrositio-buenas-practicas" className="font-semibold hover:underline" style={{ color: "var(--regu-blue)" }}>Mejores prácticas regulatorias</Link>.
            </p>
          </Tarjeta>
          </div>
        </section>

        <div className="obs-noprint mb-16 mt-10 flex flex-wrap gap-3 border-t pt-8" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <Link to="/gestion" className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:opacity-90" style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)", backgroundColor: "rgba(22,61,89,0.04)" }}>
            ← Volver a Recursos
          </Link>
          <Link to="/micrositio-buenas-practicas" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-white" style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}>
            Mejores prácticas regulatorias
          </Link>
          <Link to="/miembros" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: "var(--regu-blue)" }}>
            Ver miembros →
          </Link>
        </div>
      </div>

      {/* ───── Volver al panorama regional (aparece al llegar desde el mapa o la matriz) ───── */}
      <div className="obs-noprint pointer-events-none fixed bottom-5 left-4 z-50 sm:left-1/2 sm:-translate-x-1/2">
        <AnimatePresence>
          {vista === "comparar" && volverY != null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto flex items-center gap-0.5 rounded-full p-1 shadow-2xl"
              style={{ background: "var(--regu-navy)", boxShadow: "0 12px 30px -10px rgba(5,19,41,0.55)" }}
            >
              <button
                type="button"
                onClick={volverAlPanorama}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.875rem] font-bold text-white transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <MapIcon className="h-4 w-4" style={{ color: "var(--regu-lime)" }} />
                Volver al panorama regional
              </button>
              <button
                type="button"
                onClick={() => setVolverY(null)}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Ocultar este botón"
                title="Ocultar"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───── Subir al inicio ───── */}
      <AnimatePresence>
        {mostrarSubir && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="obs-noprint fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white transition hover:bg-slate-50"
            style={{ borderColor: "rgba(22,61,89,0.14)", boxShadow: "0 10px 24px -10px rgba(22,61,89,0.45)", color: "var(--regu-navy)" }}
            aria-label="Volver arriba"
            title="Volver arriba"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
