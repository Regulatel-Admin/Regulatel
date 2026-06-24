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
import type { FeaturedCarouselItem } from "@/components/home/FeaturedCarousel";
import { formatCarouselDisplayDate } from "@/lib/carouselDate";

const CAROUSEL_ITEM_I18N: Record<string, string> = {
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
  if (language === "es") return label?.trim() || t("common.readMore");
  const normalized = normalizeToken(label ?? "");
  if (normalized === "ver cumbre") return t("home.featuredSummits.cta");
  if (normalized === "leer mas") return t("common.readMore");
  return label?.trim() || t("common.readMore");
}

function resolveCarouselItemKey(id: string): string | undefined {
  if (CAROUSEL_ITEM_I18N[id]) return CAROUSEL_ITEM_I18N[id];

  const normalized = normalizeToken(id);
  if (normalized.includes("punta-cana") || normalized.includes("punta cana")) return "puntaCana";
  if (normalized.includes("prai")) return "prai";
  if (normalized.includes("berec") && normalized.includes("eapereg")) return "berecEapereg";
  if (normalized.includes("asiet") && normalized.includes("cartagena")) return "asietCartagena";
  if (normalized.includes("berec") && normalized.includes("bolivia")) return "berecBolivia";
  return undefined;
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

    const itemKey = resolveCarouselItemKey(item.id);
    if (!itemKey) {
      return {
        ...item,
        categoryLabel: undefined,
        date: formatCarouselDisplayDate(item.date, language),
        location: item.location?.includes("Virtual a través de")
          ? t("home.carousel.prai.location", { defaultValue: item.location })
          : item.location,
        ctaPrimaryLabel,
      };
    }

    const base = `home.carousel.${itemKey}`;
    const location = t(`${base}.location`, { defaultValue: item.location ?? "" });
    return {
      ...item,
      categoryLabel: undefined,
      title: t(`${base}.title`, { defaultValue: item.title }),
      date: t(`${base}.date`, { defaultValue: formatCarouselDisplayDate(item.date, language) }),
      location: location || item.location,
      ctaPrimaryLabel: t(`${base}.cta`, { defaultValue: ctaPrimaryLabel }),
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
