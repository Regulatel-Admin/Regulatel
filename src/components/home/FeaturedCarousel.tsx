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
  categoryLabel?: string;
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[];
  autoplayIntervalMs?: number;
}

const MESES: Record<string, number> = {
  ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5,
  JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11,
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
    if (items.length <= 1 || isPaused || isHovering) return;
    const t = setInterval(() => goTo(activeIndex + 1), autoplayIntervalMs);
    return () => clearInterval(t);
  }, [activeIndex, isPaused, isHovering, items.length, autoplayIntervalMs, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === " ") { e.preventDefault(); setIsPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (!items.length) return null;

  const slide = items[activeIndex];
  const isEventPast = slide.type === "eventos" && isSlideDatePast(slide.date);
  const defaultCategoryLabel =
    slide.type === "eventos" ? (isEventPast ? "Pasado" : "Próxima") : "Noticias";
  const categoryLabel = slide.categoryLabel ?? defaultCategoryLabel;
  const showCumbreLabel = slide.type === "eventos";

  return (
    <section
      className="featuredCarousel relative w-full overflow-hidden"
      style={{ minHeight: "380px", height: "clamp(380px, 46vh, 560px)" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Carrusel destacado"
    >
      {/* Slides con crossfade */}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: i === activeIndex ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.imageUrl})`, filter: "brightness(0.78) saturate(0.88)" }}
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
                  Cumbre
                </span>
              )}
              <span
                className="text-xs font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--regu-gray-500)" }}
              >
                {slide.date}
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
                  {slide.ctaPrimaryLabel ?? "Leer más"}
                </a>
              ) : (
                <Link
                  to={slide.href}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {slide.ctaPrimaryLabel ?? "Leer más"}
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
              <div className="mt-5 flex items-center gap-1.5" aria-label="Slides">
                {items.slice(0, 7).map((_, i) => (
                  <button
                    key={items[i].id}
                    type="button"
                    aria-label={`Ir al slide ${i + 1}`}
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

      {/* Controles — pill translúcido, esquina inferior derecha */}
      {items.length > 1 && (
        <div
          className="absolute bottom-5 right-5 z-20 flex items-center gap-0.5 rounded-xl border border-white/20 bg-black/25 px-1 py-1 backdrop-blur-sm"
          aria-label="Controles del carrusel"
        >
          <button
            type="button"
            aria-label="Slide anterior"
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
            aria-label="Slide siguiente"
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
