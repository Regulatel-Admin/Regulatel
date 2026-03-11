import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Event } from "@/types/event";
import { EVENT_STATUS_LABEL, formatEventDateRange } from "@/types/event";

interface EventCardProps {
  event: Event;
}

/**
 * Card de evento (estilo BEREC). Leer más → /eventos/[id]. Registrarse → registrationUrl (nueva pestaña) o deshabilitado "Por definir".
 */
const cardClass =
  "event-card group flex h-full flex-col rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(22,61,89,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 motion-reduce:transition-none";
const cardStyle = {
  borderColor: "var(--regu-gray-100)",
  boxShadow: "0 2px 12px rgba(22, 61, 89, 0.04)",
  borderRadius: "16px",
} as const;

export default function EventCard({ event }: EventCardProps) {
  const isUpcoming = event.status === "upcoming";
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const dateLabel = formatEventDateRange(event.startDate, event.endDate);

  const content = (
    <>
      {event.imageUrl?.trim() && (
        <div className="-mx-5 -mt-5 mb-3 overflow-hidden rounded-t-2xl" style={{ aspectRatio: "16/10", backgroundColor: "var(--regu-gray-100)" }}>
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
          style={{
            backgroundColor: isUpcoming ? "rgba(68, 137, 198, 0.12)" : "rgba(22, 61, 89, 0.1)",
            color: isUpcoming ? "var(--regu-blue)" : "var(--regu-gray-600)",
          }}
        >
          {EVENT_STATUS_LABEL[event.status]}
        </span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--regu-gray-500)" }}>
          {event.year}
        </span>
      </div>

      <h3
        className="line-clamp-3 font-bold leading-tight"
        style={{
          color: "var(--regu-gray-900)",
          fontSize: "var(--token-heading-h3-size)",
        }}
        title={event.title}
      >
        {event.title}
      </h3>

      <p className="mt-1.5 text-sm" style={{ color: "var(--regu-gray-500)" }}>
        {event.organizer} · {event.location}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: "var(--regu-gray-500)" }}>
        {dateLabel}
      </p>

      {event.description && (
        <p
          className="mt-2 flex-1 line-clamp-3 text-sm leading-snug"
          style={{ color: "var(--regu-gray-600)" }}
        >
          {event.description}
        </p>
      )}

      <div
        className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-3"
        style={{ borderColor: "var(--regu-gray-100)" }}
      >
        {isUpcoming && (
          hasRegistrationUrl ? (
            <a
              href={event.registrationUrl!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-label={`Registrarse a ${event.title}`}
            >
              Registrarse
            </a>
          ) : (
            <span
              className="inline-flex items-center rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium text-[var(--regu-gray-500)]"
              aria-hidden
            >
              Por definir
            </span>
          )
        )}
        <span
          className="flex items-center gap-0.5 text-sm font-bold transition-colors group-hover:text-[var(--regu-blue)]"
          style={{ color: "var(--regu-blue)" }}
        >
          Leer más
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </>
  );

  return (
    <Link
      to={`/eventos/${event.id}`}
      className={cardClass}
      style={cardStyle}
      aria-label={`Leer más: ${event.title}`}
    >
      {content}
    </Link>
  );
}
