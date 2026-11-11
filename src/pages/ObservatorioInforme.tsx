import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, FileWarning, Link2Off, RefreshCw, Search } from "lucide-react";
import { Flag } from "@/components/observatorio/ui";
import { PERFILES, PERFIL_BY_ISO, ULTIMA_VERIFICACION, fechaLarga, hostDe } from "@/lib/observatorio";
import { TEMA_BY_ID, TOTAL_INDICADORES, type TemaId } from "@/data/observatorio/schema";

type EstadoDoc = "vigente" | "actualizado" | "sustituido" | "derogado" | "enlace_roto" | "no_verificable";
interface DocAuditado {
  titulo: string;
  url: string;
  categoriaOriginal?: string;
  origen?: string;
  tema: TemaId | "otro";
  estado: EstadoDoc;
  nota?: string;
  urlNueva?: string;
  tituloNuevo?: string;
  anioNuevo?: number;
}
interface Auditoria {
  iso: string;
  pais: string;
  revisado: string;
  documentos: DocAuditado[];
}

const mods = import.meta.glob("../data/observatorio/auditoria/*.json", { eager: true, import: "default" }) as Record<string, Auditoria>;
const AUDITORIAS: Auditoria[] = Object.values(mods)
  .filter((a) => a && Array.isArray(a.documentos))
  .sort((a, b) => a.pais.localeCompare(b.pais, "es"));

const ESTADO_DOC: Record<EstadoDoc, { label: string; bg: string; fg: string; icon: JSX.Element }> = {
  vigente: { label: "Vigente", bg: "#DCFCE7", fg: "#166534", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  actualizado: { label: "Hay versión nueva", bg: "#DBEAFE", fg: "#1E40AF", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  sustituido: { label: "Sustituido", bg: "#FEF3C7", fg: "#92400E", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  derogado: { label: "Derogado", bg: "#FEE2E2", fg: "#991B1B", icon: <FileWarning className="h-3.5 w-3.5" /> },
  enlace_roto: { label: "Enlace roto (corregido)", bg: "#FFEDD5", fg: "#9A3412", icon: <Link2Off className="h-3.5 w-3.5" /> },
  no_verificable: { label: "No verificable", bg: "#F1F5F9", fg: "#475569", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

function Badge({ e }: { e: EstadoDoc }) {
  const m = ESTADO_DOC[e];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold" style={{ background: m.bg, color: m.fg }}>
      {m.icon}
      {m.label}
    </span>
  );
}

export default function ObservatorioInforme() {
  const [q, setQ] = useState("");
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [soloProblemas, setSoloProblemas] = useState(true);

  const totales = useMemo(() => {
    const t: Record<EstadoDoc, number> = { vigente: 0, actualizado: 0, sustituido: 0, derogado: 0, enlace_roto: 0, no_verificable: 0 };
    AUDITORIAS.forEach((a) => a.documentos.forEach((d) => (t[d.estado] = (t[d.estado] ?? 0) + 1)));
    return t;
  }, []);
  const totalDocs = Object.values(totales).reduce((a, b) => a + b, 0);
  const totalCambiosObs = PERFILES.reduce((n, p) => n + (p.cambiosDetectados?.length ?? 0), 0);

  const isos = useMemo(() => {
    const set = new Set<string>([...PERFILES.map((p) => p.iso), ...AUDITORIAS.map((a) => a.iso)]);
    return [...set].sort((a, b) => (PERFIL_BY_ISO[a]?.pais ?? a).localeCompare(PERFIL_BY_ISO[b]?.pais ?? b, "es"));
  }, []);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  return (
    <div className="min-h-screen" style={{ background: "var(--token-page-bg, #FAFCF6)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <nav className="mb-4 text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>
          <Link to="/observatorio-regulatorio" className="hover:underline">Observatorio Regulatorio</Link> / Informe de actualización
        </nav>
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-blue)" }}>Uso interno · revisión editorial</p>
        <h1 className="mt-1 font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "clamp(1.6rem, 2vw + 1rem, 2.25rem)" }}>
          Informe de actualización — {fechaLarga(ULTIMA_VERIFICACION || "2026-11-11")}
        </h1>
        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
          Qué estaba desactualizado o ya no existía en el Observatorio anterior y en los documentos que los miembros publicaron en el catálogo de Mejores prácticas, y con qué se reemplazó. Cada reemplazo fue comprobado por un segundo verificador.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { n: PERFILES.length, l: "países verificados" },
            { n: PERFILES.length * TOTAL_INDICADORES, l: "datos del Observatorio revisados" },
            { n: totalCambiosObs, l: "correcciones al Observatorio anterior" },
            { n: totalDocs, l: "documentos y enlaces auditados" },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border bg-white p-4" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <p className="font-extrabold tabular-nums" style={{ color: "var(--regu-navy)", fontSize: "1.75rem", fontFamily: "var(--token-font-heading)" }}>{k.n}</p>
              <p className="text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>{k.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(ESTADO_DOC) as EstadoDoc[]).map((e) => (
            <span key={e} className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[0.8125rem]" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <Badge e={e} /> <strong className="tabular-nums">{totales[e]}</strong>
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-3 py-2" style={{ borderColor: "rgba(22,61,89,0.12)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--regu-gray-500)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar país, norma o documento…" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
            <input type="checkbox" checked={soloProblemas} onChange={(e) => setSoloProblemas(e.target.checked)} /> Mostrar solo lo que cambió
          </label>
        </div>

        <div className="mt-6 space-y-3">
          {isos.map((iso) => {
            const p = PERFIL_BY_ISO[iso];
            const a = AUDITORIAS.find((x) => x.iso === iso);
            const pais = p?.pais ?? a?.pais ?? iso;
            const docs = (a?.documentos ?? []).filter((d) => (!soloProblemas || d.estado !== "vigente") && (!q || norm(`${pais} ${d.titulo} ${d.nota ?? ""} ${d.tituloNuevo ?? ""}`).includes(norm(q))));
            const cambios = (p?.cambiosDetectados ?? []).filter((c) => !q || norm(`${pais} ${c}`).includes(norm(q)));
            if (q && !docs.length && !cambios.length && !norm(pais).includes(norm(q))) return null;
            const problemas = (a?.documentos ?? []).filter((d) => d.estado !== "vigente").length;
            const open = abiertos[iso] ?? false;
            return (
              <section key={iso} className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
                <button type="button" onClick={() => setAbiertos((s) => ({ ...s, [iso]: !open }))} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50">
                  <Flag iso={iso} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold" style={{ color: "var(--regu-navy)" }}>{pais}</span>
                    <span className="block text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>
                      {p?.cambiosDetectados?.length ?? 0} correcciones al Observatorio ·{" "}
                      {a ? `${problemas} de ${a.documentos.length} documentos con cambios` : "auditoría de documentos en curso"}
                    </span>
                  </span>
                  <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} style={{ color: "var(--regu-gray-500)" }} />
                </button>
                {open && (
                  <div className="border-t px-5 py-4" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                    {cambios.length > 0 && (
                      <div className="mb-5">
                        <p className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>Correcciones al Observatorio anterior</p>
                        <ul className="list-disc space-y-1 pl-5 text-[0.875rem]" style={{ color: "var(--regu-gray-900)" }}>
                          {cambios.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                    <p className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-500)" }}>
                      Documentos del catálogo {soloProblemas ? "con cambios" : ""}
                    </p>
                    {docs.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>{a ? "Todos los documentos siguen vigentes y sus enlaces funcionan." : "Auditoría pendiente."}</p>
                    ) : (
                      <ul className="divide-y" style={{ borderColor: "rgba(22,61,89,0.06)" }}>
                        {docs.map((d, i) => (
                          <li key={i} className="py-3">
                            <div className="flex flex-wrap items-start gap-2">
                              <Badge e={d.estado} />
                              <span className="text-[0.75rem] font-semibold" style={{ color: "var(--regu-gray-500)" }}>{d.tema !== "otro" ? TEMA_BY_ID[d.tema as TemaId]?.corto : d.categoriaOriginal}</span>
                            </div>
                            <a href={d.url} target="_blank" rel="noreferrer" className="mt-1 block text-[0.875rem] font-semibold hover:underline" style={{ color: "var(--regu-navy)" }}>
                              {d.titulo} <span className="font-normal" style={{ color: "var(--regu-gray-500)" }}>({hostDe(d.url)})</span>
                            </a>
                            {d.nota && <p className="mt-0.5 text-[0.8125rem]" style={{ color: "var(--regu-gray-700)" }}>{d.nota}</p>}
                            {d.urlNueva && (
                              <a href={d.urlNueva} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-semibold hover:underline" style={{ color: "var(--regu-blue)" }}>
                                → {d.tituloNuevo ?? "Nuevo enlace oficial"}{d.anioNuevo ? ` (${d.anioNuevo})` : ""} <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
