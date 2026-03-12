import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import ConveniosList from "@/components/convenios/ConveniosList";
import { convenios } from "@/data/convenios";

export default function Convenios() {
  return (
    <>
      <PageHero
        title="Convenios y Memorandums"
        subtitle="COOPERACIÓN INTERNACIONAL"
        breadcrumb={[{ label: "Convenios" }]}
        description="REGULATEL mantiene acuerdos de cooperación con organizaciones internacionales y regionales para fortalecer la regulación de telecomunicaciones."
      />

      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6"
          style={{ maxWidth: "900px" }}
        >
          {/* Header de sección */}
          <div className="mb-10 flex items-start gap-4">
            <div
              className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <div>
              <h2
                className="text-xl font-bold md:text-2xl"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                Acuerdos activos
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {convenios.length} convenios de cooperación vigentes
              </p>
            </div>
          </div>

          {/* Lista de convenios */}
          <ConveniosList convenios={convenios} />

          {/* Bloque objetivos */}
          <section
            className="mt-10 rounded-2xl border bg-white p-7 md:p-10"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
            }}
          >
            <h2
              className="mb-5 flex items-center gap-3 text-lg font-bold md:text-xl"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              <span
                className="inline-block h-5 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              Objetivos de los convenios
            </h2>
            <div
              className="space-y-3 text-base leading-relaxed"
              style={{ color: "var(--regu-gray-600)" }}
            >
              <p>
                Los convenios y alianzas de REGULATEL buscan fortalecer la cooperación regional e internacional,
                facilitando el intercambio de información, experiencias y mejores prácticas en el sector
                de las telecomunicaciones.
              </p>
              <p>
                A través de estos acuerdos, REGULATEL promueve el desarrollo de políticas comunes,
                la capacitación de profesionales del sector y la coordinación de esfuerzos para
                enfrentar los desafíos regulatorios en América Latina y Europa.
              </p>
            </div>
          </section>

          {/* Footer nav */}
          <nav
            className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.06)",
              }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Inicio
            </Link>
            <Link
              to="/miembros"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Ver miembros <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
