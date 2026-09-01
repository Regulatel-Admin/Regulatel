import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, MapPin, Pause, Play } from "lucide-react";
import type { Event } from "@/types/event";
import { formatEventDateRange } from "@/types/event";
import RegistrationOpenHint from "@/components/events/RegistrationOpenHint";

const EVENTS_IMAGE_FALLBACK = "/images/homepage/regulatel-portada.png";

interface FeaturedEventsCarouselProps {
  events: Event[];
  autoplayIntervalMs?: number;
}

function getFeaturedEvents(events: Event[]): Event[] {
  const upcoming = events.filter((e) => e.status === "upcoming" && e.isFeatured);
  return [...upcoming].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 8);
}

function FeaturedEventSlide({
  event,
  featured,
  activeIndex,
  onGoTo,
}: {
  event: Event;
  featured: Event[];
  activeIndex: number;
  onGoTo: (index: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const dateLabel = formatEventDateRange(event.startDate, event.endDate, i18n.language);

  return (
    <div
      className="featuredEventsCard relative w-full max-w-[460px] overflow-hidden rounded-[22px] border border-white/14 shadow-[0_24px_60px_rgba(2,16,28,0.38)]"
      style={{
        background:
          "linear-gradient(165deg, rgba(11,38,57,0.82) 0%, rgba(7,22,34,0.78) 58%, rgba(7,22,34,0.70) 100%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 4%, #c5dc0b 28%, rgba(68,137,198,0.85) 72%, transparent 96%)",
        }}
        aria-hidden
      />

      <div className="px-6 pb-7 pt-7 md:px-8 md:pb-8 md:pt-8">
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-3">
            <span className="h-[2px] w-8 rounded-full bg-[#c5dc0b]" aria-hidden />
            <span className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#c5dc0b]">
              {t("homeSections.upcomingBadge")}
            </span>
          </span>
          {hasRegistrationUrl ? <RegistrationOpenHint variant="dark" /> : null}
        </div>

        <h2
          className="line-clamp-3 text-[1.28rem] font-bold leading-[1.2] tracking-[-0.03em] text-white md:text-[1.42rem]"
          style={{ fontFamily: "var(--token-font-heading)" }}
        >
          {event.title}
        </h2>

        {event.organizer ? (
          <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/42">
            {event.organizer}
          </p>
        ) : null}

        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem] font-medium text-white/62">
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#c5dc0b]" aria-hidden />
              {event.location}
            </span>
          ) : null}
          {event.location && dateLabel ? (
            <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
          ) : null}
          {dateLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-white/45" aria-hidden />
              {dateLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Link
            to={`/eventos/${event.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--regu-navy)] transition hover:bg-[#c5dc0b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2639]"
          >
            {t("pages.noticias.readMore")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          {hasRegistrationUrl ? (
            <a
              href={event.registrationUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/8 px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2639]"
            >
              {t("pages.eventos.register")}
            </a>
          ) : null}
        </div>

        {featured.length > 1 && (
          <div className="mt-5 flex items-center gap-1.5" aria-label={t("homeSections.eventSlides")}>
            {featured.slice(0, 8).map((ev, i) => (
              <button
                key={ev.id}
                type="button"
                aria-label={t("homeSections.eventNumber", { n: i + 1 })}
                aria-current={i === activeIndex ? "true" : undefined}
                className="h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2639]"
                style={{
                  width: i === activeIndex ? "22px" : "6px",
                  backgroundColor: i === activeIndex ? "#c5dc0b" : "rgba(255,255,255,0.28)",
                }}
                onClick={() => onGoTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeaturedEventsCarousel({
  events,
  autoplayIntervalMs = 7000,
}: FeaturedEventsCarouselProps) {
  const { t } = useTranslation();
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
    const timer = setInterval(() => goTo(activeIndex + 1), autoplayIntervalMs);
    return () => clearInterval(timer);
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

  return (
    <section
      className="featuredEvents relative w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={t("homeSections.featuredEvents")}
    >
      {/* Fondos recortados aparte: la tarjeta no se recorta con la franja */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {featured.map((ev, i) => (
          <div
            key={ev.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(22,61,89,0.65) 0%, rgba(22,61,89,0.32) 55%, rgba(0,0,0,0.06) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-24 md:h-28"
          style={{
            background:
              "linear-gradient(to bottom, var(--regu-navy-deep) 0%, rgba(5,19,41,0.72) 38%, transparent 100%)",
          }}
        />
      </div>

      {/* Todas las tarjetas en la misma celda: la altura es la de la más alta (PP-26) */}
      <div
        className="relative z-10 mx-auto grid w-full max-w-[1280px] px-4 py-14 md:px-6 md:py-16 lg:px-10 lg:py-20"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        {featured.map((ev, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={ev.id}
              className="col-start-1 row-start-1 flex items-center"
              style={{
                visibility: isActive ? "visible" : "hidden",
              }}
              aria-hidden={!isActive}
              inert={!isActive ? true : undefined}
            >
              <FeaturedEventSlide
                event={ev}
                featured={featured}
                activeIndex={activeIndex}
                onGoTo={setActiveIndex}
              />
            </div>
          );
        })}
      </div>

      {featured.length > 1 && (
        <div
          className="absolute bottom-5 right-5 z-20 flex items-center gap-0.5 rounded-xl border border-white/20 bg-black/25 px-1 py-1 backdrop-blur-sm"
          aria-label={t("homeSections.carouselControls")}
        >
          <button
            type="button"
            aria-label={t("homeSections.previousEvent")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={isPaused ? t("homeSections.resumeSlideshow") : t("homeSections.pauseSlideshow")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-label={t("homeSections.nextEvent")}
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
