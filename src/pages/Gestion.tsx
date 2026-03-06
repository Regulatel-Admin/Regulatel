import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  Calendar,
  FileDown,
  Eye,
  X,
  Maximize2,
  BookOpen,
  Search,
  Lock,
} from "lucide-react";
import { getRestrictedDocument, isRestrictedUnlocked } from "@/config/restrictedDocuments";
import PageHero from "@/components/PageHero";
import {
  gestionDocuments,
  filterByTipo,
  GESTION_TIPO_VALUES,
  GESTION_TAB_LABELS,
  GESTION_BLOCK_TITLES,
  type GestionTipo,
  type GestionDocument,
} from "@/data/gestion";

function normalizeSearch(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

function filterBySearch(docs: GestionDocument[], query: string): GestionDocument[] {
  const q = normalizeSearch(query);
  if (!q) return docs;
  return docs.filter((d) => {
    const titleNorm = normalizeSearch(d.title);
    const yearStr = d.year ? normalizeSearch(d.year) : "";
    const quarterStr = d.quarter ? normalizeSearch(d.quarter) : "";
    const catNorm = normalizeSearch(d.category);
    return (
      titleNorm.includes(q) ||
      yearStr.includes(q) ||
      quarterStr.includes(q) ||
      catNorm.includes(q)
    );
  });
}

/** Ruta específica para el heading según el filtro actual (compartible) */
function getBlockHeadingHref(tipo: GestionTipo): string {
  if (tipo === "todo") return "/gestion";
  return `/gestion?tipo=${tipo}`;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const SEARCH_DEBOUNCE_MS = 200;

export default function Gestion() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipo = (searchParams.get("tipo") ?? "todo") as GestionTipo;
  const docId = searchParams.get("id") ?? null;
  const searchQuery = searchParams.get("q") ?? "";
  const validTipo = GESTION_TIPO_VALUES.includes(tipo) ? tipo : "todo";
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredByTipo = filterByTipo(gestionDocuments, validTipo === "todo" ? null : validTipo);
  const filtered = filterBySearch(filteredByTipo, searchQuery);
  const hasDocId = docId && filtered.some((d) => d.id === docId);
  /** Si hay ?id= y el doc existe, mostrar solo ese documento (enlace directo desde menú). */
  const displayList = docId && hasDocId ? filtered.filter((d) => d.id === docId) : filtered;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const q = searchInput.trim();
        if (q) next.set("q", q);
        else next.delete("q");
        return next;
      }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput, setSearchParams]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const setTipo = (value: GestionTipo) => {
    if (value === "todo") {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("tipo");
        next.delete("id");
        return next;
      }, { replace: true });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tipo", value);
        return next;
      }, { replace: true });
    }
  };

  useEffect(() => {
    if (validTipo !== "todo" && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [validTipo]);

  // Scroll al documento cuando la URL tiene ?id= (p. ej. desde el menú Recursos)
  useEffect(() => {
    if (!docId || !hasDocId) return;
    const id = docId;
    const scrollToEl = () => {
      const el = document.getElementById(`doc-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    const t1 = setTimeout(scrollToEl, 180);
    const t2 = setTimeout(scrollToEl, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [docId, hasDocId, displayList.length]);

  const blockTitle =
    validTipo === "todo"
      ? "Documentos y recursos"
      : GESTION_BLOCK_TITLES[validTipo as Exclude<GestionTipo, "todo">];

  return (
    <>
      <PageHero
        title="Gestión"
        breadcrumb={[{ label: "Gestión" }]}
        description="Documentos, informes y recursos institucionales de REGULATEL"
      />

      <div
        className="w-full py-10 md:py-14 bg-gradient-to-b from-[var(--regu-offwhite)] to-[var(--regu-gray-100)]"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        <div
          className="container px-4 md:px-6 mx-auto"
          style={{ maxWidth: "var(--token-container-max)" }}
        >
          {/* Título + subtítulo */}
          <div className="mb-6">
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "var(--regu-gray-900)" }}
            >
              Gestión
            </h1>
            <p
              className="mt-1 text-base"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Documentos, informes y recursos institucionales de REGULATEL
            </p>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <label htmlFor="gestion-search" className="sr-only">
              Buscar documentos
            </label>
            <div
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 max-w-md"
              style={{ borderColor: "var(--regu-gray-100)" }}
            >
              <Search
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--regu-gray-500)" }}
                aria-hidden
              />
              <input
                id="gestion-search"
                type="search"
                placeholder="Buscar por título, año o categoría..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-w-0 border-0 bg-transparent py-1 text-base outline-none placeholder:italic"
                style={{ color: "var(--regu-gray-900)" }}
                aria-label="Buscar documentos"
              />
            </div>
          </div>

          {/* Tabs / Chips de categorías */}
          <div
            className="gestionTabs flex flex-wrap gap-2 mb-8"
            role="tablist"
            aria-label="Filtrar por categoría"
          >
            {GESTION_TIPO_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={validTipo === value}
                onClick={() => setTipo(value)}
                className="gestionTab px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  borderColor:
                    validTipo === value ? "var(--regu-blue)" : "var(--regu-gray-100)",
                  backgroundColor:
                    validTipo === value ? "rgba(68, 137, 198, 0.1)" : "white",
                  color: validTipo === value ? "var(--regu-blue)" : "var(--regu-gray-900)",
                }}
              >
                {GESTION_TAB_LABELS[value]}
              </button>
            ))}
          </div>

          {/* Contenido filtrado — ref para scroll; con ?id= se muestra solo ese doc */}
          <div ref={contentRef}>
            {displayList.length === 0 ? (
              <div
                className="rounded-2xl border border-[var(--regu-gray-100)] bg-white p-10 text-center"
                style={{ color: "var(--regu-gray-500)" }}
              >
                <p className="text-lg font-medium">
                  {searchQuery
                    ? "Ningún documento coincide con la búsqueda."
                    : "No hay documentos en esta categoría todavía."}
                </p>
                <p className="mt-2 text-sm">
                  {searchQuery
                    ? "Pruebe otro término o quite el filtro de búsqueda."
                    : "Seleccione otra categoría o vuelva a \"Todo\" para ver todos los documentos."}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6" style={{ color: "var(--regu-gray-900)" }}>
                  <Link
                    to={getBlockHeadingHref(validTipo)}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
                    style={{ color: "inherit" }}
                  >
                    {blockTitle}
                  </Link>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {displayList.map((doc, index) => (
                      <div key={doc.id} id={`doc-${doc.id}`} className="scroll-mt-24">
                        <DocCard
                          doc={doc}
                          index={index}
                          deepLink={`/gestion?tipo=${doc.category}&id=${doc.id}`}
                          onPreview={() => setPreviewDoc({ url: doc.url, title: doc.title })}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Bloque informativo (solo cuando se ve Todo) */}
          {validTipo === "todo" && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-12 rounded-2xl border p-6 md:p-8 bg-white/90"
              style={{
                borderColor: "var(--regu-gray-100)",
                boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)",
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Sobre la Gestión de REGULATEL
              </h2>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                <p>
                  La gestión de REGULATEL incluye la planificación estratégica anual, la documentación
                  de asambleas y reuniones, así como la publicación regular de revistas digitales que
                  reflejan las actividades y logros del Foro.
                </p>
                <p>
                  Todos los documentos oficiales están disponibles para descarga y proporcionan
                  transparencia sobre el trabajo realizado por REGULATEL en la promoción de la
                  cooperación regional en el sector de las telecomunicaciones.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de Preview de PDF */}
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
    </>
  );
}

function DocCard({
  doc,
  index,
  deepLink,
  onPreview,
}: {
  doc: GestionDocument;
  index: number;
  deepLink: string;
  onPreview: () => void;
}) {
  const isRevista = doc.category === "revista";
  const isRestrictedDoc = getRestrictedDocument(doc.id) !== null;
  const isUnlocked = isRestrictedDoc && isRestrictedUnlocked(doc.id);
  const isRestricted = isRestrictedDoc && !isUnlocked;
  const Icon = isRevista ? BookOpen : doc.category === "planes-actas" ? Calendar : FileText;
  const accessUrl = `/acceso-documentos?doc=${encodeURIComponent(doc.id)}`;

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
              <h3 className="text-base font-semibold leading-tight" style={{ color: "var(--regu-gray-900)" }}>
                <Link
                  to={isRestricted ? accessUrl : deepLink}
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
                  style={{ color: "inherit" }}
                >
                  {doc.title}
                </Link>
              </h3>
              {isRestricted && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 opacity-85" style={{ color: "var(--regu-gray-500)" }} aria-hidden />
                  <span className="text-xs font-medium" style={{ color: "var(--regu-gray-500)" }}>
                    Acceso restringido
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isRestricted && (
                <Lock className="w-5 h-5" style={{ color: "var(--regu-gray-500)" }} aria-hidden />
              )}
              <Icon
                className="w-5 h-5"
                style={{ color: "var(--regu-blue)" }}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-auto flex-wrap">
            {isRestricted ? (
              <>
                <Link
                  to={accessUrl}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-95"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <Lock className="w-4 h-4" />
                  Solicitar acceso
                </Link>
                <span
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--regu-gray-100)] cursor-not-allowed opacity-70"
                  style={{ color: "var(--regu-gray-500)" }}
                  title="Acceso restringido"
                >
                  <FileDown className="w-4 h-4" />
                  Descargar
                </span>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
