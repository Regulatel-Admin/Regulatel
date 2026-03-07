import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter } from "lucide-react";
import EventCard from "@/components/home/EventCard";
import { useEvents } from "@/contexts/AdminDataContext";
import type { Event } from "@/types/event";
import { normalizeEvent } from "@/types/event";

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
    const q = searchQuery
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300/g, "");
    list = list.filter(
      (e) =>
        e.title.toLowerCase().normalize("NFD").replace(/\u0300/g, "").includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q)
    );
  }

  return list;
}

export default function Eventos() {
  const [searchParams] = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const tabFromUrl = searchParams.get("tab");
  const events = useEvents();
  const [segment, setSegment] = useState<Segment>(() => {
    if (tabFromUrl === "pasados") return "past";
    if (tabFromUrl === "todos") return "all";
    return "upcoming";
  });
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(qFromUrl);

  useEffect(() => {
    if (qFromUrl !== searchQuery) setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  const years = useMemo(() => {
    const set = new Set(events.map((e) => e.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [events]);

  const filtered = useMemo(
    () => filterAndSort(events, segment, yearFilter, searchQuery),
    [events, segment, yearFilter, searchQuery]
  );

  return (
    <>
      {/* Hero con fondo mapa mundi + overlay oscuro — estilo BEREC */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/world-map-dots.jpg')",
          minHeight: "clamp(220px, 32vw, 320px)",
        }}
      >
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,10,20,0.75) 0%, rgba(0,20,35,0.6) 50%, rgba(0,10,20,0.75) 100%)",
          }}
        />
        <div className="relative z-[2] container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20 max-w-6xl">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            Eventos
          </h1>
          <p className="mt-2 text-lg text-white/90 max-w-2xl">
            Cronograma de eventos y actividades de cooperación de REGULATEL y organizaciones aliadas.
          </p>
        </div>
      </section>

      {/* Barra de filtros sticky */}
      <div
        className="sticky top-0 z-30 w-full border-b bg-white/95 backdrop-blur-sm py-4 shadow-sm"
        style={{
          fontFamily: "var(--token-font-body)",
          borderColor: "var(--regu-gray-100)",
        }}
      >
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" style={{ color: "var(--regu-blue)" }} aria-hidden />
              <span className="text-sm font-semibold" style={{ color: "var(--regu-gray-900)" }}>
                Filtros
              </span>
            </div>
            {/* Tabs: Próximos | Pasados | Todos */}
            <div
              className="flex rounded-xl border p-0.5"
              style={{ borderColor: "var(--regu-gray-200)" }}
              role="tablist"
              aria-label="Segmento de eventos"
            >
              {(
                [
                  { value: "upcoming" as Segment, label: "Próximos" },
                  { value: "past" as Segment, label: "Pasados" },
                  { value: "all" as Segment, label: "Todos" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={segment === value}
                  onClick={() => setSegment(value)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: segment === value ? "var(--regu-blue)" : "transparent",
                    color: segment === value ? "white" : "var(--regu-gray-700)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Año */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              aria-label="Filtrar por año"
              className="rounded-xl border px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)]"
              style={{
                borderColor: "var(--regu-gray-100)",
                color: "var(--regu-gray-900)",
              }}
            >
              <option value="all">Todos los años</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {/* Búsqueda */}
            <label htmlFor="eventos-search" className="sr-only">
              Buscar por título, organizador o lugar
            </label>
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                style={{ color: "var(--regu-gray-500)" }}
                aria-hidden
              />
              <input
                id="eventos-search"
                type="search"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)]"
                style={{
                  borderColor: "var(--regu-gray-100)",
                  color: "var(--regu-gray-900)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido: grid de cards */}
      <div
        className="w-full py-10 md:py-14"
        style={{
          background: "linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div className="container px-4 md:px-6 mx-auto" style={{ maxWidth: "var(--token-container-max)" }}>
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={`${segment}-${yearFilter}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                style={{ gap: "20px" }}
              >
                {filtered.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 rounded-2xl border bg-white"
                style={{
                  borderColor: "var(--regu-gray-100)",
                  color: "var(--regu-gray-500)",
                }}
              >
                <p className="text-lg font-medium">No se encontraron eventos</p>
                <p className="mt-1 text-sm">
                  {searchQuery.trim()
                    ? "Pruebe con otro término de búsqueda."
                    : "No hay eventos con los filtros seleccionados."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bloque informativo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-12 rounded-2xl border p-6 md:p-8 bg-white"
            style={{
              borderColor: "var(--regu-gray-100)",
              boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)",
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--regu-gray-900)" }}>
              Sobre los Eventos de REGULATEL
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
              <p>
                REGULATEL organiza y participa activamente en una amplia gama de eventos a lo largo del
                año, incluyendo cumbres, talleres, seminarios y reuniones de trabajo con organizaciones
                aliadas como BEREC, ASIET, COMTELCA, CITEL, UIT, GSMA e IIC.
              </p>
              <p>
                Estos eventos proporcionan espacios de diálogo, intercambio de experiencias y
                fortalecimiento de la cooperación regional en temas estratégicos del sector de las
                telecomunicaciones.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
