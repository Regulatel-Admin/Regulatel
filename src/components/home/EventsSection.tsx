import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import type { Event } from "@/types/event";
import { sortUpcomingBySoonest } from "@/types/event";
import EventCard from "./EventCard";
import HomeEventCard from "./HomeEventCard";
import { useSiteEdit } from "@/contexts/SiteEditContext";

interface EventsSectionProps {
  events: Event[];
  title?: string;
  /** Si "home", usa encabezado editorial, grid 4 cols, cards premium y CTA al final. Si no, comportamiento clásico (página eventos). */
  variant?: "page" | "home";
  /** En variant="home", máximo de eventos a mostrar (p. ej. 4). */
  maxEvents?: number;
}

/** Orden: próximos primero (el más cercano a hoy), luego pasados (más reciente primero). */
function sortEvents(events: Event[]): Event[] {
  const upcoming = sortUpcomingBySoonest(events);
  const past = [...events]
    .filter((e) => e.status !== "upcoming")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return [...upcoming, ...past];
}

/**
 * Sección "Eventos": en home (variant="home") es una vitrina curada con cards premium;
 * en página eventos (variant="page" o sin variant) es el listado completo con EventCard.
 */
export default function EventsSection({
  events,
  title,
  variant = "page",
  maxEvents,
}: EventsSectionProps) {
  const { t } = useTranslation();
  const { enabled: siteEditEnabled, open: openSiteEdit } = useSiteEdit();
  const resolvedTitle = title ?? t("homeSections.upcomingEvents");
  const currentYear = new Date().getFullYear();
  const sorted = useMemo(() => sortEvents(events), [events]);
  const displayList = useMemo(() => {
    if (!(variant === "home" && typeof maxEvents === "number")) return sorted;
    return sortUpcomingBySoonest(events).slice(0, maxEvents);
  }, [events, sorted, variant, maxEvents]);

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
                  {t("homeSections.upcomingEventsTitle", { year: currentYear })}
                </h2>
                <p
                  className="mt-1.5 text-sm md:text-base"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {t("homeSections.upcomingEventsSubtitle")}
                </p>
              </div>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {siteEditEnabled && (
                <button
                  type="button"
                  onClick={() => openSiteEdit({ kind: "evento" })}
                  className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-6 py-10 transition hover:bg-[rgba(15,118,110,0.06)]"
                  style={{
                    borderColor: "rgba(15,118,110,0.45)",
                    backgroundColor: "rgba(15,118,110,0.03)",
                  }}
                  aria-label="Añadir un evento"
                >
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(15,118,110,0.10)", color: "#0f766e" }}
                  >
                    <Plus className="h-10 w-10" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="text-center">
                    <span className="block text-sm font-bold" style={{ color: "#0f766e" }}>
                      Añadir evento
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                      Se coloca según la fecha más próxima.
                    </span>
                  </span>
                </button>
              )}
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
                {t("homeSections.viewAllEvents")}
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
                {resolvedTitle}
              </h2>
              <Link
                to="/eventos"
                className="text-sm font-bold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)] focus-visible:ring-offset-2"
                style={{ color: "var(--token-accent)" }}
              >
                {t("homeSections.seeAll")}
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
