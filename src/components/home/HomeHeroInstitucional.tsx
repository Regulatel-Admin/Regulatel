/**
 * Hero institucional del home REGULATEL.
 * Fondo: slideshow de imágenes, imagen fija o composición SVG (conectividad regional).
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import HeroInstitucionalBackground from "./HeroInstitucionalBackground";

const HERO_SLIDESHOW_INTERVAL_MS = 5000;

export interface HomeHeroInstitucionalProps {
  /** Una o varias imágenes de fondo: varias = slideshow con transición suave */
  coverImageUrls?: string[];
  /** Badge pequeño arriba del título (ej: Presidencia 2026) */
  badge: string;
  /** Título principal (parte en blanco) */
  title: string;
  /** Fragmento del título a resaltar en color (ej: inclusiva y segura) */
  titleHighlight: string;
  /** Párrafo descriptivo */
  description: string;
  /** CTA primario sólido */
  primaryCta: { label: string; href: string };
  /** CTA secundario outline/ghost */
  secondaryCta: { label: string; href: string };
}

const HERO_BG_FALLBACK = "#163D59";
/** Filtro suave: menos brillo y saturación para bajar ruido visual sin tapar la foto */
const HERO_IMAGE_FILTER = "brightness(0.88) saturate(0.82)";

/**
 * Hero institucional/editorial: slideshow o imagen de fondo + badge + título + descripción + 2 CTAs.
 */
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
        minHeight: "var(--hero-min-height, 58vh)",
      }}
      aria-label="Hero principal"
    >
      <div
        className="absolute inset-0"
        style={{ background: HERO_BG_FALLBACK }}
      >
        {hasImages ? (
          <>
            {coverImageUrls.map((url, i) => (
              <img
                key={url}
                src={url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{
                  objectPosition: "center 42%",
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
            {/* Overlay oscuro focal: cubre solo la zona del texto (izquierda/centro) para legibilidad */}
            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0.08) 100%)",
              }}
              aria-hidden
            />
            {showLoader && (
              <div
                className="heroCoverLoader absolute inset-0 z-[3] flex items-center justify-center"
                aria-hidden
              >
                <div
                  className="heroCoverSpinner h-10 w-10 rounded-full border-2 border-white/40 border-t-white"
                  style={{ animation: "hero-spin 0.9s linear infinite" }}
                />
              </div>
            )}

            {/* Controles del slideshow: anterior, pausa/play, siguiente — esquina inferior derecha (z-20 para quedar encima del contenido z-10 y recibir clics) */}
            {isSlideshow && (
              <div
                className="heroSlideshowControls absolute bottom-5 right-5 z-20 flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-1 py-1 shadow-sm backdrop-blur-sm"
                aria-label="Controles del slideshow"
              >
                <button
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={goPrev}
                  className="heroSlideshowBtn flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={isPaused ? "Reanudar slideshow" : "Pausar slideshow"}
                  onClick={() => setIsPaused((p) => !p)}
                  className="heroSlideshowBtn flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" aria-hidden />
                  ) : (
                    <Pause className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={goNext}
                  className="heroSlideshowBtn flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            )}
          </>
        ) : null}
        {!hasImages && <HeroInstitucionalBackground />}
      </div>

      {/* Contenido: bloque izquierda, proporción afinada al nuevo alto */}
      <div
        className="heroInstitucionalContent relative z-10 flex flex-col items-center justify-center text-center md:items-start md:text-left"
        style={{
          marginTop: "-16px",
          minHeight: "var(--hero-min-height, 58vh)",
          paddingTop: "var(--hero-content-padding-y, 3rem)",
          paddingBottom: "var(--hero-content-padding-y, 3rem)",
          paddingLeft: "var(--hero-content-padding-x, 2rem)",
          paddingRight: "var(--hero-content-padding-x, 2rem)",
        }}
      >
        <div
          className="w-full max-w-[720px] lg:max-w-[760px]"
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          <p
            className="heroInstitucionalBadge inline-block rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
            style={{
              backgroundColor: "var(--regu-lime)",
              color: "var(--regu-gray-900)",
              fontFamily: "var(--token-font-body)",
            }}
          >
            {badge}
          </p>

          <h1
            className="heroInstitucionalTitle mt-3 font-bold leading-[1.18] text-white md:mt-4"
            style={{
              fontFamily: "var(--token-font-heading)",
              fontSize: "var(--hero-title-font, clamp(1.6rem, 4.2vw, 3.6rem))",
            }}
          >
            {title}
            <br />
            <span style={{ color: "var(--regu-teal)" }}>{titleHighlight}</span>
          </h1>

          <p
            className="heroInstitucionalDescription mt-4 max-w-[640px] text-base leading-relaxed text-white/95 md:text-lg"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {description}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={primaryCta.href}
              className="heroInstitucionalPrimaryCta inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                backgroundColor: "var(--regu-teal)",
                fontFamily: "var(--token-font-body)",
              }}
            >
              {primaryCta.label}
            </Link>
            <Link
              to={secondaryCta.href}
              className="heroInstitucionalSecondaryCta inline-flex items-center justify-center rounded-lg border-2 px-6 py-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                fontFamily: "var(--token-font-body)",
                borderColor: "rgba(255,255,255,0.95)",
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
