import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HeaderMegaMenu from "@/components/layout/HeaderMegaMenu";
import { SiteEditBar } from "@/components/site-edit/SiteEditBar";
import { SiteEditDrawer } from "@/components/site-edit/SiteEditDrawer";
import { useSiteEdit } from "@/contexts/SiteEditContext";

interface LayoutProps {
  children: ReactNode;
}

const FOOTER_LOGO_SRC = "/images/regulatel-logo.png";

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [footerLogoError, setFooterLogoError] = useState(false);
  const { enabled, target } = useSiteEdit();
  const drawerOpen = Boolean(enabled && target);

  const footerLinks = {
    institucional: [
      { label: t("common.footer.links.whatWeAre"), to: "/que-somos" },
      { label: t("common.footer.links.currentAuthorities"), to: "/autoridades" },
      { label: t("common.footer.links.members"), to: "/miembros" },
      { label: t("common.footer.links.executiveCommittee"), to: "/comite-ejecutivo" },
      { label: t("common.footer.links.workingGroups"), to: "/grupos-de-trabajo" },
      { label: t("common.footer.links.visionMission"), to: "/vision-mision" },
    ],
    contenido: [
      { label: t("common.footer.links.news"), to: "/noticias" },
      { label: t("common.footer.links.events"), to: "/eventos" },
      { label: t("common.footer.links.agreements"), to: "/convenios" },
      { label: t("common.footer.links.documentManagement"), to: "/gestion" },
      { label: t("common.footer.links.bestPractices"), to: "/micrositio-buenas-practicas" },
    ],
    soporte: [
      { label: t("common.footer.links.contact"), to: "/contacto" },
      { label: t("common.footer.links.membersArea"), to: "/login" },
      { label: t("common.privacyPolicy"), to: "/declaracion-de-privacidad" },
    ],
  };

  const socialLinks = [
    { href: "https://www.youtube.com/@Regulatel", label: t("common.footer.social.youtube"), key: "youtube" },
    { href: "https://www.flickr.com/photos/indotel/albums/72177720330864280/", label: t("common.footer.social.flickr"), key: "flickr" },
    { href: "https://x.com/regulatel", label: t("common.footer.social.x"), key: "x" },
    { href: "https://www.linkedin.com/company/regulatel/", label: t("common.footer.social.linkedin"), key: "linkedin" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "var(--token-page-bg)" }}>
      <SiteEditBar />
      <div
        className={
          drawerOpen
            ? "transition-[padding] duration-300 lg:pr-[26.5rem]"
            : "transition-[padding] duration-300"
        }
      >
        <HeaderMegaMenu />
        <SiteEditDrawer />
        <div id="contentRoot">
          <main>{children}</main>

        <footer
          style={{
            background: "var(--regu-navy-deep)",
            fontFamily: "var(--token-font-body)",
            borderTop: "4px solid var(--regu-blue)",
          }}
        >
          <div
            style={{
              maxWidth: "var(--token-container-max)",
              margin: "0 auto",
              gap: "40px",
            }}
            className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] px-4 py-10 md:px-6 md:py-[52px] md:pb-10 w-full"
          >
            <div>
              <Link to="/" className="inline-block" style={{ marginBottom: 16 }} aria-label={t("common.footer.homeAria")}>
                {footerLogoError ? (
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t("common.siteName")}
                  </span>
                ) : (
                  <img
                    src={FOOTER_LOGO_SRC}
                    alt={t("common.siteLogoAlt")}
                    style={{
                      height: 44,
                      width: "auto",
                      maxWidth: "180px",
                      objectFit: "contain",
                      filter: "brightness(0) invert(1)",
                      opacity: 0.95,
                    }}
                    onError={() => setFooterLogoError(true)}
                  />
                )}
              </Link>
              <p style={{ fontSize: "0.8125rem", lineHeight: 1.65, color: "rgba(255,255,255,0.55)", maxWidth: 240, marginBottom: 20 }}>
                {t("common.siteTagline")}
              </p>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: "var(--regu-lime)", marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 10 }}>
                {socialLinks.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.60)",
                      transition: "background 0.15s, color 0.15s",
                      textDecoration: "none",
                    }}
                    className="hover:!bg-[rgba(255,255,255,0.18)] hover:!text-white"
                  >
                    {s.key === "youtube" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.5 6.2s-.3-1.9-1.1-2.7c-1-.9-2.2-.9-2.7-1C17.1 2.3 12 2.3 12 2.3s-5.1 0-7.7.2c-.5.1-1.7.1-2.7 1C.8 4.3.5 6.2.5 6.2S.2 8.4.2 10.6v2.1c0 2.2.3 4.4.3 4.4s.3 1.9 1.1 2.7c1 .9 2.4.9 3 1 2.2.2 9.4.2 9.4.2s5.1 0 7.7-.2c.5-.1 1.7-.1 2.7-1 .8-.8 1.1-2.7 1.1-2.7s.3-2.2.3-4.4v-2.1c0-2.2-.3-4.4-.3-4.4zM9.7 15.5V8.4l7.3 3.6-7.3 3.5z" />
                      </svg>
                    )}
                    {s.key === "flickr" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm8 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0z" />
                      </svg>
                    )}
                    {s.key === "x" && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                    {s.key === "linkedin" && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: 16 }}>
                {t("common.footer.sections.whoWeAre")}
              </h3>
              <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {footerLinks.institucional.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.60)", textDecoration: "none", transition: "color 0.15s" }}
                    className="hover:!text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: 16 }}>
                {t("common.footer.sections.content")}
              </h3>
              <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {footerLinks.contenido.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.60)", textDecoration: "none", transition: "color 0.15s" }}
                    className="hover:!text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: 16 }}>
                {t("common.footer.sections.support")}
              </h3>
              <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {footerLinks.soporte.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.60)", textDecoration: "none", transition: "color 0.15s" }}
                    className="hover:!text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6 md:py-[18px]"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              maxWidth: "var(--token-container-max)",
              margin: "0 auto",
            }}
          >
            <p className="text-[0.7rem] md:text-[0.75rem] text-center md:text-left" style={{ color: "rgba(255,255,255,0.35)", margin: 0 }}>
              &copy; {new Date().getFullYear()} {t("common.copyright")}
            </p>
            <Link
              to="/declaracion-de-privacidad"
              style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.15s" }}
              className="hover:!text-white"
            >
              {t("common.privacyPolicy")}
            </Link>
          </div>
        </footer>
      </div>
      </div>
    </div>
  );
}
