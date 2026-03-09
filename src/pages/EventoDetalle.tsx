import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useEvents } from "@/contexts/AdminDataContext";
import { formatEventDateRange } from "@/types/event";
import type { Event } from "@/types/event";
import { normalizeEvent } from "@/types/event";
import { api } from "@/lib/api";

export default function EventoDetalle() {
  const { id } = useParams<{ id: string }>();
  const events = useEvents();
  const eventFromList = id ? events.find((e) => e.id === id) : null;
  const [fetchedEvent, setFetchedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (eventFromList) {
      setFetchedEvent(null);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    api.events.get(id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok && res.data) {
        setFetchedEvent(normalizeEvent(res.data as Event));
        setNotFound(false);
      } else {
        setFetchedEvent(null);
        setNotFound(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, eventFromList]);

  const event = eventFromList ?? fetchedEvent;

  if (!id) {
    return <Navigate to="/eventos" replace />;
  }
  if (notFound || (!event && !loading)) {
    return <Navigate to="/eventos" replace />;
  }
  if (loading || !event) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" style={{ fontFamily: "var(--token-font-body)" }}>
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando evento…</p>
      </div>
    );
  }

  const dateLabel = formatEventDateRange(event.startDate, event.endDate);
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());

  return (
    <>
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/breadcrumb.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "clamp(200px, 28vw, 280px)",
        }}
      >
        <div className="relative z-[2] container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
          <nav className="text-sm text-white/80 mb-4">
            <Link to="/eventos" className="hover:text-white transition-colors">
              Eventos
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{event.title}</span>
          </nav>
          <h1
            className="text-2xl md:text-3xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            {event.title}
          </h1>
          <p className="mt-2 text-white/90">
            {event.organizer} · {event.location} · {dateLabel}
          </p>
        </div>
      </section>

      <div
        className="w-full py-10 md:py-14"
        style={{
          background: "linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6" style={{ maxWidth: "var(--token-container-max)" }}>
          <div
            className="rounded-2xl border bg-white p-6 shadow-sm md:p-8"
            style={{
              borderColor: "var(--regu-gray-100)",
              boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)",
            }}
          >
            {event.imageUrl?.trim() && (
              <div className="mb-6 overflow-hidden rounded-xl" style={{ aspectRatio: "16/9", backgroundColor: "var(--regu-gray-100)" }}>
                <img
                  src={event.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {event.description && (
              <p className="mb-4 text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
                {event.description}
              </p>
            )}
            {hasRegistrationUrl ? (
              <a
                href={event.registrationUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                Registrarse
              </a>
            ) : (
              <div
                className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm"
                style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
              >
                <strong>Enlace de registro: por definir.</strong>
                <p className="mt-1 text-sm opacity-90">
                  El enlace de inscripción se publicará cuando esté disponible.
                </p>
              </div>
            )}
            <div className="mt-6">
              <Link
                to="/eventos"
                className="inline-flex items-center justify-center rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  borderColor: "var(--regu-blue)",
                  color: "var(--regu-blue)",
                }}
              >
                Volver a Eventos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
