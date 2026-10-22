import { SemanaRegulatelPage, hasSemanaResources } from "@/components/events/SemanaRegulatelResources";
import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminData, useEvents } from "@/contexts/AdminDataContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import EventPageEditor from "@/components/site-edit/EventPageEditor";
import { EventEditableText, EventInlineBlocks, EventInlineDocuments } from "@/components/site-edit/EventInlineContent";
import type { ReactNode } from "react";
import { formatEventDateRange } from "@/types/event";
import type { Event } from "@/types/event";
import { Calendar, MapPin, Building2, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { normalizeEvent } from "@/types/event";
import { useLocalizedEvents, useLocalizedEvent } from "@/hooks/useLocalizedEvents";
import { api } from "@/lib/api";
import RegistrationOpenHint from "@/components/events/RegistrationOpenHint";
import {
  SEMANA_REGULATEL_2026_ATTACHMENTS,
  SEMANA_REGULATEL_2026_EVENT_ID,
  SEMANA_REGULATEL_2026_IMAGE,
} from "@/data/semanaRegulatel2026";

function isSemanaAsietEvent(event: Event) {
  return (
    event.id === SEMANA_REGULATEL_2026_EVENT_ID ||
    (event.startDate === "2026-10-16" && /asiet/i.test(event.title) && /comtelca/i.test(event.title))
  );
}

function RegisterButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.40)] focus:ring-offset-2"
      style={{ backgroundColor: "var(--regu-blue)" }}
    >
      <ExternalLink size={16} />
      {label}
    </a>
  );
}

export default function EventoDetalle() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const eventsRaw = useEvents();
  const { events: storedEvents, eventsLoaded, contentError } = useAdminData();
  const { enabled: editing } = useSiteEdit();
  const events = useLocalizedEvents(eventsRaw);
  const eventFromList = id ? (editing ? storedEvents.find(e => e.id === id) : undefined) ?? events.find((e) => e.id === id) : null;
  const [fetchedEvent, setFetchedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!eventsLoaded) return;
    if (eventFromList) {
      setFetchedEvent(null);
      setNotFound(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    api.events.get(id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok && res.data && ((res.data as Event).published !== false || editing)) {
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
  }, [id, eventFromList, editing, eventsLoaded]);

  const eventRaw = eventFromList ?? fetchedEvent;
  const event = useLocalizedEvent(eventRaw);

  if (!id) {
    return <Navigate to="/eventos" replace />;
  }
  if (!eventsLoaded) return <div className="mx-auto max-w-3xl px-4 py-12" role="status">{contentError ? "No se pudo cargar el evento. Recarga la página para reintentar." : "Cargando evento…"}</div>;
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

  const renderEvent = (event: Event, editor?: ReactNode) => {
  const dateLabel = formatEventDateRange(event.startDate, event.endDate, i18n.language);
  const hasRegistrationUrl = Boolean(event.registrationUrl?.trim());
  const isUpcoming = event.status === "upcoming";
  const documents =
    event.attachments !== undefined
      ? event.attachments
      : isSemanaAsietEvent(event)
        ? SEMANA_REGULATEL_2026_ATTACHMENTS
        : [];
  const bannerSrc = event.imageUrl !== undefined ? event.imageUrl.trim() : isSemanaAsietEvent(event) ? SEMANA_REGULATEL_2026_IMAGE : "";
  const pageMaxWidth = bannerSrc ? 1120 : 820;

  if (hasSemanaResources(event.id, event.resources)) {
    return <SemanaRegulatelPage event={event} dateLabel={dateLabel} documents={documents} editor={editor} />;
  }

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

      <div className="mx-auto px-4 pb-14 pt-8 md:px-6 md:pt-10" style={{ maxWidth: pageMaxWidth }}>
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
              <EventEditableText field="title" label="Título del evento">{event.title}</EventEditableText>
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4">
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
              {isUpcoming && hasRegistrationUrl ? (
                <RegisterButton href={event.registrationUrl!} label={t("pages.eventos.register")} />
              ) : null}
            </div>

            {!editor && bannerSrc ? (
              <div
                className="mt-6 -mx-6 overflow-hidden md:-mx-8"
                style={{ backgroundColor: "#E7F1FA" }}
              >
                <img
                  src={bannerSrc}
                  alt={event.title}
                  className="block h-auto w-full"
                  style={{ objectFit: "contain" }}
                />
              </div>
            ) : null}

            {!editor && (event.description || editing) && (
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
                  <EventEditableText field="description" label="Descripción del evento">{event.description}</EventEditableText>
                </p>
              </div>
            )}

            {editor ?? <><EventInlineBlocks event={event} /><EventInlineDocuments documents={documents} /></>}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isUpcoming && hasRegistrationUrl ? (
                <RegisterButton href={event.registrationUrl!} label={t("pages.eventos.register")} />
              ) : isUpcoming ? (
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
              ) : null}
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
  };
  return <EventPageEditor key={event.id} event={editing ? eventRaw ?? event : event}>{(draft, editor) => renderEvent(draft, editor)}</EventPageEditor>;
}
