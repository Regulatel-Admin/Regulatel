/**
 * Formato de fecha estilo BEREC para el mega-menú y listados.
 * Entrada: ISO date "YYYY-MM-DD".
 * Salida: "dd.mm.yyyy" (ej. "25.02.2026").
 */
export function formatBERECDate(isoDate: string | undefined): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Rango de fechas estilo BEREC: "dd–dd.mm.yyyy" o "dd.mm.yyyy" si son iguales.
 */
export function formatBERECDateRange(
  startIso: string | undefined,
  endIso: string | undefined
): string {
  if (!startIso) return endIso ? formatBERECDate(endIso) : "";
  if (!endIso || startIso === endIso) return formatBERECDate(startIso);
  const start = formatBERECDate(startIso);
  const end = formatBERECDate(endIso);
  const [d1, rest] = start.split(".");
  const [d2] = end.split(".");
  return `${d1}–${d2}.${rest}`;
}
