import { Link } from "react-router-dom";
import { useMergedEvents } from "@/contexts/AdminDataContext";
import { hasEventPassed, type HomeEventItem } from "@/data/events";
import { formatBERECDate } from "@/utils/date";

const MAX_UPCOMING = 6;
/** Magenta institucional para fechas (no lime). */
const DATE_COLOR = "var(--news-accent)";

function getUpcomingEvents(events: HomeEventItem[]): HomeEventItem[] {
  const upcoming = events.filter(
    (e) => e.status === "proxima" && !hasEventPassed(e)
  );
  return [...upcoming]
    .sort((a, b) => {
      const da = a.startDate ?? "9999-12-31";
      const db = b.startDate ?? "9999-12-31";
      return da.localeCompare(db);
    })
    .slice(0, MAX_UPCOMING);
}

interface MegaMenuEventsProps {
  isOpen: boolean;
  panelId: string;
  onLinkClick?: () => void;
  /** Mobile: render compact (stacked). Desktop: 2 columns. */
  variant?: "desktop" | "mobile";
}

/**
 * Mega-menú EVENTOS estilo BEREC: columna izquierda "All Events" + links,
 * columna derecha "UPCOMING EVENTS" con lista de próximos (fecha magenta + título negro).
 */
export default function MegaMenuEvents({
  isOpen,
  panelId,
  onLinkClick,
  variant = "desktop",
}: MegaMenuEventsProps) {
  const events = useMergedEvents();
  const upcoming = getUpcomingEvents(events);

  const panelClass =
    variant === "mobile"
      ? "w-full"
      : "absolute left-0 right-0 top-full z-50 w-full transition-[visibility,opacity,transform] duration-150 motion-reduce:transition-none " +
        (isOpen
          ? "visible translate-y-0 opacity-100"
          : "invisible -translate-y-0.5 opacity-0");

  const content = (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: variant === "mobile" ? "none" : "var(--token-container-max, 1160px)",
        padding: variant === "mobile" ? "12px 0 16px" : "28px 24px 36px",
        boxShadow: variant === "mobile" ? "none" : "0 12px 30px rgba(0,0,0,0.12)",
        background: variant === "mobile" ? "transparent" : "var(--regu-white)",
        borderBottom: variant === "mobile" ? "none" : "1px solid rgba(22, 61, 89, 0.10)",
      }}
    >
      {variant === "mobile" ? (
        <div className="space-y-6">
          <div>
            <h3
              className="uppercase font-bold mb-3"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.12em",
                color: "var(--regu-blue)",
              }}
            >
              All Events
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              <li>
                <Link
                  to="/eventos"
                  onClick={onLinkClick}
                  className="block py-2 font-semibold text-[0.8125rem] hover:underline"
                  style={{
                    color: "var(--regu-gray-900)",
                    textUnderlineOffset: 4,
                  }}
                >
                  Ver todos los eventos
                </Link>
              </li>
              <li>
                <Link
                  to="/eventos?tab=proximos"
                  onClick={onLinkClick}
                  className="block py-2 font-semibold text-[0.8125rem] hover:underline"
                  style={{
                    color: "var(--regu-gray-900)",
                    textUnderlineOffset: 4,
                  }}
                >
                  Próximos eventos
                </Link>
              </li>
              <li>
                <Link
                  to="/eventos?tab=pasados"
                  onClick={onLinkClick}
                  className="block py-2 font-semibold text-[0.8125rem] hover:underline"
                  style={{
                    color: "var(--regu-gray-900)",
                    textUnderlineOffset: 4,
                  }}
                >
                  Eventos pasados
                </Link>
              </li>
            </ul>
          </div>
          <div className="border-t pt-4" style={{ borderColor: "var(--regu-gray-100)" }}>
            <h3
              className="uppercase font-bold mb-3"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.12em",
                color: "var(--regu-gray-900)",
              }}
            >
              Upcoming Events
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm mb-2" style={{ color: "var(--regu-gray-500)" }}>
                No hay eventos próximos.
              </p>
            ) : (
              <ul className="list-none p-0 m-0 space-y-0">
                {upcoming.map((ev, i) => (
                  <li
                    key={`${ev.title}-${ev.year}-${i}`}
                    className="border-b py-3 first:pt-0"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  >
                    <Link
                      to={`/eventos?q=${encodeURIComponent(ev.title)}`}
                      onClick={onLinkClick}
                      className="block group"
                    >
                      {ev.startDate && (
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: DATE_COLOR }}
                        >
                          {formatBERECDate(ev.startDate)}
                        </span>
                      )}
                      <span
                        className="block mt-0.5 text-base font-semibold leading-snug group-hover:underline"
                        style={{
                          color: "var(--regu-gray-900)",
                          textUnderlineOffset: 4,
                        }}
                      >
                        {ev.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {upcoming.length > 0 && (
              <Link
                to="/eventos"
                onClick={onLinkClick}
                className="inline-block mt-3 text-sm font-semibold"
                style={{ color: "var(--regu-blue)" }}
              >
                Ver todos
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: "minmax(0, 0.3fr) minmax(0, 0.7fr)",
          }}
        >
          {/* Columna izquierda: All Events */}
          <div>
            <h3
              className="uppercase font-bold mb-4"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.12em",
                color: "var(--regu-blue)",
              }}
            >
              All Events
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              <li>
                <Link
                  to="/eventos"
                  onClick={onLinkClick}
                  className="block py-1.5 font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
                  style={{
                    fontSize: "0.8125rem",
                    lineHeight: 1.4,
                    color: "var(--regu-gray-900)",
                    textUnderlineOffset: 4,
                  }}
                >
                  Ver todos los eventos
                </Link>
              </li>
              <li>
                <Link
                  to="/eventos?tab=proximos"
                  onClick={onLinkClick}
                  className="block py-1.5 font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
                  style={{
                    fontSize: "0.8125rem",
                    lineHeight: 1.4,
                    color: "var(--regu-gray-900)",
                    textUnderlineOffset: 4,
                  }}
                >
                  Próximos eventos
                </Link>
              </li>
              <li>
                <Link
                  to="/eventos?tab=pasados"
                  onClick={onLinkClick}
                  className="block py-1.5 font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
                  style={{
                    fontSize: "0.8125rem",
                    lineHeight: 1.4,
                    color: "var(--regu-gray-900)",
                    textUnderlineOffset: 4,
                  }}
                >
                  Eventos pasados
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna derecha: UPCOMING EVENTS */}
          <div style={{ borderLeft: "1px solid var(--regu-gray-100)", paddingLeft: "28px" }}>
            <h3
              className="uppercase font-bold mb-4"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                color: "var(--regu-gray-900)",
              }}
            >
              UPCOMING EVENTS
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm mb-3" style={{ color: "var(--regu-gray-500)" }}>
                No hay eventos próximos.
              </p>
            ) : (
              <ul className="list-none p-0 m-0">
                {upcoming.map((ev, i) => (
                  <li
                    key={`${ev.title}-${ev.year}-${i}`}
                    className="border-b py-4 first:pt-0 last:border-b-0"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  >
                    <Link
                      to={`/eventos?q=${encodeURIComponent(ev.title)}`}
                      onClick={onLinkClick}
                      className="block group"
                    >
                      {ev.startDate && (
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: DATE_COLOR }}
                        >
                          {formatBERECDate(ev.startDate)} |
                        </span>
                      )}
                      <span
                        className="block mt-1 text-base font-semibold leading-snug group-hover:underline"
                        style={{
                          color: "var(--regu-gray-900)",
                          textUnderlineOffset: 4,
                          fontSize: "1rem",
                        }}
                      >
                        {ev.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {upcoming.length > 0 && (
              <Link
                to="/eventos"
                onClick={onLinkClick}
                className="inline-block mt-4 text-sm font-semibold transition-colors hover:underline"
                style={{ color: "var(--regu-blue)", textUnderlineOffset: 4 }}
              >
                Ver todos
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      id={panelId}
      role="region"
      aria-label="Eventos"
      className={panelClass}
    >
      {content}
    </div>
  );
}
