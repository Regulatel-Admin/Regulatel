import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Eye, FileDown, Download, X, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { resolveDocumentSearch } from "@/data/searchMaps";
import { searchDocuments, type GestionDocument } from "@/data/gestion";

export default function BuscarDocumentos() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categoryResults = resolveDocumentSearch(q);
  const docResults = searchDocuments(q);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-12 md:py-16"
      style={{ fontFamily: "var(--token-font-body)" }}
    >
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--regu-gray-900)" }}
      >
        Buscar documentos
      </h1>
      {q ? (
        <>
          <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Resultados para: <strong style={{ color: "var(--regu-gray-900)" }}>{q}</strong>
          </p>

          {/* Documentos concretos (actas, revistas, etc.) con Vista previa / Descargar */}
          {docResults.length > 0 && (
            <div className="mt-6">
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Documentos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                  {docResults.map((doc, index) => (
                    <DocResultCard
                      key={doc.id}
                      doc={doc}
                      index={index}
                      onPreview={() => setPreviewDoc({ url: doc.url, title: doc.title })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Enlaces por categoría (Revista Digital, Planes, Actas de asambleas, etc.) */}
          {categoryResults.length > 0 && (
            <div className={docResults.length > 0 ? "mt-10" : "mt-6"}>
              {docResults.length > 0 && (
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--regu-gray-900)" }}
                >
                  Ver por categoría
                </h2>
              )}
              <ul className="space-y-4">
                {categoryResults.map((entry, i) => (
                  <li key={`${entry.label}-${i}`}>
                    {entry.path.startsWith("http") ? (
                      <a
                        href={entry.path}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex gap-3 rounded-xl border border-[var(--regu-gray-100)] bg-white p-4 transition hover:border-[var(--news-accent)] hover:shadow-md"
                      >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: "rgba(68, 137, 198, 0.12)",
                          color: "var(--regu-blue)",
                        }}
                      >
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--regu-gray-900)" }}
                        >
                          {entry.label}
                        </span>
                        {entry.description && (
                          <p
                            className="mt-0.5 text-sm"
                            style={{ color: "var(--regu-gray-500)" }}
                          >
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </a>
                    ) : (
                      <Link
                        to={entry.path}
                        className="flex gap-3 rounded-xl border border-[var(--regu-gray-100)] bg-white p-4 transition hover:border-[var(--news-accent)] hover:shadow-md"
                      >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: "rgba(68, 137, 198, 0.12)",
                          color: "var(--regu-blue)",
                        }}
                      >
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--regu-gray-900)" }}
                        >
                          {entry.label}
                        </span>
                        {entry.description && (
                          <p
                            className="mt-0.5 text-sm"
                            style={{ color: "var(--regu-gray-500)" }}
                          >
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {docResults.length === 0 && categoryResults.length === 0 && (
            <p className="mt-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>
              No se encontraron documentos para ese término. Pruebe con
              &quot;revista&quot;, &quot;planes&quot;, &quot;actas&quot;, &quot;acta&quot; o
              &quot;documentos&quot;.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Use la barra de búsqueda de documentos del encabezado para buscar
          revistas digitales, planes de trabajo, actas y más.
        </p>
      )}
      <Link
        to="/"
        className="mt-8 inline-block text-sm font-medium"
        style={{ color: "var(--regu-blue)" }}
      >
        Volver al inicio
      </Link>

      {/* Modal Vista previa (mismo estilo que en Gestión) */}
      <AnimatePresence>
        {previewDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewDoc(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{ borderColor: "var(--regu-gray-100)" }}
            >
              <div
                className="flex items-center justify-between p-4 md:p-6 border-b"
                style={{
                  borderColor: "var(--regu-gray-100)",
                  backgroundColor: "var(--regu-offwhite)",
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(68, 137, 198, 0.15)", color: "var(--regu-blue)" }}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg md:text-xl font-bold truncate"
                      style={{ color: "var(--regu-gray-900)" }}
                    >
                      {previewDoc.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                      Vista previa del documento
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-95"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center transition-colors hover:bg-[var(--regu-gray-100)]"
                    style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-100">
                <iframe
                  src={`${previewDoc.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={`Preview de ${previewDoc.title}`}
                  style={{ minHeight: "400px" }}
                />
              </div>
              <div
                className="p-4 border-t flex items-center justify-between flex-wrap gap-2"
                style={{ borderColor: "var(--regu-gray-100)", backgroundColor: "var(--regu-offwhite)" }}
              >
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  <span className="font-medium">Nota:</span> Usa los controles del visor para navegar el documento
                </p>
                <button
                  onClick={() => window.open(previewDoc.url, "_blank")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-white"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Maximize2 className="w-4 h-4" />
                  Abrir en nueva pestaña
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DocResultCard({
  doc,
  index,
  onPreview,
}: {
  doc: GestionDocument;
  index: number;
  onPreview: () => void;
}) {
  const isRevista = doc.category === "revista";
  const Icon = isRevista ? FileText : doc.category === "planes-actas" ? Calendar : FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className="h-full transition-all hover:shadow-lg border"
        style={{
          borderColor: "var(--regu-gray-100)",
          boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)",
          borderRadius: "var(--token-radius-card)",
        }}
      >
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {(doc.quarter || doc.year) && (
                <span
                  className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold mb-2"
                  style={{
                    backgroundColor: "rgba(68, 137, 198, 0.12)",
                    color: "var(--regu-blue)",
                  }}
                >
                  {doc.quarter ? `${doc.quarter} ${doc.year}` : doc.year}
                </span>
              )}
              <h3
                className="text-base font-semibold leading-tight"
                style={{ color: "var(--regu-gray-900)" }}
              >
                {doc.title}
              </h3>
            </div>
            <Icon
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "var(--regu-blue)" }}
            />
          </div>
          <div className="flex gap-2 mt-auto flex-wrap">
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-95"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Eye className="w-4 h-4" />
              Vista previa
            </button>
            <a
              href={doc.url}
              download={!doc.url.startsWith("http")}
              target={doc.url.startsWith("http") ? "_blank" : undefined}
              rel={doc.url.startsWith("http") ? "noreferrer noopener" : undefined}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--regu-offwhite)]"
              style={{
                borderColor: "var(--regu-blue)",
                color: "var(--regu-blue)",
              }}
            >
              <FileDown className="w-4 h-4" />
              Descargar
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
