import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Event } from "@/types/event";
import { formatEventDateRange } from "@/types/event";

const EVENTS_IMAGE_FALLBACK = "/images/homepage/regulatel-portada.png";

interface FeaturedEventsCarouselProps {
  events: Event[];
  autoplayIntervalMs?: number;
}

function getFeaturedEvents(events: Event[]): Event[] {
  const upcoming = events.filter((e) => e.status === "upcoming" && e.isFeatured);
  return [...upcoming].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 8);
}

export default function FeaturedEventsCarousel({
  events,
  autoplayIntervalMs = 7000,
}: FeaturedEventsCarouselProps) {
  const featured = getFeaturedEvents(events);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      let next = index;
      if (next < 0) next = featured.length - 1;
      if (next >= featured.length) next = 0;
      setActiveIndex(next);
    },
    [featured.length]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (featured.length <= 1 || isPaused || isHovering) return;
    const t = setInterval(() => goTo(activeIndex + 1), autoplayIntervalMs);
    return () => clearInterval(t);
  }, [activeIndex, isPaused, isHovering, featured.length, autoplayIntervalMs, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === " ") { e.preventDefault(); setIsPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (!featured.length) return null;

  const event = featured[activeIndex];
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const dateLabel = formatEventDateRange(event.startDate, event.endDate);

  return (
    <section
      className="featuredEvents relative w-full overflow-hidden"
      style={{ minHeight: "300px", height: "clamp(300px, 40vh, 480px)" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Eventos destacados"
    >
      {/* Crossfade entre slides */}
      {featured.map((ev, i) => (
        <div
          key={ev.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: i === activeIndex ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${ev.imageUrl || EVENTS_IMAGE_FALLBACK})`,
              filter: "brightness(0.75) saturate(0.85)",
            }}
          />
        </div>
      ))}

      {/* Overlay navy institucional */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(105deg, rgba(22,61,89,0.65) 0%, rgba(22,61,89,0.32) 55%, rgba(0,0,0,0.06) 100%)",
        }}
        aria-hidden
      />

      {/* Layout */}
      <div
        className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-center px-4 md:px-6 lg:px-10"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        {/* Tarjeta institucional */}
        <div
          className="featuredEventsCard relative flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)]"
          style={{
            width: "min(100%, 460px)",
            borderLeft: "4px solid var(--regu-blue)",
          }}
        >
          {/* Línea de gradiente superior */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, var(--regu-blue), var(--regu-teal))" }}
            aria-hidden
          />

          <div className="p-6 md:p-7">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
              >
                Próximo
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--regu-gray-500)" }}
              >
                {event.location}
              </span>
              <span style={{ color: "var(--regu-gray-300)", fontSize: "10px" }}>·</span>
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--regu-gray-500)" }}
              >
                {dateLabel}
              </span>
            </div>

            {/* Título */}
            <h2
              className="mt-3 line-clamp-3 font-bold leading-snug"
              style={{
                fontFamily: "var(--token-font-heading)",
                fontSize: "clamp(1.05rem, 1.7vw, 1.35rem)",
                color: "var(--regu-gray-900)",
              }}
            >
              {event.title}
            </h2>

            {/* Organizador */}
            <p className="mt-1.5 text-xs" style={{ color: "var(--regu-gray-500)" }}>
              {event.organizer}
            </p>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                to={`/eventos/${event.id}`}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                Leer más
              </Link>
              {hasRegistrationUrl ? (
                <a
                  href={event.registrationUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition hover:bg-[var(--regu-navy)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-navy)] focus-visible:ring-offset-2"
                  style={{ borderColor: "var(--regu-navy)", color: "var(--regu-navy)" }}
                >
                  Registrarse
                </a>
              ) : (
                <span className="text-xs font-medium text-[var(--regu-gray-500)]">Por definir</span>
              )}
            </div>

            {/* Dots */}
            {featured.length > 1 && (
              <div className="mt-5 flex items-center gap-1.5" aria-label="Slides de eventos">
                {featured.slice(0, 8).map((ev, i) => (
                  <button
                    key={ev.id}
                    type="button"
                    aria-label={`Evento ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                    className="h-1 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                    style={{
                      width: i === activeIndex ? "24px" : "6px",
                      backgroundColor: i === activeIndex ? "var(--regu-blue)" : "rgba(22,61,89,0.18)",
                    }}
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles — pill translúcido */}
      {featured.length > 1 && (
        <div
          className="absolute bottom-5 right-5 z-20 flex items-center gap-0.5 rounded-xl border border-white/20 bg-black/25 px-1 py-1 backdrop-blur-sm"
          aria-label="Controles del carrusel"
        >
          <button
            type="button"
            aria-label="Evento anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={isPaused ? "Reanudar slideshow" : "Pausar slideshow"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-label="Evento siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={next}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
