import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { convenios } from "@/data/convenios";

interface ConveniosMenuProps {
  panelId: string;
  isOpen: boolean;
  onLinkClick: () => void;
  variant: "desktop" | "mobile";
}

/**
 * Dropdown de Convenios: cards con logo + acrónimo + descripción corta.
 */
export default function ConveniosMenu({
  panelId,
  isOpen,
  onLinkClick,
  variant,
}: ConveniosMenuProps) {
  const isDesktop = variant === "desktop";

  if (isDesktop) {
    return (
      <div
        id={panelId}
        role="region"
        aria-label="Convenios"
        className={[
          "absolute left-0 right-0 top-full z-50 w-full transition-[visibility,opacity,transform] duration-150 motion-reduce:transition-none",
          isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-0.5 opacity-0",
        ].join(" ")}
        style={{
          background: "#ffffff",
          borderBottom: "var(--mega-panel-border-bottom)",
          boxShadow: "var(--mega-panel-shadow)",
        }}
      >
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: "var(--mega-wrapper-max)",
            paddingTop: "var(--mega-padding-y-top)",
            paddingBottom: "var(--mega-padding-y-bottom)",
            paddingLeft: "var(--mega-padding-x)",
            paddingRight: "var(--mega-padding-x)",
          }}
        >
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <span
              className="h-4 w-[3px] rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <h3
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "var(--regu-gray-500)", fontFamily: "var(--token-font-body)", margin: 0 }}
            >
              Convenios de cooperación
            </h3>
          </div>

          {/* Grid 2x2 */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(2, 1fr)",
              maxWidth: "680px",
            }}
          >
            {convenios.map((c) => (
              <Link
                key={c.slug}
                to={`/convenios/${c.slug}`}
                onClick={onLinkClick}
                className="group flex items-start gap-4 rounded-xl border p-4 transition-all duration-150 hover:border-[rgba(68,137,198,0.35)] hover:bg-[rgba(68,137,198,0.04)] hover:shadow-[0_2px_10px_rgba(22,61,89,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  borderColor: "rgba(22,61,89,0.09)",
                  fontFamily: "var(--token-font-body)",
                }}
              >
                {/* Logo box */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-white p-2 transition-shadow group-hover:shadow-[0_1px_6px_rgba(22,61,89,0.10)]"
                  style={{ borderColor: "rgba(22,61,89,0.08)" }}
                >
                  <img
                    src={c.logoSrc}
                    alt=""
                    className="max-h-8 max-w-8 object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-bold leading-tight"
                      style={{
                        fontSize: "var(--mega-link-size)",
                        color: "var(--regu-navy)",
                      }}
                    >
                      {c.acronym}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      style={{ color: "var(--regu-blue)" }}
                      aria-hidden
                    />
                  </div>
                  <p
                    className="mt-0.5 line-clamp-2 leading-snug"
                    style={{
                      fontSize: "var(--mega-child-size, 12px)",
                      color: "var(--regu-gray-500)",
                    }}
                  >
                    {c.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA bottom */}
          <div
            className="mt-5 border-t pt-4"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
          >
            <Link
              to="/convenios"
              onClick={onLinkClick}
              className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-[0.10em] transition-all hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ color: "var(--regu-blue)" }}
            >
              Ver todos los convenios
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Mobile ── */
  const linkClass =
    "inline-flex items-center gap-3 w-full py-3 px-0 text-left rounded-md transition-colors hover:text-[var(--regu-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--regu-blue)]";
  const linkStyle = {
    fontFamily: "var(--token-font-body)",
    fontSize: "var(--mega-child-size)",
    fontWeight: 600,
    color: "var(--regu-gray-900)",
    lineHeight: 1.45,
  } as React.CSSProperties;

  return (
    <div id={panelId} className="space-y-0 border-t py-2" style={{ borderColor: "var(--mega-divider)" }}>
      <ul className="space-y-0 list-none p-0 m-0">
        {convenios.map((c) => (
          <li key={c.slug} className="list-none m-0">
            <Link to={`/convenios/${c.slug}`} onClick={onLinkClick} className={linkClass} style={linkStyle}>
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-white p-1.5"
                style={{ borderColor: "rgba(22,61,89,0.08)" }}
              >
                <img
                  src={c.logoSrc}
                  alt=""
                  className="max-h-6 max-w-6 object-contain"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <span>{c.acronym}</span>
            </Link>
          </li>
        ))}
        <li className="list-none m-0 mt-4 border-t pt-3" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <Link
            to="/convenios"
            onClick={onLinkClick}
            className={linkClass}
            style={{ ...linkStyle, fontWeight: 700, color: "var(--regu-blue)" }}
          >
            Ver todos los convenios
            <ArrowRight className="h-3.5 w-3.5 ml-auto" aria-hidden />
          </Link>
        </li>
      </ul>
    </div>
  );
}
