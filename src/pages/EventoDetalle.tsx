import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEvents } from "@/contexts/AdminDataContext";
import { formatEventDateRange } from "@/types/event";
import type { Event } from "@/types/event";
import { Calendar, MapPin, Building2, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { normalizeEvent } from "@/types/event";
import { useLocalizedEvents, useLocalizedEvent } from "@/hooks/useLocalizedEvents";
import { api } from "@/lib/api";
import RegistrationOpenHint from "@/components/events/RegistrationOpenHint";

export default function EventoDetalle() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const eventsRaw = useEvents();
  const events = useLocalizedEvents(eventsRaw);
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

  const eventRaw = eventFromList ?? fetchedEvent;
  const event = useLocalizedEvent(eventRaw);

  if (!id) {
    return <Navigate to="/eventos" replace />;
  }
  if (notFound || (!event && !loading)) {
    return <Navigate to="/eventos" replace />;
  }
  if (loading || !event) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        style={{ backgroundColor: "#FAFBFC", fontFamily: "var(--token-font-body)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>{t("pages.eventos.loading")}</p>
      </div>
    );
  }

  const dateLabel = formatEventDateRange(event.startDate, event.endDate, i18n.language);
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const isUpcoming = event.status === "upcoming";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} aria-hidden />

      <div className="mx-auto px-4 pb-14 pt-8 md:px-6 md:pt-10" style={{ maxWidth: 820 }}>
        <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-400)" }} aria-label="Breadcrumb">
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>{t("common.home")}</Link>
          <span aria-hidden>/</span>
          <Link to="/eventos" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>{t("pages.eventos.breadcrumb")}</Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>{event.title}</span>
        </nav>

        <article
          className="overflow-hidden rounded-2xl border bg-white"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 4px 20px rgba(22,61,89,0.08)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <div className="p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-block rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: isUpcoming ? "rgba(68,137,198,0.12)" : "rgba(22,61,89,0.08)",
                  color: isUpcoming ? "var(--regu-blue)" : "var(--regu-gray-600)",
                }}
              >
                {event.status === "upcoming" ? t("pages.eventos.upcoming") : t("pages.eventos.past")}
              </span>
              {isUpcoming && hasRegistrationUrl ? <RegistrationOpenHint /> : null}
              <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--regu-gray-500)" }}>
                {event.year}
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
                fontWeight: 700,
                color: "var(--regu-navy)",
                lineHeight: 1.25,
                marginBottom: 12,
                fontFamily: "var(--token-font-heading)",
              }}
            >
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--regu-gray-600)" }}>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} style={{ color: "var(--regu-blue)" }} />
                {dateLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} style={{ color: "var(--regu-blue)" }} />
                {event.organizer}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: "var(--regu-blue)" }} />
                {event.location}
              </span>
            </div>

            {event.imageUrl?.trim() && (
              <div
                className="mt-6 overflow-hidden rounded-xl"
                style={{ aspectRatio: "16/9", backgroundColor: "var(--regu-gray-100)" }}
              >
                <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            {event.description && (
              <div
                className="mt-6 border-t pt-6"
                style={{ borderColor: "rgba(22,61,89,0.08)" }}
              >
                <h2
                  className="mb-3 text-sm font-bold uppercase tracking-wider"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {t("pages.eventos.descriptionLabel")}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
                  {event.description}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {hasRegistrationUrl ? (
                <a
                  href={event.registrationUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.40)] focus:ring-offset-2"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <ExternalLink size={16} />
                  {t("pages.eventos.register")}
                </a>
              ) : (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "rgba(22,61,89,0.12)",
                    backgroundColor: "rgba(68,137,198,0.06)",
                    color: "var(--regu-gray-700)",
                  }}
                >
                  <strong>{t("pages.eventos.registrationPendingTitle")}</strong>
                  <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                    {t("pages.eventos.registrationPendingHint")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </article>

        <div
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
          style={{ borderColor: "rgba(22,61,89,0.08)" }}
        >
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
            style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)", textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            {t("pages.eventos.backToEvents")}
          </Link>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
          >
            {t("pages.eventos.viewNews")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
