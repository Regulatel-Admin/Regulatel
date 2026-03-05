import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { HeroSlideItem } from "@/data/home";

interface HeroSlideshowProps {
  slides: HeroSlideItem[];
  intervalMs?: number;
}

/**
 * Slideshow estilo BEREC: imagen a ancho completo + tarjeta blanca con fecha, categoría, título y READ MORE.
 * Controles: puntos, flechas y pause/play. Colores y tipografía BEREC.
 */
export default function HeroSlideshow({
  slides,
  intervalMs = 6000,
}: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs, isPaused]);

  if (!slides.length) return null;

  const slide = slides[activeIndex];
  const hasLink = slide.href != null && slide.href !== "";

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-900"
      style={{
        height: "min(520px, 55vh)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      {/* Imagen de fondo por slide; si falla la carga se muestra gradiente institucional */}
      {slides.map((s, index) => (
        <div
          key={`${s.title}-${index}`}
          className={[
            "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
            index === activeIndex ? "opacity-100 z-0" : "opacity-0 z-0",
          ].join(" ")}
        >
          {/* Fallback: gradiente BEREC (visible cuando la imagen no carga) */}
          <div
            className="absolute inset-0 h-full w-full"
            style={{ background: "var(--token-gradient-hero)" }}
            aria-hidden
          />
          <img
            src={s.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
            }}
          />
        </div>
      ))}

      {/* Tarjeta blanca overlay estilo BEREC */}
      <div className="absolute left-4 right-4 bottom-4 top-1/3 z-10 md:left-8 md:right-auto md:top-auto md:max-w-md md:bottom-8">
        <div className="rounded-none bg-white p-5 shadow-lg md:p-6">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
            <span style={{ color: "var(--token-text-primary)" }}>
              {slide.dateFormatted ?? slide.subtitle}
            </span>
            <span style={{ color: "var(--token-accent)" }}>
              {slide.category ?? "EVENTOS"}
            </span>
          </div>
          <h2
            className="text-lg font-bold leading-snug md:text-xl"
            style={{ color: "var(--token-text-primary)" }}
          >
            {slide.title}
          </h2>

          {/* Pagination dots */}
          <div className="mt-4 flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir al slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className="h-1.5 w-1.5 rounded-full transition-all motion-reduce:transition-none"
                style={{
                  backgroundColor:
                    index === activeIndex
                      ? "var(--token-text-primary)"
                      : "var(--token-text-primary)",
                  opacity: index === activeIndex ? 1 : 0.35,
                }}
              />
            ))}
          </div>

          <div className="mt-4">
            {hasLink && slide.href!.startsWith("http") ? (
              <a
                href={slide.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center rounded border-2 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
                style={{
                  borderColor: "var(--token-accent)",
                  color: "var(--token-accent)",
                }}
              >
                Leer más
              </a>
            ) : hasLink ? (
              <Link
                to={slide.href!}
                className="inline-flex items-center rounded border-2 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
                style={{
                  borderColor: "var(--token-accent)",
                  color: "var(--token-accent)",
                }}
              >
                Leer más
              </Link>
            ) : (
              <span
                className="inline-flex items-center rounded border-2 border-[var(--token-accent)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide"
                style={{ color: "var(--token-accent)" }}
              >
                Leer más
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controles: flecha izq, pause/play, flecha der (esquina inferior derecha) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() =>
            setActiveIndex((i) => (i === 0 ? slides.length - 1 : i - 1))
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--token-text-primary)] shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={isPaused ? "Reanudar" : "Pausar"}
          onClick={() => setIsPaused((p) => !p)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--token-text-primary)] shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() =>
            setActiveIndex((i) => (i + 1) % slides.length)
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--token-text-primary)] shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
