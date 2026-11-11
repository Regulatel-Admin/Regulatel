/**
 * Observatorio Regulatorio — PANEL 2 (diseño editorial alternativo).
 * Ruta: /observatorio-regulatorio/panel-2
 * Usa los mismos datos verificados que el Panel 1, sin modificarlo.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, CheckCircle2, ChevronDown, Download, FileSpreadsheet, Globe2, Printer, Share2 } from "lucide-react";
import Hero2 from "@/components/observatorio2/Hero2";
import { Cierre, Huella, ImpresionTablero, Resumen, Selectores, Tablero } from "@/components/observatorio2/Comparar2";
import Region2 from "@/components/observatorio2/Region2";
import { Desplegable, P2, useSerifFont } from "@/components/observatorio2/ui2";
import { ESTADO_LABEL, TEMAS, TOTAL_INDICADORES, type TemaId } from "@/data/observatorio/schema";
import { PERFILES, PERFIL_BY_ISO, ULTIMA_VERIFICACION, comparar, fechaLarga, veredictoTexto } from "@/lib/observatorio";
import "@/styles/observatorio2.css";

const TEMA_IDS = TEMAS.map((t) => t.id) as TemaId[];

export default function ObservatorioPanel2() {
  useSerifFont();
  const [params, setParams] = useSearchParams();
  const [soloDif, setSoloDif] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const isoA = PERFIL_BY_ISO[params.get("a") ?? ""] ? (params.get("a") as string) : PERFIL_BY_ISO.do ? "do" : PERFILES[0]?.iso;
  const pB = params.get("b") ?? "";
  const isoB = PERFIL_BY_ISO[pB] && pB !== isoA ? pB : (["ve", "cr", "co"].find((x) => PERFIL_BY_ISO[x] && x !== isoA) ?? PERFILES.find((p) => p.iso !== isoA)?.iso);
  const vista = params.get("vista") === "region" ? "region" : "comparar";
  const temaTablero = (TEMA_IDS.includes(params.get("t") as TemaId) ? params.get("t") : "espectro") as TemaId;
  const rTema = (TEMA_IDS.includes(params.get("rt") as TemaId) ? params.get("rt") : "usuario") as TemaId;
  const rTemaDef = TEMAS.find((t) => t.id === rTema)!;
  const rInd = rTemaDef.indicadores.some((i) => i.id === params.get("ri")) ? (params.get("ri") as string) : rTema === "usuario" ? "usu_portabilidad" : rTemaDef.indicadores[0].id;
  const paisSel = PERFIL_BY_ISO[params.get("p") ?? ""] ? (params.get("p") as string) : isoA;

  const A = isoA ? PERFIL_BY_ISO[isoA] : null;
  const B = isoB ? PERFIL_BY_ISO[isoB] : null;
  const cmp = useMemo(() => (A && B ? comparar(A, B) : null), [A, B]);

  const set = (cambios: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(cambios).forEach(([k, v]) => (v == null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    document.title = A && B ? `Observatorio Regulatorio · ${A.pais} y ${B.pais} · REGULATEL` : "Observatorio Regulatorio · REGULATEL";
  }, [A, B]);

  if (!A || !B || !cmp) return <div className="py-24 text-center">Cargando…</div>;

  const descargarCSV = () => {
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const head = ["Tema", "Indicador", `${A.pais} — estado`, `${A.pais} — detalle`, `${A.pais} — fuente`, `${B.pais} — estado`, `${B.pais} — detalle`, `${B.pais} — fuente`, "Resultado"];
    const rows = cmp.filas.map((f) => {
      const va = A.categorias[f.tema.id]?.indicadores?.[f.ind.id];
      const vb = B.categorias[f.tema.id]?.indicadores?.[f.ind.id];
      return [f.tema.nombre, f.ind.label, ESTADO_LABEL[f.a], va?.nota ?? "", va?.fuente ?? "", ESTADO_LABEL[f.b], vb?.nota ?? "", vb?.fuente ?? "", veredictoTexto(f.v, A.pais, B.pais)];
    });
    const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `observatorio-regulatel-${A.iso}-${B.iso}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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

  const irATablero = (t: TemaId) => {
    set({ t });
    setTimeout(() => document.getElementById("obs2-tablero")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };

  const kpis: [string, string][] = [
    [String(PERFILES.length), "países miembros"],
    ["8", "temas"],
    [String(TOTAL_INDICADORES), "indicadores"],
    [String(PERFILES.length * TOTAL_INDICADORES), "datos verificados"],
  ];

  return (
    <div className="obs2-page min-h-screen">
      <div className="obs2-noprint">
        <Hero2 kpis={kpis} />
      </div>

      <div className="obs2-print-only mx-auto max-w-[1480px] px-5 pt-4">
        <p className="text-sm font-bold">REGULATEL · Observatorio Regulatorio</p>
        <p className="text-2xl font-bold" style={{ color: P2.navy }}>{A.pais} y {B.pais}</p>
        <p className="text-xs">Información verificada al {fechaLarga(ULTIMA_VERIFICACION)}</p>
      </div>

      <div id="obs2-top" className="mx-auto w-full max-w-[1480px] scroll-mt-[90px] px-5 md:px-10">
        {/* Pestañas y herramientas */}
        <div className="obs2-noprint flex flex-col gap-3 border-b pt-6 md:flex-row md:items-end" style={{ borderColor: P2.line }}>
          <div className="flex gap-1" role="tablist">
            {[
              { id: "comparar", label: "Comparar países", icon: <ArrowLeftRight className="h-5 w-5" /> },
              { id: "region", label: "Mapa regional", icon: <Globe2 className="h-5 w-5" /> },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={vista === t.id}
                data-activo={vista === t.id}
                onClick={() => set({ vista: t.id === "region" ? "region" : null })}
                className="obs2-tab inline-flex items-center gap-2 rounded-t-lg px-3 pb-3 pt-2 text-[1.0625rem] font-bold"
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-2 md:ml-auto">
            <span className="hidden text-[0.875rem] lg:inline" style={{ color: P2.muted }}>Verificado el {fechaLarga(ULTIMA_VERIFICACION)}</span>
            <span className="mx-2 hidden h-6 w-px lg:inline-block" style={{ background: P2.line }} />
            <Desplegable
              boton={(abierto) => (
                <button type="button" className="obs2-accion inline-flex items-center gap-2 px-3 py-2 text-[0.9375rem] font-bold" aria-expanded={abierto}>
                  <Download className="h-[18px] w-[18px]" /> Exportar <ChevronDown className={`h-4 w-4 transition ${abierto ? "rotate-180" : ""}`} />
                </button>
              )}
            >
              {(cerrar) => (
                <>
                  <button type="button" onClick={() => { descargarCSV(); cerrar(); }} className="obs2-opcion flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[0.9375rem] font-semibold" style={{ color: P2.navy }}>
                    <FileSpreadsheet className="h-4 w-4" style={{ color: P2.teal }} /> Excel (CSV)
                  </button>
                  <button type="button" onClick={() => { cerrar(); setTimeout(() => window.print(), 60); }} className="obs2-opcion flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[0.9375rem] font-semibold" style={{ color: P2.navy }}>
                    <Printer className="h-4 w-4" style={{ color: P2.teal }} /> PDF / Imprimir
                  </button>
                </>
              )}
            </Desplegable>
            <button type="button" onClick={compartir} className="obs2-accion inline-flex items-center gap-2 px-3 py-2 text-[0.9375rem] font-bold">
              {copiado ? <CheckCircle2 className="h-[18px] w-[18px] text-green-700" /> : <Share2 className="h-[18px] w-[18px]" />} {copiado ? "¡Enlace copiado!" : "Compartir"}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {vista === "region" ? (
            <motion.div key="region" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-6 pb-16">
              <Region2
                perfiles={PERFILES}
                isoA={A.iso}
                isoB={B.iso}
                temaId={rTema}
                indId={rInd}
                paisSel={paisSel}
                onSel={(rt, ri) => set({ rt, ri })}
                onPais={(p) => set({ p })}
                onComparar={(iso) => {
                  set({ vista: null, b: iso });
                  setTimeout(() => document.getElementById("obs2-top")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
                }}
              />
            </motion.div>
          ) : (
            <motion.div key="comparar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-6">
              <div className="obs2-noprint">
                <Selectores A={A} B={B} perfiles={PERFILES} onPar={(a, b) => set({ a, b })} />
              </div>
              <div className="obs2-avoid mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
                <Resumen cmp={cmp} A={A} B={B} />
                <Huella cmp={cmp} A={A} B={B} onTema={irATablero} />
              </div>
              <hr className="obs2-noprint my-12" style={{ borderColor: P2.line }} />
              <div className="obs2-noprint">
                <Tablero cmp={cmp} A={A} B={B} tema={temaTablero} onTema={(t) => set({ t })} soloDif={soloDif} setSoloDif={setSoloDif} />
              </div>
              <ImpresionTablero cmp={cmp} A={A} B={B} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {vista === "comparar" && (
        <div className="obs2-noprint">
          <Cierre A={A} B={B} verificado={fechaLarga(ULTIMA_VERIFICACION)} />
        </div>
      )}
    </div>
  );
}
