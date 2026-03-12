import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, FileText, Download, Briefcase, Network, TrendingUp,
  Shield, Sparkles, BarChart3, Wifi, Eye, X, Maximize2, ArrowLeft, ArrowRight,
} from "lucide-react";
import PageHero from "@/components/PageHero";

interface GrupoTrabajo {
  id: string;
  title: string;
  description: string;
  coordinadores: string[];
  miembros: string[];
  icon: React.ElementType;
  imageUrl: string;
  termsUrl?: string;
}

const GRUPOS: GrupoTrabajo[] = [
  {
    id: "proteccion-empoderamiento-usuarios",
    title: "Protección y empoderamiento de los usuarios",
    description: "Buenas prácticas regulatorias en atención al usuario, seguridad de dispositivos y control de fraudes en telecomunicaciones.",
    coordinadores: ["OSIPTEL, Perú"],
    miembros: ["SUTEL, Costa Rica", "ATT, Bolivia", "INDOTEL, República Dominicana", "CRC, Colombia"],
    icon: Shield,
    imageUrl: "/grupos-trabajo/proteccion-empoderamiento-usuarios.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-proteccion-empoderamiento-usuarios.pdf",
  },
  {
    id: "cierre-brecha-calidad",
    title: "Cierre de brecha y calidad de servicios",
    description: "Intercambio de experiencias sobre calidad, despliegue y compartición de infraestructura para cerrar la brecha digital.",
    coordinadores: ["CRC, Colombia"],
    miembros: ["ASEP, Panamá", "ATT, Bolivia"],
    icon: Wifi,
    imageUrl: "/grupos-trabajo/cierre-brecha-calidad.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-cierre-brecha-calidad.pdf",
  },
  {
    id: "indicadores-telecomunicaciones-tic",
    title: "Indicadores de Telecomunicaciones / TIC",
    description: "Estadísticas regionales y tecnologías emergentes para optimizar y visualizar datos de conectividad.",
    coordinadores: ["CRT, México", "SUTEL, Costa Rica"],
    miembros: ["INDOTEL, República Dominicana", "ATT, Bolivia"],
    icon: BarChart3,
    imageUrl: "/grupos-trabajo/indicadores-telecomunicaciones-tic.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-indicadores-telecomunicaciones-tic.pdf",
  },
  {
    id: "fortalecimiento-institucional",
    title: "Fortalecimiento Institucional",
    description: "Iniciativas para la autoevaluación, transparencia y financiamiento del Foro en favor de la eficiencia regulatoria.",
    coordinadores: ["OSIPTEL, Perú"],
    miembros: ["ANATEL, Brasil", "INDOTEL, República Dominicana"],
    icon: TrendingUp,
    imageUrl: "/grupos-trabajo/fortalecimiento-institucional.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-fortalecimiento-institucional.pdf",
  },
  {
    id: "asuntos-internet",
    title: "Asuntos de Internet",
    description: "Intercambio de experiencias sobre Internet desde perspectiva regulatoria, técnica y de gobernanza.",
    coordinadores: ["ENACOM, Argentina", "ANATEL, Brasil"],
    miembros: ["ASEP, Panamá"],
    icon: Network,
    imageUrl: "/grupos-trabajo/asuntos-internet.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-asuntos-internet.pdf",
  },
  {
    id: "mercados-digitales",
    title: "Mercados Digitales",
    description: "Espacio de diálogo para anticipar retos y oportunidades en mercados y servicios digitales.",
    coordinadores: ["CRC, Colombia", "ANATEL, Brasil"],
    miembros: ["OSIPTEL, Perú (TBC)"],
    icon: Briefcase,
    imageUrl: "/grupos-trabajo/mercados-digitales.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-mercados-digitales.pdf",
  },
  {
    id: "innovacion-mejora-regulatoria",
    title: "Innovación y mejora regulatoria",
    description: "Promover marcos regulatorios eficientes y transparentes que impulsen la innovación y la competencia.",
    coordinadores: ["CRC, Colombia"],
    miembros: ["INDOTEL, República Dominicana", "ENACOM, Argentina", "ASEP, Panamá"],
    icon: Sparkles,
    imageUrl: "/grupos-trabajo/innovacion-mejora-regulatoria.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-innovacion-mejora-regulatoria.pdf",
  },
  {
    id: "paridad-sociedad-informacion",
    title: "Paridad en la Sociedad de la Información",
    description: "Fomento de medidas regulatorias para la equidad en TIC y la igualdad de género, alineadas con los ODS.",
    coordinadores: ["INDOTEL, República Dominicana", "CONATEL, Paraguay"],
    miembros: ["ATT, Bolivia"],
    icon: Users,
    imageUrl: "/grupos-trabajo/paridad-sociedad-informacion.jpg",
    termsUrl: "/documents/grupos-trabajo/terminos-referencia-paridad-sociedad-informacion.pdf",
  },
  {
    id: "ciberseguridad",
    title: "Ciberseguridad",
    description: "Impulsar el análisis regulatorio y las buenas prácticas para fortalecer la seguridad digital en telecomunicaciones a nivel regional.",
    coordinadores: ["INDOTEL, República Dominicana"],
    miembros: ["ANATEL, Brasil"],
    icon: Shield,
    imageUrl: "/grupos-trabajo/ciberseguridad.jpg",
    termsUrl: "/documents/grupos-trabajo/TdR_CIberseguirdad_2026.pdf",
  },
];

export default function GruposTrabajo() {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

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
        <div
          className="mx-auto px-4 md:px-6 lg:px-8"
          style={{ maxWidth: "1180px" }}
        >
          {/* Header de sección */}
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
                {GRUPOS.length} grupos de trabajo en funcionamiento
              </p>
            </div>
          </div>

          {/* Lista de grupos */}
          <div className="space-y-5 mb-12">
            {GRUPOS.map((grupo, index) => {
              const Icon = grupo.icon;
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
                  {/* Acento top */}
                  <div
                    className="grupoCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                    aria-hidden
                  />

                  <div className="flex flex-col gap-6 p-6 md:flex-row md:p-7">
                    {/* Imagen / Ícono */}
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

                    {/* Contenido */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      {/* Número + título */}
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

                      <p
                        className="mb-5 text-sm leading-relaxed md:text-base"
                        style={{ color: "var(--regu-gray-600)" }}
                      >
                        {grupo.description}
                      </p>

                      {/* Coordinadores + Miembros */}
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

                      {/* CTAs */}
                      {grupo.termsUrl && (
                        <div
                          className="mt-auto flex flex-wrap items-center gap-2.5 border-t pt-4"
                          style={{ borderColor: "rgba(22,61,89,0.07)" }}
                        >
                          <button
                            onClick={() => setPreviewDoc({ url: grupo.termsUrl!, title: `Términos de referencia — ${grupo.title}` })}
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
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Bloque informativo */}
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
                Los grupos de trabajo son espacios especializados donde los países miembros trabajan en temas
                del sector de las telecomunicaciones, compartiendo experiencias y desarrollando soluciones comunes.
              </p>
              <p>
                Cada grupo cuenta con al menos un organismo coordinador y miembros que participan activamente
                en el intercambio de conocimientos, elaboración de recomendaciones técnicas y documentos de referencia.
              </p>
            </div>
          </section>

          {/* Footer nav */}
          <nav
            className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ color: "var(--regu-blue)", borderColor: "var(--regu-blue)", backgroundColor: "rgba(68,137,198,0.06)" }}
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

      {/* Modal PDF */}
      <AnimatePresence>
        {previewDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold" style={{ color: "var(--regu-gray-900)" }}>{previewDoc.title}</h3>
                    <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>Vista previa del documento</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <a href={previewDoc.url} download className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: "var(--regu-blue)" }}>
                    <Download className="h-4 w-4" /><span className="hidden sm:inline">Descargar</span>
                  </a>
                  <button onClick={() => setPreviewDoc(null)} className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-[var(--regu-gray-100)]" style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }} aria-label="Cerrar">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-[#F0F0F0]">
                <iframe src={`${previewDoc.url}#toolbar=1`} className="h-full w-full border-0" title={previewDoc.title} style={{ minHeight: "400px" }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3" style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}>
                <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>Usa los controles del visor para navegar</p>
                <button onClick={() => window.open(previewDoc.url, "_blank")} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-white" style={{ color: "var(--regu-blue)" }}>
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
