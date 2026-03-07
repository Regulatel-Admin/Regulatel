import { getDb } from "./db.js";

export interface CifrasRow {
  year: number;
  grupos_trabajo: number;
  comites_ejecutivos: number;
  revista_digital: number;
  paises: number;
  updated_at: string;
}

export interface CifrasAnualesDto {
  gruposTrabajo: number;
  comitesEjecutivos: number;
  revistaDigital: number;
  paises: number;
}

function rowToCifras(r: CifrasRow): { year: number } & CifrasAnualesDto {
  return {
    year: r.year,
    gruposTrabajo: r.grupos_trabajo,
    comitesEjecutivos: r.comites_ejecutivos,
    revistaDigital: r.revista_digital,
    paises: r.paises,
  };
}

/** List all cifras by year (for admin and public). */
export async function listCifras(): Promise<Record<number, CifrasAnualesDto>> {
  const sql = getDb();
  const rows = await sql<CifrasRow[]>`
    SELECT year, grupos_trabajo, comites_ejecutivos, revista_digital, paises, updated_at
    FROM cifras
    ORDER BY year DESC
  `;
  const out: Record<number, CifrasAnualesDto> = {};
  for (const r of rows) {
    out[r.year] = {
      gruposTrabajo: r.grupos_trabajo,
      comitesEjecutivos: r.comites_ejecutivos,
      revistaDigital: r.revista_digital,
      paises: r.paises,
    };
  }
  return out;
}

/** Upsert cifras for one year. Creates row if not present. */
export async function upsertCifras(
  year: number,
  data: CifrasAnualesDto
): Promise<{ year: number } & CifrasAnualesDto> {
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<CifrasRow[]>`
    INSERT INTO cifras (year, grupos_trabajo, comites_ejecutivos, revista_digital, paises, updated_at)
    VALUES (${year}, ${data.gruposTrabajo}, ${data.comitesEjecutivos}, ${data.revistaDigital}, ${data.paises}, ${now}::timestamptz)
    ON CONFLICT (year) DO UPDATE SET
      grupos_trabajo = ${data.gruposTrabajo},
      comites_ejecutivos = ${data.comitesEjecutivos},
      revista_digital = ${data.revistaDigital},
      paises = ${data.paises},
      updated_at = ${now}::timestamptz
    RETURNING year, grupos_trabajo, comites_ejecutivos, revista_digital, paises, updated_at
  `;
  return rowToCifras(row);
}

/** Remove stored cifras for a year (so frontend falls back to default). */
export async function deleteCifrasForYear(year: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM cifras WHERE year = ${year}`;
  return result.count > 0;
}
