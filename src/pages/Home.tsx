/**
 * Portal REGULATEL – Página principal (home).
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 * Hero, accesos y cumbres pueden venir de /api/settings (CMS) o de datos estáticos.
 */
import { useMemo } from "react";
import QuickLinksBar from "@/components/home/QuickLinksBar";
import EventsSection from "@/components/home/EventsSection";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import LiveIndicatorsSection from "@/components/home/LiveIndicatorsSection";
import FeaturedEventsCarousel from "@/components/home/FeaturedEventsCarousel";
import HomeHeroInstitucional from "@/components/home/HomeHeroInstitucional";
import NewsSectionBerec from "@/components/home/NewsSectionBerec";
import RegulatelEnCifras from "@/components/home/RegulatelEnCifras";
import {
  useEvents,
  useMergedNews,
} from "@/contexts/AdminDataContext";
import { useHomeHero, useHomeQuickLinks, useFeaturedCarouselSettings } from "@/contexts/SiteSettingsContext";
import { quickLinkItemsFromSetting } from "@/lib/quickLinks";
import { quickLinks as staticQuickLinks, featuredCarouselItems as fallbackCarouselItems } from "@/data/home";
import type { FeaturedCarouselItem } from "@/components/home/FeaturedCarousel";

export default function Home() {
  const homeNews = useMergedNews();
  const allEvents = useEvents();
  const homeEvents = useMemo(() => allEvents.filter((e) => e.year === 2026), [allEvents]);

  const hero = useHomeHero();
  const quickLinksSetting = useHomeQuickLinks();
  const carouselSettings = useFeaturedCarouselSettings();

  const quickLinkItems = useMemo(() => {
    if (quickLinksSetting.length === 0) return staticQuickLinks;
    return quickLinkItemsFromSetting(quickLinksSetting);
  }, [quickLinksSetting]);

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
      })),
    [carouselSettings]
  );

  const carouselItems = featuredItems.length > 0 ? featuredItems : (fallbackCarouselItems as FeaturedCarouselItem[]);

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

      <QuickLinksBar items={quickLinkItems} seeMoreHref="/recursos" />

      <RegulatelEnCifras />

      <div className="mx-auto max-w-[1280px] px-4 pt-10 pb-2 md:px-6 md:pt-12 md:pb-3 lg:pt-14 lg:pb-4" style={{ background: "var(--regu-offwhite)" }}>
        <h2
          className="text-xl font-bold uppercase tracking-wide md:text-2xl"
          style={{ color: "var(--regu-gray-900)", fontFamily: "var(--token-font-heading)" }}
        >
          CUMBRES DESTACADAS
        </h2>
        <p
          className="mt-1 text-sm md:mt-1.5 md:text-base"
          style={{ color: "var(--regu-gray-700)", fontFamily: "var(--token-font-body)" }}
        >
          Próximas y recientes cumbres de REGULATEL y organismos aliados.
        </p>
      </div>
      <FeaturedCarousel items={carouselItems} />

      <LiveIndicatorsSection />

      <section className="bg-white">
        <NewsSectionBerec news={homeNews} />
        </section>
      {/* Eventos: carrusel destacados + grid "Próximos eventos" */}
      <section style={{ backgroundColor: "var(--regu-offwhite)", borderTop: "1px solid rgba(22,61,89,0.07)" }}>
        <FeaturedEventsCarousel events={homeEvents} autoplayIntervalMs={7000} />
        <EventsSection events={homeEvents} variant="home" maxEvents={4} />
        </section>
    </>
  );
}
