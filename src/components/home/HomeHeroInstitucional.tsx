/**
 * Hero institucional del home REGULATEL.
 * Fondo: composición institucional (conectividad regional) o imagen opcional.
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import HeroInstitucionalBackground from "./HeroInstitucionalBackground";

export interface HomeHeroInstitucionalProps {
  /** Imagen de fondo del hero (opcional; si no se indica, se usa color sólido) */
  coverImageUrl?: string;
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

/**
 * Hero institucional/editorial: imagen de fondo o color sólido + badge + título + descripción + 2 CTAs.
 * Estilo BEREC / UE / ITU.
 */
export default function HomeHeroInstitucional({
  coverImageUrl,
  badge,
  title,
  titleHighlight,
  description,
  primaryCta,
  secondaryCta,
}: HomeHeroInstitucionalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const showLoader = Boolean(coverImageUrl) && !imageLoaded;

  return (
    <section
      className="heroInstitucional relative w-full overflow-hidden min-h-[50vh] md:min-h-[54vh] lg:min-h-[58vh]"
      style={{ fontFamily: "var(--token-font-body)" }}
      aria-label="Hero principal"
    >
      {/* Fondo: imagen opcional o composición institucional (conectividad regional). */}
      <div
        className="absolute inset-0"
        style={{ background: HERO_BG_FALLBACK }}
      >
        {coverImageUrl ? (
          <>
            <img
              src={coverImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center 42%", filter: "none" }}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                setImageLoaded(true);
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.background = HERO_BG_FALLBACK;
              }}
            />
            {showLoader && (
              <div
                className="heroCoverLoader absolute inset-0 z-[2] flex items-center justify-center"
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
        {/* Composición institucional: nodos y conexiones (telecom + cooperación regional). */}
        {!coverImageUrl && <HeroInstitucionalBackground />}
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
