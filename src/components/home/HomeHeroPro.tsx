import { Link } from "react-router-dom";

export interface HomeHeroProProps {
  /** Imagen de portada fija (mapa/latam) */
  coverImageUrl: string;
  /** Si se indica, se muestra el logo en lugar del título de texto */
  logoUrl?: string;
  /** Eyebrow/tagline pequeño (ej: #conectando) */
  eyebrow: string;
  /** Título H1 (usado como alt del logo o texto si no hay logo) */
  title: string;
  /** Subtítulo exacto que explica qué es REGULATEL */
  subtitle: string;
  /** Bullets de valor (3 puntos) */
  bullets: string[];
  /** CTA primario (ej: EXPLORAR RECURSOS) */
  primaryCta: { label: string; href: string };
  /** CTA secundario (ej: VER PRÓXIMOS EVENTOS) */
  secondaryCta: { label: string; href: string };
}

const HERO_OVERLAY = "rgba(0, 0, 0, 0.48)";

/**
 * Hero limpio nivel BEREC: mapa como textura/editorial de fondo, texto protagonista.
 * Mapa con opacidad reducida, blur sutil y brillo bajo para no competir con el copy.
 */
export default function HomeHeroPro({
  coverImageUrl,
  logoUrl,
  eyebrow,
  title,
  subtitle,
  bullets,
  primaryCta,
  secondaryCta,
}: HomeHeroProProps) {
  return (
    <section
      className="hero relative w-full overflow-hidden min-h-[70vh]"
      style={{ fontFamily: "var(--token-font-body)" }}
    >
      {/* Background: gradiente base + mapa como textura editorial */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 h-full w-full"
          style={{ background: "var(--token-gradient-hero)" }}
          aria-hidden
        />
        <img
          src={coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: 0.42,
            filter: "blur(1px) brightness(0.72) contrast(0.95)",
            objectPosition: "38% 50%",
          }}
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Overlay para legibilidad (más oscuro = fondo más limpio tipo BEREC) */}
      <div
        className="heroOverlay absolute inset-0 z-[1]"
        style={{ backgroundColor: HERO_OVERLAY }}
        aria-hidden
      />

      {/* Contenido: solo izquierda (texto + CTAs) */}
      <div
        className="heroContent relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 md:items-start md:px-6 md:py-14 lg:px-8"
        style={{
          maxWidth: "var(--token-container-max)",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div className="w-full max-w-[520px] text-center md:text-left">
          <p
            className="text-sm font-semibold uppercase tracking-wider text-white/90"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {eyebrow}
          </p>
          {logoUrl ? (
            <h1 className="mt-2 flex items-center">
              <img
                src={logoUrl}
                alt={title}
                className="h-14 w-auto max-w-[280px] object-contain object-left md:h-16 md:max-w-[320px]"
              />
            </h1>
          ) : (
            <h1
              className="mt-2 font-bold leading-tight text-white"
              style={{
                fontFamily: "var(--token-font-heading)",
                fontSize: "clamp(2rem, 5vw, 3rem)",
              }}
            >
              {title}
            </h1>
          )}
          <p
            className="mt-3 text-base leading-snug text-white/95 md:text-lg"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {subtitle}
          </p>
          {bullets.length > 0 && (
            <ul
              className="mt-4 space-y-2"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {bullets.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2 text-sm md:text-base"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/80"
                    aria-hidden
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={primaryCta.href}
              className="primaryCta inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              {primaryCta.label}
            </Link>
            <Link
              to={secondaryCta.href}
              className="secondaryCta inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
