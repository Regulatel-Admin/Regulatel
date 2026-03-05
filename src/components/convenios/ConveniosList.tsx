import { Link } from "react-router-dom";
import type { Convenio } from "@/data/convenios";

interface ConveniosListProps {
  convenios: Convenio[];
}

/**
 * Lista de convenios: logo izquierda, contenido derecha, CTA. Estilo BEREC, cards limpias.
 */
export default function ConveniosList({ convenios }: ConveniosListProps) {
  return (
    <ul className="list-none p-0 m-0 space-y-6">
      {convenios.map((c) => (
        <li key={c.slug} className="list-none m-0">
          <article
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 p-6 sm:p-8 rounded-xl border bg-white transition-shadow hover:shadow-[var(--token-shadow-hover)]"
            style={{
              borderColor: "var(--token-border)",
              boxShadow: "var(--token-shadow-card)",
            }}
          >
            <div className="flex-shrink-0 flex items-center justify-center sm:justify-start w-full sm:w-40 h-28 sm:h-32">
              <img
                src={c.logoSrc}
                alt={`Logo ${c.acronym}`}
                className="max-h-[70px] w-auto object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold tracking-tight m-0 mb-1" style={{ color: "var(--token-text-primary)" }}>
                {c.title}
              </h2>
              <p className="text-sm font-medium m-0 mb-3" style={{ color: "var(--regu-blue)" }}>
                {c.acronym}
              </p>
              <p className="text-base leading-relaxed m-0 mb-5" style={{ color: "var(--token-text-secondary)" }}>
                {c.shortDescription}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/convenios/${c.slug}`}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
                  style={{
                    backgroundColor: "var(--token-accent)",
                    color: "var(--regu-navy)",
                  }}
                >
                  Ver convenio
                </Link>
                {c.downloadUrl && (
                  <a
                    href={c.downloadUrl}
                    download
                    className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
                    style={{
                      borderColor: "var(--token-border)",
                      color: "var(--token-text-primary)",
                    }}
                  >
                    Descargar memorándum
                  </a>
                )}
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
