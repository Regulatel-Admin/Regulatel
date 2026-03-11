import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Event } from "@/types/event";
import { formatEventDateRange } from "@/types/event";

const EVENTS_IMAGE_FALLBACK = "/images/homepage/regulatel-portada.png";
const OVERLAY_GRADIENT =
  "linear-gradient(90deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 60%, rgba(0,0,0,.05) 100%)";

interface FeaturedEventsCarouselProps {
  events: Event[];
  autoplayIntervalMs?: number;
}

/** Eventos destacados: isFeatured && upcoming, orden por startDate, máx 8. */
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
      setActiveIndex(() => {
        let next = index;
        if (next < 0) next = featured.length - 1;
        if (next >= featured.length) next = 0;
        return next;
      });
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
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (!featured.length) return null;

  const event = featured[activeIndex];
  const imageUrl = event.imageUrl || EVENTS_IMAGE_FALLBACK;
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const dateLabel = `${event.location}, ${formatEventDateRange(event.startDate, event.endDate)}`;

  return (
    <section
      className="featuredEvents relative w-full overflow-hidden min-h-[260px] md:min-h-[300px] lg:min-h-[360px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Eventos destacados"
    >
      <div
        className="slide absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="slideOverlay absolute inset-0 pointer-events-none" style={{ background: OVERLAY_GRADIENT }} />

      <div
        className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-[1280px] flex-col justify-end px-4 pb-6 pt-10 md:min-h-[300px] md:px-6 md:pb-8 md:pt-12 lg:min-h-[360px] lg:justify-center lg:pb-10 lg:pt-16"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        <div
          className="floatingCard mx-auto w-[90vw] max-w-[620px] flex-shrink-0 rounded-[16px] border border-black/[0.06] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,.12)] md:ml-[8%] md:mr-auto md:p-7"
          style={{ minWidth: "min(620px, 90vw)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-flex-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="eventMeta flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>
                  {dateLabel}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--news-accent)" }}>
                  PRÓXIMO
                </span>
              </div>
              <h2
                className="eventTitle mt-2 line-clamp-3 text-xl font-bold leading-tight md:text-2xl lg:text-[1.75rem]"
                style={{ color: "var(--regu-gray-900)" }}
                title={event.title}
              >
                {event.title}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {event.organizer} · {formatEventDateRange(event.startDate, event.endDate)}
              </p>
              <div className="ctaRow mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to={`/eventos/${event.id}`}
                  className="inline-flex items-center justify-center rounded-lg border-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
                  style={{
                    borderColor: "var(--news-accent)",
                    color: "var(--news-accent)",
                  }}
                >
                  Leer más
                </Link>
                {hasRegistrationUrl ? (
                  <a
                    href={event.registrationUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                    aria-label={`Registrarse a ${event.title}`}
                  >
                    Registrarse
                  </a>
                ) : (
                  <span className="text-xs font-medium uppercase text-[var(--regu-gray-500)]">Por definir</span>
                )}
              </div>
            </div>
            <div className="dots flex items-center gap-2 sm:shrink-0" aria-label="Slides">
              {featured.slice(0, 8).map((ev, i) => (
                <button
                  key={ev.id}
                  type="button"
                  aria-label={`Ir al evento ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className="h-1.5 w-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: i === activeIndex ? "var(--news-accent)" : "var(--regu-gray-100)",
                  }}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="navArrow absolute bottom-4 right-4 flex items-center gap-2 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8" aria-label="Controles del carrusel">
          <button
            type="button"
            aria-label="Evento anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--regu-gray-900)] shadow-md transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
            onClick={prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={isPaused ? "Reanudar" : "Pausar"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--regu-gray-900)] shadow-md transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button
            type="button"
            aria-label="Siguiente evento"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--regu-gray-900)] shadow-md transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
            onClick={next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
