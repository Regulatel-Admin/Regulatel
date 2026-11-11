import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import type { Estado, PerfilPais, TemaId } from "@/data/observatorio/schema";
import { TEMAS } from "@/data/observatorio/schema";
import { conteoTema, estadoDe, hostDe } from "@/lib/observatorio";
import { DotMap } from "@/components/observatorio/DotMap";
import { Flag, IndIcon, TemaIcon } from "@/components/observatorio/ui";
import { Caps, P2, Pill2 } from "./ui2";

const ORDEN: Estado[] = ["si", "parcial", "no", "sin_dato"];
const PUNTO: Record<Estado, string> = { si: "#2B9A66", parcial: "#E9A23B", no: "#D9534F", sin_dato: "#A9B6C1" };
const ETIQ: Record<Estado, string> = { si: "Sí", parcial: "En proceso", no: "No", sin_dato: "Sin dato" };

function SelectNativo({ etiqueta, valor, onCambio, opciones }: { etiqueta: string; valor: string; onCambio: (v: string) => void; opciones: { v: string; t: string }[] }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="obs2-select w-full appearance-none rounded-lg border bg-white py-3.5 pl-5 pr-12 text-[1.0625rem] font-semibold outline-none"
        style={{ borderColor: P2.line, color: P2.navy }}
      >
        {opciones.map((o) => (
          <option key={o.v} value={o.v}>{o.t}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: P2.navy }} />
    </label>
  );
}

export default function Region2({
  perfiles,
  isoA,
  isoB,
  temaId,
  indId,
  paisSel,
  onSel,
  onPais,
  onComparar,
}: {
  perfiles: PerfilPais[];
  isoA: string;
  isoB: string;
  temaId: TemaId;
  indId: string;
  paisSel: string;
  onSel: (temaId: TemaId, indId: string) => void;
  onPais: (iso: string) => void;
  onComparar: (iso: string) => void;
}) {
  const tema = TEMAS.find((t) => t.id === temaId) ?? TEMAS[0];
  const ind = tema.indicadores.find((i) => i.id === indId) ?? tema.indicadores[0];
  const [hover, setHover] = useState<string | null>(null);
  const [todos, setTodos] = useState(false);

  const estados = useMemo(() => Object.fromEntries(perfiles.map((p) => [p.iso, estadoDe(p, tema.id, ind.id)])) as Record<string, Estado>, [perfiles, tema.id, ind.id]);
  const conteo = useMemo(() => {
    const c: Record<Estado, number> = { si: 0, parcial: 0, no: 0, sin_dato: 0 };
    perfiles.forEach((p) => c[estados[p.iso]]++);
    return c;
  }, [perfiles, estados]);
  const adopcionTema = useMemo(
    () => tema.indicadores.map((i) => ({ i, si: perfiles.filter((p) => estadoDe(p, tema.id, i.id) === "si").length })),
    [perfiles, tema]
  );

  const detalle = perfiles.find((p) => p.iso === paisSel) ?? perfiles[0];
  const valDetalle = detalle?.categorias[tema.id]?.indicadores?.[ind.id];
  const visibles = todos ? perfiles : perfiles.slice(0, 8);

  return (
    <div>
      {/* Selección de tema e indicador */}
      <div className="flex flex-col gap-3 md:flex-row">
        <SelectNativo etiqueta="Tema" valor={tema.id} onCambio={(v) => onSel(v as TemaId, TEMAS.find((t) => t.id === v)!.indicadores[0].id)} opciones={TEMAS.map((t) => ({ v: t.id, t: t.nombre }))} />
        <SelectNativo etiqueta="Indicador" valor={ind.id} onCambio={(v) => onSel(tema.id, v)} opciones={tema.indicadores.map((i) => ({ v: i.id, t: i.label }))} />
      </div>

      {/* Mapa + detalle nacional */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-xl p-4 md:p-6" style={{ background: "#E6F0F5" }}>
          <div className="mx-auto w-full max-w-[720px]">
            <DotMap perfiles={perfiles} estados={estados} isoA={isoA} isoB={isoB} hover={hover ?? paisSel} setHover={setHover} onPick={onPais} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.875rem]" style={{ color: "#3B4B57" }}>
            {ORDEN.map((e) => (
              <span key={e} className="inline-flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PUNTO[e] }} />{ETIQ[e]} <strong className="tabular-nums">{conteo[e]}</strong></span>
            ))}
            <span style={{ color: P2.muted }}>· Haga clic en una bandera para ver su detalle</span>
          </div>
        </div>

        {detalle && (
          <aside className="rounded-xl p-6 lg:self-start" style={{ background: P2.bgSoft }}>
            <Caps>Detalle nacional</Caps>
            <div className="mt-4 flex items-center gap-4 border-b pb-5" style={{ borderColor: P2.line }}>
              <Flag iso={detalle.iso} size={50} />
              <span className="font-semibold" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "2.1rem", lineHeight: 1.1 }}>{detalle.pais}</span>
            </div>
            <div className="border-b py-5" style={{ borderColor: P2.line }}>
              <Caps>Estado del indicador</Caps>
              <div className="mt-3"><Pill2 estado={estados[detalle.iso]} grande /></div>
              <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: P2.text }}>{valDetalle?.nota ?? "No se encontró información pública confirmada."}</p>
              {valDetalle?.fuente && (
                <a href={valDetalle.fuente} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[0.875rem] font-semibold hover:underline" style={{ color: P2.teal }}>
                  Fuente: {hostDe(valDetalle.fuente)} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="border-b py-4" style={{ borderColor: P2.line }}>
              <p className="text-[0.875rem]" style={{ color: P2.muted }}>Indicador</p>
              <p className="mt-0.5 text-[1.0625rem] font-semibold" style={{ color: P2.navy }}>{ind.label}</p>
            </div>
            <div className="py-4">
              <p className="text-[0.875rem]" style={{ color: P2.muted }}>Tema</p>
              <p className="mt-0.5 text-[1.0625rem] font-semibold" style={{ color: P2.navy }}>{tema.nombre}</p>
            </div>
            {detalle.iso !== isoA && (
              <button type="button" onClick={() => onComparar(detalle.iso)} className="obs2-boton mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[0.9375rem] font-bold">
                Comparar con {perfiles.find((p) => p.iso === isoA)?.pais ?? "el país A"} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </aside>
        )}
      </div>

      {/* Tabla + resumen */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h2 className="font-semibold" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "clamp(1.7rem, 1vw + 1.3rem, 2.3rem)" }}>Países miembros y adopción por indicador</h2>
          <p className="mt-2 text-[1rem]" style={{ color: P2.muted }}>Estado de {ind.label.toLowerCase()} y prácticas del tema {tema.corto.toLowerCase()} en los {perfiles.length} países miembros.</p>
          <div className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: P2.line }}>
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 px-4 py-3 text-[0.875rem] font-semibold" style={{ background: "#EEF3F4", color: "#3B4B57" }}>
              <span>País</span>
              <span className="flex items-center justify-center gap-1.5 text-center"><TemaIcon icono={tema.icono} size={15} /> {tema.corto}</span>
              <span className="flex items-center justify-center gap-1.5 text-center"><IndIcon id={ind.id} size={15} /> {ind.label}</span>
            </div>
            <ul>
              {visibles.map((p) => {
                const c = conteoTema(p, tema);
                const sel = p.iso === paisSel;
                return (
                  <li key={p.iso}>
                    <button type="button" onClick={() => onPais(p.iso)} data-activo={sel} className="obs2-fila-pais grid w-full grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-t px-4 py-2.5 text-left" style={{ borderColor: "#E3EAEE" }}>
                      <span className="flex min-w-0 items-center gap-3 font-semibold" style={{ color: P2.navy }}>
                        <Flag iso={p.iso} size={26} /> <span className="truncate">{p.pais}</span>
                      </span>
                      <span className="flex items-center justify-center gap-2 text-[0.875rem] font-semibold tabular-nums" style={{ color: "#3B4B57" }}>
                        <span className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, k) => (
                            <span key={k} className="inline-block h-2 w-2 rounded-full" style={{ background: k < c.si ? P2.teal : k < c.si + c.parcial ? "#9CC7C1" : "#DDE5EA" }} />
                          ))}
                        </span>
                        {c.si}/5
                      </span>
                      <span className="flex justify-center"><Pill2 estado={estadoDe(p, tema.id, ind.id)} /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          {perfiles.length > 8 && (
            <button type="button" onClick={() => setTodos((t) => !t)} className="mt-4 inline-flex items-center gap-1.5 text-[1rem] font-bold hover:underline" style={{ color: P2.teal }}>
              {todos ? "Ver menos" : `Ver los ${perfiles.length} países miembros`} <ArrowRight className={`h-4 w-4 transition ${todos ? "-rotate-90" : ""}`} />
            </button>
          )}
        </div>

        <aside className="lg:border-l lg:pl-8" style={{ borderColor: P2.line }}>
          <h2 className="font-semibold" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "clamp(1.5rem, 0.8vw + 1.2rem, 1.9rem)", lineHeight: 1.15 }}>Resumen de adopción por indicador</h2>
          <p className="mt-2 text-[0.9375rem]" style={{ color: P2.muted }}>Cantidad de países, de {perfiles.length}, según el estado de cada indicador.</p>

          <div className="mt-5 rounded-xl p-4" style={{ background: P2.bgSoft }}>
            <p className="mb-2 font-bold" style={{ color: P2.navy }}>{ind.label}</p>
            {ORDEN.map((e) => (
              <div key={e} className="flex items-center gap-2.5 border-b py-2 last:border-b-0" style={{ borderColor: P2.line }}>
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PUNTO[e] }} />
                <span className="flex-1 text-[0.9375rem]" style={{ color: "#3B4B57" }}>{ETIQ[e]}</span>
                <span className="text-[1.125rem] font-bold tabular-nums" style={{ color: P2.navy }}>{conteo[e]}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl p-4" style={{ background: P2.bgSoft }}>
            <p className="mb-2 font-bold" style={{ color: P2.navy }}>{tema.nombre}</p>
            {adopcionTema.map(({ i, si }) => (
              <button key={i.id} type="button" onClick={() => onSel(tema.id, i.id)} className="block w-full py-1.5 text-left">
                <div className="mb-1 flex items-baseline justify-between gap-2 text-[0.875rem]">
                  <span className={i.id === ind.id ? "font-bold" : ""} style={{ color: i.id === ind.id ? P2.navy : "#3B4B57" }}>{i.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: P2.navy }}>{si}/{perfiles.length}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "#DDE5EA" }}>
                  <div className="h-full rounded-full" style={{ width: `${(si / Math.max(1, perfiles.length)) * 100}%`, background: i.id === ind.id ? P2.teal : "#9CC7C1" }} />
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
