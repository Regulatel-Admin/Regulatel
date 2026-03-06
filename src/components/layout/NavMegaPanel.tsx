import { Link } from "react-router-dom";
import { ExternalLink, Lock } from "lucide-react";
import type { NavigationColumn, NavigationItemLink } from "@/data/navigation";

interface NavMegaPanelProps {
  panelId: string;
  label: string;
  columns: NavigationColumn[];
  isOpen: boolean;
  onLinkClick: () => void;
}

/**
 * Single link — BEREC 1:1: 13px, line-height 28px, weight 600, hover underline + accent.
 */
function PanelLink({
  link,
  onLinkClick,
}: {
  link: NavigationItemLink;
  onLinkClick: () => void;
}) {
  const baseClass =
    "mega-menu-link block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--token-accent)]";
  const style = {
    fontFamily: "var(--token-font-body)",
    fontSize: "var(--mega-link-size)",
    fontWeight: "var(--mega-link-weight)",
    color: "var(--mega-link-color)",
    lineHeight: "var(--mega-link-line-height)",
    margin: 0,
    padding: 0,
  } as React.CSSProperties;

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onLinkClick}
        className={baseClass}
        style={style}
      >
        {link.label}
        <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 opacity-60" aria-hidden />
      </a>
    );
  }

  if (link.restricted) {
    return (
      <span className="block">
        <Link to={link.href} onClick={onLinkClick} className={baseClass} style={style}>
          <Lock className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 opacity-85" aria-hidden />
          {link.label}
        </Link>
        <span
          className="mt-0.5 block text-xs"
          style={{ color: "var(--regu-gray-500)", fontWeight: 500 }}
        >
          Acceso restringido
        </span>
      </span>
    );
  }

  return (
    <Link to={link.href} onClick={onLinkClick} className={baseClass} style={style}>
      {link.label}
    </Link>
  );
}

/**
 * Mega panel — BEREC 1:1: full-width, no shadow, border-bottom only,
 * wrapper 1200px, padding 38/24/44, column-gap 56px, vertical dividers.
 */
export default function NavMegaPanel({
  panelId,
  label,
  columns,
  isOpen,
  onLinkClick,
}: NavMegaPanelProps) {
  return (
    <div
      id={panelId}
      role="region"
      aria-label={label}
      className={[
        "absolute left-0 right-0 top-full z-50 w-full transition-[visibility,opacity,transform] duration-150 motion-reduce:transition-none",
        isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-0.5 opacity-0",
      ].join(" ")}
      style={{
        fontFamily: "var(--token-font-body)",
        background: "var(--mega-panel-bg)",
        borderBottom: "var(--mega-panel-border-bottom)",
      }}
    >
      <div
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns:
            columns.length === 3
              ? "1fr 1fr 1fr"
              : columns.length === 2
                ? "1fr 1fr"
                : `repeat(${columns.length}, 1fr)`,
          columnGap: "var(--mega-column-gap)",
          maxWidth: columns.length === 2 ? "720px" : "var(--mega-wrapper-max)",
          margin: "0 auto",
          paddingTop: "var(--mega-padding-y-top)",
          paddingBottom: "var(--mega-padding-y-bottom)",
          paddingLeft: "var(--mega-padding-x)",
          paddingRight: "var(--mega-padding-x)",
        }}
      >
        {columns.map((column, index) => (
          <div
            key={column.title}
            className="min-w-0"
            style={{
              paddingLeft: "var(--mega-col-padding-inline)",
              paddingRight: "var(--mega-col-padding-inline)",
              borderLeft: index === 0 ? "none" : "var(--mega-col-divider)",
            }}
          >
            <h3
              className="uppercase"
              style={{
                fontSize: "var(--mega-heading-size)",
                fontWeight: "var(--mega-heading-weight)",
                letterSpacing: "var(--mega-heading-spacing)",
                color: "var(--mega-heading-color)",
                marginBottom: "var(--mega-heading-margin-bottom)",
                marginTop: 0,
                fontFamily: "var(--token-font-body)",
              }}
            >
              {column.title}
            </h3>
            <ul className="list-none p-0" style={{ margin: 0 }}>
              {column.links.map((link) => (
                <li key={link.label} style={{ margin: 0 }}>
                  <PanelLink link={link} onLinkClick={onLinkClick} />
                  {link.subtitle && (
                    <span
                      className="mt-0.5 block text-xs"
                      style={{ color: "var(--regu-gray-500)", fontWeight: 500 }}
                    >
                      {link.subtitle}
                    </span>
                  )}
                  {link.children?.length ? (
                    <ul
                      className="list-none pl-4"
                      style={{
                        margin: 0,
                        marginTop: "2px",
                        borderLeft: "var(--mega-col-divider)",
                        paddingLeft: "12px",
                      }}
                    >
                      {link.children.map((child) => (
                        <li key={child.label} style={{ margin: 0 }}>
                          <PanelLink link={child} onLinkClick={onLinkClick} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
