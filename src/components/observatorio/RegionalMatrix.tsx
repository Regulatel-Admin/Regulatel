import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PerfilPais } from "@/data/observatorio/schema";
import { REGION_BY_ISO, TEMAS } from "@/data/observatorio/schema";
import { conteoTema, fmt } from "@/lib/observatorio";
import { COLOR_A, COLOR_B, Flag, TemaIcon } from "./ui";

const ESCALA = ["#F1F5F9", "#DCE8F4", "#B9D2EA", "#86B3DA", "#4C8CC5", "#1E5A86", "#163D59"];
function colorDe(v: number) {
  // 0 → gris claro · 5 → azul petróleo
  const i = Math.min(ESCALA.length - 1, Math.round((v / 5) * (ESCALA.length - 1)));
  return ESCALA[i];
}

const REGIONES = ["Sudamérica", "Centroamérica, México y el Caribe", "Europa"] as const;

export default function RegionalMatrix({
  perfiles,
  isoA,
  isoB,
  onPick,
}: {
  perfiles: PerfilPais[];
  isoA: string;
  isoB: string;
  onPick: (iso: string) => void;
}) {
  const [hover, setHover] = useState<{ iso: string; tema: string } | null>(null);
  const filas = useMemo(
    () =>
      REGIONES.map((r) => ({
        region: r,
        paises: perfiles
          .filter((p) => REGION_BY_ISO[p.iso] === r)
          .map((p) => ({ p, vals: TEMAS.map((t) => conteoTema(p, t)) })),
      })).filter((g) => g.paises.length),
    [perfiles]
  );

  return (
    <div className="rounded-[20px] border bg-white p-5 sm:p-6" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-blue)" }}>Panorama regional</p>
          <h4 className="font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "1.25rem" }}>
            Los {perfiles.length} miembros, tema por tema
          </h4>
          <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>
            Cada casilla indica cuántas de las 5 prácticas del tema tiene el país. Haga clic en un país para compararlo.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[0.75rem] font-semibold" style={{ color: "var(--regu-gray-500)" }}>
          0
          <span className="flex overflow-hidden rounded-md">
            {ESCALA.map((c) => (
              <span key={c} className="h-3.5 w-6" style={{ background: c }} />
            ))}
          </span>
          5 prácticas
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate" style={{ borderSpacing: "4px" }}>
          <thead>
            <tr>
              <th className="w-[210px]" />
              {TEMAS.map((t) => (
                <th key={t.id} className="px-1 pb-2 align-bottom">
                  <span className="flex flex-col items-center gap-1 text-center text-[0.6875rem] font-bold leading-tight" style={{ color: "var(--regu-navy)" }}>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(68,137,198,0.10)" }}>
                      <TemaIcon icono={t.icono} size={15} color="var(--regu-blue)" />
                    </span>
                    {t.corto}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((g) => (
              <FilaGrupo key={g.region} g={g} isoA={isoA} isoB={isoB} hover={hover} setHover={setHover} onPick={onPick} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilaGrupo({
  g,
  isoA,
  isoB,
  hover,
  setHover,
  onPick,
}: {
  g: { region: string; paises: { p: PerfilPais; vals: ReturnType<typeof conteoTema>[] }[] };
  isoA: string;
  isoB: string;
  hover: { iso: string; tema: string } | null;
  setHover: (h: { iso: string; tema: string } | null) => void;
  onPick: (iso: string) => void;
}) {
  return (
    <>
      <tr>
        <td colSpan={TEMAS.length + 1} className="pb-1 pt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>
          {g.region}
        </td>
      </tr>
      {g.paises.map(({ p, vals }, ri) => {
        const sel = p.iso === isoA ? COLOR_A : p.iso === isoB ? COLOR_B : null;
        return (
          <tr key={p.iso} className="group cursor-pointer" onClick={() => onPick(p.iso)}>
            <td className="rounded-lg pr-2">
              <span
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-[0.8125rem] font-semibold transition group-hover:bg-slate-50"
                style={{ color: "var(--regu-navy)", boxShadow: sel ? `inset 3px 0 0 ${sel}` : undefined }}
              >
                <Flag iso={p.iso} size={20} />
                <span className="truncate">{p.pais}</span>
              </span>
            </td>
            {vals.map((c, i) => {
              const t = TEMAS[i];
              const activo = hover?.iso === p.iso && hover?.tema === t.id;
              return (
                <td key={t.id} className="p-0">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: Math.min(0.6, ri * 0.02 + i * 0.01) }}
                    onMouseEnter={() => setHover({ iso: p.iso, tema: t.id })}
                    onMouseLeave={() => setHover(null)}
                    title={`${p.pais} · ${t.nombre}: ${fmt(c.valor)} de 5 (${c.si} sí, ${c.parcial} en proceso, ${c.sinDato} sin dato)`}
                    className="flex h-9 items-center justify-center rounded-lg text-[0.8125rem] font-bold tabular-nums transition"
                    style={{
                      background: colorDe(c.valor),
                      color: c.valor >= 3.5 ? "#fff" : "#163D59",
                      boxShadow: activo ? "0 0 0 2px #fff, 0 0 0 4px var(--regu-blue)" : undefined,
                    }}
                  >
                    {fmt(c.valor)}
                  </motion.span>
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
