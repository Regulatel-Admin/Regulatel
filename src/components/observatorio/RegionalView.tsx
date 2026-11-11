import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Estado, PerfilPais, TemaId } from "@/data/observatorio/schema";
import { TEMAS } from "@/data/observatorio/schema";
import { estadoDe } from "@/lib/observatorio";
import { DotMap } from "./DotMap";
import { COLOR_A, COLOR_B, ESTADO_COLOR, ESTADO_TEXTO, Flag, IndIcon, StatusIcon, TemaIcon } from "./ui";

const GRUPOS: { e: Estado; titulo: string }[] = [
  { e: "si", titulo: "Lo tienen" },
  { e: "parcial", titulo: "En proceso" },
  { e: "no", titulo: "No lo tienen" },
  { e: "sin_dato", titulo: "Sin dato público" },
];

export interface SeleccionRegional {
  temaId: TemaId;
  indId: string;
}

export default function RegionalView({
  perfiles,
  isoA,
  isoB,
  onPick,
  sel,
  onSel,
}: {
  perfiles: PerfilPais[];
  isoA: string;
  isoB: string;
  onPick: (iso: string) => void;
  /** Tema e indicador elegidos (se conservan al ir a comparar y volver) */
  sel: SeleccionRegional;
  onSel: (s: SeleccionRegional) => void;
}) {
  const temaId = sel.temaId;
  const tema = TEMAS.find((t) => t.id === temaId)!;
  const indId = sel.indId;
  const ind = tema.indicadores.find((i) => i.id === indId) ?? tema.indicadores[0];
  const setTemaId = (t: TemaId) => onSel({ temaId: t, indId: TEMAS.find((x) => x.id === t)!.indicadores[0].id });
  const setIndId = (i: string) => onSel({ temaId, indId: i });
  const [hover, setHover] = useState<string | null>(null);

  const byIso = useMemo(() => Object.fromEntries(perfiles.map((p) => [p.iso, p])), [perfiles]);
  const estados = useMemo(
    () => Object.fromEntries(perfiles.map((p) => [p.iso, estadoDe(p, tema.id, ind.id)])) as Record<string, Estado>,
    [perfiles, tema.id, ind.id]
  );
  const grupos = useMemo(() => {
    const g: Record<Estado, PerfilPais[]> = { si: [], parcial: [], no: [], sin_dato: [] };
    perfiles.forEach((p) => g[estados[p.iso]].push(p));
    return g;
  }, [perfiles, estados]);

  const adopcion = useMemo(
    () =>
      tema.indicadores.map((i) => ({
        ind: i,
        si: perfiles.filter((p) => estadoDe(p, tema.id, i.id) === "si").length,
        parcial: perfiles.filter((p) => estadoDe(p, tema.id, i.id) === "parcial").length,
      })),
    [perfiles, tema]
  );

  const hovered = hover ? byIso[hover] : null;
  const hoveredVal = hovered ? hovered.categorias[tema.id]?.indicadores?.[ind.id] : null;
  const pct = perfiles.length ? Math.round((grupos.si.length / perfiles.length) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 rounded-[20px] border bg-white p-5 sm:p-6" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
        {/* Selección de tema */}
        <p className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>1 · Tema</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {TEMAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemaId(t.id)}
              data-activo={t.id === temaId}
              className="obs-pill obs-pill--borde inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold"
            >
              <TemaIcon icono={t.icono} size={15} />
              {t.corto}
            </button>
          ))}
        </div>

        <p className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>2 · Indicador</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {tema.indicadores.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setIndId(i.id)}
              data-activo={i.id === ind.id}
              className="obs-pill obs-pill--borde obs-pill--suave inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-left text-[0.8125rem] font-semibold"
            >
              <IndIcon id={i.id} size={14} color="var(--regu-blue)" />
              {i.label}
            </button>
          ))}
        </div>

        {/* Titular */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-blue)" }}>Mapa regional</p>
            <h4 className="font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1.25rem", lineHeight: 1.25 }}>
              {ind.label}
            </h4>
          </div>
          <div className="text-right">
            <p className="font-extrabold tabular-nums" style={{ color: ESTADO_COLOR.si.bg, fontSize: "1.75rem", lineHeight: 1, fontFamily: "var(--token-font-heading)" }}>
              {grupos.si.length}<span className="text-[1rem] font-bold" style={{ color: "var(--regu-gray-500)" }}> / {perfiles.length}</span>
            </p>
            <p className="text-[0.75rem] font-semibold" style={{ color: "var(--regu-gray-500)" }}>miembros ({pct} %) lo tienen</p>
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px] 2xl:items-start">
        <div className="min-w-0">
        {/* Mapa */}
        <div className="mx-auto w-full max-w-[720px]">
          <DotMap perfiles={perfiles} estados={estados} isoA={isoA} isoB={isoB} hover={hover} setHover={setHover} onPick={onPick} />
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem]" style={{ color: "var(--regu-gray-700)" }}>
          {GRUPOS.map(({ e }) => (
            <span key={e} className="inline-flex items-center gap-2">
              <StatusIcon estado={e} size={18} /> {ESTADO_TEXTO[e]} <strong className="tabular-nums">{grupos[e].length}</strong>
            </span>
          ))}
          <span className="inline-flex items-center gap-3 sm:ml-auto">
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{ boxShadow: `0 0 0 2px ${COLOR_A}` }} /> País A</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{ boxShadow: `0 0 0 2px ${COLOR_B}` }} /> País B</span>
          </span>
        </div>

        </div>
        {/* Listas por estado */}
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2 2xl:grid-cols-1 2xl:border-l 2xl:border-t-0 2xl:pl-6 2xl:pt-0" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          {GRUPOS.filter((g) => grupos[g.e].length > 0).map(({ e, titulo }) => (
            <div key={e}>
              <p className="mb-2 flex items-center gap-2 text-[0.75rem] font-bold" style={{ color: "var(--regu-navy)" }}>
                <StatusIcon estado={e} size={16} /> {titulo} ({grupos[e].length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {grupos[e].map((p) => (
                  <button
                    key={p.iso}
                    type="button"
                    onMouseEnter={() => setHover(p.iso)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onPick(p.iso)}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2 py-1 text-[0.75rem] font-semibold transition hover:bg-slate-50"
                    style={{ borderColor: p.iso === isoA ? COLOR_A : p.iso === isoB ? COLOR_B : "rgba(22,61,89,0.12)", color: "var(--regu-navy)" }}
                  >
                    <Flag iso={p.iso} size={16} /> {p.pais}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Panel lateral */}
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[20px] border bg-white p-5" style={{ borderColor: "rgba(22,61,89,0.10)", minHeight: 170 }}>
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.div key={hovered.iso} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="mb-3 flex items-center gap-3">
                  <Flag iso={hovered.iso} size={36} />
                  <div className="min-w-0">
                    <p className="truncate font-bold" style={{ color: "var(--regu-navy)" }}>{hovered.pais}</p>
                    <p className="truncate text-xs" style={{ color: "var(--regu-gray-500)" }}>{hovered.regulador.sigla} · {hovered.regulador.nombre}</p>
                  </div>
                  <span className="ml-auto"><StatusIcon estado={estados[hovered.iso]} size={28} /></span>
                </div>
                <p className="text-[0.875rem] leading-snug" style={{ color: "var(--regu-gray-900)" }}>
                  {hoveredVal?.nota ?? "Sin información pública confirmada para este indicador."}
                </p>
                <p className="mt-3 text-[0.75rem] font-semibold" style={{ color: "var(--regu-blue)" }}>Clic para compararlo con {byIso[isoA]?.pais ?? "el país A"} →</p>
              </motion.div>
            ) : (
              <motion.div key="ayuda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>¿Qué mide?</p>
                <p className="mt-1 text-[0.9375rem] leading-relaxed" style={{ color: "var(--regu-gray-900)" }}>{ind.ayuda}</p>
                <p className="mt-3 text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>Pase el cursor sobre una bandera para ver el detalle; haga clic para compararla.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-[20px] border bg-white p-5" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          <p className="mb-3 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>
            Adopción en la región · {tema.nombre}
          </p>
          <ul className="space-y-3">
            {adopcion.map(({ ind: i, si, parcial }) => (
              <li key={i.id}>
                <button type="button" onClick={() => setIndId(i.id)} className="w-full text-left">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-[0.8125rem] font-semibold leading-snug" style={{ color: i.id === ind.id ? "var(--regu-navy)" : "var(--regu-gray-700)" }}>
                      {i.id === ind.id ? "▸ " : ""}{i.label}
                    </span>
                    <span className="shrink-0 text-[0.75rem] font-bold tabular-nums" style={{ color: "var(--regu-navy)" }}>{si}/{perfiles.length}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.span initial={{ width: 0 }} animate={{ width: `${(si / Math.max(1, perfiles.length)) * 100}%` }} transition={{ duration: 0.6 }} style={{ background: ESTADO_COLOR.si.bg }} />
                    <motion.span initial={{ width: 0 }} animate={{ width: `${(parcial / Math.max(1, perfiles.length)) * 100}%` }} transition={{ duration: 0.6 }} style={{ background: ESTADO_COLOR.parcial.bg }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
