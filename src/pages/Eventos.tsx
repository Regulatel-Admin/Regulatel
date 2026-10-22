import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Plus, GripVertical, ArrowUp, ArrowDown, Save, RotateCcw } from "lucide-react";
import EventCard from "@/components/home/EventCard";
import { useEvents } from "@/contexts/AdminDataContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useLocalizedEvents } from "@/hooks/useLocalizedEvents";
import type { Event } from "@/types/event";
import { normalizeEvent } from "@/types/event";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { api } from "@/lib/api";
import { notifyCmsSaved } from "@/lib/siteEdit";
import { EVENT_ORDER_SETTINGS_KEY, applyEventOrder, completeEventOrder, moveVisibleEvent, parseEventOrder } from "@/data/eventOrder";

type Segment = "upcoming" | "past" | "all";

function filterAndSort(
  events: Event[],
  segment: Segment,
  yearFilter: string,
  searchQuery: string
): Event[] {
  const normalized = events.map(normalizeEvent);
  let list = normalized;

  if (segment === "upcoming") {
    list = list.filter((e) => e.status === "upcoming");
    list = [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
  } else if (segment === "past") {
    list = list.filter((e) => e.status === "past");
    list = [...list].sort((a, b) => b.startDate.localeCompare(a.startDate));
  } else {
    list = [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === "upcoming" ? -1 : 1;
      return a.status === "upcoming"
        ? a.startDate.localeCompare(b.startDate)
        : b.startDate.localeCompare(a.startDate);
    });
  }

  if (yearFilter !== "all") {
    const y = parseInt(yearFilter, 10);
    list = list.filter((e) => e.year === y);
  }

  if (searchQuery.trim()) {
    const normalizeSearch = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const q = normalizeSearch(searchQuery.trim());
    list = list.filter((event) =>
      [event.title, event.organizer, event.location, event.description ?? ""].some((value) => normalizeSearch(value).includes(q)),
    );
  }

  return list;
}

export default function Eventos() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const tabFromUrl = searchParams.get("tab");
  const eventsRaw = useEvents();
  const { enabled: siteEditEnabled, open: openSiteEdit, preview: siteEditPreview, target: siteEditTarget, setPreview, clearPreview, recordPersistedChange } =
    useSiteEdit();
  const { eventOrder, refetch: refetchSettings } = useSiteSettings();
  const eventsMerged = useMemo(() => {
    const patch = siteEditEnabled ? siteEditPreview.evento : undefined;
    if (!patch) return eventsRaw;
    const idx = eventsRaw.findIndex((e) => e.id === patch.id);
    if (idx >= 0) {
      const next = eventsRaw.slice();
      next[idx] = normalizeEvent({ ...eventsRaw[idx], ...patch });
      return next;
    }
    return [normalizeEvent(patch), ...eventsRaw];
  }, [eventsRaw, siteEditEnabled, siteEditPreview.evento]);
  const events = useLocalizedEvents(eventsMerged);
  const draftingNew = Boolean(
    siteEditEnabled &&
      ((siteEditTarget?.kind === "evento" && !siteEditTarget.id) ||
        (siteEditPreview.evento && !eventsRaw.some((e) => e.id === siteEditPreview.evento!.id))),
  );
  const showAdd = siteEditEnabled && !draftingNew;
  const [segment, setSegment] = useState<Segment>(() => {
    if (tabFromUrl === "pasados") return "past";
    if (tabFromUrl === "todos") return "all";
    return "upcoming";
  });
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const orderBusy = useRef(false);
  const draftOrder = siteEditEnabled ? siteEditPreview.eventOrder : undefined;
  const effectiveOrder = draftOrder ?? eventOrder ?? [];
  const fullOrder = useMemo(
    () => completeEventOrder(filterAndSort(events, "all", "all", "").map((event) => event.id), eventOrder),
    [events, eventOrder],
  );
  const orderDirty = draftOrder !== undefined && (draftOrder.length === 0
    ? Boolean(eventOrder?.length)
    : JSON.stringify(draftOrder) !== JSON.stringify(fullOrder));

  useEffect(() => {
    if (qFromUrl !== searchQuery) setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  const years = useMemo(() => {
    const set = new Set(events.map((e) => e.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [events]);

  const filtered = useMemo(
    () => applyEventOrder(filterAndSort(events, segment, yearFilter, searchQuery), effectiveOrder),
    [events, segment, yearFilter, searchQuery, effectiveOrder]
  );

  const stageOrder = (next: string[]) => {
    setOrderError(null);
    setOrderMessage(null);
    const matchesSaved = next.length === 0
      ? !eventOrder?.length
      : JSON.stringify(next) === JSON.stringify(fullOrder);
    if (matchesSaved) clearPreview("eventOrder");
    else setPreview({ eventOrder: next });
  };

  const moveCard = (sourceId: string, targetId: string) => {
    if (!siteEditEnabled || savingOrder || draftingNew) return;
    const current = completeEventOrder(fullOrder, effectiveOrder.length ? effectiveOrder : fullOrder);
    stageOrder(moveVisibleEvent(current, filtered.map((event) => event.id), sourceId, targetId));
  };

  const saveOrder = async () => {
    if (!orderDirty || draftOrder === undefined || orderBusy.current) return;
    orderBusy.current = true;
    setSavingOrder(true);
    setOrderError(null);
    setOrderMessage(null);
    try {
      const loaded = await api.settings.get(EVENT_ORDER_SETTINGS_KEY);
      if (!loaded.ok) throw new Error(loaded.error || "No se pudo cargar el orden guardado.");
      const before = parseEventOrder(loaded.data.value) ?? [];
      const after = draftOrder.length ? completeEventOrder(before, draftOrder) : [];
      const result = await api.settings.set(EVENT_ORDER_SETTINGS_KEY, after);
      if (!result.ok) throw new Error(result.error || "No se pudo guardar el orden.");
      recordPersistedChange({
        label: "orden de eventos",
        undo: async () => {
          const result = await api.settings.set(EVENT_ORDER_SETTINGS_KEY, before);
          if (!result.ok) throw new Error(result.error || "No se pudo deshacer el orden.");
          notifyCmsSaved(EVENT_ORDER_SETTINGS_KEY);
        },
        redo: async () => {
          const result = await api.settings.set(EVENT_ORDER_SETTINGS_KEY, after);
          if (!result.ok) throw new Error(result.error || "No se pudo rehacer el orden.");
          notifyCmsSaved(EVENT_ORDER_SETTINGS_KEY);
        },
      });
      notifyCmsSaved(EVENT_ORDER_SETTINGS_KEY);
      await refetchSettings();
      clearPreview("eventOrder");
      setOrderMessage("Orden guardado en el sitio público.");
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "No se pudo guardar el orden. Intenta de nuevo.");
    } finally {
      orderBusy.current = false;
      setSavingOrder(false);
    }
  };

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

      <div className="mx-auto px-4 pb-14 pt-10 md:px-6 md:pt-14" style={{ maxWidth: "var(--token-container-max)" }}>
        <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-400)" }} aria-label="Breadcrumb">
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>{t("pages.shared.breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>{t("pages.eventos.breadcrumb")}</span>
        </nav>

        <header className="mb-8">
          <p
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--regu-gray-400)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Calendar size={12} style={{ color: "var(--regu-blue)" }} />
            {t("pages.eventos.eyebrow")}
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 4,
                minHeight: 40,
                borderRadius: 2,
                background: "var(--regu-blue)",
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                  fontWeight: 700,
                  color: "var(--regu-navy)",
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: "var(--token-font-heading)",
                }}
              >
                {t("pages.eventos.title")}
              </h1>
              <p
                style={{
                  marginTop: 8,
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--regu-gray-500)",
                  maxWidth: 560,
                }}
              >
                {t("pages.eventos.description")}
              </p>
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.eventos.count", { count: filtered.length })}
              </p>
            </div>
          </div>
        </header>

        {/* Filter bar card */}
        <div
          className="rounded-2xl border bg-white p-4 shadow-[0_2px_8px_rgba(22,61,89,0.06)]"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            borderTop: "3px solid var(--regu-blue)",
            marginBottom: 28,
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" style={{ color: "var(--regu-blue)" }} aria-hidden />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.shared.filters")}
              </span>
            </div>
            <div
              className="flex rounded-xl border p-0.5"
              style={{ borderColor: "rgba(22,61,89,0.12)" }}
              role="tablist"
              aria-label={t("pages.eventos.segmentAria")}
            >
              {(
                [
                  { value: "upcoming" as Segment, label: t("pages.eventos.upcoming") },
                  { value: "past" as Segment, label: t("pages.eventos.past") },
                  { value: "all" as Segment, label: t("pages.eventos.allSegment") },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={segment === value}
                  onClick={() => setSegment(value)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
                  style={{
                    backgroundColor: segment === value ? "var(--regu-blue)" : "transparent",
                    color: segment === value ? "#fff" : "var(--regu-gray-600)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              aria-label={t("pages.shared.filterByYear")}
              className="rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)]"
              style={{
                borderColor: "rgba(22,61,89,0.12)",
                backgroundColor: "#F4F6F8",
                color: "var(--regu-navy)",
              }}
            >
              <option value="all">{t("pages.shared.allYears")}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <label htmlFor="eventos-search" className="sr-only">{t("pages.eventos.searchLabel")}</label>
            <div className="relative min-w-0 flex-1 max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "var(--regu-gray-400)" }} aria-hidden />
              <input
                id="eventos-search"
                type="search"
                placeholder={t("pages.eventos.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.30)]"
                style={{
                  borderColor: "rgba(22,61,89,0.12)",
                  backgroundColor: "#F4F6F8",
                  color: "var(--regu-navy)",
                }}
              />
            </div>
          </div>
        </div>

        {siteEditEnabled && (
          <div className="mb-5 rounded-xl border bg-white p-4" style={{ borderColor: "rgba(15,118,110,0.25)" }} aria-label="Orden de los eventos" role="region">
            <p className="text-sm" style={{ color: "var(--regu-navy)" }}>
              Arrastra el asa de una tarjeta o usa las flechas. Guarda el orden para que lo vean los visitantes.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void saveOrder()} disabled={!orderDirty || savingOrder}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#0f766e" }}>
                <Save className="h-4 w-4" aria-hidden /> {savingOrder ? "Guardando…" : "Guardar orden"}
              </button>
              <button type="button" onClick={() => { clearPreview("eventOrder"); setOrderError(null); setOrderMessage(null); }}
                disabled={!orderDirty || savingOrder} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50">
                <RotateCcw className="h-4 w-4" aria-hidden /> Revertir
              </button>
              <button type="button" onClick={() => stageOrder([])} disabled={savingOrder || effectiveOrder.length === 0}
                className="rounded-lg px-3 py-2 text-sm font-medium underline underline-offset-2 disabled:opacity-50">
                Volver al orden por fecha
              </button>
              {orderDirty && <span className="text-xs font-medium text-amber-800" role="status">Orden sin guardar.</span>}
            </div>
            {orderError && <p className="mt-2 text-sm text-red-700" role="alert">{orderError}</p>}
            {orderMessage && <p className="mt-2 text-sm font-medium text-teal-700" role="status">{orderMessage}</p>}
          </div>
        )}

        <AnimatePresence mode="wait">
          {filtered.length > 0 || showAdd ? (
            <motion.div
              key={`${segment}-${yearFilter}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              style={{ gap: 24 }}
            >
              {showAdd && (
                <button
                  type="button"
                  onClick={() => openSiteEdit({ kind: "evento" })}
                  className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition hover:bg-[rgba(15,118,110,0.06)]"
                  style={{
                    borderColor: "rgba(15,118,110,0.45)",
                    backgroundColor: "rgba(15,118,110,0.03)",
                  }}
                  aria-label="Añadir un evento"
                >
                  <span
                    className="flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(15,118,110,0.10)", color: "#0f766e" }}
                  >
                    <Plus className="h-12 w-12" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="text-center">
                    <span
                      className="block text-base font-bold"
                      style={{ color: "#0f766e", fontFamily: "var(--token-font-heading)" }}
                    >
                      Añadir evento
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                      Título, fechas y lugar. Se ve aquí al instante.
                    </span>
                  </span>
                </button>
              )}
              {filtered.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="eventListCardWrapper"
                  layout={siteEditEnabled ? "position" : false}
                >
                  <div
                    className={`h-full rounded-2xl ${dropTargetId === event.id && draggedId !== event.id ? "ring-2 ring-teal-600 ring-offset-2" : ""}`}
                    style={{ opacity: draggedId === event.id ? 0.55 : 1 }}
                    onDragOver={(drag) => {
                      if (!draggedId || savingOrder) return;
                      drag.preventDefault();
                      drag.dataTransfer.dropEffect = "move";
                      setDropTargetId(event.id);
                    }}
                    onDrop={(drag) => {
                      drag.preventDefault();
                      if (draggedId) moveCard(draggedId, event.id);
                      setDraggedId(null);
                      setDropTargetId(null);
                    }}
                  >
                    {siteEditEnabled && (
                      <div className="mb-2 flex items-center gap-1 rounded-xl border bg-white px-2 py-1" style={{ borderColor: "rgba(15,118,110,0.2)", color: "#0f766e" }}>
                        <button type="button" draggable={!savingOrder && !draftingNew} disabled={savingOrder || draftingNew}
                          onDragStart={(drag) => {
                            drag.dataTransfer.setData("text/plain", event.id);
                            drag.dataTransfer.effectAllowed = "move";
                            setDraggedId(event.id);
                          }}
                          onDragEnd={() => { setDraggedId(null); setDropTargetId(null); }}
                          className="inline-flex h-11 w-11 cursor-grab items-center justify-center rounded-lg hover:bg-teal-50 active:cursor-grabbing disabled:opacity-40"
                          aria-label={`Arrastrar para ordenar: ${event.title}`} title="Arrastrar para ordenar">
                          <GripVertical className="h-5 w-5" aria-hidden />
                        </button>
                        <span className="mr-auto text-xs font-semibold">{index + 1}</span>
                        <button type="button" disabled={index === 0 || savingOrder || draftingNew}
                          onClick={() => moveCard(event.id, filtered[index - 1].id)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-teal-50 disabled:opacity-40"
                          aria-label={`Subir: ${event.title}`} title="Subir">
                          <ArrowUp className="h-4 w-4" aria-hidden />
                        </button>
                        <button type="button" disabled={index === filtered.length - 1 || savingOrder || draftingNew}
                          onClick={() => moveCard(event.id, filtered[index + 1].id)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-teal-50 disabled:opacity-40"
                          aria-label={`Bajar: ${event.title}`} title="Bajar">
                          <ArrowDown className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    )}
                    <EventCard event={event} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border bg-white py-16 text-center"
              style={{
                borderColor: "rgba(22,61,89,0.10)",
                boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
                borderTop: "3px solid var(--regu-blue)",
              }}
            >
              <p className="text-lg font-bold" style={{ color: "var(--regu-navy)" }}>{t("pages.eventos.noResults")}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {searchQuery.trim() ? t("pages.eventos.noResultsSearch") : t("pages.eventos.noResultsFiltered")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="mt-12 rounded-2xl border p-6 md:p-8"
          style={{
            backgroundColor: "#fff",
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
            Sobre los Eventos de REGULATEL
          </h2>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
            <p>
              REGULATEL organiza y participa en cumbres, talleres, seminarios y reuniones de trabajo con organizaciones aliadas como BEREC, ASIET, COMTELCA, CITEL, UIT, GSMA e IIC.
            </p>
            <p>
              Estos eventos son espacios de diálogo, intercambio de experiencias y fortalecimiento de la cooperación regional en el sector de las telecomunicaciones.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t pt-8" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
            style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)", textDecoration: "none" }}
          >
            ← Volver a inicio
          </Link>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
          >
            Ver noticias →
          </Link>
        </div>
      </div>
    </div>
  );
}
