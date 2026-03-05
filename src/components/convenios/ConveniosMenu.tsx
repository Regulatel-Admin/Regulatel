import { Link } from "react-router-dom";
import { convenios } from "@/data/convenios";

interface ConveniosMenuProps {
  panelId: string;
  isOpen: boolean;
  onLinkClick: () => void;
  variant: "desktop" | "mobile";
}

/**
 * Dropdown de Convenios: BEREC, ICANN, FCC, COMTELCA + "Ver todos".
 * Ancho fijo 280–340px en desktop; en mobile es accordion dentro del menú.
 */
export default function ConveniosMenu({
  panelId,
  isOpen,
  onLinkClick,
  variant,
}: ConveniosMenuProps) {
  const isDesktop = variant === "desktop";

  const linkClass =
    "block w-full py-2.5 px-3 text-left rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--token-accent)]";
  const linkStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--token-text-primary)",
    lineHeight: 1.35,
  } as React.CSSProperties;
  const linkHover = "hover:bg-[var(--regu-gray-100)] hover:text-[var(--regu-blue)]";

  const content = (
    <>
      {convenios.map((c) => (
        <li key={c.slug} className="list-none m-0">
          <Link
            to={`/convenios/${c.slug}`}
            onClick={onLinkClick}
            className={`${linkClass} ${linkHover}`}
            style={linkStyle}
          >
            {c.acronym}
          </Link>
        </li>
      ))}
      <li className="list-none m-0 border-t border-[var(--regu-gray-100)] mt-2 pt-2">
        <Link
          to="/convenios"
          onClick={onLinkClick}
          className={`${linkClass} ${linkHover} font-semibold`}
          style={{ ...linkStyle, color: "var(--regu-blue)" }}
        >
          Ver todos los convenios
        </Link>
      </li>
    </>
  );

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
          background: "var(--mega-panel-bg)",
          borderBottom: "var(--mega-panel-border-bottom)",
        }}
      >
        <div
          className="mx-auto py-6"
          style={{
            maxWidth: "var(--token-container-max)",
            paddingLeft: "var(--mega-padding-x)",
            paddingRight: "var(--mega-padding-x)",
          }}
        >
          <ul
            className="flex flex-col gap-0 w-full"
            style={{ width: "min(100%, 320px)", margin: 0, padding: 0 }}
          >
            {content}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div id={panelId} className="space-y-0 border-t py-2" style={{ borderColor: "var(--mega-divider)" }}>
      <ul className="space-y-0 list-none p-0 m-0">{content}</ul>
    </div>
  );
}
