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
 * Single link — label + descripción opcional, hover pill institucional.
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

  const description = link.description ? (
    <span
      className="mega-panel-link-desc block leading-snug"
      style={{
        fontFamily: "var(--token-font-body)",
        fontSize: "var(--mega-secondary-size)",
        color: "var(--regu-gray-500)",
        fontWeight: 400,
        marginTop: "2px",
        paddingLeft: "10px",
      }}
    >
      {link.description}
    </span>
  ) : null;

  if (link.external) {
    return (
      <>
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          onClick={onLinkClick}
          className={className}
          style={style}
        >
          {link.label}
          <ExternalLink className="ml-1 inline-block h-3 w-3 opacity-50" aria-hidden />
        </a>
        {description}
      </>
    );
  }

  if (link.restricted) {
    return (
      <>
        <Link to={link.href} onClick={onLinkClick} className={className} style={style}>
          <Lock className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          {link.label}
        </Link>
        {description}
      </>
    );
  }

  return (
    <>
      <Link to={link.href} onClick={onLinkClick} className={className} style={style}>
        {link.label}
      </Link>
      {description}
    </>
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
        background: "#ffffff",
        borderBottom: "1px solid rgba(22,61,89,0.12)",
        boxShadow: "0 8px 32px rgba(22,61,89,0.10), 0 2px 8px rgba(22,61,89,0.06)",
        maxHeight: "var(--mega-panel-max-height, 62vh)",
        overflowY: "auto",
      }}
    >
      <div
        className="w-full mx-auto"
        style={{
          maxWidth: columns.length === 2 ? "720px" : "var(--mega-wrapper-max)",
          paddingTop: "var(--mega-padding-y-top)",
          paddingBottom: "var(--mega-padding-y-bottom)",
          paddingLeft: "var(--mega-padding-x)",
          paddingRight: "var(--mega-padding-x)",
        }}
      >
        <div
          className="w-full mega-panel-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              columns.length === 3
                ? "1fr 1fr 1fr"
                : columns.length === 2
                  ? "1fr 1fr"
                  : `repeat(${columns.length}, 1fr)`,
            columnGap: "var(--mega-column-gap)",
            alignItems: "stretch",
          }}
        >
        {columns.map((column, index) => (
          <div
            key={column.title}
            className={`min-w-0 flex flex-col ${index === columns.length - 1 && columns.length === 3 ? "mega-panel-col-last" : ""}`}
            style={{
              paddingLeft: "var(--mega-col-padding-inline)",
              paddingRight: "var(--mega-col-padding-inline)",
              borderLeft: index === 0 ? "none" : "1px solid rgba(22,61,89,0.08)",
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
                <li
                  key={link.label}
                  className={link.description ? "mega-panel-link-has-desc" : ""}
                  style={{ margin: 0 }}
                >
                  <PanelLink
                    link={link}
                    onLinkClick={onLinkClick}
                    variant={link.children?.length ? "category" : "default"}
                  />
                  {link.subtitle && !link.description && (
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
                        <div className="mega-panel-year-groups mt-5 space-y-6">
                          {groups.map((group) => (
                            <div key={group.label} className="mega-panel-year-group">
                              <p
                                className="mega-panel-year-subtitle"
                                style={{
                                  paddingLeft: "var(--mega-child-indent, 24px)",
                                }}
                              >
                                {group.label}
                              </p>
                              <ul
                                className="mega-panel-editions-list list-none"
                                style={{
                                  margin: 0,
                                  marginTop: "8px",
                                  paddingLeft: "var(--mega-child-indent, 20px)",
                                  borderLeft: "3px solid rgba(68, 137, 198, 0.2)",
                                }}
                              >
                                {group.items.map((child) => (
                                  <li
                                    key={child.label}
                                    className="mega-panel-edition-item mega-panel-child-item"
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
    </div>
  );
}
