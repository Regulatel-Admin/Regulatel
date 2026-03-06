const POWER_BI_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiOWM5NWI3YWEtZjk0MC00NDlhLWI0YmYtMDQ4MGQ2OTM1ZTQwIiwidCI6ImVjYzY2NjY1LTFiYjktNDgxOC04YWJjLWE0MDk0Njg5NDE3OCIsImMiOjR9";

const TITLE = "Indicadores en vivo";
const SUBTITLE =
  "Consulta el panel interactivo de indicadores y visualizaciones de REGULATEL.";
const LINK_LABEL = "Abrir panel completo";
const MOBILE_MESSAGE =
  "Para una mejor visualización del panel interactivo, ábralo en pantalla completa.";
const MOBILE_CTA = "Abrir panel completo";

/**
 * Sección BEREC: dashboard Power BI como módulo institucional premium (desktop) o CTA elegante (mobile).
 * Ubicación: debajo del carrusel de cumbres en la home.
 */
export default function LiveIndicatorsSection() {
  return (
    <section
      className="liveIndicatorsSection bg-[var(--regu-offwhite)] py-16 md:py-20"
      aria-label="Indicadores en vivo"
    >
      <div
        className="mx-auto w-full px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: "1200px" }}
      >
        {/* Desktop: módulo institucional único (header + embed) */}
        <div
          className="hidden overflow-hidden rounded-2xl border bg-white md:block"
          style={{
            borderColor: "rgba(22, 61, 89, 0.12)",
            boxShadow: "0 4px 24px rgba(22, 61, 89, 0.06)",
          }}
        >
          {/* Header: título, subtítulo y CTA alineados */}
          <div className="liveIndicatorsHeader border-b px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6" style={{ borderColor: "rgba(22, 61, 89, 0.08)" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <h2
                  id="live-indicators-heading"
                  className="text-xl font-bold tracking-tight text-[var(--regu-gray-900)] md:text-2xl"
                  style={{ fontFamily: "var(--token-font-heading)" }}
                >
                  {TITLE}
                </h2>
                <p
                  className="mt-2 text-sm text-[var(--regu-gray-600)] md:text-base md:leading-relaxed"
                  style={{ fontFamily: "var(--token-font-body)" }}
                >
                  {SUBTITLE}
                </p>
              </div>
              <a
                href={POWER_BI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="liveIndicatorsFullLink inline-flex shrink-0 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  fontFamily: "var(--token-font-body)",
                  borderColor: "var(--regu-blue)",
                  color: "var(--regu-blue)",
                }}
              >
                {LINK_LABEL}
                <span aria-hidden className="ml-1">↗</span>
              </a>
            </div>
          </div>

          {/* Contenedor del embed dentro del mismo módulo */}
          <div className="liveIndicatorsEmbedWrap p-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
            <div
              className="overflow-hidden rounded-xl bg-[var(--regu-gray-100)]"
              style={{
                boxShadow: "0 2px 12px rgba(22, 61, 89, 0.04)",
                border: "1px solid rgba(22, 61, 89, 0.08)",
              }}
            >
              <iframe
                className="liveIndicatorsIframe h-[520px] w-full border-0 lg:h-[580px]"
                src={POWER_BI_URL}
                title="Panel de indicadores REGULATEL - Power BI"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Mobile: fallback card (sin iframe) — mismo estilo de módulo */}
        <div
          className="liveIndicatorsMobileFallback rounded-2xl border bg-white p-6 md:hidden"
          style={{
            borderColor: "rgba(22, 61, 89, 0.12)",
            boxShadow: "0 4px 24px rgba(22, 61, 89, 0.06)",
          }}
        >
          <h3
            className="text-lg font-bold text-[var(--regu-gray-900)]"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            {TITLE}
          </h3>
          <p
            className="mt-2 text-sm leading-relaxed text-[var(--regu-gray-600)]"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {MOBILE_MESSAGE}
          </p>
          <a
            href={POWER_BI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{
              backgroundColor: "var(--regu-blue)",
              fontFamily: "var(--token-font-body)",
            }}
          >
            {MOBILE_CTA}
            <span aria-hidden className="ml-1">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
