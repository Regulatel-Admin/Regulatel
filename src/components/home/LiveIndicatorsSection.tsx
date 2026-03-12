import { ExternalLink, BarChart2 } from "lucide-react";

const POWER_BI_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiOWM5NWI3YWEtZjk0MC00NDlhLWI0YmYtMDQ4MGQ2OTM1ZTQwIiwidCI6ImVjYzY2NjY1LTFiYjktNDgxOC04YWJjLWE0MDk0Njg5NDE3OCIsImMiOjR9";

export default function LiveIndicatorsSection() {
  return (
    <section
      className="w-full"
      aria-label="Indicadores en vivo"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        borderBottom: "1px solid rgba(22,61,89,0.07)",
        paddingTop: "56px",
        paddingBottom: "64px",
      }}
    >
      <div className="mx-auto w-full px-4 md:px-6 lg:px-8" style={{ maxWidth: "1280px" }}>

        {/* Section header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <div>
              <p
                className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--regu-gray-400)" }}
              >
                Panel interactivo
              </p>
              <h2
                className="text-xl font-bold md:text-2xl"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                Indicadores en vivo
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Datos e indicadores interactivos de los países miembros de REGULATEL.
              </p>
            </div>
          </div>
          <a
            href={POWER_BI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all hover:bg-[rgba(68,137,198,0.06)]"
            style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-blue)" }}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir panel completo
          </a>
        </div>

        {/* Desktop: iframe embed */}
        <div
          className="hidden overflow-hidden rounded-2xl border bg-white md:block"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 4px 24px rgba(22,61,89,0.06)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <div className="p-4 md:p-5 lg:p-6">
            <div
              className="overflow-hidden rounded-xl"
              style={{
                border: "1px solid rgba(22,61,89,0.07)",
                backgroundColor: "rgba(22,61,89,0.02)",
              }}
            >
              <iframe
                className="h-[540px] w-full border-0 md:h-[620px] lg:h-[680px]"
                src={POWER_BI_URL}
                title="Panel de indicadores REGULATEL - Power BI"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Mobile: clean CTA card */}
        <div
          className="overflow-hidden rounded-2xl border bg-white md:hidden"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 4px 24px rgba(22,61,89,0.06)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <div className="p-6">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(68,137,198,0.10)" }}
            >
              <BarChart2 className="h-7 w-7" style={{ color: "var(--regu-blue)" }} />
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              Indicadores en vivo
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--regu-gray-600)" }}>
              Accede al panel interactivo de indicadores y visualizaciones de REGULATEL con datos actualizados de los países miembros.
            </p>
            <a
              href={POWER_BI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir panel completo
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
