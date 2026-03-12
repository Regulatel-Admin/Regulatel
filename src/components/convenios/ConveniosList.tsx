import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import type { Convenio } from "@/data/convenios";

interface ConveniosListProps {
  convenios: Convenio[];
}

/**
 * Lista de convenios con diseño institucional premium.
 */
export default function ConveniosList({ convenios }: ConveniosListProps) {
  return (
    <ul className="list-none m-0 p-0 space-y-5">
      {convenios.map((c, index) => (
        <li key={c.slug} className="list-none m-0">
          <article
            className="convenioCard group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
              fontFamily: "var(--token-font-body)",
            }}
          >
            {/* Accent top bar */}
            <div
              className="convenioCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />

            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 sm:p-7 md:p-8">
              {/* Logo */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl border bg-white w-full sm:w-[120px] h-24 sm:h-[120px]"
                style={{
                  borderColor: "rgba(22,61,89,0.08)",
                  boxShadow: "0 1px 4px rgba(22,61,89,0.06)",
                  padding: "16px",
                }}
              >
                <img
                  src={c.logoSrc}
                  alt={`Logo ${c.acronym}`}
                  className="max-h-full w-auto object-contain"
                  style={{ maxWidth: "88px" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Number + acronym badge */}
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                    style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.10em]"
                    style={{ color: "var(--regu-gray-500)" }}
                  >
                    Convenio de cooperación
                  </span>
                </div>

                <h2
                  className="text-lg font-bold leading-snug mb-1 md:text-xl"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  {c.title}
                </h2>
                <p
                  className="text-sm font-bold uppercase tracking-[0.08em] mb-3"
                  style={{ color: "var(--regu-blue)" }}
                >
                  {c.acronym}
                </p>
                <p
                  className="text-sm leading-relaxed mb-5 md:text-base"
                  style={{ color: "var(--regu-gray-600)" }}
                >
                  {c.shortDescription}
                </p>

                {/* Areas pills */}
                {c.areas.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {c.areas.slice(0, 3).map((area, i) => (
                      <span
                        key={i}
                        className="inline-block rounded-full px-3 py-1 text-xs font-medium leading-snug"
                        style={{ backgroundColor: "rgba(22,61,89,0.05)", color: "var(--regu-gray-700)" }}
                      >
                        {area}
                      </span>
                    ))}
                    {c.areas.length > 3 && (
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
                      >
                        +{c.areas.length - 3} más
                      </span>
                    )}
                  </div>
                )}

                {/* CTAs */}
                <div
                  className="flex flex-wrap items-center gap-3 border-t pt-4"
                  style={{ borderColor: "rgba(22,61,89,0.07)" }}
                >
                  <Link
                    to={`/convenios/${c.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                  >
                    Ver convenio
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                  {c.downloadUrl && (
                    <a
                      href={c.downloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Descargar memorándum
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
