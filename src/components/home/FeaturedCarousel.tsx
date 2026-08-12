import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Play, Pause, MapPin, Expand, X } from "lucide-react";
import { formatCarouselDisplayDate, isCarouselDatePast } from "@/lib/carouselDate";
import { localizeCarouselCta } from "@/hooks/useLocalizedHome";
import { EditableSpot } from "@/components/site-edit/EditableSpot";
import { useSiteEdit } from "@/contexts/SiteEditContext";

export interface FeaturedCarouselItem {
  id: string;
  type: "eventos" | "noticias";
  date: string;
  title: string;
  imageUrl: string;
  href: string;
  ctaPrimaryLabel?: string;
  ctaSecondary?: { label: string; href: string };
  categoryLabel?: string;
  /** Ubicación del evento (ej. "Punta Cana, Rep. Dom."). Se muestra en la card cuando está definido. */
  location?: string;
  /** Posición del fondo (ej. "center top", "50% 25%") para mejorar el encuadre de la imagen. */
  imagePosition?: string;
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[];
  autoplayIntervalMs?: number;
}

export default function FeaturedCarousel({
  items,
  autoplayIntervalMs = 6000,
}: FeaturedCarouselProps) {
  const { t, i18n } = useTranslation();
  const { enabled: siteEditEnabled } = useSiteEdit();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      let next = index;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      setActiveIndex(next);
    },
    [items.length]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (items.length <= 1 || isPaused || isHovering || siteEditEnabled) return;
    const t = setInterval(() => goTo(activeIndex + 1), autoplayIntervalMs);
    return () => clearInterval(t);
  }, [activeIndex, isPaused, isHovering, siteEditEnabled, items.length, autoplayIntervalMs, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen && e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === " ") { e.preventDefault(); setIsPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, lightboxOpen]);

  if (!items.length) return null;

  const slide = items[activeIndex];
  const isEventPast = slide.type === "eventos" && isCarouselDatePast(slide.date);
  const defaultCategoryLabel =
    slide.type === "eventos"
      ? isEventPast
        ? t("home.carousel.labels.past")
        : t("home.carousel.labels.upcoming")
      : t("home.carousel.labels.news");
  const categoryLabel = slide.categoryLabel ?? defaultCategoryLabel;
  const showCumbreLabel = slide.type === "eventos";
  const displayDate = formatCarouselDisplayDate(slide.date, i18n.language);
  const primaryCtaLabel = localizeCarouselCta(slide.ctaPrimaryLabel, t, i18n.language);

  return (
    <section
      className="featuredCarousel relative w-full overflow-hidden"
      style={{ minHeight: "380px", height: "clamp(380px, 46vh, 560px)" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={t("home.carousel.aria.carousel")}
    >
      {/* Slides con crossfade */}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: i === activeIndex ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              backgroundPosition: item.imagePosition ?? "center",
              filter: "brightness(0.78) saturate(0.88)",
            }}
          />
        </div>
      ))}

      {/* Mismo overlay que el slideshow del home: más protección izquierda para el texto, se desvanece hacia la derecha */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(105deg, rgba(10,28,48,0.72) 0%, rgba(10,28,48,0.48) 45%, rgba(10,28,48,0.10) 75%, rgba(10,28,48,0.00) 100%)",
        }}
        aria-hidden
      />

      {/* Layout principal */}
      <div
        className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-center px-4 md:px-6 lg:px-10"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        {/* Tarjeta institucional */}
        <EditableSpot target={{ kind: "cumbre", id: slide.id }} label="Editar esta cumbre" className="flex-shrink-0">
        <div
          className="featuredCarouselCard relative flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)]"
          style={{
            width: "min(100%, 480px)",
            borderLeft: "4px solid var(--regu-blue)",
          }}
        >
          {/* Acento superior sutil */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, var(--regu-blue), var(--regu-teal))" }}
            aria-hidden
          />

          <div className="p-6 md:p-7">
            {/* Meta — badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                style={{
                  backgroundColor: "rgba(68,137,198,0.10)",
                  color: "var(--regu-blue)",
                }}
              >
                {categoryLabel}
              </span>
              {showCumbreLabel && (
                <span
                  className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{
                    backgroundColor: "rgba(22,61,89,0.07)",
                    color: "var(--regu-navy)",
                  }}
                >
                  {t("home.carousel.labels.summit")}
                </span>
              )}
              <span
                className="text-xs font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--regu-gray-500)" }}
              >
                {displayDate}
              </span>
            </div>

            {/* Título */}
            <h2
              className="mt-3 line-clamp-3 font-bold leading-snug"
              style={{
                fontFamily: "var(--token-font-heading)",
                fontSize: "clamp(1.05rem, 1.8vw, 1.375rem)",
                color: "var(--regu-gray-900)",
              }}
            >
              {slide.title}
            </h2>

            {/* Ubicación (opcional) */}
            {slide.location && (
              <p
                className="mt-2 flex items-center gap-1.5 text-xs font-medium tracking-[0.02em]"
                style={{ color: "var(--regu-gray-600)" }}
              >
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--regu-blue)" }} aria-hidden />
                <span>{slide.location}</span>
              </p>
            )}

            {/* CTA */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {slide.href.startsWith("http") ? (
                <a
                  href={slide.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {primaryCtaLabel}
                </a>
              ) : (
                <Link
                  to={slide.href}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {primaryCtaLabel}
                </Link>
              )}
              {slide.ctaSecondary && (
                <a
                  href={slide.ctaSecondary.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition hover:bg-[var(--regu-navy)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-navy)] focus-visible:ring-offset-2"
                  style={{ borderColor: "var(--regu-navy)", color: "var(--regu-navy)" }}
                >
                  {slide.ctaSecondary.label}
                </a>
              )}
            </div>

            {/* Dots de paginación — dentro de la card, fila inferior */}
            {items.length > 1 && (
              <div className="mt-5 flex items-center gap-1.5" aria-label={t("home.carousel.aria.slides")}>
                {items.slice(0, 7).map((_, i) => (
                  <button
                    key={items[i].id}
                    type="button"
                    aria-label={t("home.carousel.aria.goToSlide", { n: i + 1 })}
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
        </EditableSpot>

        {/* Botón ver imagen completa — a la derecha del card, uso institucional */}
        <div className="ml-auto hidden flex-shrink-0 md:flex items-center">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={t("home.carousel.aria.viewImage")}
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
          >
            <Expand className="h-4 w-4" aria-hidden />
            {t("home.carousel.aria.viewImage")}
          </button>
        </div>
      </div>

      {/* Lightbox: imagen de fondo completa */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("home.carousel.aria.lightbox")}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label={t("home.carousel.aria.close")}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-black/40 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={slide.imageUrl}
              alt=""
              className="max-h-[90vh] w-full object-contain rounded-lg shadow-2xl"
              style={{ filter: "none" }}
            />
          </div>
        </div>
      )}

      {/* Controles — pill sólido estilo Apple, esquina inferior derecha */}
      {items.length > 1 && (
        <div
          className="absolute bottom-5 right-5 z-20 flex items-center justify-center gap-1 rounded-full px-3 py-2.5 shadow-[0_2px_12px_rgba(68,137,198,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset]"
          style={{ backgroundColor: "var(--regu-blue)" }}
          aria-label={t("home.carousel.aria.controls")}
        >
          <button
            type="button"
            aria-label={t("home.carousel.aria.previousSlide")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-blue)]"
            onClick={prev}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label={isPaused ? t("home.carousel.aria.resumeSlideshow") : t("home.carousel.aria.pauseSlideshow")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-blue)]"
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" strokeWidth={2.25} /> : <Pause className="h-3.5 w-3.5" strokeWidth={2.25} />}
          </button>
          <button
            type="button"
            aria-label={t("home.carousel.aria.nextSlide")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-blue)]"
            onClick={next}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      )}
    </section>
  );
}
