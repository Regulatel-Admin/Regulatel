import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Download, Eye, X, Maximize2, ArrowLeft, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";

const DOCUMENTOS_ESTUDIOS = [
  {
    id: "conectividad-2022",
    title: "Diagnóstico sobre la Conectividad en la Región de REGULATEL 2022",
    description: "Análisis de la conectividad en la región de REGULATEL (versión final).",
    url: "/documents/estudios/diagnostico-conectividad-region-regulatel-2022.pdf",
  },
  {
    id: "industria-40",
    title: "Diagnóstico sobre la Industria 4.0 en la región de REGULATEL",
    description: "Estudio sobre Industria 4.0 en la región (versión final).",
    url: "/documents/estudios/diagnostico-industria-40-region-regulatel.pdf",
  },
];

export default function EstudiosInvestigacion() {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  return (
    <>
      <PageHero
        title="Estudios e investigación"
        subtitle="CONOCIMIENTO"
        breadcrumb={[{ label: "Estudios e investigación" }]}
        description="Análisis y estudios regulatorios comparados elaborados por REGULATEL."
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
          <div className="space-y-6 mb-12">
            {DOCUMENTOS_ESTUDIOS.map((doc, index) => (
              <motion.article
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: "rgba(22,61,89,0.10)",
                  boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                  aria-hidden
                />
                <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-7">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <h3
                        className="font-bold leading-tight"
                        style={{
                          color: "var(--regu-navy)",
                          fontSize: "clamp(1rem, 1.4vw, 1.175rem)",
                          fontFamily: "var(--token-font-heading)",
                        }}
                      >
                        {doc.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed pl-12 md:pl-0" style={{ color: "var(--regu-gray-600)" }}>
                      {doc.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pl-12 md:pl-0 md:flex-shrink-0">
                    <button
                      onClick={() => setPreviewDoc({ url: doc.url, title: doc.title })}
                      className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ backgroundColor: "var(--regu-blue)" }}
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      Vista previa
                    </button>
                    <a
                      href={doc.url}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      Descargar
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <nav
            className="flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación"
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
              to="/gestion?tipo=revista"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Revista Digital REGULATEL <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>

      {/* Modal vista previa PDF */}
      <AnimatePresence>
        {previewDoc && (
          <React.Fragment key="estudios-preview">
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
                  onClick={() => window.open(previewDoc.url, "_blank")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-white"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Maximize2 className="h-4 w-4" /> Abrir en nueva pestaña
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
}
