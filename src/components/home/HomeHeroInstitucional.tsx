/**
 * Hero institucional del home REGULATEL.
 * Fondo: slideshow de imágenes, imagen fija o composición SVG (conectividad regional).
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
/** Overlay navy institucional para legibilidad del texto sobre la foto */
const HERO_OVERLAY = "linear-gradient(90deg, rgba(22, 61, 89, 0.68) 0%, rgba(22, 61, 89, 0.42) 45%, rgba(22, 61, 89, 0.28) 100%)";
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
  const hasImages = coverImageUrls.length > 0;
  const isSlideshow = coverImageUrls.length > 1;
  const showLoader = hasImages && loadedCount === 0;

  useEffect(() => {
    if (!isSlideshow) return;
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % coverImageUrls.length);
    }, HERO_SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isSlideshow, coverImageUrls.length]);

  return (
    <section
      className="heroInstitucional relative w-full overflow-hidden min-h-[50vh] md:min-h-[54vh] lg:min-h-[58vh]"
      style={{ fontFamily: "var(--token-font-body)" }}
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
            {/* Overlay azul institucional + gradiente focal (más oscuro donde está el texto) */}
            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{ background: HERO_OVERLAY }}
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
          </>
        ) : null}
        {!hasImages && <HeroInstitucionalBackground />}
      </div>

      {/* Contenido: bloque izquierda, proporción afinada al nuevo alto */}
      <div
        className="heroInstitucionalContent relative z-10 flex min-h-[50vh] md:min-h-[54vh] lg:min-h-[58vh] flex-col items-center justify-center px-4 py-10 text-center md:items-start md:px-6 md:py-12 md:text-left lg:px-8"
        style={{ marginTop: "-16px" }}
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
              fontSize: "clamp(1.6rem, 4.2vw, 3.6rem)",
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
