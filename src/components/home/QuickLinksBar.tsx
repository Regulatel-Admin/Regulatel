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
      className="quickLinksBar w-full mt-0 mb-0 py-12 md:py-14"
      style={{
        backgroundColor: "var(--regu-offwhite)",
        fontFamily: "var(--token-font-body)",
      }}
      aria-label={title}
    >
      <div
        className="mx-auto w-full px-4 md:px-6"
        style={{ maxWidth: "1200px" }}
      >
        <h2
          className="mb-6 md:mb-8 text-left font-bold uppercase tracking-wider"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "var(--token-heading-h2-size)",
            color: "var(--regu-gray-900)",
          }}
        >
          {title}
        </h2>

        {/* Grid: sin gap para tiles pegados; en mobile se apilan */}
        <div className="quickLinksGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-xl border border-[var(--regu-gray-100)] shadow-[0_4px_20px_rgba(22,61,89,0.08)]">
          {items.map((item, index) => (
            <QuickLinkTile key={item.label} item={item} index={index} />
          ))}
        </div>

        {seeMoreHref && (
          <div className="mt-6 text-right">
            <Link
              to={seeMoreHref}
              className="text-sm font-semibold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
              style={{ color: "var(--regu-blue)" }}
            >
              Ver más →
            </Link>
          </div>
        )}
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
          className="flex-shrink-0 flex items-center justify-center mr-3"
          style={{ color: "var(--regu-navy)" }}
          aria-hidden
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </span>
      )}
      <span className="flex flex-col items-start justify-center text-left min-w-0">
        <span className="font-semibold text-sm md:text-base leading-tight block" style={{ color: "var(--regu-navy)" }}>
          {item.label}
        </span>
        {item.subtitle && (
          <span className="text-xs md:text-sm font-normal mt-0.5 block" style={{ color: "var(--regu-gray-500)" }}>
            {item.subtitle}
          </span>
        )}
      </span>
    </>
  );

  const tileClass =
    "quickLinkTile flex items-center justify-center h-[90px] md:h-[100px] min-h-[90px] px-4 md:px-5 cursor-pointer transition-all duration-200 hover:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-inset";

  const tileStyle: React.CSSProperties = {
    backgroundColor: bgBase,
  };

  const commonProps = {
    className: tileClass,
    style: tileStyle,
    "aria-label": item.subtitle ? `${item.label}: ${item.subtitle}` : item.label,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = bgHover;
      e.currentTarget.style.boxShadow = "0 2px 12px rgba(22,61,89,0.12)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = bgBase;
      e.currentTarget.style.boxShadow = "none";
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
