import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { NoticiaData } from "@/pages/noticiasData";

export interface LocalizableNewsFields {
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
}

function newsPrefix(slug: string): string {
  return `newsArticles.${slug}`;
}

export function hasNewsTranslation(slug: string, t: TFunction, language: string): boolean {
  if (language === "es") return true;
  return Boolean(t(`${newsPrefix(slug)}.title`, { defaultValue: "" }));
}

export function localizeNewsCategory(category: string, t: TFunction, language: string): string {
  if (language === "es") return category;
  return t(`newsCategories.${category}`, { defaultValue: category });
}

export function localizeNewsFields<T extends LocalizableNewsFields>(
  item: T,
  t: TFunction,
  language: string
): T {
  if (language === "es") return item;
  const prefix = newsPrefix(item.slug);
  const title = t(`${prefix}.title`, { defaultValue: "" });
  if (!title) return item;
  return {
    ...item,
    title,
    excerpt: item.excerpt ? t(`${prefix}.excerpt`, { defaultValue: item.excerpt }) : item.excerpt,
    category: item.category ? localizeNewsCategory(item.category, t, language) : item.category,
  };
}

export function localizeNoticiaData(
  noticia: NoticiaData,
  t: TFunction,
  language: string
): NoticiaData {
  if (language === "es") return noticia;
  const prefix = newsPrefix(noticia.slug);
  const title = t(`${prefix}.title`, { defaultValue: "" });
  if (!title) return noticia;

  const contentRaw = t(`${prefix}.content`, { returnObjects: true, defaultValue: noticia.content });
  const quotesRaw = t(`${prefix}.quotes`, { returnObjects: true, defaultValue: noticia.quotes ?? [] });
  const highlightsRaw = t(`${prefix}.highlights`, {
    returnObjects: true,
    defaultValue: noticia.highlights ?? [],
  });

  return {
    ...noticia,
    title,
    excerpt: t(`${prefix}.excerpt`, { defaultValue: noticia.excerpt }),
    category: localizeNewsCategory(noticia.category, t, language),
    content: Array.isArray(contentRaw) ? (contentRaw as string[]) : noticia.content,
    quotes: Array.isArray(quotesRaw) ? (quotesRaw as NoticiaData["quotes"]) : noticia.quotes,
    highlights: Array.isArray(highlightsRaw)
      ? (highlightsRaw as NoticiaData["highlights"])
      : noticia.highlights,
  };
}

export function useLocalizedNewsList<T extends LocalizableNewsFields>(items: T[]): T[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => items.map((item) => localizeNewsFields(item, t, i18n.language)),
    [items, t, i18n.language]
  );
}
