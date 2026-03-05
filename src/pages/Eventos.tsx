import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter } from "lucide-react";
import PageHero from "@/components/PageHero";
import EventCard from "@/components/home/EventCard";
import { useMergedEvents } from "@/contexts/AdminDataContext";
import type { HomeEventItem } from "@/data/events";

const MESES_OPCIONES = [
  "Todos",
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const TIPO_OPCIONES = ["Todos", "Presencial", "Virtual"] as const;

function sortEvents(events: HomeEventItem[]): HomeEventItem[] {
  return [...events].sort((a, b) => {
    if (a.status !== b.status) return a.status === "proxima" ? -1 : 1;
    if (a.status === "proxima") return a.year - b.year;
    return b.year - a.year;
  });
}

export default function Eventos() {
  const [searchParams] = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const events = useMergedEvents();
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [filtroMes, setFiltroMes] = useState<string>("Todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");

  // Sincronizar búsqueda con URL (ej. al llegar desde mega-menú con ?q=...)
  useEffect(() => {
    if (qFromUrl !== searchQuery) setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  const filtered = useMemo(() => {
    let list = sortEvents(events);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().normalize("NFD").replace(/\u0300/g, "");
      list = list.filter(
        (e) =>
          e.title.toLowerCase().normalize("NFD").replace(/\u0300/g, "").includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    if (filtroMes !== "Todos") {
      list = list.filter((e) => (e.mes ?? "").toLowerCase() === filtroMes.toLowerCase());
    }
    if (filtroTipo !== "Todos") {
      const tipoVal = filtroTipo.toLowerCase() as "presencial" | "virtual";
      list = list.filter((e) => (e.tipo ?? "presencial") === tipoVal);
    }
    return list;
  }, [events, searchQuery, filtroMes, filtroTipo]);

  return (
    <>
      <PageHero
        title="Eventos"
        breadcrumb={[{ label: "Eventos" }]}
        description="Cronograma de eventos y actividades de cooperación de REGULATEL y organizaciones aliadas"
      />

      <div
        className="w-full py-10 md:py-14"
        style={{
          background: "linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="container px-4 md:px-6 mx-auto"
          style={{ maxWidth: "var(--token-container-max)" }}
        >
          {/* Calendario de Eventos 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div
              className="bg-white rounded-2xl p-6 md:p-8 border max-w-4xl mx-auto"
              style={{
                borderColor: "var(--regu-gray-100)",
                boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)",
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Calendario de Eventos 2026
              </h2>
              <img
                src="/images/calendario-eventos-2026.jpg"
                alt="Calendario de Eventos 2026 - REGULATEL"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </motion.div>

          {/* Filtros: búsqueda + por mes + por tipo (virtual/presencial) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" style={{ color: "var(--regu-blue)" }} aria-hidden />
                <span className="font-semibold text-sm" style={{ color: "var(--regu-gray-900)" }}>
                  Filtros:
                </span>
              </div>
              <label htmlFor="eventos-search" className="sr-only">
                Buscar eventos por nombre, lugar o descripción
              </label>
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "var(--regu-gray-500)" }}
                  aria-hidden
                />
                <input
                  id="eventos-search"
                  type="search"
                  placeholder="Buscar por nombre del evento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:border-transparent"
                  style={{
                    borderColor: "var(--regu-gray-100)",
                    color: "var(--regu-gray-900)",
                  }}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  Mes:
                </span>
                <select
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)]"
                  style={{
                    borderColor: "var(--regu-gray-100)",
                    color: "var(--regu-gray-900)",
                  }}
                >
                  {MESES_OPCIONES.map((mes) => (
                    <option key={mes} value={mes}>
                      {mes === "Todos" ? "Todos" : mes.charAt(0).toUpperCase() + mes.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  Tipo:
                </span>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)]"
                  style={{
                    borderColor: "var(--regu-gray-100)",
                    color: "var(--regu-gray-900)",
                  }}
                >
                  {TIPO_OPCIONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Grid de cuadros (cards) */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                style={{ gap: "20px" }}
              >
                {filtered.map((event, index) => (
                  <motion.div
                    key={`${event.title}-${event.year}`}
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
                    : "No hay eventos disponibles."}
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
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--regu-gray-900)" }}
            >
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
