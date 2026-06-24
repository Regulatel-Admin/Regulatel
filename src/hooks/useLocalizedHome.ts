import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  heroInstitucional,
  quickLinks as staticQuickLinks,
  cifrasCardsConfig,
  type CifraCardConfig,
} from "@/data/home";

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

  return useMemo(() => {
    if (i18n.language === "es") return staticQuickLinks;
    return staticQuickLinks.map((item) => {
      const keyMap: Record<string, string> = {
        Miembros: "home.quickLinks.items.members",
        "Buenas Prácticas Regulatorias": "home.quickLinks.items.bestPractices",
        "Banco de Información de Telecomunicación": "home.quickLinks.items.informationBank",
        Documentos: "home.quickLinks.items.documents",
      };
      const key = keyMap[item.label];
      return key ? { ...item, label: t(key) } : item;
    });
  }, [t, i18n.language]);
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
