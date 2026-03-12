import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
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
  title?: string;
  seeMoreHref?: string;
}

export default function QuickLinksBar({
  items,
  title = "ACCESOS PRINCIPALES",
  seeMoreHref = "/recursos",
}: QuickLinksBarProps) {
  return (
    <section
      className="quickLinksBar w-full"
      style={{
        backgroundColor: "var(--regu-offwhite)",
        borderBottom: "1px solid rgba(22, 61, 89, 0.08)",
        fontFamily: "var(--token-font-body)",
        paddingTop: "56px",
        paddingBottom: "56px",
      }}
      aria-label={title}
    >
      <div
        className="mx-auto w-full px-4 md:px-8 lg:px-10"
        style={{ maxWidth: "1520px" }}
      >
        {/* Header — mismo peso visual que REGULATEL EN CIFRAS */}
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2
              className="text-left font-bold uppercase tracking-tight"
              style={{
                fontFamily: "var(--token-font-heading)",
                fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                color: "var(--regu-gray-900)",
              }}
            >
              {title}
            </h2>
            <p
              className="mt-2 text-base leading-relaxed"
              style={{ color: "var(--regu-gray-500)", maxWidth: "42ch" }}
            >
              Accesos rápidos a herramientas, documentos y recursos clave de REGULATEL.
            </p>
          </div>
          {seeMoreHref && (
            <Link
              to={seeMoreHref}
              className="quickLinksVerMas inline-flex shrink-0 items-center gap-1.5 text-base font-semibold transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
              style={{ color: "var(--regu-blue)" }}
            >
              Ver más <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Contenedor unificado de tiles */}
        <div
          className="quickLinksGrid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-2xl"
          style={{
            border: "1px solid rgba(22, 61, 89, 0.11)",
            boxShadow: "0 2px 8px rgba(22, 61, 89, 0.05), 0 8px 24px rgba(22, 61, 89, 0.07)",
          }}
        >
          {items.map((item, index) => (
            <QuickLinkTile key={item.label} item={item} index={index} total={items.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinkTile({
  item,
  index,
  total,
}: {
  item: QuickLinkItem;
  index: number;
  total: number;
}) {
  const Icon = item.icon;
  const isExternal = item.external ?? item.href.startsWith("http");
  const isLast = index === total - 1;

  const content = (
    <span className="quickLinkTileInner flex w-full items-center gap-5 px-6 md:px-7">
      {Icon && (
        <span
          className="quickLinkIconWrap flex shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          style={{
            width: "52px",
            height: "52px",
            backgroundColor: "rgba(22, 61, 89, 0.08)",
            color: "var(--regu-navy)",
          }}
          aria-hidden
        >
          <Icon style={{ width: "24px", height: "24px" }} strokeWidth={1.75} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start justify-center">
        <span
          className="block font-semibold leading-snug"
          style={{
            fontSize: "clamp(1rem, 1.2vw, 1.125rem)",
            color: "var(--regu-navy)",
            lineHeight: 1.28,
          }}
        >
          {item.label}
        </span>
        {item.subtitle && (
          <span
            className="mt-1 block text-sm leading-snug"
            style={{ color: "var(--regu-gray-500)" }}
          >
            {item.subtitle}
          </span>
        )}
      </span>
      {isExternal && (
        <ArrowUpRight
          className="quickLinkExtIcon shrink-0 opacity-25 transition-opacity duration-200"
          style={{ width: "16px", height: "16px", color: "var(--regu-blue)" }}
          aria-hidden
        />
      )}
    </span>
  );

  const dividerClass = !isLast
    ? "border-b border-b-[rgba(22,61,89,0.08)] sm:border-b-0 sm:border-r sm:border-r-[rgba(22,61,89,0.08)] lg:border-r lg:border-b-0"
    : "";

  const tileClass = [
    "quickLinkTile flex items-center cursor-pointer transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-inset",
    dividerClass,
  ]
    .filter(Boolean)
    .join(" ");

  const tileStyle: React.CSSProperties = {
    minHeight: "132px",
    backgroundColor: "rgba(68, 137, 198, 0.06)",
  };

  const hoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = "rgba(68, 137, 198, 0.13)";
      const iconWrap = e.currentTarget.querySelector(".quickLinkIconWrap") as HTMLElement;
      if (iconWrap) iconWrap.style.backgroundColor = "rgba(68, 137, 198, 0.18)";
      const extIcon = e.currentTarget.querySelector(".quickLinkExtIcon") as HTMLElement;
      if (extIcon) extIcon.style.opacity = "0.7";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = "rgba(68, 137, 198, 0.06)";
      const iconWrap = e.currentTarget.querySelector(".quickLinkIconWrap") as HTMLElement;
      if (iconWrap) iconWrap.style.backgroundColor = "rgba(22, 61, 89, 0.08)";
      const extIcon = e.currentTarget.querySelector(".quickLinkExtIcon") as HTMLElement;
      if (extIcon) extIcon.style.opacity = "0.25";
    },
  };

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={item.subtitle ? `${item.label}: ${item.subtitle}` : item.label}
        className={tileClass}
        style={tileStyle}
        {...hoverHandlers}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      aria-label={item.subtitle ? `${item.label}: ${item.subtitle}` : item.label}
      className={tileClass}
      style={tileStyle}
      {...hoverHandlers}
    >
      {content}
    </Link>
  );
}
