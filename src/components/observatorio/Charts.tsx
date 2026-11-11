import { motion } from "framer-motion";
import type { Comparacion } from "@/lib/observatorio";
import { fmt } from "@/lib/observatorio";
import { COLOR_A, COLOR_B, Flag, TemaIcon } from "./ui";

/** Anillo de coincidencia regulatoria (0–100 %) */
export function CoincidenceRing({ value, size = 176 }: { value: number; size?: number }) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id="obs-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLOR_A} />
            <stop offset="100%" stopColor={COLOR_B} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8EEF3" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#obs-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-extrabold tabular-nums" style={{ color: "var(--regu-navy)", fontSize: size * 0.24, lineHeight: 1, fontFamily: "var(--token-font-heading)" }}>
          {value}%
        </span>
        <span className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>
          en común
        </span>
      </div>
    </div>
  );
}

/** Barras agrupadas por tema (A arriba, B abajo): ideal para tarjetas angostas */
export function GroupedBars({ cmp, onSelectTema }: { cmp: Comparacion; onSelectTema?: (id: string) => void }) {
  return (
    <ul className="space-y-2.5">
      {cmp.porTema.map(({ tema, a, b }, i) => (
        <li key={tema.id}>
          <button
            type="button"
            onClick={() => onSelectTema?.(tema.id)}
            className="grid w-full grid-cols-[124px_minmax(0,1fr)_28px] items-center gap-2 rounded-lg text-left transition hover:bg-slate-50"
            title={`${tema.nombre}: ${fmt(a.valor)} vs ${fmt(b.valor)} de 5`}
          >
            <span className="flex min-w-0 items-center gap-1.5 text-[0.78rem] font-semibold" style={{ color: "var(--regu-navy)" }}>
              <TemaIcon icono={tema.icono} size={14} color="var(--regu-blue)" />
              <span className="truncate" title={tema.nombre}>{tema.corto}</span>
            </span>
            <span className="space-y-1">
              {[
                { v: a.valor, c: COLOR_A },
                { v: b.valor, c: COLOR_B },
              ].map((x, j) => (
                <span key={j} className="relative block h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: x.c }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(x.v / 5) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              ))}
            </span>
            <span className="text-right text-[0.6875rem] font-bold leading-[1.15] tabular-nums">
              <span className="block" style={{ color: COLOR_A }}>{fmt(a.valor)}</span>
              <span className="block" style={{ color: COLOR_B }}>{fmt(b.valor)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Radar ("huella regulatoria"): 8 ejes = 8 temas; cada país es una figura.
 * Cuanto más grande la figura en un eje, más prácticas identificadas en ese tema.
 */
export function RadarChart({
  cmp,
  size = 340,
  onSelectTema,
  compact = false,
}: {
  cmp: Comparacion;
  size?: number;
  onSelectTema?: (id: string) => void;
  compact?: boolean;
}) {
  const n = cmp.porTema.length;
  const pad = compact ? 14 : 58;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - pad;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => [cx + Math.cos(ang(i)) * (R * v) / 5, cy + Math.sin(ang(i)) * (R * v) / 5] as const;
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, Math.max(v, 0.15)).join(",")).join(" ");
  const valsA = cmp.porTema.map((t) => t.a.valor);
  const valsB = cmp.porTema.map((t) => t.b.valor);
  return (
    <svg
      viewBox={compact ? `0 0 ${size} ${size}` : `-40 0 ${size + 80} ${size}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: compact ? size : size + 80 }}
      role="img"
      aria-label="Gráfico de radar por tema"
    >
      {[1, 2, 3, 4, 5].map((g) => (
        <polygon
          key={g}
          points={Array.from({ length: n }, (_, i) => pt(i, g).join(",")).join(" ")}
          fill={g === 5 ? "#F8FAFC" : "none"}
          stroke="#E2E8F0"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E2E8F0" strokeWidth={1} />;
      })}
      <motion.g initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <polygon points={poly(valsA)} fill={COLOR_A} fillOpacity={0.16} stroke={COLOR_A} strokeWidth={2.5} strokeLinejoin="round" />
        <polygon points={poly(valsB)} fill={COLOR_B} fillOpacity={0.16} stroke={COLOR_B} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray="6 3" />
        {!compact &&
          valsA.map((v, i) => {
            const [x, y] = pt(i, Math.max(v, 0.15));
            return <circle key={`a${i}`} cx={x} cy={y} r={3.6} fill={COLOR_A} stroke="#fff" strokeWidth={1.5} />;
          })}
        {!compact &&
          valsB.map((v, i) => {
            const [x, y] = pt(i, Math.max(v, 0.15));
            return <circle key={`b${i}`} cx={x} cy={y} r={3.6} fill={COLOR_B} stroke="#fff" strokeWidth={1.5} />;
          })}
      </motion.g>
      {!compact &&
        cmp.porTema.map(({ tema, a, b }, i) => {
          const [x, y] = pt(i, 6.15);
          return (
            <g key={tema.id} style={{ cursor: onSelectTema ? "pointer" : undefined }} onClick={() => onSelectTema?.(tema.id)}>
              <title>{`${tema.nombre}: ${fmt(a.valor)} vs ${fmt(b.valor)} de 5`}</title>
              <circle cx={x} cy={y - 7} r={13} fill="#fff" stroke="rgba(22,61,89,0.14)" />
              <foreignObject x={x - 8} y={y - 15} width={16} height={16}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                  <TemaIcon icono={tema.icono} size={14} color="var(--regu-blue)" />
                </div>
              </foreignObject>
              <text x={x} y={y + 18} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#163D59">
                {tema.corto}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

/**
 * Barras enfrentadas: país A crece hacia la izquierda, país B hacia la derecha.
 * Cada fila = un tema; valor = prácticas identificadas (✓ = 1, ◐ = 0,5) de 5.
 */
export function ButterflyChart({
  cmp,
  nameA,
  nameB,
  isoA,
  isoB,
  onSelectTema,
}: {
  cmp: Comparacion;
  nameA: string;
  nameB: string;
  isoA: string;
  isoB: string;
  onSelectTema?: (id: string) => void;
}) {
  return (
    <div className="w-full">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-end gap-3 text-[0.75rem] font-bold">
        <span className="flex min-w-0 items-center justify-end gap-1.5" style={{ color: COLOR_A }}>
          <span className="hidden truncate sm:inline">{nameA}</span>
          <Flag iso={isoA} size={20} />
        </span>
        <span className="w-[104px] text-center text-[0.625rem] uppercase tracking-[0.14em] sm:w-[168px]" style={{ color: "var(--regu-gray-500)" }}>
          Tema
        </span>
        <span className="flex min-w-0 items-center gap-1.5" style={{ color: COLOR_B }}>
          <Flag iso={isoB} size={20} />
          <span className="hidden truncate sm:inline">{nameB}</span>
        </span>
      </div>
      <ul className="space-y-1.5">
        {cmp.porTema.map(({ tema, a, b }, i) => (
          <li key={tema.id}>
            <button
              type="button"
              onClick={() => onSelectTema?.(tema.id)}
              className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl px-1 py-1.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2"
              title={`${tema.nombre}: ${nameA} ${fmt(a.valor)} de 5 · ${nameB} ${fmt(b.valor)} de 5`}
            >
              {/* A */}
              <span className="flex items-center justify-end gap-2">
                <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: COLOR_A }}>{fmt(a.valor)}</span>
                <span className="relative h-3.5 w-full max-w-[220px] overflow-hidden rounded-l-full bg-slate-100">
                  <motion.span
                    className="absolute inset-y-0 right-0 rounded-l-full"
                    style={{ background: COLOR_A }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(a.valor / 5) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </span>
              {/* Tema */}
              <span className="flex w-[104px] items-center justify-center gap-1.5 text-center sm:w-[168px]">
                <TemaIcon icono={tema.icono} size={15} color="var(--regu-blue)" />
                <span className="truncate text-[0.8125rem] font-semibold" style={{ color: "var(--regu-navy)" }}>{tema.corto}</span>
              </span>
              {/* B */}
              <span className="flex items-center gap-2">
                <span className="relative h-3.5 w-full max-w-[220px] overflow-hidden rounded-r-full bg-slate-100">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-r-full"
                    style={{ background: COLOR_B }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.valor / 5) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: COLOR_B }}>{fmt(b.valor)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[0.75rem]" style={{ color: "var(--regu-gray-500)" }}>
        Prácticas identificadas por tema (de 5). ✓ suma 1 · ◐ suma 0,5. Haga clic en un tema para ver el detalle.
      </p>
    </div>
  );
}
