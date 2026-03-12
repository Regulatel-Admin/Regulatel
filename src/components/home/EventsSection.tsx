import { Link } from "react-router-dom";
import { useMemo } from "react";
import type { Event } from "@/types/event";
import EventCard from "./EventCard";
import HomeEventCard from "./HomeEventCard";

interface EventsSectionProps {
  events: Event[];
  title?: string;
  /** Si "home", usa encabezado editorial, grid 4 cols, cards premium y CTA al final. Si no, comportamiento clásico (página eventos). */
  variant?: "page" | "home";
  /** En variant="home", máximo de eventos a mostrar (p. ej. 4). */
  maxEvents?: number;
}

/** Orden: próximos primero (startDate asc), luego pasados (startDate desc). */
function sortEvents(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.status !== b.status) return a.status === "upcoming" ? -1 : 1;
    return a.status === "upcoming"
      ? a.startDate.localeCompare(b.startDate)
      : b.startDate.localeCompare(a.startDate);
  });
}

/**
 * Sección "Eventos": en home (variant="home") es una vitrina curada con cards premium;
 * en página eventos (variant="page" o sin variant) es el listado completo con EventCard.
 */
export default function EventsSection({
  events,
  title = "Todos los eventos",
  variant = "page",
  maxEvents,
}: EventsSectionProps) {
  const sorted = useMemo(() => sortEvents(events), [events]);
  const displayList =
    variant === "home" && typeof maxEvents === "number"
      ? sorted.slice(0, maxEvents)
      : sorted;

  const isHome = variant === "home";

  return (
    <section
      className={`w-full ${isHome ? "pt-8 pb-10 md:pt-10 md:pb-12" : "py-12 md:py-14"}`}
      style={{ fontFamily: "var(--token-font-body)" }}
    >
      <div
        className={isHome ? "mx-auto w-full px-4 md:px-6 lg:px-8" : "mx-auto w-full px-4 md:px-6"}
        style={{ maxWidth: isHome ? "1280px" : "var(--token-container-max)" }}
      >
        {isHome ? (
          <>
            <header className="mb-8 flex items-start gap-4 md:mb-10">
              <div
                className="mt-1 hidden h-10 w-[3px] flex-shrink-0 rounded-full sm:block"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              <div>
                <h2
                  className="text-xl font-bold uppercase tracking-[0.06em] md:text-2xl"
                  style={{
                    color: "var(--regu-navy)",
                    fontFamily: "var(--token-font-heading)",
                  }}
                >
                  Próximos eventos 2026
                </h2>
                <p
                  className="mt-1.5 text-sm md:text-base"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  Agenda institucional y encuentros regionales de REGULATEL.
                </p>
              </div>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {displayList.map((event) => (
                <HomeEventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-8 flex justify-center md:mt-10">
              <Link
                to="/eventos"
                className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-[var(--regu-offwhite)] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  borderColor: "var(--regu-blue)",
                  color: "var(--regu-blue)",
                }}
              >
                Ver todos los eventos
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2
                className="font-bold leading-tight"
                style={{
                  color: "var(--token-text-primary)",
                  fontSize: "var(--token-heading-h2-size)",
                }}
              >
                {title}
              </h2>
              <Link
                to="/eventos"
                className="text-sm font-bold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)] focus-visible:ring-offset-2"
                style={{ color: "var(--token-accent)" }}
              >
                Ver todos
              </Link>
            </div>
            <div
              className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5 xl:grid-cols-3 xl:gap-5"
              style={{ gap: "20px" }}
            >
              {displayList.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
