import { Link } from "react-router-dom";
import type { Convenio } from "@/data/convenios";

interface ConvenioDetailProps {
  convenio: Convenio;
}

/**
 * Vista detalle de un convenio: hero, título, descripción, áreas de cooperación, CTAs.
 */
export default function ConvenioDetail({ convenio }: ConvenioDetailProps) {
  return (
    <div
      className="mx-auto w-full px-4 py-8 md:px-6 md:py-12"
      style={{ maxWidth: 720, fontFamily: "var(--token-font-body)" }}
    >
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start mb-10">
        <div className="flex-shrink-0 flex items-center justify-center w-full sm:w-36 h-28">
          <img
            src={convenio.logoSrc}
            alt={`Logo ${convenio.acronym}`}
            className="max-h-[70px] w-auto object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl md:text-3xl font-semibold tracking-tight m-0 mb-2"
            style={{ color: "var(--token-text-primary)" }}
          >
            {convenio.title}
          </h1>
          <p className="text-base font-medium m-0 mb-4" style={{ color: "var(--regu-blue)" }}>
            {convenio.acronym}
          </p>
          <p className="text-base leading-relaxed m-0" style={{ color: "var(--token-text-secondary)" }}>
            {convenio.shortDescription}
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2
          className="text-lg font-semibold m-0 mb-4"
          style={{ color: "var(--token-text-primary)" }}
        >
          Áreas de cooperación
        </h2>
        <ul className="list-disc pl-6 m-0 space-y-2" style={{ color: "var(--token-text-secondary)" }}>
          {convenio.areas.map((area, i) => (
            <li key={i} className="leading-relaxed">
              {area}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        {convenio.downloadUrl && (
          <a
            href={convenio.downloadUrl}
            download
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
            style={{
              backgroundColor: "var(--token-accent)",
              color: "var(--regu-navy)",
            }}
          >
            Descargar memorándum
          </a>
        )}
        <Link
          to="/convenios"
          className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
          style={{
            borderColor: "var(--token-border)",
            color: "var(--token-text-primary)",
          }}
        >
          Volver a Convenios
        </Link>
      </div>
    </div>
  );
}
