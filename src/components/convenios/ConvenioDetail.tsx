import { Link } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle2, ArrowRight } from "lucide-react";
import type { Convenio } from "@/data/convenios";
import { convenios as defaultConvenios } from "@/data/convenios";

interface ConvenioDetailProps {
  convenio: Convenio;
  /** Lista completa para el bloque «otros convenios»; por defecto datos estáticos. */
  allConvenios?: Convenio[];
}

/**
 * Vista detalle de un convenio: diseño institucional premium.
 */
export default function ConvenioDetail({ convenio, allConvenios }: ConvenioDetailProps) {
  const list = allConvenios ?? defaultConvenios;
  const otherConvenios = list.filter((c) => c.slug !== convenio.slug);

  return (
    <div
      className="w-full py-12 md:py-16"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div
        className="mx-auto px-4 md:px-6"
        style={{ maxWidth: "860px" }}
      >
        {/* Hero card del convenio */}
        <div
          className="relative overflow-hidden rounded-2xl border bg-white p-7 md:p-10 mb-8"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
          }}
        >
          {/* Accent top */}
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ backgroundColor: "var(--regu-blue)" }}
            aria-hidden
          />

          <div className="flex flex-col sm:flex-row items-start gap-7">
            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl border bg-white"
              style={{
                width: "120px",
                height: "120px",
                padding: "18px",
                borderColor: "rgba(22,61,89,0.10)",
                boxShadow: "0 1px 4px rgba(22,61,89,0.06)",
              }}
            >
              <img
                src={convenio.logoSrc}
                alt={`Logo ${convenio.acronym}`}
                className="max-h-full w-auto object-contain"
                style={{ maxWidth: "84px" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span
                className="mb-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
              >
                Convenio de cooperación
              </span>
              <h1
                className="mt-1 text-2xl font-bold leading-tight md:text-3xl"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                {convenio.title}
              </h1>
              <p
                className="mt-1 text-sm font-bold uppercase tracking-[0.10em]"
                style={{ color: "var(--regu-blue)" }}
              >
                {convenio.acronym}
              </p>
              <p
                className="mt-4 text-base leading-relaxed"
                style={{ color: "var(--regu-gray-600)" }}
              >
                {convenio.shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Áreas de cooperación */}
        <section
          className="rounded-2xl border bg-white p-7 md:p-10 mb-8"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
          }}
        >
          <div className="mb-6 flex items-start gap-4">
            <div
              className="mt-1 h-7 w-[3px] flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <h2
              className="text-lg font-bold md:text-xl"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              Áreas de cooperación
            </h2>
          </div>
          <ul className="space-y-3">
            {convenio.areas.map((area, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base leading-relaxed"
                style={{ color: "var(--regu-gray-700)" }}
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  style={{ color: "var(--regu-blue)" }}
                  aria-hidden
                />
                {area}
              </li>
            ))}
          </ul>
        </section>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {convenio.downloadUrl && (
            <a
              href={convenio.downloadUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Descargar memorándum
            </a>
          )}
          <Link
            to="/convenios"
            className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-3 text-sm font-semibold transition hover:bg-[rgba(68,137,198,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Todos los convenios
          </Link>
        </div>

        {/* Otros convenios */}
        {otherConvenios.length > 0 && (
          <section>
            <h2
              className="mb-5 flex items-center gap-3 text-base font-bold uppercase tracking-[0.08em]"
              style={{ color: "var(--regu-gray-500)" }}
            >
              <span
                className="inline-block h-4 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              Otros convenios
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {otherConvenios.map((c) => (
                <Link
                  key={c.slug}
                  to={`/convenios/${c.slug}`}
                  className="group flex items-center gap-3 rounded-xl border bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--regu-blue)] hover:shadow-[0_4px_16px_rgba(22,61,89,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
                  style={{ borderColor: "rgba(22,61,89,0.10)" }}
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-white p-2"
                    style={{ borderColor: "rgba(22,61,89,0.08)" }}
                  >
                    <img
                      src={c.logoSrc}
                      alt=""
                      className="max-h-8 max-w-8 object-contain"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--regu-navy)" }}
                    >
                      {c.acronym}
                    </p>
                    <p
                      className="truncate text-xs"
                      style={{ color: "var(--regu-gray-500)" }}
                    >
                      {c.title}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 flex-shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    style={{ color: "var(--regu-blue)" }}
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
