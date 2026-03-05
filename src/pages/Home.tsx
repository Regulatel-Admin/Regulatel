import QuickLinksBar from "@/components/home/QuickLinksBar";
import EventsSection from "@/components/home/EventsSection";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import FeaturedEventsCarousel from "@/components/home/FeaturedEventsCarousel";
import HomeHeroPro from "@/components/home/HomeHeroPro";
import NewsSectionBerec from "@/components/home/NewsSectionBerec";
import RegulatelEnCifras from "@/components/home/RegulatelEnCifras";
import {
  useMergedEvents,
  useMergedNews,
} from "@/contexts/AdminDataContext";
import {
  featuredCarouselItems,
  heroClean,
  heroValueBullets,
  quickLinks,
} from "@/data/home";

export default function Home() {
  const homeNews = useMergedNews();
  const homeEvents = useMergedEvents();

  return (
    <>
      {/* Hero limpio: solo fondo + overlay + mensaje + 2 CTAs (sin cards) */}
      <HomeHeroPro
        coverImageUrl="/images/homepage/regulatel-portada.png"
        logoUrl="/images/regulatel-logo.png"
        eyebrow={heroClean.eyebrow}
        title={heroClean.title}
        subtitle={heroClean.subtitle}
        bullets={heroValueBullets}
        primaryCta={heroClean.primaryCta}
        secondaryCta={heroClean.secondaryCta}
      />

      {/* Accesos principales: barra de tiles estilo INDOTEL (4 tiles pegados, primer tile flecha) */}
      <QuickLinksBar items={quickLinks} seeMoreHref="/recursos" />

      <RegulatelEnCifras />

      <FeaturedCarousel items={featuredCarouselItems} />

      <section className="bg-white">
        <NewsSectionBerec news={homeNews} />
      </section>
      {/* Eventos: carrusel destacados (BEREC) + grid "Todos los eventos" */}
      <section className="bg-gradient-to-b from-white to-slate-100">
        <FeaturedEventsCarousel events={homeEvents} autoplayIntervalMs={7000} />
        <EventsSection events={homeEvents} />
      </section>
    </>
  );
}
