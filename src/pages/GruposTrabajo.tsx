import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Download,
  Briefcase,
  Eye,
  X,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { api } from "@/lib/api";
import {
  GRUPOS_TRABAJO_SETTINGS_KEY,
  defaultGruposTrabajo,
  getGrupoTrabajoIcon,
  parseGruposTrabajoFromSettingValue,
  type GrupoTrabajoSerialized,
} from "@/data/gruposTrabajo";
import { useBoletinesGtai } from "@/hooks/useBoletinesGtai";
import {
  BOLETINES_GTAI_LIST_PATH,
  getBoletinesGtaiPublished,
  sortBoletinesByDateDesc,
} from "@/data/boletinesGtai";

export default function GruposTrabajo() {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const [grupos, setGrupos] = useState<GrupoTrabajoSerialized[]>(defaultGruposTrabajo);
  const { entries: boletinesGtai } = useBoletinesGtai();
  const latestGtaiBoletin = useMemo(() => {
    const pub = sortBoletinesByDateDesc(getBoletinesGtaiPublished(boletinesGtai));
    return pub[0] ?? null;
  }, [boletinesGtai]);

  const loadGrupos = useCallback(async () => {
    const res = await api.settings.get(GRUPOS_TRABAJO_SETTINGS_KEY);
    if (res.ok && res.data && res.data.value != null) {
      const parsed = parseGruposTrabajoFromSettingValue(res.data.value);
      if (parsed !== null) {
        setGrupos(parsed);
        return;
      }
    }
    setGrupos(defaultGruposTrabajo);
  }, []);

  useEffect(() => {
    void loadGrupos();
  }, [loadGrupos]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void loadGrupos();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadGrupos]);

  return (
    <>
      <PageHero
        title="Grupos de Trabajo"
        subtitle="QUIÉNES SOMOS"
        breadcrumb={[{ label: "Grupos de Trabajo" }]}
        description="Espacios de colaboración especializada donde los países miembros comparten experiencias y desarrollan soluciones regulatorias comunes."
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
          <div className="mb-10 flex items-start gap-4 md:mb-12">
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
                Grupos activos
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {grupos.length} grupos de trabajo en funcionamiento
              </p>
            </div>
          </div>

          <div className="mb-8 flex items-start gap-4">
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
                Informes finales de los grupos 2025
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Vista previa y descarga del informe de cada grupo de trabajo
              </p>
            </div>
          </div>

          <div className="mb-12 space-y-5">
            {grupos.map((grupo, index) => {
              const Icon = getGrupoTrabajoIcon(grupo.iconKey);
              return (
                <motion.article
                  key={grupo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="grupoCard relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: "rgba(22,61,89,0.10)",
                    boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
                  }}
                >
                  <div
                    className="grupoCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                    aria-hidden
                  />

                  <div className="flex flex-col gap-6 p-6 md:flex-row md:p-7">
                    <div className="flex-shrink-0 md:w-44">
                      <div
                        className="relative aspect-square w-full overflow-hidden rounded-xl md:w-44"
                        style={{ backgroundColor: "rgba(68,137,198,0.08)" }}
                      >
                        <img
                          src={grupo.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                        <div
                          className="absolute inset-0 hidden items-center justify-center rounded-xl"
                          style={{ backgroundColor: "rgba(68,137,198,0.08)" }}
                          aria-hidden
                        >
                          <Icon className="h-14 w-14" style={{ color: "var(--regu-blue)", opacity: 0.6 }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="mb-3 flex items-start gap-3">
                        <span
                          className="mt-0.5 inline-block flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                          style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                        >
                          GT {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className="font-bold leading-tight"
                          style={{
                            color: "var(--regu-navy)",
                            fontSize: "clamp(1rem, 1.4vw, 1.175rem)",
                            fontFamily: "var(--token-font-heading)",
                          }}
                        >
                          {grupo.title}
                        </h3>
                      </div>

                      <p className="mb-5 text-sm leading-relaxed md:text-base" style={{ color: "var(--regu-gray-600)" }}>
                        {grupo.description}
                      </p>

                      <div className="mb-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} aria-hidden />
                            <span
                              className="text-[10px] font-bold uppercase tracking-[0.10em]"
                              style={{ color: "var(--regu-gray-500)" }}
                            >
                              Coordinadores
                            </span>
                          </div>
                          <div className="space-y-1">
                            {grupo.coordinadores.map((c, i) => (
                              <p key={i} className="text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
                                {c}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} aria-hidden />
                            <span
                              className="text-[10px] font-bold uppercase tracking-[0.10em]"
                              style={{ color: "var(--regu-gray-500)" }}
                            >
                              Miembros
                            </span>
                          </div>
                          <div className="space-y-1">
                            {grupo.miembros.map((m, i) => (
                              <p key={i} className="text-sm" style={{ color: "var(--regu-gray-700)" }}>
                                {m}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {grupo.id === "asuntos-internet" && latestGtaiBoletin && (
                        <div
                          className="mb-5 rounded-xl border px-4 py-4 md:px-5 md:py-5"
                          style={{
                            borderColor: "rgba(68,137,198,0.20)",
                            background: "linear-gradient(125deg, rgba(68,137,198,0.07) 0%, rgba(255,255,255,0.96) 55%)",
                            boxShadow: "0 1px 0 rgba(22,61,89,0.04)",
                          }}
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
                              >
                                <Newspaper className="h-4 w-4" aria-hidden />
                              </div>
                              <div>
                                <p
                                  className="text-[10px] font-bold uppercase tracking-[0.12em]"
                                  style={{ color: "var(--regu-blue)" }}
                                >
                                  Boletines del grupo
                                </p>
                                <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                                  Publicación más reciente del GTAI
                                </p>
                              </div>
                            </div>
                            <Link
                              to={BOLETINES_GTAI_LIST_PATH}
                              className="inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition hover:bg-white"
                              style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                            >
                              Ver todos los boletines
                              <ArrowRight className="h-3 w-3" aria-hidden />
                            </Link>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div
                              className="relative h-16 w-full shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-24"
                              style={{ backgroundColor: "rgba(68,137,198,0.08)" }}
                            >
                              {latestGtaiBoletin.coverImage ? (
                                <img
                                  src={latestGtaiBoletin.coverImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Newspaper className="h-6 w-6 opacity-40" style={{ color: "var(--regu-blue)" }} aria-hidden />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold leading-snug" style={{ color: "var(--regu-navy)" }}>
                                {latestGtaiBoletin.title}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
                                {latestGtaiBoletin.shortSummary}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Link
                                  to={`${BOLETINES_GTAI_LIST_PATH}/${latestGtaiBoletin.slug}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90"
                                  style={{ backgroundColor: "var(--regu-blue)" }}
                                >
                                  Ver boletín
                                </Link>
                                <a
                                  href={latestGtaiBoletin.pdfFile}
                                  download
                                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(68,137,198,0.06)]"
                                  style={{ borderColor: "var(--regu-navy)", color: "var(--regu-navy)" }}
                                >
                                  <Download className="h-3 w-3" aria-hidden />
                                  PDF
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div
                        className="mt-auto flex flex-wrap items-center gap-2.5 border-t pt-4"
                        style={{ borderColor: "rgba(22,61,89,0.07)" }}
                      >
                        {grupo.termsUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({ url: grupo.termsUrl!, title: `Términos de referencia — ${grupo.title}` })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                              style={{ backgroundColor: "var(--regu-blue)" }}
                            >
                              <Eye className="h-3.5 w-3.5 shrink-0" />
                              Vista previa
                            </button>
                            <a
                              href={grupo.termsUrl}
                              download
                              className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                              style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                            >
                              <Download className="h-3.5 w-3.5 shrink-0" />
                              Términos de referencia
                            </a>
                          </>
                        )}
                        {grupo.informeUrl && (
                          <>
                            {grupo.informeUrl.toLowerCase().endsWith(".pdf") ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewDoc({ url: grupo.informeUrl!, title: `Informe 2025 — ${grupo.title}` })
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                                style={{ backgroundColor: "var(--regu-navy)" }}
                              >
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                Ver informe
                              </button>
                            ) : (
                              <a
                                href={grupo.informeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-navy)] focus-visible:ring-offset-2"
                                style={{ backgroundColor: "var(--regu-navy)" }}
                                title="Los archivos PPTX se abren en nueva pestaña o se descargan según el navegador"
                              >
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                Abrir informe
                              </a>
                            )}
                            <a
                              href={grupo.informeUrl}
                              download
                              className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(22,61,89,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-navy)] focus-visible:ring-offset-2"
                              style={{ borderColor: "var(--regu-navy)", color: "var(--regu-navy)" }}
                            >
                              <Download className="h-3.5 w-3.5 shrink-0" />
                              Descargar informe
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <section
            className="rounded-2xl border bg-white p-8 md:p-10"
            style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04)" }}
          >
            <h2
              className="mb-5 flex items-center gap-3 text-lg font-bold md:text-xl"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              <span
                className="inline-block h-5 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              Sobre los Grupos de Trabajo
            </h2>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
              <p>
                Los grupos de trabajo son espacios especializados donde los países miembros trabajan en temas del sector
                de las telecomunicaciones, compartiendo experiencias y desarrollando soluciones comunes.
              </p>
              <p>
                Cada grupo cuenta con al menos un organismo coordinador y miembros que participan activamente en el
                intercambio de conocimientos, elaboración de recomendaciones técnicas y documentos de referencia.
              </p>
            </div>
          </section>

          <nav
            className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.06)",
              }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Inicio
            </Link>
            <Link
              to="/miembros"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Ver todos los miembros <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {previewDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewDoc(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:inset-8 lg:inset-12"
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4 md:px-6"
                style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold" style={{ color: "var(--regu-gray-900)" }}>
                      {previewDoc.title}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                      Vista previa del documento
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-[var(--regu-gray-100)]"
                    style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }}
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-[#F0F0F0]">
                <iframe
                  src={`${previewDoc.url}#toolbar=1`}
                  className="h-full w-full border-0"
                  title={previewDoc.title}
                  style={{ minHeight: "400px" }}
                />
              </div>
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3"
                style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}
              >
                <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                  Usa los controles del visor para navegar
                </p>
                <button
                  type="button"
                  onClick={() => window.open(previewDoc.url, "_blank")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-white"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Maximize2 className="h-4 w-4" /> Abrir en nueva pestaña
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
