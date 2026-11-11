import { memo, useMemo } from "react";
import type { Estado, PerfilPais } from "@/data/observatorio/schema";
import { flagUrl } from "@/lib/observatorio";
import { COLOR_A, COLOR_B, ESTADO_COLOR } from "./ui";

/* ─────────────────────────────────────────────────────────────
   Mapa de puntos (estilo REGULATEL) de Latinoamérica + recuadro
   de Europa. Contornos simplificados (lon, lat) dibujados a mano;
   a la resolución de la retícula de puntos no se aprecian detalles.
   ───────────────────────────────────────────────────────────── */

type LL = [number, number];

const LATAM: LL[] = [
  [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-108.2, 31.3], [-106.4, 31.7], [-104.5, 29.6], [-102.9, 29.2], [-101.4, 29.8],
  [-99.5, 27.5], [-97.2, 25.9], [-97.7, 24], [-97.8, 22.3], [-97.2, 20.6], [-96.1, 19.2], [-94.5, 18.2], [-92, 18.6],
  [-90.6, 19.8], [-90.4, 21], [-88, 21.5], [-86.8, 21.2], [-87.5, 19.6], [-88.2, 18.4], [-88.3, 16.5], [-88.6, 15.8],
  [-87.9, 15.85], [-85.9, 15.9], [-84, 15.7], [-83.2, 15], [-83.5, 13], [-83.7, 11], [-83, 10], [-82.3, 9.2],
  [-79.9, 9.4], [-78, 9.4], [-77.36, 8.67], [-76.6, 8.1], [-75.6, 9.5], [-75.5, 10.4], [-74.8, 11], [-74.2, 11.25],
  [-73, 11.4], [-71.9, 12.4], [-71.6, 10.8], [-70.2, 11.6], [-68.4, 10.5], [-66.9, 10.6], [-64.2, 10.5], [-62, 10.7],
  [-61.6, 9.9], [-60.7, 8.6], [-58.2, 6.8], [-55.2, 5.9], [-52.3, 4.9], [-51, 4], [-50.4, 1.8], [-49, 0], [-48.5, -1.3],
  [-46, -1], [-44.3, -2.5], [-40, -2.85], [-38.5, -3.7], [-35.24, -5.48], [-34.79, -7.15], [-35.7, -9.7], [-37.05, -10.9],
  [-38.5, -13], [-39, -14.8], [-39.25, -17.7], [-40.3, -20.3], [-42, -22.9], [-43.2, -23], [-46.3, -24], [-48.5, -26.9],
  [-48.8, -28.5], [-50.2, -30.3], [-52.1, -32.1], [-53.4, -33.7], [-54.9, -34.9], [-56.2, -34.9], [-57.8, -34.4],
  [-58.4, -34.6], [-57.4, -36], [-56.7, -36.4], [-57.5, -38], [-58.7, -38.6], [-62.3, -38.8], [-62.1, -40.6],
  [-65, -40.8], [-63.6, -42.6], [-65.1, -43.3], [-65.6, -45], [-67.5, -45.9], [-65.9, -47.8], [-67.7, -49.3],
  [-69.2, -51.6], [-68.4, -52.4], [-67.6, -53.8], [-65.3, -54.7], [-66.5, -55], [-68.2, -55.5], [-69.5, -55.4],
  [-71.5, -54.5], [-73.5, -53], [-74.8, -51.5], [-75.5, -48.5], [-75.6, -46.7], [-74.6, -45], [-74.2, -42.6],
  [-73.9, -41], [-73.4, -39.8], [-73.65, -37.6], [-73.1, -36.8], [-72, -34.4], [-71.6, -33], [-71.5, -32],
  [-71.35, -29.95], [-70.8, -27.07], [-70.6, -25.4], [-70.4, -23.6], [-70.2, -22.1], [-70.15, -20.2], [-70.3, -18.5],
  [-71.34, -17.64], [-72.7, -16.6], [-74.85, -15.55], [-76.2, -13.9], [-77.1, -12.05], [-77.6, -11.1], [-78.6, -9.1],
  [-79.03, -8.1], [-79.9, -6.8], [-80.9, -5.8], [-81.3, -4.7], [-80.3, -3.4], [-80, -2.7], [-80.9, -2.2], [-80.7, -0.95],
  [-80.1, 0], [-79.65, 0.96], [-78.8, 1.8], [-77.5, 3], [-77.1, 3.9], [-77.4, 5.5], [-77.6, 6.6], [-78.17, 7.52],
  [-78.3, 8.3], [-79.5, 8.95], [-80.2, 8.3], [-80, 7.2], [-80.9, 7.6], [-81.7, 8.1], [-82.9, 8], [-83.6, 8.4],
  [-84.6, 9.6], [-85.8, 9.9], [-85.9, 10.8], [-86.5, 11.9], [-87.3, 12.6], [-87.6, 13], [-88.9, 13.25], [-90.1, 13.7],
  [-91.4, 13.95], [-92.2, 14.55], [-93.75, 16.05], [-95.2, 16.17], [-96.5, 15.65], [-98.6, 16.4], [-99.9, 16.85],
  [-101.5, 17.6], [-102.2, 17.95], [-104.3, 19.05], [-105.7, 20.4], [-105.3, 21.5], [-106.4, 23.2], [-108, 24.6],
  [-109.05, 25.6], [-110.9, 27.9], [-111.95, 28.8], [-113.5, 31.3], [-114.8, 31.8], [-114.84, 31.02], [-113.55, 28.95],
  [-112.27, 27.34], [-111.35, 26], [-110.3, 24.15], [-109.42, 23.4], [-109.9, 22.9], [-110.22, 23.45], [-112.1, 24.6],
  [-112.9, 26], [-115.07, 27.85], [-114.4, 28.6], [-115.95, 30.48], [-116.6, 31.85],
];
const CUBA: LL[] = [[-84.9, 21.9], [-84, 22.7], [-82, 23.15], [-80, 23.1], [-77.5, 21.8], [-75.6, 21.1], [-74.2, 20.2], [-75.5, 19.85], [-77.7, 19.85], [-78.3, 20.6], [-81, 21.7], [-82.5, 22.0]];
const LA_ESPANOLA: LL[] = [[-74.5, 18.4], [-72.8, 19.95], [-71, 19.9], [-69.5, 19.25], [-68.35, 18.6], [-68.8, 18.2], [-70, 18.2], [-71.4, 17.6], [-72.5, 18.2]];
const PUERTO_RICO: LL[] = [[-67.3, 18.5], [-65.6, 18.42], [-65.6, 17.95], [-67.2, 17.95]];
const JAMAICA: LL[] = [[-78.4, 18.45], [-76.2, 18.1], [-76.8, 17.7], [-78.3, 18.2]];
const TRINIDAD: LL[] = [[-61.9, 10.85], [-60.9, 10.85], [-61, 10.05], [-61.9, 10.1]];

const IBERIA: LL[] = [
  [-9.27, 42.9], [-7.87, 43.77], [-5.66, 43.55], [-3.8, 43.47], [-1.8, 43.39], [0, 42.7], [1.5, 42.5], [3.32, 42.32], [3.2, 41.85],
  [2.2, 41.4], [1.25, 41.1], [0.85, 40.7], [-0.33, 39.47], [0.23, 38.73], [-0.48, 38.34], [-0.98, 37.6], [-2.19, 36.72],
  [-4.4, 36.7], [-5.6, 36], [-6.3, 36.5], [-7.4, 37.2], [-7.93, 37], [-8.95, 37], [-8.87, 37.95], [-9.5, 38.75], [-8.86, 40.15],
  [-8.68, 41.15], [-8.9, 42.24],
];
const FRANCIA: LL[] = [
  [-1.8, 43.39], [-1.25, 44.65], [-1.15, 46.16], [-2.2, 47.27], [-4.5, 47.8], [-4.75, 48.4], [-3, 48.8], [-1.62, 49.64],
  [0.1, 49.5], [1.6, 50.7], [2.5, 51.05], [4.2, 49.95], [5.8, 49.5], [8.23, 48.97], [7.6, 47.6], [6.15, 46.2], [6.86, 45.83],
  [7, 44.9], [7.5, 43.78], [6.64, 43.27], [5.37, 43.3], [3.9, 43.5], [3.04, 42.9], [3.17, 42.43], [1.5, 42.5], [0, 42.7],
];
const ITALIA: LL[] = [
  [7.5, 43.78], [8.93, 44.41], [9.85, 44.1], [10.3, 43.55], [11.13, 42.43], [12.25, 41.75], [13.25, 41.28], [14.25, 40.84],
  [14.77, 40.67], [15.63, 40.07], [16.05, 39.1], [15.65, 38.1], [16.55, 38.45], [17.13, 39.08], [16.5, 39.75], [17.24, 40.47],
  [17.99, 40.06], [18.36, 39.8], [18.49, 40.15], [17.94, 40.63], [16.87, 41.13], [16.1, 41.9], [14.7, 42.1], [14.21, 42.46],
  [13.5, 43.62], [12.57, 44.06], [12.3, 44.42], [12.34, 45.44], [13.77, 45.65], [13.7, 46.5], [12.4, 47], [10.5, 46.85],
  [9, 46.5], [7, 45.9], [6.9, 44.9],
];
const SICILIA: LL[] = [[12.4, 37.8], [13.35, 38.15], [15.65, 38.25], [15.1, 37.5], [15.1, 36.7], [14, 37.05], [12.6, 37.65]];
const CERDENA: LL[] = [[8.2, 40.95], [9.2, 41.25], [9.75, 40.95], [9.65, 40], [9.52, 39.14], [8.65, 38.87], [8.35, 39.1], [8.5, 39.9], [8.3, 40.55]];
const CORCEGA: LL[] = [[8.55, 42.95], [9.35, 43], [9.55, 42.1], [9.1, 41.4], [8.73, 41.92], [8.55, 42.4]];
const MAGREB: LL[] = [[-6.3, 35.8], [-5.3, 35.9], [-2, 35.1], [1, 36.5], [3, 36.8], [8.6, 36.95], [10.2, 37.25], [11.1, 36.9], [11.2, 35.2], [-6.5, 35.2]];

function inside(p: LL, poly: LL[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/* Proyección equirectangular del mapa principal */
const MAIN = { lon0: -118, lon1: -33, lat0: -56.5, lat1: 33.5, s: 8 };
export const MAP_W = (MAIN.lon1 - MAIN.lon0) * MAIN.s; // 680
export const MAP_H = (MAIN.lat1 - MAIN.lat0) * MAIN.s; // 720
const proj = ([lon, lat]: LL): [number, number] => [(lon - MAIN.lon0) * MAIN.s, (MAIN.lat1 - lat) * MAIN.s];

/* Recuadro de Europa (esquina superior derecha, sobre el Atlántico) */
const INSET = { x: 462, y: 14, w: 206, lon0: -14, lon1: 19.5, lat0: 35.2, lat1: 48.2 };
const IS = INSET.w / (INSET.lon1 - INSET.lon0);
const INSET_H = (INSET.lat1 - INSET.lat0) * IS + 34;
const projIn = ([lon, lat]: LL): [number, number] => [INSET.x + (lon - INSET.lon0) * IS, INSET.y + 26 + (INSET.lat1 - lat) * IS];

const STEP = 9;
const PUNTOS: { x: number; y: number }[] = (() => {
  const out: { x: number; y: number }[] = [];
  const tierras = [LATAM, CUBA, LA_ESPANOLA, PUERTO_RICO, JAMAICA, TRINIDAD];
  for (let y = STEP / 2; y < MAP_H; y += STEP) {
    for (let x = STEP / 2; x < MAP_W; x += STEP) {
      if (x > INSET.x - 6 && y < INSET.y + INSET_H + 6) continue;
      const ll: LL = [MAIN.lon0 + x / MAIN.s, MAIN.lat1 - y / MAIN.s];
      if (tierras.some((t) => inside(ll, t))) out.push({ x, y });
    }
  }
  return out;
})();

const STEP_IN = 6.2;
const PUNTOS_IN: { x: number; y: number; miembro: boolean }[] = (() => {
  const out: { x: number; y: number; miembro: boolean }[] = [];
  const top = INSET.y + 26;
  const h = (INSET.lat1 - INSET.lat0) * IS;
  for (let y = top + STEP_IN / 2; y < top + h; y += STEP_IN) {
    for (let x = INSET.x + STEP_IN / 2; x < INSET.x + INSET.w; x += STEP_IN) {
      const ll: LL = [INSET.lon0 + (x - INSET.x) / IS, INSET.lat1 - (y - top) / IS];
      const miembro = [IBERIA, ITALIA, SICILIA, CERDENA].some((t) => inside(ll, t));
      if (miembro || [FRANCIA, CORCEGA, MAGREB].some((t) => inside(ll, t))) out.push({ x, y, miembro });
    }
  }
  return out;
})();

/** Centroide (c) y, si el área está congestionada, posición desplazada del marcador (m). */
const MARCADORES: Record<string, { c: LL; m?: LL; eu?: boolean }> = {
  mx: { c: [-102.5, 23.8] },
  gt: { c: [-90.3, 15.6], m: [-97.6, 12.6] },
  sv: { c: [-88.9, 13.75], m: [-95.2, 8.3] },
  hn: { c: [-86.6, 14.8], m: [-85.6, 19.8] },
  ni: { c: [-85.1, 12.8], m: [-80.2, 15.4] },
  cr: { c: [-84.1, 9.9], m: [-92.0, 4.1] },
  pa: { c: [-80.2, 8.5], m: [-87.8, 0.1] },
  cu: { c: [-79.4, 21.8], m: [-80.2, 27.0] },
  do: { c: [-70.4, 18.9], m: [-70.4, 24.2] },
  pr: { c: [-66.5, 18.2], m: [-63.9, 21.6] },
  co: { c: [-73.5, 4.2] },
  ve: { c: [-66.3, 7.2] },
  ec: { c: [-78.4, -1.5], m: [-83.4, -3.6] },
  pe: { c: [-75.0, -9.6] },
  br: { c: [-51.5, -10.5] },
  bo: { c: [-64.6, -16.8] },
  py: { c: [-58.3, -23.3] },
  uy: { c: [-56.0, -32.8], m: [-51.4, -36.0] },
  ar: { c: [-65.0, -35.5] },
  cl: { c: [-70.9, -30.5], m: [-77.6, -30.5] },
  pt: { c: [-8.1, 39.6], m: [-12.0, 38.2], eu: true },
  es: { c: [-3.7, 40.3], eu: true },
  it: { c: [12.4, 42.9], eu: true },
};

const R = 15;

function Marcador({
  p,
  estado,
  isA,
  isB,
  activo,
  onEnter,
  onLeave,
  onClick,
}: {
  p: PerfilPais;
  estado: Estado;
  isA: boolean;
  isB: boolean;
  activo: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const def = MARCADORES[p.iso];
  if (!def) return null;
  const pr = def.eu ? projIn : proj;
  const [cx, cy] = pr(def.c);
  const [mx, my] = def.m ? pr(def.m) : [cx, cy];
  const r = def.eu ? 11.5 : R;
  const ring = estado === "sin_dato" ? "#94A3B8" : ESTADO_COLOR[estado].bg;
  return (
    <g
      className="obs-marker"
      role="button"
      tabIndex={0}
      aria-label={p.pais}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{ cursor: "pointer" }}
    >
      {def.m && (
        <>
          <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#64748B" strokeWidth={1.2} strokeDasharray="2 2.5" />
          <circle cx={cx} cy={cy} r={2.6} fill="#334155" />
        </>
      )}
      <g className="obs-marker-body" style={{ transformOrigin: `${mx}px ${my}px`, transform: activo ? "scale(1.18)" : undefined }}>
        {(isA || isB) && <circle cx={mx} cy={my} r={r + 6.5} fill="none" stroke={isA ? COLOR_A : COLOR_B} strokeWidth={2.6} />}
        <circle cx={mx} cy={my} r={r + 2.4} fill="#fff" stroke={ring} strokeWidth={4} strokeDasharray={estado === "sin_dato" ? "3 2.5" : undefined} />
        <image
          href={flagUrl(p.iso, 80)}
          x={mx - r}
          y={my - r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#obs-flag-clip)"
        />
        {estado !== "sin_dato" && (
          <g transform={`translate(${mx + r * 0.78}, ${my + r * 0.78})`}>
            <circle r={6.2} fill={ring} stroke="#fff" strokeWidth={1.6} />
            {estado === "si" && <path d="M-2.6 0.1 L-0.8 1.9 L2.7 -1.9" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
            {estado === "no" && <path d="M-2 -2 L2 2 M2 -2 L-2 2" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />}
            {estado === "parcial" && <path d="M0 -3.6 A3.6 3.6 0 0 1 0 3.6 Z" fill="#fff" />}
          </g>
        )}
      </g>
    </g>
  );
}

function DotMapBase({
  perfiles,
  estados,
  isoA,
  isoB,
  hover,
  setHover,
  onPick,
}: {
  perfiles: PerfilPais[];
  estados: Record<string, Estado>;
  isoA: string;
  isoB: string;
  hover: string | null;
  setHover: (iso: string | null) => void;
  onPick: (iso: string) => void;
}) {
  const ordenados = useMemo(
    () => [...perfiles].sort((a, b) => Number(a.iso === hover) - Number(b.iso === hover)),
    [perfiles, hover]
  );
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full" role="img" aria-label="Mapa de los miembros de REGULATEL">
      <defs>
        <clipPath id="obs-flag-clip" clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.5" />
        </clipPath>
        <radialGradient id="obs-ocean" cx="40%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#F3F8FC" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={MAP_W} height={MAP_H} rx={18} fill="url(#obs-ocean)" />
      {PUNTOS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.35} fill="#C9D9E8" />
      ))}

      {/* Recuadro Europa */}
      <g>
        <rect x={INSET.x - 8} y={INSET.y - 4} width={INSET.w + 16} height={INSET_H} rx={14} fill="#fff" stroke="rgba(22,61,89,0.14)" />
        <text x={INSET.x + 2} y={INSET.y + 14} fontSize={10} fontWeight={700} letterSpacing="0.14em" fill="#7E909E">
          EUROPA
        </text>
        {PUNTOS_IN.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.9} fill={d.miembro ? "#B9CDE0" : "#E3EAF2"} />
        ))}
      </g>

      {ordenados.map((p) => (
        <Marcador
          key={p.iso}
          p={p}
          estado={estados[p.iso] ?? "sin_dato"}
          isA={p.iso === isoA}
          isB={p.iso === isoB}
          activo={hover === p.iso}
          onEnter={() => setHover(p.iso)}
          onLeave={() => setHover(null)}
          onClick={() => onPick(p.iso)}
        />
      ))}
    </svg>
  );
}

export const DotMap = memo(DotMapBase);
