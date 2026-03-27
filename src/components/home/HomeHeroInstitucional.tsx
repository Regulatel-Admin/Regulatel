/**
 * Hero institucional del home REGULATEL.
 * Fondo: slideshow de imágenes, imagen fija o composición SVG.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight } from "lucide-react";
import HeroInstitucionalBackground from "./HeroInstitucionalBackground";
import HomeRevistaAnnouncement from "./HomeRevistaAnnouncement";

const HERO_SLIDESHOW_INTERVAL_MS = 5500;

export interface HomeHeroInstitucionalProps {
  coverImageUrls?: string[];
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

const HERO_BG_FALLBACK = "#163D59";
const HERO_IMAGE_FILTER = "brightness(0.84) saturate(0.80)";

export default function HomeHeroInstitucional({
  coverImageUrls = [],
  badge,
  title,
  titleHighlight,
  description,
  primaryCta,
  secondaryCta,
}: HomeHeroInstitucionalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hasImages = coverImageUrls.length > 0;
  const isSlideshow = coverImageUrls.length > 1;
  const showLoader = hasImages && loadedCount === 0;

  useEffect(() => {
    if (!isSlideshow || isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % coverImageUrls.length);
    }, HERO_SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isSlideshow, isPaused, coverImageUrls.length]);

  const goPrev = () =>
    setCurrentIndex((i) => (i === 0 ? coverImageUrls.length - 1 : i - 1));
  const goNext = () =>
    setCurrentIndex((i) => (i + 1) % coverImageUrls.length);

  return (
    <section
      className="heroInstitucional relative w-full overflow-hidden"
      style={{
        fontFamily: "var(--token-font-body)",
        minHeight: "var(--hero-min-height, 66vh)",
      }}
      aria-label="Hero principal"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0" style={{ background: HERO_BG_FALLBACK }}>
        {hasImages && (
          <>
            {coverImageUrls.map((url, i) => (
              <img
                key={url}
                src={url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{
                  objectPosition: "center 40%",
                  filter: HERO_IMAGE_FILTER,
                  opacity: i === currentIndex ? 1 : 0,
                  zIndex: i === currentIndex ? 1 : 0,
                }}
                loading={i === 0 ? "eager" : "lazy"}
                onLoad={() => setLoadedCount((c) => c + 1)}
                onError={(e) => {
                  setLoadedCount((c) => c + 1);
                  e.currentTarget.style.display = "none";
                }}
              />
            ))}

            {/* Overlay: más protección izquierda para el texto, se desvanece hacia la derecha */}
            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  "linear-gradient(105deg, rgba(10,28,48,0.72) 0%, rgba(10,28,48,0.48) 45%, rgba(10,28,48,0.10) 75%, rgba(10,28,48,0.00) 100%)",
              }}
              aria-hidden
            />

            {/* Loader */}
            {showLoader && (
              <div className="absolute inset-0 z-[3] flex items-center justify-center" aria-hidden>
                <div
                  className="h-10 w-10 rounded-full border-2 border-white/40 border-t-white"
                  style={{ animation: "hero-spin 0.9s linear infinite" }}
                />
              </div>
            )}
          </>
        )}
        {!hasImages && <HeroInstitucionalBackground />}
      </div>

      {/* ── Content ── */}
      <div
        className="heroInstitucionalContent relative z-10 flex min-h-[var(--hero-min-height,66vh)] flex-col justify-center"
        style={{
          paddingTop: "var(--hero-content-padding-y, 3.5rem)",
          paddingBottom: "var(--hero-content-padding-y, 3.5rem)",
          paddingLeft: "var(--hero-content-padding-x, 2.5rem)",
          paddingRight: "var(--hero-content-padding-x, 2.5rem)",
        }}
      >
        {/* Container: max-width anchored left */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          <div
            className="w-full text-center md:text-left"
            style={{ maxWidth: "clamp(320px, 52%, 640px)" }}
          >
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2">
              <span
                className="inline-block rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ backgroundColor: "var(--regu-lime)", color: "#1a2a00" }}
              >
                {badge}
              </span>
            </div>

            {/* Title */}
            <h1
              className="heroInstitucionalTitle font-bold leading-[1.16] text-white"
              style={{
                fontFamily: "var(--token-font-heading)",
                fontSize: "var(--hero-title-font, clamp(1.75rem, 4.2vw, 3.5rem))",
              }}
            >
              {title}{" "}
              <span
                style={{
                  color: "var(--regu-lime)",
                  display: "inline",
                }}
              >
                {titleHighlight}
              </span>
            </h1>

            {/* Description */}
            <p
              className="mt-5 max-w-[520px] text-[0.9375rem] leading-relaxed text-white/90 md:mx-0 md:text-base"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              {description}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <Link
                to={primaryCta.href}
                className="heroInstitucionalPrimaryCta inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  backgroundColor: "var(--regu-blue)",
                  fontFamily: "var(--token-font-body)",
                  boxShadow: "0 2px 12px rgba(68,137,198,0.45)",
                }}
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
              <Link
                to={secondaryCta.href}
                className="heroInstitucionalSecondaryCta inline-flex items-center justify-center rounded-lg border-2 px-6 py-3.5 text-sm font-semibold transition-all hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  fontFamily: "var(--token-font-body)",
                  borderColor: "rgba(255,255,255,0.55)",
                  color: "rgba(255,255,255,0.90)",
                  backgroundColor: "rgba(255,255,255,0.07)",
                }}
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar: dots + controls ── */}
      <HomeRevistaAnnouncement />

      {isSlideshow && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 md:px-8">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Diapositivas">
            {coverImageUrls.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Ir a imagen ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className="rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  height: "4px",
                  width: i === currentIndex ? "24px" : "6px",
                  backgroundColor: i === currentIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div
            className="flex items-center gap-0.5 rounded-xl border border-white/15 bg-black/20 px-1 py-1 backdrop-blur-sm"
            aria-label="Controles del slideshow"
          >
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={goPrev}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={isPaused ? "Reanudar slideshow" : "Pausar slideshow"}
              onClick={() => setIsPaused((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Pause className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={goNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
