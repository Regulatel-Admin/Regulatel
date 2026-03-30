import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Download, Eye, FileText, Layers, Sparkles } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useBoletinesGtai } from "@/hooks/useBoletinesGtai";
import {
  BOLETINES_GTAI_LIST_PATH,
  getBoletinesGtaiPublished,
  getFeaturedBoletin,
  sortBoletinesByDateDesc,
  uniqueYearsDesc,
} from "@/data/boletinesGtai";

export default function BoletinesGtai() {
  const { entries, loading } = useBoletinesGtai();
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const published = useMemo(() => sortBoletinesByDateDesc(getBoletinesGtaiPublished(entries)), [entries]);
  const featured = useMemo(() => getFeaturedBoletin(entries), [entries]);
  const years = useMemo(() => uniqueYearsDesc(entries), [entries]);

  const listFiltered = useMemo(() => {
    if (yearFilter === "all") return published;
    return published.filter((b) => b.year === yearFilter);
  }, [published, yearFilter]);

  const restAfterFeatured = useMemo(() => {
    if (!featured) return listFiltered;
    return listFiltered.filter((b) => b.slug !== featured.slug);
  }, [listFiltered, featured]);

  return (
    <>
      <PageHero
        title="Boletines GTAI"
        subtitle="RECURSOS — CONOCIMIENTO"
        breadcrumb={[
          { label: "Gestión y recursos", path: "/gestion" },
          { label: "Boletines GTAI" },
        ]}
        description="Publicaciones periódicas — Grupo de Asuntos de Internet (GTAI), REGULATEL."
      />

      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div className="mx-auto px-4 md:px-6 lg:px-8" style={{ maxWidth: "1180px" }}>
          {loading && (
            <p className="mb-8 text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>
              Cargando boletines…
            </p>
          )}

          {featured && (yearFilter === "all" || featured.year === yearFilter) && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-12 overflow-hidden rounded-2xl border bg-white"
              style={{
                borderColor: "rgba(22,61,89,0.10)",
                boxShadow: "0 4px 24px rgba(22,61,89,0.08)",
              }}
              aria-label="Boletín destacado"
            >
              <div className="grid gap-0 md:grid-cols-[minmax(200px,320px)_1fr]">
                <div
                  className="relative min-h-[200px] md:min-h-[280px]"
                  style={{ background: "linear-gradient(145deg, rgba(68,137,198,0.14) 0%, rgba(22,61,89,0.12) 100%)" }}
                >
                  {featured.coverImage ? (
                    <img
                      src={featured.coverImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(22,61,89,0.55)] to-transparent p-6 md:p-8">
                    <span
                      className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                    >
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Destacado
                    </span>
                    <p className="text-lg font-bold leading-tight text-white" style={{ fontFamily: "var(--token-font-heading)" }}>
                      {featured.title}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col p-6 md:p-8 lg:p-10">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
                    >
                      {featured.contentType}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--regu-gray-500)" }}>
                      Edición {featured.issueNumber} · {featured.year}
                    </span>
                  </div>
                  <h2
                    className="mb-3 text-2xl font-bold md:text-[1.65rem]"
                    style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                  >
                    Última publicación
                  </h2>
                  <p className="mb-2 text-sm font-semibold" style={{ color: "var(--regu-gray-600)" }}>
                    {featured.groupName}
                  </p>
                  <p className="mb-6 flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                    {new Date(featured.publicationDate + "T12:00:00").toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mb-8 max-w-2xl flex-1 text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
                    {featured.shortSummary}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`${BOLETINES_GTAI_LIST_PATH}/${featured.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ backgroundColor: "var(--regu-blue)" }}
                    >
                      <Eye className="h-4 w-4" />
                      Ver boletín
                    </Link>
                    <a
                      href={featured.pdfFile}
                      download
                      className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                    >
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </a>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              <div>
                <h2
                  className="text-xl font-bold md:text-2xl"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  Archivo de boletines
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  Listado completo, del más reciente al más antiguo
                </p>
              </div>
            </div>

            {years.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="boletin-year" className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: "var(--regu-gray-500)" }}>
                  Año
                </label>
                <select
                  id="boletin-year"
                  value={yearFilter === "all" ? "all" : String(yearFilter)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setYearFilter(v === "all" ? "all" : Number(v));
                  }}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
                  style={{ borderColor: "rgba(22,61,89,0.15)", color: "var(--regu-navy)" }}
                >
                  <option value="all">Todos</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {restAfterFeatured.map((b, index) => (
              <motion.article
                key={b.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: "rgba(22,61,89,0.10)",
                  boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
                }}
              >
                <div
                  className="h-[3px] w-full shrink-0"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                  aria-hidden
                />
                <div className="flex flex-1 flex-col p-6 md:flex-row md:gap-6">
                  <div className="mb-4 shrink-0 md:mb-0 md:w-36">
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl md:w-36"
                      style={{ backgroundColor: "rgba(68,137,198,0.08)" }}
                    >
                      {b.coverImage ? (
                        <img src={b.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText className="h-10 w-10" style={{ color: "var(--regu-blue)", opacity: 0.45 }} aria-hidden />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: "var(--regu-blue)" }}
                      >
                        {b.contentType} · Ed. {b.issueNumber}
                      </span>
                      <span className="text-xs" style={{ color: "var(--regu-gray-400)" }}>
                        {b.year}
                      </span>
                    </div>
                    <h3
                      className="mb-2 font-bold leading-snug"
                      style={{
                        color: "var(--regu-navy)",
                        fontSize: "clamp(1rem, 1.25vw, 1.15rem)",
                        fontFamily: "var(--token-font-heading)",
                      }}
                    >
                      {b.title}
                    </h3>
                    <p className="mb-2 text-xs font-semibold" style={{ color: "var(--regu-gray-600)" }}>
                      {b.groupName}
                    </p>
                    <p className="mb-3 flex items-center gap-1.5 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {new Date(b.publicationDate + "T12:00:00").toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mb-5 line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
                      {b.shortSummary}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Link
                        to={`${BOLETINES_GTAI_LIST_PATH}/${b.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90"
                        style={{ backgroundColor: "var(--regu-navy)" }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver boletín
                      </Link>
                      <a
                        href={b.pdfFile}
                        download
                        className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(22,61,89,0.06)]"
                        style={{ borderColor: "var(--regu-navy)", color: "var(--regu-navy)" }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Descargar PDF
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {!loading && listFiltered.length === 0 && (
            <p className="rounded-xl border bg-white p-10 text-center text-sm font-medium" style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-gray-600)" }}>
              No hay boletines publicados para este criterio.
            </p>
          )}

          <nav
            className="mt-12 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
          >
            <Link
              to="/grupos-de-trabajo"
              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
              style={{ color: "var(--regu-blue)" }}
            >
              <Layers className="h-4 w-4" />
              Grupos de trabajo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
