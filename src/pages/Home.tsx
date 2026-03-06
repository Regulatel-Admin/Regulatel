/**
 * Portal REGULATEL – Página principal (home).
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
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
import {
  featuredCarouselItems,
  heroInstitucional,
  quickLinks,
} from "@/data/home";

export default function Home() {
  const homeNews = useMergedNews();
  const allEvents = useEvents();
  const homeEvents = useMemo(() => allEvents.filter((e) => e.year === 2026), [allEvents]);

  return (
    <>
      {/* Hero institucional/editorial: imagen de cooperación + badge + título + 2 CTAs (mapa disponible en /images/mapa-mundi-nuevo-home.png para otras secciones) */}
      <HomeHeroInstitucional
        coverImageUrl={heroInstitucional.coverImageUrl}
        badge={heroInstitucional.badge}
        title={heroInstitucional.title}
        titleHighlight={heroInstitucional.titleHighlight}
        description={heroInstitucional.description}
        primaryCta={heroInstitucional.primaryCta}
        secondaryCta={heroInstitucional.secondaryCta}
      />

      {/* Accesos principales: barra de tiles estilo INDOTEL (4 tiles pegados, primer tile flecha) */}
      <QuickLinksBar items={quickLinks} seeMoreHref="/recursos" />

      <RegulatelEnCifras />

      {/* Encabezado de sección: Cumbres destacadas (carousel de arriba) */}
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
      <FeaturedCarousel items={featuredCarouselItems} />

      <LiveIndicatorsSection />

      <section className="bg-white">
        <NewsSectionBerec news={homeNews} />
      </section>
      {/* Eventos: carrusel destacados (BEREC) + grid "Todos los eventos" */}
      <section className="bg-gradient-to-b from-white to-slate-100">
        <FeaturedEventsCarousel events={homeEvents} autoplayIntervalMs={7000} />
        <EventsSection events={homeEvents} variant="home" maxEvents={4} />
      </section>
    </>
  );
}
