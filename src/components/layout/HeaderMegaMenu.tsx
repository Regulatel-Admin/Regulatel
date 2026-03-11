import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Lock } from "lucide-react";
import NavMegaPanel from "@/components/layout/NavMegaPanel";
import MegaMenuEvents from "@/components/layout/MegaMenuEvents";
import ConveniosMenu from "@/components/convenios/ConveniosMenu";
import TopBarBerecLike from "@/components/layout/TopBarBerecLike";
import { navigationItems } from "@/data/navigation";

/** Histéresis: evita flicker al hacer scroll cerca del umbral. Ocultar solo al bajar pasado HIDE; mostrar solo al subir hasta SHOW o menos. */
const SCROLL_THRESHOLD_HIDE = 80; // px — al bajar pasado esto se oculta la top bar
const SCROLL_THRESHOLD_SHOW = 8; // px — solo volver a mostrar cuando scroll esté casi en 0 (evita loop al colapsar: el reflow no dispara expand)
/** Tras navegar (menú → filtro), ignorar scroll unos ms para que el topbar no suba/baje de golpe. */
const NAV_STABILIZE_MS = 450;

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
  const ignoreScrollUntilRef = useRef(0);
  const onScrollRef = useRef<() => void>(() => {});

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
    // Evitar que el topbar colapse/expanda al instante tras navegar (ej. Recursos → Gestión?tipo=banco).
    ignoreScrollUntilRef.current = Date.now() + NAV_STABILIZE_MS;
    setIsCompact(false);
    lastCompactRef.current = false;
    // Tras el periodo de estabilización, sincronizar con el scroll actual (p. ej. si la página hizo auto-scroll).
    const t = setTimeout(() => {
      onScrollRef.current();
    }, NAV_STABILIZE_MS);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

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
    if (Date.now() < ignoreScrollUntilRef.current) return;
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

  onScrollRef.current = onScroll;

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
              className="flex flex-nowrap items-stretch justify-center"
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
        <div
          className="mobile-menu-scroll max-h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-label="Menú de navegación"
        >
        <ul className="space-y-2 pb-4" aria-label="Navegación móvil">
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
                  <div id={panelId} className="space-y-6 border-t px-4 py-5" style={{ borderColor: "var(--mega-divider)" }}>
                    {item.columns?.map((column) => (
                      <div key={column.title} className="space-y-3">
                        <h3
                          className="mega-panel-subheader uppercase"
                          style={{
                            fontFamily: "var(--token-font-body)",
                          }}
                        >
                          {column.title}
                        </h3>
                        <ul className="mega-panel-links list-none space-y-0 p-0" style={{ margin: 0 }}>
                          {column.links.map((link) => (
                            <li key={link.label}>
                              {link.external ? (
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="mega-menu-link block py-2.5 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                  style={{
                                    color: "var(--mega-link-color)",
                                  }}
                                >
                                  {link.label}
                                </a>
                              ) : (
                                <Link
                                  to={link.href}
                                  className="mega-menu-link block py-2.5 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                  style={{
                                    color: "var(--mega-link-color)",
                                  }}
                                >
                                  {link.label}
                                </Link>
                              )}
                              {link.subtitle && (
                                <span className="mega-panel-secondary mt-0.5 block pl-0">
                                  {link.subtitle}
                                </span>
                              )}
                              {link.children?.length ? (
                                (() => {
                                  const hasGroups = link.children.some((c) => "groupLabel" in c && c.groupLabel);
                                  const childList = (children: typeof link.children) => (
                                    <ul className="mega-panel-children mt-2 list-none border-l-2 pl-5 space-y-1" style={{ margin: 0, borderColor: "var(--regu-gray-100)" }}>
                                      {children.map((child) => (
                                        <li key={child.label} className="mega-panel-child-item">
                                          {child.external ? (
                                            <a
                                              href={child.href}
                                              target="_blank"
                                              rel="noreferrer noopener"
                                              className="mega-menu-link mega-panel-child-link block py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                                              style={{ color: "var(--mega-link-color)" }}
                                            >
                                              {child.label}
                                            </a>
                                          ) : child.restricted ? (
                                            <span className="block">
                                              <Link to={child.href} className="mega-menu-link mega-panel-child-link inline-flex items-center gap-1.5 py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]" style={{ color: "var(--mega-link-color)" }}>
                                                <Lock className="h-3.5 w-3.5 shrink-0 opacity-85" aria-hidden />
                                                {child.label}
                                              </Link>
                                              <span className="mega-panel-secondary mt-0.5 block">Acceso restringido</span>
                                            </span>
                                          ) : (
                                            <Link to={child.href} className="mega-menu-link mega-panel-child-link block py-2 transition-colors hover:text-[var(--mega-link-hover-color)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]" style={{ color: "var(--mega-link-color)" }}>
                                              {child.label}
                                            </Link>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                  if (!hasGroups) return childList(link.children);
                                  const groups: { label: string; items: typeof link.children }[] = [];
                                  const seen = new Set<string>();
                                  for (const child of link.children) {
                                    const g = child.groupLabel ?? "";
                                    if (!seen.has(g)) { seen.add(g); groups.push({ label: g, items: [] }); }
                                    groups.find((x) => x.label === g)!.items.push(child);
                                  }
                                  return (
                                    <div className="mt-4 space-y-6">
                                      {groups.map((group) => (
                                        <div key={group.label}>
                                          <p className="mega-panel-year-subtitle mb-2.5 font-semibold uppercase tracking-wider pl-5">
                                            {group.label}
                                          </p>
                                          {childList(group.items)}
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
                ) : null}
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </header>
  );
}
