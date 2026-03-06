import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export interface FeaturedCarouselItem {
  id: string;
  type: "eventos" | "noticias";
  date: string;
  title: string;
  imageUrl: string;
  href: string;
  ctaPrimaryLabel?: string;
  ctaSecondary?: { label: string; href: string };
  /** Si se define, reemplaza la etiqueta por defecto (EVENTOS / Pasado / NOTICIAS). Ej.: "PRÓXIMA" */
  categoryLabel?: string;
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[];
  autoplayIntervalMs?: number;
}

const OVERLAY_GRADIENT =
  "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.58) 50%, rgba(0,0,0,.42) 100%)";

const MESES: Record<string, number> = {
  ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5, JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11,
};
function isSlideDatePast(dateStr: string): boolean {
  if (!dateStr || dateStr.length < 6) return false;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length < 3) return false;
  const day = parseInt(parts[0], 10);
  const mesStr = (parts[1] || "").toUpperCase().slice(0, 3);
  const year = parseInt(parts[2], 10);
  if (Number.isNaN(day) || Number.isNaN(year) || !MESES[mesStr]) return false;
  const d = new Date(year, MESES[mesStr], day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

export default function FeaturedCarousel({
  items,
  autoplayIntervalMs = 6000,
}: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(() => {
        let next = index;
        if (next < 0) next = items.length - 1;
        if (next >= items.length) next = 0;
        return next;
      });
    },
    [items.length]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (items.length <= 1 || isPaused || isHovering) return;
    const t = setInterval(() => goTo(activeIndex + 1), autoplayIntervalMs);
    return () => clearInterval(t);
  }, [activeIndex, isPaused, isHovering, items.length, autoplayIntervalMs, goTo]);

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

  if (!items.length) return null;

  const slide = items[activeIndex];
  const isEventPast = slide.type === "eventos" && isSlideDatePast(slide.date);
  const defaultCategoryLabel = slide.type === "eventos" ? (isEventPast ? "Pasado" : "PRÓXIMA") : "NOTICIAS";
  const categoryLabel = slide.categoryLabel ?? defaultCategoryLabel;
  const showCumbreLabel = slide.type === "eventos";

  return (
    <section
      className="featuredCarousel relative w-full overflow-hidden min-h-[320px] md:min-h-[380px] lg:min-h-[460px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Carrusel destacado"
    >
      {/* Background del slide activo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${slide.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Overlay sutil para legibilidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: OVERLAY_GRADIENT }}
      />

      {/* Contenedor: card + controles */}
      <div
        className="relative z-10 mx-auto flex min-h-[320px] w-full max-w-[1280px] flex-col justify-end px-4 pb-6 pt-12 md:min-h-[380px] md:px-6 md:pb-8 md:pt-16 lg:min-h-[460px] lg:justify-center lg:pb-12 lg:pt-20"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        {/* Card blanca overlay — centrada y levemente a la izquierda en desktop */}
        <div
          className="featuredCarouselCard mx-auto w-[92vw] max-w-[560px] flex-shrink-0 rounded-[16px] border border-black/[0.06] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,.12)] md:ml-[8%] md:mr-auto md:p-7"
          style={{ minWidth: "min(560px, 92vw)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-flex-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {/* Meta: fecha · estado (PRÓXIMA/Pasado) · CUMBRE para eventos; fecha · NOTICIAS para noticias */}
              <div className="featuredCarouselMeta flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--news-accent)" }}
                >
                  {slide.date}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--regu-gray-700)" }}>
                  ·
                </span>
                <span
                  className={isEventPast ? "text-[10px] font-medium uppercase tracking-wider opacity-90" : "text-xs font-semibold uppercase tracking-[0.12em]"}
                  style={{ color: isEventPast ? "var(--regu-gray-500)" : "var(--news-accent)" }}
                >
                  {categoryLabel}
                </span>
                {showCumbreLabel && (
                  <>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--regu-gray-700)" }}>
                      ·
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--regu-blue)" }}>
                      CUMBRE
                    </span>
                  </>
                )}
              </div>
              {/* Título */}
              <h2
                className="mt-2 line-clamp-3 text-xl font-bold leading-tight md:text-2xl lg:text-[1.75rem]"
                style={{ color: "var(--regu-gray-900)" }}
              >
                {slide.title}
              </h2>
              {/* Botones */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {slide.href.startsWith("http") ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-lg border-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
                    style={{
                      borderColor: "var(--news-accent)",
                      color: "var(--news-accent)",
                    }}
                  >
                    {slide.ctaPrimaryLabel ?? "Leer más"}
                  </a>
                ) : (
                  <Link
                    to={slide.href}
                    className="inline-flex items-center justify-center rounded-lg border-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
                    style={{
                      borderColor: "var(--news-accent)",
                      color: "var(--news-accent)",
                    }}
                  >
                    {slide.ctaPrimaryLabel ?? "Leer más"}
                  </Link>
                )}
                {slide.ctaSecondary && (
                  <a
                    href={slide.ctaSecondary.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                    style={{ backgroundColor: "var(--news-accent)" }}
                  >
                    {slide.ctaSecondary.label}
                  </a>
                )}
              </div>
            </div>
            {/* Dots / indicadores a la derecha dentro de la card */}
            <div
              className="featuredCarouselDots flex items-center gap-2 sm:shrink-0"
              aria-label="Slides"
            >
              {items.slice(0, 7).map((_, i) => (
                <button
                  key={items[i].id}
                  type="button"
                  aria-label={`Ir al slide ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className="h-1.5 w-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
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

        {/* Controles del carrusel: prev / play-pause / next — abajo a la derecha */}
        <div
          className="featuredCarouselControls absolute bottom-4 right-4 flex items-center gap-2 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8"
          aria-label="Controles del carrusel"
        >
          <button
            type="button"
            aria-label="Slide anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--regu-gray-900)] shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={isPaused ? "Reanudar" : "Pausar"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--regu-gray-900)] shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
            aria-label="Slide siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--regu-gray-900)] shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
