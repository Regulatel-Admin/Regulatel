/**
 * Directorio de autoridades — página Miembros.
 * Valor en site_settings: { entries: DirectorioAutoridad[] } bajo DIRECTORIO_AUTORIDADES_SETTINGS_KEY.
 */

export interface DirectorioAutoridad {
  pais: string;
  acronym: string;
  presidente: string;
  cargo: string;
  corresponsal: string;
  correo: string;
}

export const DIRECTORIO_AUTORIDADES_SETTINGS_KEY = "directorio_autoridades" as const;

/** Correo = primer email de la columna "Dirección de correo electrónico1" (correo del corresponsal) por país. */
export const defaultDirectorioAutoridades: DirectorioAutoridad[] = [
  { pais: "ARGENTINA", acronym: "ENACOM", presidente: "Juan Martín Ozores", cargo: "Presidente", corresponsal: "Allen Aldana Palacios", correo: "apelacion@enacom.gob.ar" },
  { pais: "BOLIVIA", acronym: "ATT", presidente: "Néstor Ríos Rivero", cargo: "Director Ejecutivo", corresponsal: "Alan Wilbert Borda Rivera", correo: "aborda@att.gob.bo" },
  { pais: "BRASIL", acronym: "ANATEL", presidente: "Carlos Baigorri", cargo: "Presidente", corresponsal: "Salerme Oliveira", correo: "salerme@anatel.gov.br" },
  { pais: "CHILE", acronym: "SUBTEL", presidente: "Claudio Araya San Martín", cargo: "Subsecretario", corresponsal: "Denis Gonzalez Grandjean", correo: "dgonzalez@subtel.gob.cl" },
  { pais: "COLOMBIA", acronym: "CRC", presidente: "Felipe Augusto Díaz Suaza", cargo: "Director Ejecutivo", corresponsal: "Mariana Sarmiento Argüello", correo: "mariana.sarmiento@crcom.gov.co" },
  { pais: "COSTA RICA", acronym: "SUTEL", presidente: "Carlos Watson Carazo", cargo: "Presidente del Consejo Directivo", corresponsal: "Ivannia Morales Chávez", correo: "ivannia.morales@sutel.go.cr" },
  { pais: "CUBA", acronym: "MINCOM", presidente: "Wilfredo López Rodríguez", cargo: "Primer Viceministro", corresponsal: "Melba Pita Calderon", correo: "melba.pita@mincom.gob.cu" },
  { pais: "ECUADOR", acronym: "ARCOTEL", presidente: "Jorge Roberto Hoyos Zavala", cargo: "Director Ejecutivo", corresponsal: "Juan Pablo Zhunio Cifuentes", correo: "juan.puchuela@arcotel.gob.ec" },
  { pais: "EL SALVADOR", acronym: "SIGET", presidente: "Manuel Ernesto Aguilar", cargo: "Superintendente General", corresponsal: "María Escobar", correo: "mescobar@siget.gob.sv" },
  { pais: "ESPAÑA", acronym: "CNMC", presidente: "Alejandra de Iturriaga", cargo: "Vicepresidenta", corresponsal: "Antonio Serra Bastida", correo: "antonio.serra@cnmc.es" },
  { pais: "GUATEMALA", acronym: "SIT", presidente: "Herbert Armando Rubio Montes", cargo: "Comisionado Presidente", corresponsal: "Ingrid Rosenda García Santiago", correo: "ingrid.garcia@sit.gob.gt" },
  { pais: "HONDURAS", acronym: "CONATEL", presidente: "Lorenzo Sauceda Calix", cargo: "Comisionado Presidente", corresponsal: "Claudia Rosario Reyes Solís", correo: "maurin.reyes@conatel.gob.hn" },
  { pais: "ITALIA", acronym: "AGCOM", presidente: "Giacomo Lasorella", cargo: "Presidente", corresponsal: "Antonio De Tommaso", correo: "s.detommaso@agcom.it" },
  { pais: "MÉXICO", acronym: "CRT", presidente: "Norma Solano Rodríguez", cargo: "Presidente", corresponsal: "Julio Téllez del Río", correo: "julio.tellez@crt.gob.mx" },
  { pais: "NICARAGUA", acronym: "TELCOR", presidente: "Nahima Díaz Flores", cargo: "Directora General", corresponsal: "Alina Rivas", correo: "arivas@telcor.gob.ni" },
  { pais: "PANAMÁ", acronym: "ASEP", presidente: "Zelmar Rodríguez Crespo", cargo: "Administradora General", corresponsal: "Ana De la Rosa", correo: "adelarosa@asep.gob.pa" },
  { pais: "PARAGUAY", acronym: "CONATEL", presidente: "Juan Carlos Duarte Duré", cargo: "Presidente", corresponsal: "Rodrigo Volpe", correo: "rodrigo_volpe@conatel.gov.py" },
  { pais: "PERÚ", acronym: "OSIPTEL", presidente: "Jesus Guillén Marroquín", cargo: "Presidente", corresponsal: "Vanessa Castillo Mendives", correo: "vcastillo@osiptel.gob.pe" },
  { pais: "PORTUGAL", acronym: "ANACOM", presidente: "Sandra Maximiano", cargo: "Presidente del Consejo de Administración", corresponsal: "Rita Silva", correo: "rita.silva@anacom.pt" },
  { pais: "PUERTO RICO", acronym: "NET", presidente: "Romina Garrido Iglesias", cargo: "Comisionado Presidente", corresponsal: "Norberto Almodóvar Vélez", correo: "osvaldo.soto@jsp.pr.gov" },
  { pais: "REPÚBLICA DOMINICANA", acronym: "INDOTEL", presidente: "Guido Orlando Gómez Mazara", cargo: "Presidente del Consejo Directivo", corresponsal: "Amparo Arango Cruz", correo: "aarango@indotel.gob.do" },
  { pais: "URUGUAY", acronym: "URSEC", presidente: "Gonzalo Balseiro", cargo: "Presidente", corresponsal: "Carol Dolinkas", correo: "cdolinkas@ursec.gub.uy" },
  { pais: "VENEZUELA", acronym: "CONATEL", presidente: "Enrique José Quintana Sifontes", cargo: "Director General", corresponsal: "Mariana Solymer Calderón Martínez", correo: "mcalderon@conatel.gob.ve" },
];

export function parseDirectorioFromSettingValue(value: unknown): DirectorioAutoridad[] | null {
  if (value == null || typeof value !== "object") return null;
  const entries = (value as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return null;
  const out: DirectorioAutoridad[] = [];
  for (const row of entries) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    out.push({
      pais: typeof r.pais === "string" ? r.pais : "",
      acronym: typeof r.acronym === "string" ? r.acronym : "",
      presidente: typeof r.presidente === "string" ? r.presidente : "",
      cargo: typeof r.cargo === "string" ? r.cargo : "",
      corresponsal: typeof r.corresponsal === "string" ? r.corresponsal : "",
      correo: typeof r.correo === "string" ? r.correo : "",
    });
  }
  return out;
}
