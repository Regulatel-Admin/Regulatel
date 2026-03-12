import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Event } from "@/types/event";
import { formatEventDateRange } from "@/types/event";

interface HomeEventCardProps {
  event: Event;
}

/**
 * Card premium para la sección de eventos del HOME: vitrina curada, institucional.
 * Estructura: badge + año → organizador/lugar/fecha → título → (descripción opcional 1–2 líneas) → botones al pie.
 */
export default function HomeEventCard({ event }: HomeEventCardProps) {
  const isUpcoming = event.status === "upcoming";
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const dateLabel = formatEventDateRange(event.startDate, event.endDate);
  const metaLine = `${event.organizer} · ${event.location} · ${dateLabel}`;
  let shortDescription: string | null = null;
  if (event.description) {
    const raw = event.description.replace(/\s+/g, " ").trim().slice(0, 100);
    if (raw.length >= 100) {
      const lastSpace = raw.lastIndexOf(" ");
      shortDescription = lastSpace > 60 ? raw.slice(0, lastSpace) + "…" : raw + "…";
    } else {
      shortDescription = raw || null;
    }
  }

  return (
    <article
      className="home-event-card homeEventCardHover relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[20px] border bg-white transition-all duration-200 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[var(--regu-blue)] focus-within:ring-offset-2"
      style={{
        borderColor: "rgba(22, 61, 89, 0.11)",
        boxShadow: "0 2px 8px rgba(22,61,89,0.05), 0 6px 20px rgba(22,61,89,0.06)",
      }}
    >
      {/* Acento top: azul en reposo, lima en hover */}
      <div
        className="homeEventCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
        style={{ backgroundColor: "var(--regu-blue)" }}
        aria-hidden
      />

      {event.imageUrl?.trim() && (
        <div className="-mx-0 mt-0 mb-0 overflow-hidden rounded-t-[20px]" style={{ aspectRatio: "16/10", backgroundColor: "var(--regu-gray-100)" }}>
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 md:p-7">
      {/* Badge + año */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <span
          className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
          style={{
            backgroundColor: isUpcoming ? "rgba(68,137,198,0.10)" : "rgba(22,61,89,0.07)",
            color: isUpcoming ? "var(--regu-blue)" : "var(--regu-gray-600)",
          }}
        >
          {isUpcoming ? "Próximo" : "Pasado"}
        </span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--regu-gray-500)" }}>
          {event.year}
        </span>
      </div>

      {/* Metadata — mismo margen inferior */}
      <p
        className="mb-2.5 text-xs leading-snug"
        style={{ color: "var(--regu-gray-500)", fontFamily: "var(--token-font-body)" }}
      >
        {metaLine}
      </p>

      {/* Título — altura visual consistente (2 líneas), mismo line-height */}
      <h3
        className="line-clamp-2 font-bold"
        style={{
          color: "var(--regu-gray-900)",
          fontSize: "1.0625rem",
          lineHeight: 1.22,
          minHeight: "2.44em",
          fontFamily: "var(--token-font-heading)",
        }}
        title={event.title}
      >
        {event.title}
      </h3>

      {/* Descripción corta o espaciador — mismo margen superior, 2 líneas máx */}
      {shortDescription ? (
        <p
          className="mt-2.5 line-clamp-2 flex-1 min-h-0 text-sm"
          style={{ color: "var(--regu-gray-600)", lineHeight: 1.4 }}
        >
          {shortDescription}
        </p>
      ) : (
        <div className="mt-0 flex-1 min-h-0" aria-hidden />
      )}

      {/* CTA */}
      <div
        className="mt-6 flex flex-wrap items-center gap-4 pt-4"
        style={{ borderTop: "1px solid rgba(22, 61, 89, 0.08)" }}
      >
        {isUpcoming && (
          hasRegistrationUrl ? (
            <a
              href={event.registrationUrl!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-label={`Registrarse a ${event.title}`}
            >
              Registrarse
            </a>
          ) : (
            <span
              className="inline-flex h-9 items-center rounded-lg border border-dashed px-4 text-xs font-medium"
              style={{ color: "var(--regu-gray-500)", borderColor: "var(--regu-gray-100)" }}
              aria-hidden
            >
              Por definir
            </span>
          )
        )}
        <Link
          to={`/eventos/${event.id}`}
          className="inline-flex h-9 items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
          style={{ color: "var(--regu-blue)" }}
        >
          Leer más
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
      </div>
    </article>
  );
}
