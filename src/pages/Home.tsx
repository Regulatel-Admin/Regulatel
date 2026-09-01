/**
 * Portal REGULATEL – Página principal (home).
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 * Hero, accesos y cumbres pueden venir de /api/settings (CMS) o de datos estáticos.
 */
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import QuickLinksBar from "@/components/home/QuickLinksBar";
import EventsSection from "@/components/home/EventsSection";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import LiveIndicatorsSection from "@/components/home/LiveIndicatorsSection";
import FeaturedEventsCarousel from "@/components/home/FeaturedEventsCarousel";
import HomeHeroInstitucional from "@/components/home/HomeHeroInstitucional";
import NewsSectionBerec from "@/components/home/NewsSectionBerec";
import RegulatelEnCifras from "@/components/home/RegulatelEnCifras";
import HablaElReguladorHome from "@/components/home/HablaElReguladorHome";
import {
  useEvents,
  useMergedNews,
} from "@/contexts/AdminDataContext";
import { useHomeHero, useHomeQuickLinks, useFeaturedCarouselSettings, useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { quickLinkItemsFromSetting } from "@/lib/quickLinks";
import { quickLinks as staticQuickLinks, featuredCarouselItems as fallbackCarouselItems } from "@/data/home";
import type { FeaturedCarouselItem } from "@/components/home/FeaturedCarousel";
import { localizeFeaturedCarouselItems, localizeQuickLinkItems, useLocalizedHomeHeroSettings } from "@/hooks/useLocalizedHome";
import { useLocalizedNewsList } from "@/hooks/useLocalizedNews";
import { useLocalizedEvents } from "@/hooks/useLocalizedEvents";
import { normalizeEvent } from "@/types/event";

export default function Home() {
  const { t, i18n } = useTranslation();
  const { refetch: refetchSettings } = useSiteSettings();
  useEffect(() => {
    void refetchSettings();
  }, [refetchSettings]);

  const homeNewsRaw = useMergedNews();
  const homeNews = useLocalizedNewsList(homeNewsRaw);
  const allEventsRaw = useEvents();
  const { enabled: siteEditEnabled, preview } = useSiteEdit();
  const eventsWithPreview = useMemo(() => {
    const patch = siteEditEnabled ? preview.evento : undefined;
    if (!patch) return allEventsRaw;
    const idx = allEventsRaw.findIndex((e) => e.id === patch.id);
    if (idx >= 0) {
      const next = allEventsRaw.slice();
      next[idx] = normalizeEvent({ ...allEventsRaw[idx], ...patch });
      return next;
    }
    return [normalizeEvent(patch), ...allEventsRaw];
  }, [allEventsRaw, siteEditEnabled, preview.evento]);
  const allEvents = useLocalizedEvents(eventsWithPreview);

  const rawHero = useHomeHero();
  const localizedHero = useLocalizedHomeHeroSettings(rawHero);
  const hero = siteEditEnabled && preview.homeHero ? rawHero : localizedHero;
  const quickLinksSetting = useHomeQuickLinks();
  const carouselSettings = useFeaturedCarouselSettings();

  const quickLinkItems = useMemo(() => {
    const items =
      quickLinksSetting.length === 0
        ? staticQuickLinks
        : quickLinkItemsFromSetting(quickLinksSetting);
    return localizeQuickLinkItems(items, t, i18n.language);
  }, [quickLinksSetting, t, i18n.language]);

  const featuredItems = useMemo<FeaturedCarouselItem[]>(() =>
    carouselSettings
      .filter((i) => i.active !== false)
      .map((s) => ({
        id: s.id,
        type: (s.type ?? "eventos") as "eventos" | "noticias",
        date: s.date,
        title: s.title,
        imageUrl: s.imageUrl,
        href: s.href,
        ctaPrimaryLabel: s.ctaPrimaryLabel,
        location: s.location,
        imagePosition: s.imagePosition,
        imageFit: s.imageFit,
      })),
    [carouselSettings]
  );

  const carouselItems = useMemo(() => {
    const raw = featuredItems.length > 0 ? featuredItems : (fallbackCarouselItems as FeaturedCarouselItem[]);
    return localizeFeaturedCarouselItems(raw, t, i18n.language);
  }, [featuredItems, t, i18n.language]);

  return (
    <>
      <HomeHeroInstitucional
        coverImageUrls={hero.coverImageUrls}
        badge={hero.badge}
        title={hero.title}
        titleHighlight={hero.titleHighlight}
        description={hero.description}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
      />

      <QuickLinksBar items={quickLinkItems} seeMoreHref="/recursos" title={t("home.quickLinks.title")} />

      <RegulatelEnCifras />

      <div className="mx-auto max-w-[1280px] px-4 pt-10 pb-2 md:px-6 md:pt-12 md:pb-3 lg:pt-14 lg:pb-4" style={{ background: "var(--regu-offwhite)" }}>
        <h2
          className="text-xl font-bold uppercase tracking-wide md:text-2xl"
          style={{ color: "var(--regu-gray-900)", fontFamily: "var(--token-font-heading)" }}
        >
          {t("home.featuredSummits.title")}
        </h2>
        <p
          className="mt-1 text-sm md:mt-1.5 md:text-base"
          style={{ color: "var(--regu-gray-700)", fontFamily: "var(--token-font-body)" }}
        >
          {t("home.featuredSummits.subtitle")}
        </p>
      </div>
      <FeaturedCarousel items={carouselItems} />

      <LiveIndicatorsSection />

      <section className="bg-white">
        <NewsSectionBerec news={homeNews} />
      </section>

      <HablaElReguladorHome />

      <FeaturedEventsCarousel events={allEvents} autoplayIntervalMs={7000} />
      <section style={{ backgroundColor: "var(--regu-offwhite)" }}>
        <EventsSection events={allEvents} variant="home" maxEvents={4} />
      </section>
    </>
  );
}
