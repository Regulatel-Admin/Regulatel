import { Link } from "react-router-dom";
import { useMemo } from "react";
import type { HomeEventItem } from "@/data/events";
import EventCard from "./EventCard";

interface EventsSectionProps {
  events: HomeEventItem[];
}

/**
 * Orden: PRÓXIMAS primero (año ascendente), luego PASADAS (año descendente).
 */
function sortEvents(events: HomeEventItem[]): HomeEventItem[] {
  return [...events].sort((a, b) => {
    if (a.status !== b.status) return a.status === "proxima" ? -1 : 1;
    if (a.status === "proxima") return a.year - b.year;
    return b.year - a.year;
  });
}

/**
 * Sección "Eventos" estilo BEREC: contenedor con mismo max-width, título + Ver todos, grid de cards.
 * Desktop 3 cols, tablet 2, mobile 1. Gap consistente y tight.
 */
export default function EventsSection({ events }: EventsSectionProps) {
  const sorted = useMemo(() => sortEvents(events), [events]);

  return (
    <section
      className="w-full py-12 md:py-14"
      style={{ fontFamily: "var(--token-font-body)" }}
    >
      <div
        className="mx-auto w-full px-4 md:px-6"
        style={{ maxWidth: "var(--token-container-max)" }}
      >
        {/* Cabecera: título a la izquierda, "Ver todos" a la derecha — alineados verticalmente */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2
            className="font-bold leading-tight"
            style={{
              color: "var(--token-text-primary)",
              fontSize: "var(--token-heading-h2-size)",
            }}
          >
            Todos los eventos
          </h2>
          <Link
            to="/eventos"
            className="text-sm font-bold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)] focus-visible:ring-offset-2"
            style={{ color: "var(--token-accent)" }}
          >
            Ver todos
          </Link>
        </div>

        {/* Grid: 3 cols desktop, 2 tablet, 1 mobile — gap 20px (tight, consistente) */}
        <div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5 xl:grid-cols-3 xl:gap-5"
          style={{ gap: "20px" }}
        >
          {sorted.map((event) => (
            <EventCard key={`${event.title}-${event.year}`} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
