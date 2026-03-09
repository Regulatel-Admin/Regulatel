import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface QuickLinkItem {
  label: string;
  subtitle?: string;
  href: string;
  external?: boolean;
  icon?: LucideIcon;
}

interface QuickLinksBarProps {
  items: QuickLinkItem[];
  /** Título de la sección */
  title?: string;
  /** URL del enlace "Ver más" (opcional) */
  seeMoreHref?: string;
}

/**
 * Barra de accesos rápidos estilo INDOTEL: tiles pegados sin gaps,
 * primer tile con forma de flecha a la derecha, resto rectángulos.
 * Responsive: 4 cols desktop, 2x2 tablet, 1 col mobile.
 */
export default function QuickLinksBar({
  items,
  title = "ACCESOS PRINCIPALES",
  seeMoreHref = "/recursos",
}: QuickLinksBarProps) {
  return (
    <section
      className="quickLinksBar w-full mt-0 mb-0 pt-14 pb-8 md:pt-16 md:pb-10"
      style={{
        backgroundColor: "var(--regu-offwhite)",
        fontFamily: "var(--token-font-body)",
      }}
      aria-label={title}
    >
      <div
        className="mx-auto w-full px-4 md:px-8 lg:px-10"
        style={{ maxWidth: "1520px" }}
      >
        {/* Encabezado: título + línea de apoyo + CTA integrado */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between md:mb-10">
          <div className="min-w-0 flex-1">
            <h2
              className="text-left font-bold uppercase tracking-wider"
              style={{
                fontFamily: "var(--token-font-heading)",
                fontSize: "var(--token-heading-h2-size)",
                color: "var(--regu-gray-900)",
              }}
            >
              {title}
            </h2>
            <p
              className="mt-1.5 text-sm text-[var(--regu-gray-500)]"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              Accesos rápidos a herramientas, documentos y recursos clave de REGULATEL.
            </p>
          </div>
          {seeMoreHref && (
            <Link
              to={seeMoreHref}
              className="quickLinksVerMas inline-flex shrink-0 items-center text-sm font-semibold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
              style={{ color: "var(--regu-blue)" }}
            >
              Ver más →
            </Link>
          )}
        </div>

        {/* Grid: bloque único con borde y sombra refinados */}
        <div
          className="quickLinksGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-2xl border"
          style={{
            borderColor: "rgba(22, 61, 89, 0.12)",
            boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)",
          }}
        >
          {items.map((item, index) => (
            <QuickLinkTile key={item.label} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinkTile({ item, index }: { item: QuickLinkItem; index: number }) {
  const Icon = item.icon;
  const isExternal = item.external ?? item.href.startsWith("http");

  // Alternancia de tonos turquesa/azul claro (institucional)
  const bgBase =
    index % 2 === 0
      ? "rgba(51, 164, 180, 0.18)"
      : "rgba(68, 137, 198, 0.14)";
  const bgHover =
    index % 2 === 0
      ? "rgba(51, 164, 180, 0.28)"
      : "rgba(68, 137, 198, 0.24)";

  const content = (
    <>
      {Icon && (
        <span
          className="flex-shrink-0 flex items-center justify-center mr-4"
          style={{ color: "var(--regu-navy)" }}
          aria-hidden
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </span>
      )}
      <span className="flex flex-col items-start justify-center text-left min-w-0">
        <span className="font-semibold text-base md:text-lg leading-tight block" style={{ color: "var(--regu-navy)" }}>
          {item.label}
        </span>
        {item.subtitle && (
          <span className="text-sm md:text-base font-normal mt-1 block" style={{ color: "var(--regu-gray-500)" }}>
            {item.subtitle}
          </span>
        )}
      </span>
    </>
  );

  const tileClass =
    "quickLinkTile flex items-center justify-center h-[100px] md:h-[120px] min-h-[100px] px-5 md:px-6 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-inset";

  const tileStyle: React.CSSProperties = {
    backgroundColor: bgBase,
  };

  const commonProps = {
    className: tileClass,
    style: tileStyle,
    "aria-label": item.subtitle ? `${item.label}: ${item.subtitle}` : item.label,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      el.style.backgroundColor = bgHover;
      el.style.boxShadow = "0 4px 16px rgba(22,61,89,0.1)";
      el.style.transform = "translateY(-1px)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      el.style.backgroundColor = bgBase;
      el.style.boxShadow = "none";
      el.style.transform = "translateY(0)";
    },
  };

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        {...commonProps}
      >
        <span className="flex items-center w-full max-w-full overflow-hidden">
          {content}
        </span>
      </a>
    );
  }

  return (
    <Link to={item.href} {...commonProps}>
      <span className="flex items-center w-full max-w-full overflow-hidden">
        {content}
      </span>
    </Link>
  );
}
