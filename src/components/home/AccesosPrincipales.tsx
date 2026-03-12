import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface AccessCardItem {
  title: string;
  shortDescription: string;
  href: string;
  icon: LucideIcon;
}

interface AccessCardProps {
  item: AccessCardItem;
}

/* Paleta Accesos Principales — identidad visual REGULATEL (logo: azul #488CC8, lima #CAD536) */
const ACCESOS_BG_SECTION = "#EAF3F8";
const ACCESOS_CARD_BG = "#F3F8FB";
const ACCESOS_CARD_BORDER = "#D4E3EE";
const ACCESOS_ICON_BG = "#DFECF5";
const ACCESOS_ICON_TITLE = "#163E67";
const ACCESOS_LINK = "#488CC8";

function AccessCard({ item }: AccessCardProps) {
  const Icon = item.icon;
  const isExternal = item.href.startsWith("http");
  const linkClass =
    "accessCardLink mt-3 inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2";
  const linkStyle = { color: ACCESOS_LINK };

  return (
    <article
      className="accessCard h-full rounded-2xl border p-5 shadow-sm transition-all duration-200"
      style={{
        backgroundColor: ACCESOS_CARD_BG,
        borderColor: ACCESOS_CARD_BORDER,
        borderWidth: "1px",
      }}
    >
      <div className="flex h-full flex-col">
        <div
          className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: ACCESOS_ICON_BG,
            color: ACCESOS_ICON_TITLE,
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <h3
          className="font-bold"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "var(--token-heading-h3-size)",
            color: ACCESOS_ICON_TITLE,
          }}
        >
          {item.title}
        </h3>
        <p
          className="mt-1 flex-1 text-sm leading-snug"
          style={{ color: "var(--regu-gray-500)" }}
        >
          {item.shortDescription}
        </p>
        {isExternal ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className={linkClass}
            style={linkStyle}
          >
            Ver más →
          </a>
        ) : (
          <Link to={item.href} className={linkClass} style={linkStyle}>
            Ver más →
          </Link>
        )}
      </div>
    </article>
  );
}

interface AccesosPrincipalesProps {
  items: AccessCardItem[];
}

/**
 * Sección "ACCESOS PRINCIPALES" debajo del hero: grid de 6 tarjetas (3x2 desktop, 2 tablet, 1 mobile).
 */
export default function AccesosPrincipales({ items }: AccesosPrincipalesProps) {
  return (
    <section
      className="accessSection w-full border-b py-12 md:py-14"
      style={{
        backgroundColor: ACCESOS_BG_SECTION,
        borderColor: ACCESOS_CARD_BORDER,
      }}
    >
      <div
        className="mx-auto w-full px-4 md:px-6"
        style={{ maxWidth: "var(--token-container-max)" }}
      >
        <h2
          className="mb-8 text-left font-bold uppercase tracking-wider"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "var(--token-heading-h2-size)",
            color: ACCESOS_ICON_TITLE,
          }}
        >
          ACCESOS PRINCIPALES
        </h2>
        <div className="accessGrid grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AccessCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
