import {
  TEMAS,
  type Estado,
  type IndicadorDef,
  type PerfilPais,
  type TemaDef,
  type TemaId,
} from "@/data/observatorio/schema";

/* ───────────────────────── Carga de perfiles ───────────────────────── */

const modules = import.meta.glob("../data/observatorio/paises/*.json", { eager: true, import: "default" }) as Record<
  string,
  PerfilPais
>;

export const PERFILES: PerfilPais[] = Object.values(modules)
  .filter((p) => p && p.iso && p.categorias)
  .sort((a, b) => a.pais.localeCompare(b.pais, "es", { sensitivity: "base" }));

export const PERFIL_BY_ISO: Record<string, PerfilPais> = Object.fromEntries(PERFILES.map((p) => [p.iso, p]));

export const ULTIMA_VERIFICACION = PERFILES.reduce((max, p) => (p.verificadoEn > max ? p.verificadoEn : max), "");

/* ───────────────────────── Puntuación ───────────────────────── */

/** Presencia de una práctica: ✓ = 1, ◐ = 0,5, ✗ / sin dato = 0 */
export function presencia(e: Estado | undefined): number {
  return e === "si" ? 1 : e === "parcial" ? 0.5 : 0;
}

export function estadoDe(p: PerfilPais, temaId: TemaId, indId: string): Estado {
  return p.categorias?.[temaId]?.indicadores?.[indId]?.estado ?? "sin_dato";
}

export interface ConteoTema {
  si: number;
  parcial: number;
  no: number;
  sinDato: number;
  /** Suma de presencias (0–5) */
  valor: number;
}

export function conteoTema(p: PerfilPais, tema: TemaDef): ConteoTema {
  const c: ConteoTema = { si: 0, parcial: 0, no: 0, sinDato: 0, valor: 0 };
  for (const ind of tema.indicadores) {
    const e = estadoDe(p, tema.id, ind.id);
    if (e === "si") c.si++;
    else if (e === "parcial") c.parcial++;
    else if (e === "no") c.no++;
    else c.sinDato++;
    c.valor += presencia(e);
  }
  return c;
}

export function conteoTotal(p: PerfilPais): ConteoTema {
  return TEMAS.map((t) => conteoTema(p, t)).reduce(
    (acc, c) => ({
      si: acc.si + c.si,
      parcial: acc.parcial + c.parcial,
      no: acc.no + c.no,
      sinDato: acc.sinDato + c.sinDato,
      valor: acc.valor + c.valor,
    }),
    { si: 0, parcial: 0, no: 0, sinDato: 0, valor: 0 }
  );
}

/* ───────────────────────── Comparación ───────────────────────── */

export type Veredicto = "ambos" | "soloA" | "soloB" | "ambosParcial" | "ninguno" | "sinDatos";

/** Una práctica está presente si existe (✓) o está en proceso (◐). */
export function presente(e: Estado): boolean {
  return e === "si" || e === "parcial";
}

export function veredicto(a: Estado, b: Estado): Veredicto {
  if (a === "sin_dato" && b === "sin_dato") return "sinDatos";
  const pa = presente(a);
  const pb = presente(b);
  if (pa && pb) return a === "parcial" && b === "parcial" ? "ambosParcial" : "ambos";
  if (pa) return "soloA";
  if (pb) return "soloB";
  return "ninguno";
}

export function veredictoTexto(v: Veredicto, a: string, b: string): string {
  return {
    ambos: "En ambos",
    ambosParcial: "Ambos en proceso",
    soloA: `Solo ${a}`,
    soloB: `Solo ${b}`,
    ninguno: "En ninguno",
    sinDatos: "Sin datos",
  }[v];
}

/** Nombre corto para etiquetas estrechas */
export function nombreCorto(pais: string): string {
  const map: Record<string, string> = { "República Dominicana": "Rep. Dominicana" };
  return map[pais] ?? pais;
}

export interface FilaComparacion {
  tema: TemaDef;
  ind: IndicadorDef;
  a: Estado;
  b: Estado;
  v: Veredicto;
}

export interface Comparacion {
  filas: FilaComparacion[];
  /** 0–100: de las prácticas presentes en al menos uno de los dos países, % que comparten */
  coincidencia: number;
  /** Prácticas presentes en al menos uno de los dos países */
  union: number;
  enComun: FilaComparacion[];
  soloA: FilaComparacion[];
  soloB: FilaComparacion[];
  diferencias: number;
  porTema: { tema: TemaDef; a: ConteoTema; b: ConteoTema; diferencias: number }[];
}

export function comparar(A: PerfilPais, B: PerfilPais): Comparacion {
  const filas: FilaComparacion[] = [];
  for (const tema of TEMAS) {
    for (const ind of tema.indicadores) {
      const a = estadoDe(A, tema.id, ind.id);
      const b = estadoDe(B, tema.id, ind.id);
      filas.push({ tema, ind, a, b, v: veredicto(a, b) });
    }
  }
  const enComun = filas.filter((f) => f.v === "ambos" || f.v === "ambosParcial");
  const soloA = filas.filter((f) => f.v === "soloA");
  const soloB = filas.filter((f) => f.v === "soloB");
  const diferencias = soloA.length + soloB.length;
  const union = enComun.length + diferencias;
  return {
    filas,
    coincidencia: union ? Math.round((enComun.length / union) * 100) : 0,
    union,
    enComun,
    soloA,
    soloB,
    diferencias,
    porTema: TEMAS.map((tema) => ({
      tema,
      a: conteoTema(A, tema),
      b: conteoTema(B, tema),
      diferencias: filas.filter((f) => f.tema.id === tema.id && (f.v === "soloA" || f.v === "soloB")).length,
    })),
  };
}

/* ───────────────────────── Texto en lenguaje sencillo ───────────────────────── */

export function unirLista(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export function minusculaInicial(s: string): string {
  // Conserva siglas (IMEI, CSIRT, 5G…) y nombres propios en mayúscula.
  const first = s.split(" ")[0] ?? "";
  if (/^[A-ZÁÉÍÓÚÑ0-9"]{2,}/.test(first)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Valor con coma decimal (3,5) o entero */
export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export function flagUrl(iso: string, w: 40 | 80 | 160 = 80): string {
  return `https://flagcdn.com/w${w}/${iso}.png`;
}

export function fechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m) return iso;
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return d ? `${d} de ${meses[m - 1]} de ${y}` : `${meses[m - 1]} de ${y}`;
}

export function hostDe(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
