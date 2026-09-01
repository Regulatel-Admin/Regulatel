import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { BoletinGtaiSerialized } from "@/data/boletinesGtai";

type BoletinArticleTranslation = {
  title?: string;
  shortSummary?: string;
  description?: string;
  groupName?: string;
};

const KNOWN_BOLETIN_KEYS = ["boletin-1-2026", "boletin-2-2026", "boletin-3-2026", "boletin-4-2026"] as const;

function resolveArticleKey(entry: BoletinGtaiSerialized): string {
  const slug = entry.slug.trim().toLowerCase();
  if ((KNOWN_BOLETIN_KEYS as readonly string[]).includes(slug)) return slug;

  const byIssueYear = `boletin-${entry.issueNumber}-${entry.year}`.toLowerCase();
  if ((KNOWN_BOLETIN_KEYS as readonly string[]).includes(byIssueYear)) return byIssueYear;

  if (entry.issueNumber >= 1 && entry.issueNumber <= 4 && entry.year === 2026) {
    return `boletin-${entry.issueNumber}-2026`;
  }

  return slug;
}

function languageBase(language: string): string {
  return language.split("-")[0] || language;
}

function getBoletinArticles(t: TFunction, language: string): Record<string, BoletinArticleTranslation> {
  if (languageBase(language) === "es") return {};
  const raw = t("boletinesArticles", { returnObjects: true, defaultValue: {} });
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, BoletinArticleTranslation>;
  }
  return {};
}

function getBoletinShared(t: TFunction, language: string): Record<string, string> {
  if (languageBase(language) === "es") return {};
  const raw = t("boletinesShared", { returnObjects: true, defaultValue: {} });
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, string>;
  }
  return {};
}

function localizeTitle(
  entry: BoletinGtaiSerialized,
  article: BoletinArticleTranslation | undefined,
  t: TFunction,
  language: string
): string {
  if (languageBase(language) === "es") return entry.title;
  if (article?.title) return article.title;

  const match = entry.title.match(/bolet[ií]n\s*(\d+)/i);
  if (match) {
    return t("boletinesShared.titleNumbered", {
      number: match[1],
      defaultValue: entry.title,
    });
  }

  if (entry.issueNumber > 0) {
    return t("boletinesShared.titleNumbered", {
      number: entry.issueNumber,
      defaultValue: entry.title,
    });
  }

  return entry.title;
}

export function localizeBoletin(
  entry: BoletinGtaiSerialized,
  t: TFunction,
  language: string
): BoletinGtaiSerialized {
  if (languageBase(language) === "es") return entry;

  const languageKey = languageBase(language);
  const articles = getBoletinArticles(t, languageKey);
  const shared = getBoletinShared(t, languageKey);
  const articleKey = resolveArticleKey(entry);
  const article = articles[articleKey];

  return {
    ...entry,
    title: localizeTitle(entry, article, t, languageKey),
    groupName: article?.groupName ?? shared.groupName ?? entry.groupName,
    shortSummary: article?.shortSummary ?? entry.shortSummary,
    description: article?.description ?? entry.description,
    contentType: shared.contentType ?? entry.contentType,
  };
}

export function useLocalizedBoletin(
  entry: BoletinGtaiSerialized | null | undefined
): BoletinGtaiSerialized | null | undefined {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    if (!entry) return entry;
    return localizeBoletin(entry, t, i18n.resolvedLanguage ?? i18n.language);
  }, [entry, t, i18n.language, i18n.resolvedLanguage]);
}

export function useLocalizedBoletines(entries: BoletinGtaiSerialized[]): BoletinGtaiSerialized[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => entries.map((entry) => localizeBoletin(entry, t, i18n.resolvedLanguage ?? i18n.language)),
    [entries, t, i18n.language, i18n.resolvedLanguage]
  );
}
