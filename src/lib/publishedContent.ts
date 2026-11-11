import en from "@/i18n/locales/published-en.json";
import pt from "@/i18n/locales/published-pt.json";
import it from "@/i18n/locales/published-it.json";

type Catalog = Record<string, string>;
const catalogs: Record<string, Catalog> = { en, pt, it };
const normalizedCatalogs = new Map<string, Map<string, string | null>>();
const textFields = new Set([
  "title", "text", "description", "excerpt", "caption", "label", "name",
  "location", "organizer", "summary", "details", "subtitle",
  "shortDescription", "heading", "pageTitle", "pageDescription", "role", "cargo", "badge", "titleHighlight",
  "institution", "country", "pais", "content", "tags", "ctaLabel", "ctaPrimaryLabel",
  "ctaSecondaryLabel", "buttonLabel", "alt", "hint", "intro", "body",
  "fullName", "organization", "groupName", "contentType", "shortSummary",
  "funciones", "funcionesIntro", "miembros", "coordinadores", "coverEdition", "coverLabel",
]);

export function publishedLanguage(language: string): string {
  return language.toLowerCase().split("-")[0];
}

function normalizedText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

function lookup(text: string, language: string): string | undefined {
  const lang = publishedLanguage(language);
  const catalog = catalogs[lang];
  if (!catalog) return undefined;
  if (Object.prototype.hasOwnProperty.call(catalog, text)) return catalog[text];
  if (!normalizedCatalogs.has(lang)) {
    const normalized = new Map<string, string | null>();
    for (const [source, translated] of Object.entries(catalog)) {
      const key = normalizedText(source);
      if (!normalized.has(key)) normalized.set(key, translated);
      else if (normalized.get(key) !== translated) normalized.set(key, null);
    }
    normalizedCatalogs.set(lang, normalized);
  }
  return normalizedCatalogs.get(lang)?.get(normalizedText(text)) ?? undefined;
}

/** Exact source text keeps a newer CMS edit from receiving an older translation. */
export function hasPublishedTextTranslation(text: string, language: string): boolean {
  return lookup(text, language) !== undefined;
}

export function localizePublishedText(text: string, language: string): string {
  if (publishedLanguage(language) === "es" || !text.trim()) return text;
  const translated = lookup(text, language);
  if (translated !== undefined) {
    const leading = text.match(/^\s*/)?.[0] ?? "";
    const trailing = text.match(/\s*$/)?.[0] ?? "";
    return leading + translated.trim() + trailing;
  }
  const paragraphs = text.split(/(\n\s*\n)/);
  if (paragraphs.length > 1) return paragraphs.map(part => part.trim() ? localizePublishedText(part, language) : part).join("");
  return text;
}

export function localizePublishedImage(url: string, language: string): string {
  return publishedLanguage(language) === "en" && url === "/images/noticias/conecta-latam-2026-es.png"
    ? "/images/noticias/conecta-latam-2026-en.png" : url;
}

/** Clone display fields only. Identifiers, addresses, access flags and source data stay intact. */
export function localizePublishedValue<T>(value: T, language: string): T {
  if (publishedLanguage(language) === "es") return value;
  const visit = (current: unknown, field = ""): unknown => {
    if (typeof current === "string") {
      if (field === "imageUrl" || field === "src") return localizePublishedImage(current, language);
      return textFields.has(field) ? localizePublishedText(current, language) : current;
    }
    if (Array.isArray(current)) return current.map(item => visit(item, field));
    if (current && typeof current === "object") {
      return Object.fromEntries(Object.entries(current).map(([key, item]) => [key, visit(item, key)]));
    }
    return current;
  };
  return visit(value) as T;
}

export function formatPublishedDate(date: string | undefined, language: string, fallback = ""): string {
  if (!date || publishedLanguage(language) === "es") return fallback || date || "";
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00` : date);
  if (Number.isNaN(parsed.getTime())) return fallback || date;
  const locale = ({ en: "en-GB", pt: "pt-PT", it: "it-IT" } as Record<string, string>)[publishedLanguage(language)] ?? "es-ES";
  return parsed.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}
