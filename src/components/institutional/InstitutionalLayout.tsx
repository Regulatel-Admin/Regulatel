import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";

const CONTENT_MAX_WIDTH = "1180px";

interface InstitutionalLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumb: { label: string; path?: string }[];
  children: ReactNode;
}

export default function InstitutionalLayout({
  title,
  subtitle,
  breadcrumb,
  children,
}: InstitutionalLayoutProps) {
  return (
    <>
      <PageHero
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
        description={undefined}
      />
      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          fontFamily: "var(--token-font-body)",
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6 lg:px-8"
          style={{ maxWidth: CONTENT_MAX_WIDTH }}
        >
          {children}
          <footer
            className="mt-16 md:mt-20 lg:mt-24 pt-10 pb-4 border-t flex flex-wrap items-center gap-4"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Cierre de página"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 border-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.06)",
              }}
            >
              Inicio
            </Link>
            <Link
              to="/que-somos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Quiénes somos <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}

export function InstitutionalSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-12 md:mb-16 ${className}`}>
      {children}
    </section>
  );
}

/** Título de sección con barra accent izquierda — mismo sistema que el home */
export function InstitutionalH2({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div
        className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
        style={{ backgroundColor: "var(--regu-blue)" }}
        aria-hidden
      />
      <div>
        <h2
          className="text-xl font-bold md:text-2xl"
          style={{
            color: "var(--regu-navy)",
            fontFamily: "var(--token-font-heading)",
          }}
        >
          {children}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/** Card institucional con acento top opcional */
export function InstitutionalCard({
  children,
  className = "",
  accent = true,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      style={{
        borderColor: "rgba(22,61,89,0.10)",
        boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget.querySelector(".instCardAccent") as HTMLElement | null)?.style.setProperty("background-color", "var(--regu-lime)");
      }}
      onMouseLeave={(e) => {
        (e.currentTarget.querySelector(".instCardAccent") as HTMLElement | null)?.style.setProperty("background-color", "var(--regu-blue)");
      }}
    >
      {accent && (
        <div
          className="instCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
          style={{ backgroundColor: "var(--regu-blue)" }}
          aria-hidden
        />
      )}
      <div className={accent ? "pt-1" : ""}>
        {children}
      </div>
    </div>
  );
}

/** Lead editorial con borde izquierdo — para introducción de páginas */
export function InstitutionalLead({
  children,
  source,
}: {
  children: ReactNode;
  source?: string;
}) {
  return (
    <div
      className="mb-12 rounded-r-xl border-l-4 py-6 pl-6 pr-6 md:py-7 md:pl-8"
      style={{
        borderLeftColor: "var(--regu-blue)",
        backgroundColor: "rgba(68,137,198,0.04)",
      }}
    >
      <div
        className="text-lg leading-relaxed md:text-xl"
        style={{ color: "var(--regu-gray-800)" }}
      >
        {children}
      </div>
      {source && (
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "var(--regu-gray-500)" }}>
          Fuente: {source}
        </p>
      )}
    </div>
  );
}
