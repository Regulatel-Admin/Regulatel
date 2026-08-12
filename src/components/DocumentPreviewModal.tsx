import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, X, Maximize2 } from "lucide-react";
import DocxPreview from "@/components/DocxPreview";
import {
  isDocxDocument,
  isPdfDocument,
  type DocumentPreviewTarget,
} from "@/lib/documentPreview";

export default function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: DocumentPreviewTarget | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isWord = doc ? isDocxDocument(doc.url, doc.fileType, doc.fileName) : false;
  const isPdf = doc ? isPdfDocument(doc.url, doc.fileType, doc.fileName) : false;

  useEffect(() => {
    if (!doc) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  return (
    <AnimatePresence>
      {doc && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-preview-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
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
                  <h3
                    id="document-preview-title"
                    className="truncate text-base font-bold md:text-lg"
                    style={{ color: "var(--regu-gray-900)" }}
                  >
                    {doc.title}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                    {t("pages.shared.documentPreviewSubtitle")}
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <a
                  href={doc.url}
                  download
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("common.download")}</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-[var(--regu-gray-100)]"
                  style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }}
                  aria-label={t("common.close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-[#F0F0F0]">
              {isWord ? (
                <DocxPreview url={doc.url} />
              ) : (
                <iframe
                  src={`${doc.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="h-full w-full border-0"
                  title={doc.title}
                  style={{ minHeight: "400px" }}
                />
              )}
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3"
              style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}
            >
              <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                {isWord ? t("pages.shared.wordPreviewHint") : t("pages.shared.viewerControlsHint")}
              </p>
              {isPdf && (
                <button
                  type="button"
                  onClick={() => window.open(doc.url, "_blank")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-white"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Maximize2 className="h-4 w-4" />
                  {t("common.openInNewTab")}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
