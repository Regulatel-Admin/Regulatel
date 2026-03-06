/**
 * Hero institucional del home REGULATEL.
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 */
import { Link } from "react-router-dom";

export interface HomeHeroInstitucionalProps {
  /** Imagen de fondo del hero (opcional; si no se indica, se usa gradiente) */
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

const HERO_BG_GRADIENT =
  "linear-gradient(135deg, #163D59 0%, #2d5a7b 50%, #1a4a6e 100%)";
/** Overlay en gradiente: izquierda (texto) más oscuro, derecha deja ver más la imagen. Refinado y elegante. */
const HERO_OVERLAY =
  "linear-gradient(90deg, rgba(7, 30, 55, 0.80) 0%, rgba(7, 30, 55, 0.68) 45%, rgba(7, 30, 55, 0.42) 100%)";

/**
 * Hero institucional/editorial: imagen de fondo o gradiente + badge + título + descripción + 2 CTAs.
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
  return (
    <section
      className="heroInstitucional relative w-full overflow-hidden min-h-[72vh] md:min-h-[73vh]"
      style={{ fontFamily: "var(--token-font-body)" }}
      aria-label="Hero principal"
    >
      {/* Fondo: imagen o gradiente */}
      <div className="absolute inset-0">
        {coverImageUrl ? (
          <>
            <img
              src={coverImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "brightness(0.85)" }}
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const overlay = parent.querySelector(".heroInstitucionalOverlay");
                  if (overlay instanceof HTMLElement) overlay.style.display = "none";
                  parent.style.background = HERO_BG_GRADIENT;
                }
              }}
            />
            <div
              className="heroInstitucionalOverlay absolute inset-0 z-[1]"
              style={{ background: HERO_OVERLAY }}
              aria-hidden
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: HERO_BG_GRADIENT }}
            aria-hidden
          />
        )}
      </div>

      {/* Contenido: bloque izquierda, ligeramente subido para mejor equilibrio vertical */}
      <div
        className="heroInstitucionalContent relative z-10 flex min-h-[72vh] md:min-h-[73vh] flex-col items-center justify-center px-4 py-14 text-center md:items-start md:px-6 md:py-16 md:text-left lg:px-8"
        style={{ marginTop: "-24px" }}
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
            className="heroInstitucionalTitle mt-4 font-bold leading-[1.14] text-white md:mt-5"
            style={{
              fontFamily: "var(--token-font-heading)",
              fontSize: "clamp(1.75rem, 4.8vw, 4.25rem)",
            }}
          >
            {title}
            <br />
            <span style={{ color: "var(--regu-teal)" }}>{titleHighlight}</span>
          </h1>

          <p
            className="heroInstitucionalDescription mt-5 max-w-[640px] text-base leading-relaxed text-white/95 md:mt-6 md:text-lg"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
