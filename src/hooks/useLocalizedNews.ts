import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { noticiasData, type NoticiaData } from "@/pages/noticiasData";
import { formatPublishedDate, hasPublishedTextTranslation, localizePublishedText, localizePublishedValue, publishedLanguage } from "@/lib/publishedContent";

export interface LocalizableNewsFields {
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  dateFormatted?: string;
}

function newsPrefix(slug: string): string {
  return `newsArticles.${slug}`;
}

export function hasNewsTranslation(slug: string, t: TFunction, language: string): boolean {
  if (publishedLanguage(language) === "es") return true;
  const original = noticiasData.find(item => item.slug === slug);
  return Boolean(t(`${newsPrefix(slug)}.title`, { defaultValue: "" })) || Boolean(original && hasPublishedTextTranslation(original.title, language));
}

export function localizeNewsCategory(category: string, t: TFunction, language: string): string {
  if (publishedLanguage(language) === "es") return category;
  return hasPublishedTextTranslation(category, language) ? localizePublishedText(category, language)
    : t(`newsCategories.${category}`, { defaultValue: category });
}

export function localizeNewsFields<T extends LocalizableNewsFields>(
  item: T,
  t: TFunction,
  language: string
): T {
  if (publishedLanguage(language) === "es") return item;
  const prefix = newsPrefix(item.slug);
  const localized = localizePublishedValue(item, language);
  const original = noticiasData.find(article => article.slug === item.slug);
  const title = hasPublishedTextTranslation(item.title, language) ? localized.title
    : original?.title === item.title ? t(`${prefix}.title`, { defaultValue: item.title }) : item.title;
  return {
    ...localized,
    title,
    excerpt: item.excerpt ? hasPublishedTextTranslation(item.excerpt, language) ? localized.excerpt
      : original?.excerpt === item.excerpt ? t(`${prefix}.excerpt`, { defaultValue: localized.excerpt }) : item.excerpt : item.excerpt,
    category: item.category ? localizeNewsCategory(item.category, t, language) : item.category,
    ...(item.dateFormatted !== undefined ? { dateFormatted: formatPublishedDate(item.date, language, item.dateFormatted) } : {}),
  };
}

export function localizeNoticiaData(
  noticia: NoticiaData,
  t: TFunction,
  language: string
): NoticiaData {
  if (publishedLanguage(language) === "es") return noticia;
  const prefix = newsPrefix(noticia.slug);
  const localized = localizeNewsFields(noticia, t, language);

  const contentRaw = t(`${prefix}.content`, { returnObjects: true, defaultValue: noticia.content });
  const quotesRaw = t(`${prefix}.quotes`, { returnObjects: true, defaultValue: noticia.quotes ?? [] });
  const highlightsRaw = t(`${prefix}.highlights`, {
    returnObjects: true,
    defaultValue: noticia.highlights ?? [],
  });

  return {
    ...localized,
    content: noticia.content.every(text => hasPublishedTextTranslation(text, language))
      ? localized.content : Array.isArray(contentRaw) ? (contentRaw as string[]) : localized.content,
    quotes: noticia.quotes?.some(quote => hasPublishedTextTranslation(quote.text, language)) ? localized.quotes
      : Array.isArray(quotesRaw) ? (quotesRaw as NoticiaData["quotes"]) : localized.quotes,
    highlights: noticia.highlights?.some(highlight => hasPublishedTextTranslation(highlight.text, language)) ? localized.highlights
      : Array.isArray(highlightsRaw)
      ? (highlightsRaw as NoticiaData["highlights"])
      : localized.highlights,
  };
}

export function useLocalizedNewsList<T extends LocalizableNewsFields>(items: T[]): T[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => items.map((item) => localizeNewsFields(item, t, i18n.language)),
    [items, t, i18n.language]
  );
}
