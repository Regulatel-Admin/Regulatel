import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  heroInstitucional,
  quickLinks as staticQuickLinks,
  cifrasCardsConfig,
  type CifraCardConfig,
} from "@/data/home";
import type { HomeHeroSetting } from "@/types/siteSettings";
import type { QuickLinkItem } from "@/components/home/QuickLinksBar";

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
  if (language === "es") return items;
  return items.map((item) => {
    const key = QUICK_LINK_LABEL_KEYS[item.label.trim()];
    return key ? { ...item, label: t(key) } : item;
  });
}

export function useLocalizedHomeHeroSettings(hero: HomeHeroSetting): HomeHeroSetting {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    if (i18n.language === "es") return hero;
    return {
      ...hero,
      badge: t("home.hero.institutional.badge"),
      title: t("home.hero.institutional.title"),
      titleHighlight: t("home.hero.institutional.titleHighlight"),
      description: t("home.hero.institutional.description"),
      primaryCta: {
        ...hero.primaryCta,
        label: t("home.hero.institutional.primaryCta"),
      },
      secondaryCta: {
        ...hero.secondaryCta,
        label: t("home.hero.institutional.secondaryCta"),
      },
    };
  }, [hero, t, i18n.language]);
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
