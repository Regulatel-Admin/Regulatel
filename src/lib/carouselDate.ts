const MESES: Record<string, number> = {
  ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5,
  JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11,
};

const MESES_LARGO: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const MONTH_ABBR_EN: Record<string, string> = {
  ENE: "JAN", FEB: "FEB", MAR: "MAR", ABR: "APR", MAY: "MAY", JUN: "JUN",
  JUL: "JUL", AGO: "AUG", SEP: "SEP", OCT: "OCT", NOV: "NOV", DIC: "DEC",
};

const MONTH_ABBR_PT: Record<string, string> = {
  ENE: "JAN", FEB: "FEV", MAR: "MAR", ABR: "ABR", MAY: "MAI", JUN: "JUN",
  JUL: "JUL", AGO: "AGO", SEP: "SET", OCT: "OUT", NOV: "NOV", DIC: "DEZ",
};

function localeTag(language: string): string {
  if (language === "en") return "en-GB";
  if (language === "pt") return "pt-PT";
  return "es-ES";
}

export function parseCarouselDate(dateStr: string): Date | null {
  if (!dateStr?.trim()) return null;
  const s = dateStr.trim();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const year = parseInt(iso[1], 10);
    const month = parseInt(iso[2], 10) - 1;
    const day = parseInt(iso[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  const onlyYear = /^\d{4}$/.exec(s);
  if (onlyYear) return new Date(parseInt(onlyYear[0], 10), 11, 31);

  const matchLong = s.match(/^(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?(\d{4})$/i);
  if (matchLong) {
    const day = parseInt(matchLong[1], 10);
    const year = parseInt(matchLong[3], 10);
    const mesStr = matchLong[2].toLowerCase();
    const mes = MESES_LARGO[mesStr] ?? MESES[mesStr.slice(0, 3).toUpperCase()];
    if (!Number.isNaN(day) && !Number.isNaN(year) && mes !== undefined) {
      return new Date(year, mes, day);
    }
  }

  const parts = s.split(/\s+/);
  if (parts.length >= 2) {
    const mesStr = (parts[0] || "").toUpperCase().slice(0, 3);
    const year = parseInt(parts[parts.length - 1], 10);
    if (MESES[mesStr] !== undefined && !Number.isNaN(year)) {
      return new Date(year, MESES[mesStr], 1);
    }
  }

  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const mesStr = (parts[1] || "").toUpperCase().slice(0, 3);
    const year = parseInt(parts[2], 10);
    if (!Number.isNaN(day) && MESES[mesStr] !== undefined && !Number.isNaN(year)) {
      return new Date(year, MESES[mesStr], day);
    }
  }

  return null;
}

/** Valor para <input type="date"> (YYYY-MM-DD) a partir del texto guardado en la cumbre. */
export function toDateInputValue(dateStr: string): string {
  const trimmed = dateStr?.trim() ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = parseCarouselDate(trimmed);
  if (!parsed) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateHasDayPrecision(dateStr: string): boolean {
  const s = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return true;
  if (/^\w{3,4}\s+\d{4}$/i.test(s)) return false;
  if (/^\d{4}$/.test(s)) return false;
  return /\d{1,2}/.test(s);
}

function translateMonthAbbrev(token: string, language: string): string {
  const key = token.toUpperCase().slice(0, 3);
  if (language === "en") return MONTH_ABBR_EN[key] ?? token;
  if (language === "pt") return MONTH_ABBR_PT[key] ?? token;
  return token;
}

/** Formats carousel date strings for the active UI language. */
export function formatCarouselDisplayDate(dateStr: string, language: string): string {
  if (!dateStr?.trim()) return dateStr;

  const parsed = parseCarouselDate(dateStr);
  if (parsed) {
    if (dateHasDayPrecision(dateStr)) {
      return parsed.toLocaleDateString(localeTag(language), {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return parsed.toLocaleDateString(localeTag(language), {
      month: "short",
      year: "numeric",
    });
  }

  if (language === "es") return dateStr;

  const monthYear = dateStr.trim().match(/^([A-Za-zÁÉÍÓÚáéíóú]{3,})\s+(\d{4})$/i);
  if (monthYear) {
    const month = translateMonthAbbrev(monthYear[1], language);
    return `${month} ${monthYear[2]}`;
  }

  return dateStr;
}

export function isCarouselDatePast(dateStr: string): boolean {
  const d = parseCarouselDate(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}
