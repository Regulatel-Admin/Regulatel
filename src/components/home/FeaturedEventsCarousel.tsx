import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { hasEventPassed, type HomeEventItem } from "@/data/events";

const EVENTS_IMAGE_FALLBACK = "/images/homepage/regulatel-portada.png";
const OVERLAY_GRADIENT =
  "linear-gradient(90deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 60%, rgba(0,0,0,.05) 100%)";

interface FeaturedEventsCarouselProps {
  events: HomeEventItem[];
  autoplayIntervalMs?: number;
}

/**
 * Solo eventos que no han pasado (próximos). Orden por año ascendente. Máximo 8 slides.
 */
function getFeaturedEvents(events: HomeEventItem[]): HomeEventItem[] {
  const upcoming = events.filter((e) => e.status === "proxima");
  return [...upcoming].sort((a, b) => a.year - b.year).slice(0, 8);
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
  const isProxima = event.status === "proxima";
  const eventPassed = hasEventPassed(event);
  const displayAsProxima = isProxima && !eventPassed;
  const showRegistrarse = displayAsProxima;
  const registerUrl = event.registrationUrl || "/eventos";
  const dateLabel = event.dateLabel
    ? `${event.city}, ${event.dateLabel}`
    : `${event.city}, ${event.year}`;

  return (
    <section
      className="featuredEvents relative w-full overflow-hidden min-h-[260px] md:min-h-[300px] lg:min-h-[360px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Eventos destacados"
    >
      {/* Background del slide activo */}
      <div
        className="slide absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="slideOverlay absolute inset-0 pointer-events-none"
        style={{ background: OVERLAY_GRADIENT }}
      />

      <div
        className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-[1280px] flex-col justify-end px-4 pb-6 pt-10 md:min-h-[300px] md:px-6 md:pb-8 md:pt-12 lg:min-h-[360px] lg:justify-center lg:pb-10 lg:pt-16"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        {/* Card blanca flotante — alineada a la izquierda, max-width 560px */}
        <div
          className="floatingCard mx-auto w-[90vw] max-w-[560px] flex-shrink-0 rounded-[16px] border border-black/[0.06] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,.12)] md:ml-[8%] md:mr-auto md:p-7"
          style={{ minWidth: "min(560px, 90vw)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-flex-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {/* Meta: fecha a la izquierda, etiqueta PRÓXIMO / PASADO / EVENTOS a la derecha */}
              <div className="eventMeta flex flex-wrap items-center justify-between gap-2">
                <span
                  className="text-xs font-medium uppercase tracking-[0.12em]"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {dateLabel}
                </span>
                <span
                  className={
                    eventPassed
                      ? "text-[10px] font-medium uppercase tracking-wider opacity-80"
                      : "text-xs font-semibold uppercase tracking-[0.12em]"
                  }
                  style={{
                    color: eventPassed ? "var(--regu-gray-500)" : "var(--news-accent)",
                  }}
                >
                  {displayAsProxima ? "PRÓXIMO" : eventPassed ? "Pasado" : "EVENTOS"}
                </span>
              </div>
              {/* Título (2 líneas máx) */}
              <h2
                className="eventTitle mt-2 line-clamp-2 text-xl font-bold leading-tight md:text-2xl lg:text-[1.75rem]"
                style={{ color: "var(--regu-gray-900)" }}
              >
                {event.title}
              </h2>
              {/* Lugar y fecha en texto pequeño */}
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--regu-gray-500)" }}
              >
                {event.dateLabel ? `${event.city} · ${event.dateLabel}` : `${event.city}, ${event.year}`}
              </p>
              {/* CTAs: VER EVENTO (outline) + REGISTRARSE (filled) solo si upcoming y registrationUrl */}
              <div className="ctaRow mt-4 flex flex-wrap items-center gap-3">
                {event.href.startsWith("http") ? (
                  <a
                    href={event.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-lg border-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
                    style={{
                      borderColor: "var(--news-accent)",
                      color: "var(--news-accent)",
                    }}
                  >
                    Ver evento
                  </a>
                ) : (
                  <Link
                    to={event.href}
                    className="inline-flex items-center justify-center rounded-lg border-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
                    style={{
                      borderColor: "var(--news-accent)",
                      color: "var(--news-accent)",
                    }}
                  >
                    Ver evento
                  </Link>
                )}
                {showRegistrarse &&
                  (registerUrl.startsWith("http") ? (
                    <a
                      href={registerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                      style={{ backgroundColor: "var(--news-accent)" }}
                    >
                      Registrarse
                    </a>
                  ) : (
                    <Link
                      to={registerUrl}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                      style={{ backgroundColor: "var(--news-accent)" }}
                    >
                      Registrarse
                    </Link>
                  ))}
              </div>
            </div>
            {/* Indicadores del carrusel (dashes/dots) — activo magenta */}
            <div
              className="dots flex items-center gap-2 sm:shrink-0"
              aria-label="Slides"
            >
              {featured.slice(0, 8).map((ev, i) => (
                <button
                  key={`${ev.title}-${ev.year}-${i}`}
                  type="button"
                  aria-label={`Ir al evento ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className={`h-1.5 w-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2 ${i === activeIndex ? "dotActive" : ""}`}
                  style={{
                    backgroundColor:
                      i === activeIndex
                        ? "var(--news-accent)"
                        : "var(--regu-gray-100)",
                  }}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controles: prev / play-pause / next — bottom-right, círculos blancos */}
        <div
          className="navArrow absolute bottom-4 right-4 flex items-center gap-2 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8"
          aria-label="Controles del carrusel"
        >
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
            {isPaused ? (
              <Play className="h-5 w-5" />
            ) : (
              <Pause className="h-5 w-5" />
            )}
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
