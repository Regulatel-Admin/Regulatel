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
 * Single link — legible, jerarquía clara (categoría vs hijo vs secundario).
 */
function PanelLink({
  link,
  onLinkClick,
  variant = "default",
}: {
  link: NavigationItemLink;
  onLinkClick: () => void;
  variant?: "category" | "child" | "default";
}) {
  const baseClass =
    "mega-menu-link block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--token-accent)]";
  const variantClass =
    variant === "category"
      ? "mega-panel-category-link"
      : variant === "child"
        ? "mega-panel-child-link"
        : "";
  const style = {
    fontFamily: "var(--token-font-body)",
    fontSize: "var(--mega-link-size)",
    fontWeight: "var(--mega-link-weight)",
    color: "var(--mega-link-color)",
    lineHeight: "var(--mega-link-line-height)",
    margin: 0,
    padding: 0,
  } as React.CSSProperties;

  const className = [baseClass, variantClass].filter(Boolean).join(" ");

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onLinkClick}
        className={className}
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
        <Link to={link.href} onClick={onLinkClick} className={className} style={style}>
          <Lock className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 opacity-85" aria-hidden />
          {link.label}
        </Link>
        <span className="mega-panel-secondary mt-1.5 block">
          Acceso restringido
        </span>
      </span>
    );
  }

  return (
    <Link to={link.href} onClick={onLinkClick} className={className} style={style}>
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
        "mega-panel-viewport absolute left-0 right-0 top-full z-50 w-full transition-[visibility,opacity,transform] duration-150 motion-reduce:transition-none",
        isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-0.5 opacity-0",
      ].join(" ")}
      style={{
        fontFamily: "var(--token-font-body)",
        background: "var(--mega-panel-bg)",
        borderBottom: "var(--mega-panel-border-bottom)",
        maxHeight: "calc(100vh - var(--mega-panel-viewport-offset, 140px))",
        overflowY: "auto",
      }}
    >
      <div
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns:
            columns.length === 3
              ? "1.08fr 1fr 0.92fr"
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
          alignItems: "start",
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
              className="mega-panel-subheader uppercase"
              style={{
                marginTop: 0,
                fontFamily: "var(--token-font-body)",
              }}
            >
              {column.title}
            </h3>
            <ul className="mega-panel-links list-none p-0" style={{ margin: 0 }}>
              {column.links.map((link) => (
                <li key={link.label} style={{ margin: 0 }}>
                  <PanelLink
                    link={link}
                    onLinkClick={onLinkClick}
                    variant={link.children?.length ? "category" : "default"}
                  />
                  {link.subtitle && (
                    <span className="mega-panel-secondary mt-1.5 block">
                      {link.subtitle}
                    </span>
                  )}
                  {link.children?.length ? (
                    (() => {
                      const hasGroups = link.children.some((c) => c.groupLabel);
                      if (!hasGroups) {
                        return (
                          <ul
                            className="mega-panel-children list-none"
                            style={{
                              margin: 0,
                              marginTop: "10px",
                              paddingLeft: "var(--mega-child-indent, 20px)",
                              borderLeft: "2px solid var(--regu-gray-100)",
                            }}
                          >
                            {link.children.map((child) => (
                              <li
                                key={child.label}
                                className="mega-panel-child-item"
                                style={{
                                  margin: 0,
                                  marginBottom: "var(--mega-child-spacing, 10px)",
                                }}
                              >
                                <PanelLink
                                  link={child}
                                  onLinkClick={onLinkClick}
                                  variant="child"
                                />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      const groups: { label: string; items: typeof link.children }[] = [];
                      const seen = new Set<string>();
                      for (const child of link.children) {
                        const g = child.groupLabel ?? "";
                        if (!seen.has(g)) {
                          seen.add(g);
                          groups.push({ label: g, items: [] });
                        }
                        groups.find((x) => x.label === g)!.items.push(child);
                      }
                      return (
                        <div className="mt-4 space-y-5">
                          {groups.map((group) => (
                            <div key={group.label}>
                              <p
                                className="mega-panel-year-subtitle mb-2 font-semibold uppercase tracking-wider"
                                style={{
                                  paddingLeft: "var(--mega-child-indent, 24px)",
                                }}
                              >
                                {group.label}
                              </p>
                              <ul
                                className="mega-panel-children list-none"
                                style={{
                                  margin: 0,
                                  paddingLeft: "var(--mega-child-indent, 20px)",
                                  borderLeft: "2px solid var(--regu-gray-100)",
                                }}
                              >
                                {group.items.map((child) => (
                                  <li
                                    key={child.label}
                                    className="mega-panel-child-item"
                                    style={{
                                      margin: 0,
                                      marginBottom: "var(--mega-child-spacing, 10px)",
                                    }}
                                  >
                                    <PanelLink
                                      link={child}
                                      onLinkClick={onLinkClick}
                                      variant="child"
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      );
                    })()
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
