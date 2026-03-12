import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Eye,
  Download,
  X,
  Maximize2,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Archive,
  Files,
  Search,
} from "lucide-react";
import { resolveDocumentSearch } from "@/data/searchMaps";
import { searchDocumentsInList, type GestionDocument } from "@/data/gestion";
import { useMergedGestionDocuments } from "@/contexts/AdminDataContext";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  revista: <BookOpen className="h-5 w-5" />,
  "planes-actas": <ClipboardList className="h-5 w-5" />,
  asamblea: <Archive className="h-5 w-5" />,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? <FileText className="h-5 w-5" />;
}

function getCategoryLabel(category: string) {
  if (category === "revista") return "Revista Digital";
  if (category === "planes-actas") return "Planes de trabajo";
  if (category === "asamblea") return "Asamblea";
  return "Documento";
}

export default function BuscarDocumentos() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const mergedDocuments = useMergedGestionDocuments();
  const categoryResults = resolveDocumentSearch(q);
  const docResults = searchDocumentsInList(mergedDocuments, q);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const hasResults = docResults.length > 0 || categoryResults.length > 0;

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      {/* Blue accent bar */}
      <div style={{ backgroundColor: "var(--regu-blue)", height: "4px" }} aria-hidden />

      <div className="mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14" style={{ maxWidth: "960px" }}>

        {/* ── Page header ── */}
        <div className="mb-8 flex items-start gap-4">
          <div
            className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
            style={{ backgroundColor: "var(--regu-blue)" }}
            aria-hidden
          />
          <div>
            <h1
              className="text-2xl font-bold md:text-[1.875rem]"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              Buscar documentos
            </h1>
            {q ? (
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Resultados para:{" "}
                <strong className="font-bold" style={{ color: "var(--regu-navy)" }}>
                  &ldquo;{q}&rdquo;
                </strong>
              </p>
            ) : (
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Busca revistas, planes de trabajo, actas y más publicaciones de REGULATEL.
              </p>
            )}
          </div>
        </div>

        {q ? (
          <>
            {/* ── Document cards ── */}
            {docResults.length > 0 && (
              <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: "var(--regu-gray-400)" }}
                  >
                    {docResults.length} documento{docResults.length !== 1 ? "s" : ""} encontrado{docResults.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </section>
            )}

            {/* ── Category links ── */}
            {categoryResults.length > 0 && (
              <section className={docResults.length > 0 ? "mb-10" : "mb-10"}>
                <p
                  className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: "var(--regu-gray-400)" }}
                >
                  Ver por categoría
                </p>
                <div
                  className="overflow-hidden rounded-2xl border bg-white"
                  style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04)" }}
                >
                  {categoryResults.map((entry, i, arr) => {
                    const inner = (
                      <>
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                        >
                          <Files className="h-5 w-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm" style={{ color: "var(--regu-navy)" }}>
                            {entry.label}
                          </p>
                          {entry.description && (
                            <p className="mt-0.5 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                              {entry.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ color: "var(--regu-blue)" }}
                        />
                      </>
                    );

                    const cls = `group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(68,137,198,0.04)] ${i < arr.length - 1 ? "border-b" : ""}`;
                    const bColor = "rgba(22,61,89,0.07)";

                    return entry.path.startsWith("http") ? (
                      <a
                        key={`${entry.label}-${i}`}
                        href={entry.path}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cls}
                        style={{ borderColor: bColor }}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link
                        key={`${entry.label}-${i}`}
                        to={entry.path}
                        className={cls}
                        style={{ borderColor: bColor }}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Empty state ── */}
            {!hasResults && (
              <div
                className="rounded-2xl border bg-white px-8 py-12 text-center"
                style={{ borderColor: "rgba(22,61,89,0.10)" }}
              >
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "rgba(68,137,198,0.10)" }}
                >
                  <Search className="h-7 w-7" style={{ color: "var(--regu-blue)" }} />
                </div>
                <h2 className="text-base font-bold mb-2" style={{ color: "var(--regu-navy)" }}>
                  Sin resultados para &ldquo;{q}&rdquo;
                </h2>
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  Prueba con términos como{" "}
                  {["revista", "planes", "actas", "declaraciones"].map((t, i, a) => (
                    <span key={t}>
                      <strong className="font-semibold" style={{ color: "var(--regu-navy)" }}>{t}</strong>
                      {i < a.length - 1 ? ", " : "."}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </>
        ) : (
          /* ── Empty query state ── */
          <div
            className="rounded-2xl border bg-white px-8 py-12 text-center"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(68,137,198,0.10)" }}
            >
              <FileText className="h-7 w-7" style={{ color: "var(--regu-blue)" }} />
            </div>
            <h2 className="text-base font-bold mb-2" style={{ color: "var(--regu-navy)" }}>
              Busca un documento
            </h2>
            <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
              Usa la barra de búsqueda del encabezado para buscar revistas digitales, planes de trabajo, actas y más.
            </p>
          </div>
        )}

        {/* Back link */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-75"
          style={{ color: "var(--regu-blue)" }}
        >
          ← Volver al inicio
        </Link>
      </div>

      {/* ── PDF Preview Modal ── */}
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
              {/* Modal header */}
              <div
                className="flex items-center gap-4 border-b px-5 py-4 md:px-6"
                style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="truncate text-base font-bold md:text-lg"
                    style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                  >
                    {previewDoc.title}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                    Vista previa del documento
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-[rgba(22,61,89,0.05)]"
                    style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-600)" }}
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* iframe */}
              <div className="flex-1 overflow-hidden bg-[#F0F2F4]">
                <iframe
                  src={`${previewDoc.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="h-full w-full border-0"
                  title={`Preview de ${previewDoc.title}`}
                  style={{ minHeight: "400px" }}
                />
              </div>

              {/* Modal footer */}
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 md:px-6"
                style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}
              >
                <p className="text-xs" style={{ color: "var(--regu-gray-400)" }}>
                  Usa los controles del visor para navegar el documento.
                </p>
                <button
                  onClick={() => window.open(previewDoc.url, "_blank")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.08)]"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
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
  const icon = getCategoryIcon(doc.category);
  const categoryLabel = getCategoryLabel(doc.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="h-full"
    >
      <div
        className="convenioCard flex h-full flex-col rounded-2xl border bg-white transition-all"
        style={{
          borderColor: "rgba(22,61,89,0.10)",
          boxShadow: "0 2px 8px rgba(22,61,89,0.05)",
          borderTop: "3px solid var(--regu-blue)",
        }}
      >
        <div className="flex flex-1 flex-col p-5">
          {/* Top row */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {(doc.quarter || doc.year) && (
                <span
                  className="mb-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                >
                  {doc.quarter ? `${doc.quarter} ${doc.year}` : doc.year}
                </span>
              )}
              {!doc.quarter && !doc.year && (
                <span
                  className="mb-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{ backgroundColor: "rgba(22,61,89,0.06)", color: "var(--regu-gray-500)" }}
                >
                  {categoryLabel}
                </span>
              )}
              <h3
                className="text-sm font-bold leading-snug md:text-base"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                {doc.title}
              </h3>
            </div>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
            >
              {icon}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-auto flex flex-wrap gap-2">
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Eye className="h-3.5 w-3.5" />
              Vista previa
            </button>
            <a
              href={doc.url}
              download={!doc.url.startsWith("http")}
              target={doc.url.startsWith("http") ? "_blank" : undefined}
              rel={doc.url.startsWith("http") ? "noreferrer noopener" : undefined}
              className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all hover:bg-[rgba(68,137,198,0.06)]"
              style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-blue)" }}
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
