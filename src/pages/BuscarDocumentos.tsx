import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Eye,
  Download,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Archive,
  Files,
  Search,
  Lock,
} from "lucide-react";
import { resolveDocumentSearch } from "@/data/searchMaps";
import { searchDocumentsInList, type GestionDocument } from "@/data/gestion";
import { useMergedGestionDocuments } from "@/contexts/AdminDataContext";
import { getRestrictedDocument, isRestrictedUnlocked } from "@/config/restrictedDocuments";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { canPreviewDocument, type DocumentPreviewTarget } from "@/lib/documentPreview";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  revista: <BookOpen className="h-5 w-5" />,
  "planes-actas": <ClipboardList className="h-5 w-5" />,
  "comite-ejecutivo": <Archive className="h-5 w-5" />,
  asamblea: <Archive className="h-5 w-5" />,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? <FileText className="h-5 w-5" />;
}

function getCategoryLabel(category: string, t: (key: string) => string) {
  if (category === "revista") return t("pages.buscarDocumentos.categories.revista");
  if (category === "planes-actas") return t("pages.buscarDocumentos.categories.planesActas");
  if (category === "asamblea") return t("pages.buscarDocumentos.categories.asamblea");
  if (category === "comite-ejecutivo") return t("pages.buscarDocumentos.categories.comiteEjecutivo");
  return t("pages.buscarDocumentos.categories.documento");
}

export default function BuscarDocumentos() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const mergedDocuments = useMergedGestionDocuments();
  const categoryResults = resolveDocumentSearch(q);
  const docResults = searchDocumentsInList(mergedDocuments, q);
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewTarget | null>(null);
  const hasResults = docResults.length > 0 || categoryResults.length > 0;
  const tryTerms = ["revista", "planes", "actas", "declaraciones"];

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div style={{ backgroundColor: "var(--regu-blue)", height: "4px" }} aria-hidden />

      <div className="mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14" style={{ maxWidth: "960px" }}>
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
              {t("pages.buscarDocumentos.title")}
            </h1>
            {q ? (
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.buscarDocumentos.resultsFor")}{" "}
                <strong className="font-bold" style={{ color: "var(--regu-navy)" }}>
                  &ldquo;{q}&rdquo;
                </strong>
              </p>
            ) : (
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.buscarDocumentos.emptyDescription")}
              </p>
            )}
          </div>
        </div>

        {q ? (
          <>
            {docResults.length > 0 && (
              <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: "var(--regu-gray-400)" }}
                  >
                    {t("pages.buscarDocumentos.documentsFound", { count: docResults.length })}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {docResults.map((doc, index) => (
                      <DocResultCard
                        key={doc.id}
                        doc={doc}
                        index={index}
                        onPreview={() =>
                          setPreviewDoc({
                            url: doc.url,
                            title: doc.title,
                            fileType: doc.fileType,
                            fileName: doc.fileName,
                          })
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {categoryResults.length > 0 && (
              <section className="mb-10">
                <p
                  className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: "var(--regu-gray-400)" }}
                >
                  {t("pages.buscarDocumentos.viewByCategory")}
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
                  {t("pages.buscarDocumentos.noResultsFor", { query: q })}
                </h2>
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.buscarDocumentos.tryTermsHint")}{" "}
                  {tryTerms.map((term, i, a) => (
                    <span key={term}>
                      <strong className="font-semibold" style={{ color: "var(--regu-navy)" }}>{term}</strong>
                      {i < a.length - 1 ? ", " : "."}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </>
        ) : (
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
              {t("pages.buscarDocumentos.emptyQueryTitle")}
            </h2>
            <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
              {t("pages.buscarDocumentos.emptyQueryHint")}
            </p>
          </div>
        )}

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-75"
          style={{ color: "var(--regu-blue)" }}
        >
          ← {t("common.backToHomeShort")}
        </Link>
      </div>

      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
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
  const { t } = useTranslation();
  const icon = getCategoryIcon(doc.category);
  const categoryLabel = getCategoryLabel(doc.category, t);
  const isRestrictedDoc = getRestrictedDocument(doc.id) !== null;
  const isRestricted = isRestrictedDoc && !isRestrictedUnlocked(doc.id);
  const accessUrl = `/acceso-documentos?doc=${encodeURIComponent(doc.id)}&solicitar=1`;
  const canPreview = canPreviewDocument(doc.url, doc.fileType, doc.fileName);

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

          <div className="mt-auto flex flex-wrap gap-2">
            {isRestricted ? (
              <Link
                to={accessUrl}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-85"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Lock className="h-3.5 w-3.5" />
                {t("pages.gestion.requestAccess")}
              </Link>
            ) : (
              <>
            {canPreview && (
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Eye className="h-3.5 w-3.5" />
              {t("common.preview")}
            </button>
            )}
            <a
              href={doc.url}
              download={!doc.url.startsWith("http")}
              target={doc.url.startsWith("http") ? "_blank" : undefined}
              rel={doc.url.startsWith("http") ? "noreferrer noopener" : undefined}
              className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all hover:bg-[rgba(68,137,198,0.06)]"
              style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-blue)" }}
            >
              <Download className="h-3.5 w-3.5" />
              {t("common.download")}
            </a>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
