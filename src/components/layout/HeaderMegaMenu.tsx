import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import NavMegaPanel from "@/components/layout/NavMegaPanel";
import MegaMenuEvents from "@/components/layout/MegaMenuEvents";
import ConveniosMenu from "@/components/convenios/ConveniosMenu";
import TopBarBerecLike from "@/components/layout/TopBarBerecLike";
import { navigationItems } from "@/data/navigation";

/** Histéresis: evita flicker al hacer scroll cerca del umbral. Ocultar solo al bajar pasado HIDE; mostrar solo al subir hasta SHOW o menos. */
const SCROLL_THRESHOLD_HIDE = 80; // px — al bajar pasado esto se oculta la top bar
const SCROLL_THRESHOLD_SHOW = 24; // px — al subir hasta aquí o menos se muestra de nuevo

function isPathActive(currentPath: string, href?: string): boolean {
  if (!href) return false;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function HeaderMegaMenu() {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const topbarWrapperRef = useRef<HTMLDivElement>(null);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileAccordions, setOpenMobileAccordions] = useState<
    Record<string, boolean>
  >({});
  const getCompact = useCallback((scrollY: number) => {
    return scrollY > SCROLL_THRESHOLD_HIDE;
  }, []);
  const getExpand = useCallback((scrollY: number) => {
    return scrollY <= SCROLL_THRESHOLD_SHOW;
  }, []);
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    const y = window.scrollY;
    return y > SCROLL_THRESHOLD_HIDE;
  });
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCompactRef = useRef(
    typeof window !== "undefined" ? window.scrollY > SCROLL_THRESHOLD_HIDE : false
  );

  const activeByItemId = useMemo(() => {
    const map: Record<string, boolean> = {};

    for (const item of navigationItems) {
      let active = isPathActive(location.pathname, item.href);
      if (item.columns?.length) {
        for (const column of item.columns) {
          for (const link of column.links) {
            if (isPathActive(location.pathname, link.href)) {
              active = true;
            }
            if (link.children?.some((child) => isPathActive(location.pathname, child.href))) {
              active = true;
            }
          }
        }
      }
      map[item.id] = active;
    }

    return map;
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDesktopMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
        setMobileMenuOpen(false);
      }
    };

    const onClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // BEREC-like: TopBar se oculta al bajar (solo desktop). Histéresis para evitar flicker al scroll cerca del umbral.
  const onScroll = useCallback(() => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    if (!isDesktop) return;
    const y = window.scrollY;
    const currentlyCompact = lastCompactRef.current;
    let nextCompact: boolean;
    if (currentlyCompact) {
      nextCompact = !getExpand(y); // seguir compact hasta que y <= SHOW
    } else {
      nextCompact = getCompact(y); // expandido hasta que y > HIDE
    }
    if (nextCompact !== lastCompactRef.current) {
      lastCompactRef.current = nextCompact;
      if (nextCompact && topbarWrapperRef.current) {
        const active = document.activeElement as HTMLElement | null;
        if (active && topbarWrapperRef.current.contains(active)) {
          active.blur();
        }
      }
      setIsCompact(nextCompact);
    }
  }, [getCompact, getExpand]);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onScroll]);

  const toggleMobileAccordion = (id: string) => {
    setOpenMobileAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openItem = navigationItems.find((item) => item.id === openDesktopMenu);

  return (
    <header
      className="header-font-fixed sticky top-0 z-40 backdrop-blur-md"
      style={{
        fontFamily: "var(--token-font-heading)",
        backgroundColor: "var(--token-surface)",
      }}
    >
      <div ref={navRef} className="relative">
        {/* Top bar BEREC: se colapsa al hacer scroll (solo visible en scrollY ≈ 0) */}
        <div
          ref={topbarWrapperRef}
          className={["header-topbar-wrapper", isCompact ? "collapsed" : ""].filter(Boolean).join(" ")}
          aria-hidden={isCompact}
        >
          <TopBarBerecLike
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>

        {/* Fila nav + línea fina (solo desktop); menú Quiénes somos, Recursos, etc. */}
        <div
          className="hidden md:block"
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
              setOpenDesktopMenu(null);
              closeTimeoutRef.current = null;
            }, 130);
          }}
          style={{ borderBottom: "var(--header-separator)" }}
        >
          <nav
            aria-label="Navegación principal"
            className="mx-auto w-full px-4 md:px-6"
            style={{ maxWidth: "var(--token-container-max)" }}
          >
            <ul
              className="flex flex-wrap items-stretch justify-center"
              style={{
                gap: "var(--header-nav-item-gap)",
                paddingTop: "var(--header-nav-row-padding-top)",
                paddingBottom: "var(--header-nav-row-padding-bottom)",
                margin: 0,
                listStyle: "none",
              }}
            >
              {navigationItems.map((item) => {
                const hasPanel = Boolean(item.columns?.length) || item.id === "eventos" || item.id === "convenios";
                const isOpen = openDesktopMenu === item.id;
                const isActive = activeByItemId[item.id];
                const panelId = `${item.id}-mega-panel`;

                const showUnderline = isActive || isOpen;
                const navLinkBase =
                  "nav-item-underline inline-flex items-center gap-1 rounded-md px-4 py-2 uppercase transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--token-accent)]" +
                  (showUnderline ? " nav-item-active" : "");
                const navLinkStyle = {
                  fontSize: "var(--token-nav-font-size)",
                  fontWeight: "var(--token-nav-font-weight)",
                  letterSpacing: "var(--token-nav-letter-spacing)",
                  fontFamily: "var(--token-font-heading)",
                } as React.CSSProperties;

                return (
                  <li
                    key={item.id}
                    className="flex items-stretch"
                    onMouseEnter={() => {
                      if (hasPanel) setOpenDesktopMenu(item.id);
                    }}
                  >
                    {hasPanel && item.id !== "eventos" ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenDesktopMenu((current) => (current === item.id ? null : item.id))
                        }
                        className={
                          navLinkBase +
                          (isActive
                            ? " text-[var(--token-accent)]"
                            : " text-[var(--token-text-primary)] hover:text-[var(--token-accent)]")
                        }
                        style={navLinkStyle}
                      >
                        {item.label}
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform motion-reduce:transition-none",
                            isOpen ? "rotate-180" : "rotate-0",
                          ].join(" ")}
                        />
                      </button>
                    ) : hasPanel && item.id === "eventos" ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenDesktopMenu((current) => (current === item.id ? null : item.id))
                        }
                        className={
                          navLinkBase +
                          (isActive
                            ? " text-[var(--token-accent)]"
                            : " text-[var(--token-text-primary)] hover:text-[var(--token-accent)]")
                        }
                        style={navLinkStyle}
                      >
                        {item.label}
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform motion-reduce:transition-none",
                            isOpen ? "rotate-180" : "rotate-0",
                          ].join(" ")}
                        />
                      </button>
                    ) : (
                      <Link
                        to={item.href ?? "/"}
                        className={
                          navLinkBase +
                          (isActive
                            ? " text-[var(--token-accent)]"
                            : " text-[var(--token-text-primary)] hover:text-[var(--token-accent)]")
                        }
                        style={navLinkStyle}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {openItem?.id === "eventos" ? (
            <MegaMenuEvents
              panelId="eventos-mega-panel"
              isOpen={openDesktopMenu === "eventos"}
              onLinkClick={() => setOpenDesktopMenu(null)}
              variant="desktop"
            />
          ) : openItem?.id === "convenios" ? (
            <ConveniosMenu
              panelId="convenios-mega-panel"
              isOpen={openDesktopMenu === "convenios"}
              onLinkClick={() => setOpenDesktopMenu(null)}
              variant="desktop"
            />
          ) : openItem?.columns?.length ? (
            <NavMegaPanel
              panelId={`${openItem.id}-mega-panel`}
              label={openItem.panelLabel ?? openItem.label}
              columns={openItem.columns}
              isOpen={Boolean(openDesktopMenu)}
              onLinkClick={() => setOpenDesktopMenu(null)}
            />
          ) : null}
        </div>
      </div>

      <div
        className={[
          "border-t bg-white px-4 py-4 md:hidden",
          mobileMenuOpen ? "block" : "hidden",
        ].join(" ")}
        style={{ borderColor: "var(--token-border)" }}
      >
        <ul className="space-y-2" aria-label="Navegación móvil">
          {navigationItems.map((item) => {
            const hasPanel = Boolean(item.columns?.length) || item.id === "eventos";
            const expanded = openMobileAccordions[item.id] ?? false;
            const panelId = `${item.id}-mobile-panel`;
            const isActive = activeByItemId[item.id];

            return (
              <li key={item.id} className="rounded-lg border bg-slate-50/60 px-3 py-2" style={{ borderColor: "var(--token-border)" }}>
                <div className="flex items-center justify-between">
                  {hasPanel ? (
                    <button
                      type="button"
                      className={[
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]",
                        isActive ? "font-semibold" : "font-medium",
                      ].join(" ")}
                      style={{
                        fontSize: "var(--token-nav-font-size)",
                        color: isActive ? "var(--token-accent)" : "var(--token-text-primary)",
                      }}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggleMobileAccordion(item.id)}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.href ?? "/"}
                      className="w-full rounded-lg px-3 py-2 font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                      style={{
                        fontSize: "var(--token-nav-font-size)",
                        color: isActive ? "var(--token-accent)" : "var(--token-text-primary)",
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>

                {hasPanel && expanded && item.id === "eventos" ? (
                  <div id={panelId} className="border-t px-3 py-2" style={{ borderColor: "var(--mega-divider)" }}>
                    <MegaMenuEvents
                      panelId={panelId}
                      isOpen
                      onLinkClick={() => {
                        setOpenDesktopMenu(null);
                        setMobileMenuOpen(false);
                      }}
                      variant="mobile"
                    />
                  </div>
                ) : hasPanel && expanded && item.id === "convenios" ? (
                  <div id={panelId} className="px-3">
                    <ConveniosMenu
                      panelId={panelId}
                      isOpen
                      onLinkClick={() => {
                        setOpenDesktopMenu(null);
                        setMobileMenuOpen(false);
                      }}
                      variant="mobile"
                    />
                  </div>
                ) : hasPanel && expanded && item.columns?.length ? (
                  <div id={panelId} className="space-y-4 border-t px-3 py-4" style={{ borderColor: "var(--mega-divider)" }}>
                    {item.columns?.map((column) => (
                      <div key={column.title} className="space-y-2">
                        <h3
                          className="uppercase"
                          style={{
                            fontSize: "var(--mega-heading-size)",
                            fontWeight: "var(--mega-heading-weight)",
                            letterSpacing: "var(--mega-heading-spacing)",
                            color: "var(--mega-heading-color)",
                            marginBottom: "var(--mega-heading-margin-bottom)",
                          }}
                        >
                          {column.title}
                        </h3>
                        <ul className="list-none space-y-0 p-0" style={{ margin: 0 }}>
                          {column.links.map((link) => (
                            <li key={link.label}>
                              {link.external ? (
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="block py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                  style={{
                                    fontSize: "var(--mega-link-size)",
                                    fontWeight: "var(--mega-link-weight)",
                                    color: "var(--mega-link-color)",
                                    lineHeight: "var(--mega-link-line-height)",
                                  }}
                                >
                                  {link.label}
                                </a>
                              ) : (
                                <Link
                                  to={link.href}
                                  className="block py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                  style={{
                                    fontSize: "var(--mega-link-size)",
                                    fontWeight: "var(--mega-link-weight)",
                                    color: "var(--mega-link-color)",
                                    lineHeight: "var(--mega-link-line-height)",
                                  }}
                                >
                                  {link.label}
                                </Link>
                              )}
                              {link.children?.length ? (
                                <ul className="mt-0 list-none border-l pl-4" style={{ margin: 0, borderColor: "var(--mega-divider)" }}>
                                  {link.children.map((child) => (
                                    <li key={child.label}>
                                      {child.external ? (
                                        <a
                                          href={child.href}
                                          target="_blank"
                                          rel="noreferrer noopener"
                                          className="block py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                          style={{
                                            fontSize: "var(--mega-link-size)",
                                            fontWeight: "var(--mega-link-weight)",
                                            color: "var(--mega-link-color)",
                                            lineHeight: "var(--mega-link-line-height)",
                                          }}
                                        >
                                          {child.label}
                                        </a>
                                      ) : (
                                        <Link
                                          to={child.href}
                                          className="block py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                          style={{
                                            fontSize: "var(--mega-link-size)",
                                            fontWeight: "var(--mega-link-weight)",
                                            color: "var(--mega-link-color)",
                                            lineHeight: "var(--mega-link-line-height)",
                                          }}
                                        >
                                          {child.label}
                                        </Link>
                                      )}
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
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
