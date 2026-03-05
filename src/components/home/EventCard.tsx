import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { hasEventPassed, type HomeEventItem } from "@/data/events";

interface EventCardProps {
  event: HomeEventItem;
}

/**
 * Una card de evento totalmente clickeable (estilo BEREC).
 * Jerarquía: chip estado + año → título → ubicación → descripción → CTA "Ver evento →".
 * Hover: elevación y acento sutil. Accesible: enlace con aria-label.
 */
const cardClass =
  "event-card group flex h-full flex-col rounded-xl border bg-white p-5 transition-all duration-200 hover:shadow-[var(--token-shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)] focus-visible:ring-offset-2 motion-reduce:transition-none";
const cardStyle = {
  borderColor: "var(--token-border)",
  boxShadow: "var(--token-shadow-card)",
  borderRadius: "var(--token-radius-card)",
} as const;

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const isProxima = event.status === "proxima";
  const eventPassed = hasEventPassed(event);
  const displayAsProxima = isProxima && !eventPassed;
  const showRegistrarse = displayAsProxima;
  const isExternal = event.href.startsWith("http");
  const registerUrl = event.registrationUrl || "/eventos";

  const handleRegistrarse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (registerUrl.startsWith("http")) window.open(registerUrl, "_blank", "noopener,noreferrer");
    else navigate(registerUrl);
  };

  const content = (
    <>
      {/* Fila superior: chip estado (PRÓXIMA / PASADA) + año. Si la fecha ya pasó, se muestra Pasada. */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
          style={{
            backgroundColor: displayAsProxima ? "rgba(197, 220, 11, 0.15)" : "rgba(22, 61, 89, 0.1)",
            color: displayAsProxima ? "var(--token-accent)" : "var(--token-text-secondary)",
          }}
        >
          {displayAsProxima ? "Próxima" : "Pasada"}
        </span>
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color: "var(--token-text-secondary)" }}
        >
          {event.year}
        </span>
      </div>

      {/* Título: máx. 2 líneas */}
      <h3
        className="line-clamp-2 font-bold leading-tight"
        style={{
          color: "var(--token-text-primary)",
          fontSize: "var(--token-heading-h3-size)",
        }}
      >
        {event.title}
      </h3>

      {/* Ubicación y fecha — estilo secondary */}
      <p
        className="mt-1.5 text-sm"
        style={{ color: "var(--token-text-secondary)" }}
      >
        {event.city}
        {event.dateLabel ? ` · ${event.dateLabel}` : ""}
      </p>

      {/* Descripción: 2–3 líneas máx */}
      <p
        className="mt-2 flex-1 line-clamp-3 text-sm leading-snug"
        style={{ color: "var(--token-text-secondary)" }}
      >
        {event.description}
      </p>

      {/* Badge "Fotos" si tiene mediaLabel */}
      {event.mediaLabel ? (
        <span
          className="mt-2 inline-flex w-fit rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.06)",
            color: "var(--token-text-secondary)",
          }}
        >
          {event.mediaLabel}
        </span>
      ) : null}

      {/* Footer: Registrarse (solo próximos) + Ver evento; card completa es clickeable a evento */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-3" style={{ borderColor: "var(--token-border)" }}>
        {showRegistrarse && (
          <button
            type="button"
            onClick={handleRegistrarse}
            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
            style={{ backgroundColor: "var(--news-accent)" }}
          >
            Registrarse
          </button>
        )}
        <span
          className="flex items-center gap-0.5 text-sm font-bold transition-colors group-hover:text-[var(--token-accent)]"
          style={{ color: "var(--token-accent)" }}
        >
          Ver evento
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={event.href}
        target="_blank"
        rel="noreferrer noopener"
        className={cardClass}
        style={cardStyle}
        aria-label={`Ver evento: ${event.title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={event.href}
      className={cardClass}
      style={cardStyle}
      aria-label={`Ver evento: ${event.title}`}
    >
      {content}
    </Link>
  );
}
