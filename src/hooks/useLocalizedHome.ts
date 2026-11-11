import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  heroInstitucional,
  quickLinks as staticQuickLinks,
  featuredCarouselItems as staticCarouselItems,
  cifrasCardsConfig,
  type CifraCardConfig,
} from "@/data/home";
import type { HomeHeroSetting } from "@/types/siteSettings";
import type { QuickLinkItem } from "@/components/home/QuickLinksBar";
import type { FeaturedCarouselItem } from "@/components/home/FeaturedCarousel";
import { formatCarouselDisplayDate } from "@/lib/carouselDate";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { hasPublishedTextTranslation, localizePublishedText, publishedLanguage } from "@/lib/publishedContent";

const CAROUSEL_ITEM_I18N: Record<string, string> = {
  "cumbre-regulatel-asiet-comtelca-2026": "montevideo2026",
  "cumbre-punta-cana": "puntaCana",
  "cumbre-regulatel-prai-2025": "prai",
  "berec-eapereg-regulatel": "berecEapereg",
  "regulatel-asiet-cartagena-dic-2024": "asietCartagena",
  "berec-regulatel-bolivia-junio-2025": "berecBolivia",
};

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function localizeCarouselCta(label: string | undefined, t: TFunction, language: string): string {
  if (publishedLanguage(language) === "es") return label?.trim() || t("common.readMore");
  if (label && hasPublishedTextTranslation(label, language)) return localizePublishedText(label, language);
  const normalized = normalizeToken(label ?? "");
  if (normalized === "ver cumbre") return t("home.featuredSummits.cta");
  if (normalized === "leer mas") return t("common.readMore");
  return label?.trim() || t("common.readMore");
}

/** A known identifier alone must not overwrite a later CMS edit with old copy. */
function localizeHomeText(
  source: string,
  defaultSource: string | undefined,
  key: string | undefined,
  t: TFunction,
  language: string,
): string {
  if (publishedLanguage(language) === "es") return source;
  if (hasPublishedTextTranslation(source, language)) return localizePublishedText(source, language);
  return key && source === defaultSource ? t(key, { defaultValue: source }) : source;
}

/** Maps default Spanish quick-link labels to locale keys. */
export const QUICK_LINK_LABEL_KEYS: Record<string, string> = {
  Miembros: "home.quickLinks.items.members",
  "Buenas Prácticas Regulatorias": "home.quickLinks.items.bestPractices",
  "Buenas practicas regulatorias": "home.quickLinks.items.bestPractices",
  "Banco de Información de Telecomunicación": "home.quickLinks.items.informationBank",
  "Banco de Informacion de Telecomunicacion": "home.quickLinks.items.informationBank",
  Documentos: "home.quickLinks.items.documents",
};

export function localizeQuickLinkItems(
  items: QuickLinkItem[],
  t: TFunction,
  language: string
): QuickLinkItem[] {
  if (publishedLanguage(language) === "es") return items;
  return items.map((item) => {
    if (hasPublishedTextTranslation(item.label, language)) {
      return { ...item, label: localizePublishedText(item.label, language) };
    }
    const key = QUICK_LINK_LABEL_KEYS[item.label.trim()];
    return key ? { ...item, label: t(key) } : item;
  });
}

export function useLocalizedHomeHeroSettings(hero: HomeHeroSetting): HomeHeroSetting {
  const { t, i18n } = useTranslation();
  const { enabled: siteEditEnabled } = useSiteEdit();

  return useMemo(() => {
    if (siteEditEnabled || publishedLanguage(i18n.language) === "es") return hero;
    const text = (source: string, fallback: string, key: string) =>
      localizeHomeText(source, fallback, `home.hero.institutional.${key}`, t, i18n.language);
    return {
      ...hero,
      badge: text(hero.badge, heroInstitucional.badge, "badge"),
      title: text(hero.title, heroInstitucional.title, "title"),
      titleHighlight: text(hero.titleHighlight, heroInstitucional.titleHighlight, "titleHighlight"),
      description: text(hero.description, heroInstitucional.description, "description"),
      primaryCta: {
        ...hero.primaryCta,
        label: text(hero.primaryCta.label, heroInstitucional.primaryCta.label, "primaryCta"),
      },
      secondaryCta: {
        ...hero.secondaryCta,
        label: text(hero.secondaryCta.label, heroInstitucional.secondaryCta.label, "secondaryCta"),
      },
    };
  }, [hero, t, i18n.language, siteEditEnabled]);
}

export function useLocalizedHeroInstitucional() {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    if (i18n.language === "es") return heroInstitucional;
    return {
      ...heroInstitucional,
      badge: t("home.hero.institutional.badge"),
      title: t("home.hero.institutional.title"),
      titleHighlight: t("home.hero.institutional.titleHighlight"),
      description: t("home.hero.institutional.description"),
      primaryCta: {
        label: t("home.hero.institutional.primaryCta"),
        href: heroInstitucional.primaryCta.href,
      },
      secondaryCta: {
        label: t("home.hero.institutional.secondaryCta"),
        href: heroInstitucional.secondaryCta.href,
      },
    };
  }, [t, i18n.language]);
}

export function useLocalizedQuickLinks() {
  const { t, i18n } = useTranslation();

  return useMemo(
    () => localizeQuickLinkItems(staticQuickLinks, t, i18n.language),
    [t, i18n.language]
  );
}

export function localizeFeaturedCarouselItems(
  items: FeaturedCarouselItem[],
  t: TFunction,
  language: string
): FeaturedCarouselItem[] {
  return items.map((item) => {
    const ctaPrimaryLabel = localizeCarouselCta(item.ctaPrimaryLabel, t, language);

    if (language === "es") {
      return ctaPrimaryLabel !== item.ctaPrimaryLabel
        ? { ...item, ctaPrimaryLabel, categoryLabel: undefined }
        : { ...item, categoryLabel: undefined };
    }

    const itemKey = CAROUSEL_ITEM_I18N[item.id];
    const defaults = staticCarouselItems.find((entry) => entry.id === item.id) as FeaturedCarouselItem | undefined;
    const key = (field: string) => itemKey ? `home.carousel.${itemKey}.${field}` : undefined;
    return {
      ...item,
      categoryLabel: undefined,
      title: localizeHomeText(item.title, defaults?.title, key("title"), t, language),
      date: hasPublishedTextTranslation(item.date, language)
        ? localizePublishedText(item.date, language)
        : formatCarouselDisplayDate(item.date, language),
      location: item.location === undefined ? undefined
        : localizeHomeText(item.location, defaults?.location, key("location"), t, language),
      ctaPrimaryLabel,
      ctaSecondary: item.ctaSecondary ? {
        ...item.ctaSecondary,
        label: localizePublishedText(item.ctaSecondary.label, language),
      } : undefined,
    };
  });
}

export function useLocalizedCifrasCards(year: number): CifraCardConfig[] | undefined {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const cards = cifrasCardsConfig[year];
    if (!cards) return undefined;
    if (i18n.language === "es") return cards;
    const yearKey = String(year) as "2025" | "2026";
    return cards.map((card) => {
      const cardT = t(`home.cifras.cards.${yearKey}.${card.key}`, { returnObjects: true }) as {
        title: string;
        subtitle: string;
        sourceLabel: string;
      };
      return {
        ...card,
        title: cardT.title ?? card.title,
        subtitle: cardT.subtitle ?? card.subtitle,
        sourceLabel: cardT.sourceLabel ?? card.sourceLabel,
      };
    });
  }, [t, i18n.language, year]);
}
