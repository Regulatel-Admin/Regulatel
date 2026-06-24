import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, FileText, Users, Newspaper, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const quickLinks = [
    { label: t("pages.notFound.quickLinks.home"), to: "/", icon: <Home size={16} /> },
    { label: t("pages.notFound.quickLinks.news"), to: "/noticias", icon: <Newspaper size={16} /> },
    { label: t("pages.notFound.quickLinks.whoWeAre"), to: "/que-somos", icon: <Users size={16} /> },
    { label: t("pages.notFound.quickLinks.documents"), to: "/gestion", icon: <FileText size={16} /> },
    { label: t("pages.notFound.quickLinks.search"), to: "/search", icon: <Search size={16} /> },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        background: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        minHeight: "calc(100vh - 120px)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} />

      <div
        className="w-full px-4 py-12 md:py-[72px] md:pb-20"
        style={{
          maxWidth: 740,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "clamp(5rem, 14vw, 9rem)",
            fontWeight: 900,
            lineHeight: 1,
            color: "transparent",
            backgroundImage: "linear-gradient(135deg, var(--regu-blue) 0%, var(--regu-navy) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            marginBottom: 8,
            fontFamily: "var(--token-font-heading)",
            letterSpacing: "-0.04em",
          }}
        >
          404
        </div>

        <div
          style={{
            width: 48,
            height: 4,
            borderRadius: 2,
            background: "var(--regu-lime)",
            margin: "0 auto 32px",
          }}
        />

        <h1
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 700,
            color: "var(--regu-navy)",
            marginBottom: 12,
            fontFamily: "var(--token-font-heading)",
          }}
        >
          {t("pages.notFound.title")}
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            color: "var(--regu-gray-500)",
            maxWidth: 480,
            margin: "0 auto 12px",
          }}
        >
          {t("pages.notFound.message")}{" "}
          <code
            style={{
              fontSize: "0.875rem",
              background: "rgba(68,137,198,0.10)",
              color: "var(--regu-blue)",
              padding: "2px 8px",
              borderRadius: 6,
              fontFamily: "monospace",
            }}
          >
            {pathname}
          </code>{" "}
          {t("pages.notFound.messageSuffix")}
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--regu-gray-400)",
            marginBottom: 44,
          }}
        >
          {t("pages.notFound.hint")}
        </p>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 10,
            background: "var(--regu-blue)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9375rem",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(68,137,198,0.30)",
            transition: "background 0.15s, box-shadow 0.15s",
            marginBottom: 48,
          }}
          className="hover:!bg-[var(--regu-navy)]"
        >
          <Home size={17} />
          {t("common.backToHome")}
        </Link>

        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(22,61,89,0.10)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(22,61,89,0.06)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(22,61,89,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 16,
                borderRadius: 2,
                background: "var(--regu-blue)",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "var(--regu-gray-500)",
                margin: 0,
              }}
            >
              {t("pages.notFound.quickLinksTitle")}
            </p>
          </div>
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(22,61,89,0.05)",
                textDecoration: "none",
                color: "var(--regu-gray-700)",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "background 0.15s, color 0.15s",
              }}
              className="hover:!bg-[rgba(68,137,198,0.05)] hover:!text-[var(--regu-navy)]"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--regu-blue)" }}>{link.icon}</span>
                {link.label}
              </span>
              <ArrowRight size={14} style={{ color: "var(--regu-gray-300)" }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
