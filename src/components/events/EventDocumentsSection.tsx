import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText, Maximize2 } from "lucide-react";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import DocxPreview from "@/components/DocxPreview";
import {
  isDocxDocument,
  isPdfDocument,
  type DocumentPreviewTarget,
} from "@/lib/documentPreview";
import type { EventAttachment } from "@/types/event";

export default function EventDocumentsSection({
  documents,
}: {
  documents: EventAttachment[];
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<DocumentPreviewTarget | null>(null);
  const usable = documents.filter((doc) => doc.url?.trim());
  if (usable.length === 0) return null;

  return (
    <>
      <div className="mt-8 border-t pt-6" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
        <h2
          className="mb-4 text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--regu-gray-500)" }}
        >
          {t("pages.eventos.documentsLabel")}
        </h2>
        <p className="mb-5 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          {t("pages.eventos.documentsHint")}
        </p>
        <div className="space-y-6">
          {usable.map((doc) => {
            const isPdf = isPdfDocument(doc.url, doc.fileType, doc.fileName);
            const isWord = isDocxDocument(doc.url, doc.fileType, doc.fileName);
            const previewTarget: DocumentPreviewTarget = {
              url: doc.url,
              title: doc.title,
              fileType: doc.fileType,
              fileName: doc.fileName,
            };
            return (
              <article
                key={doc.id || doc.url}
                className="overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 4px 18px rgba(22,61,89,0.06)" }}
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-5"
                  style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#FAFBFC" }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                        {doc.title}
                      </h3>
                      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
                        {isPdf ? "PDF" : isWord ? "Word" : t("pages.eventos.documentFile")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreview(previewTarget)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
                      style={{ color: "var(--regu-blue)", backgroundColor: "rgba(68,137,198,0.10)" }}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      {t("pages.eventos.openDocument")}
                    </button>
                    <a
                      href={doc.url}
                      download={doc.fileName || true}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--regu-blue)" }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t("common.download")}
                    </a>
                  </div>
                </div>
                <div className="bg-[#F3F5F7]" style={{ minHeight: 420 }}>
                  {isWord ? (
                    <div className="max-h-[70vh] overflow-auto p-3 md:p-4">
                      <DocxPreview url={doc.url} />
                    </div>
                  ) : (
                    <iframe
                      src={`${doc.url}#toolbar=1&navpanes=0&scrollbar=1`}
                      title={doc.title}
                      className="h-[70vh] w-full border-0"
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} />
    </>
  );
}
