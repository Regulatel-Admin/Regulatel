import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openPdfDocument, renderPdfPageToBlob, renderPdfPageToDataUrl } from "@/lib/pdfPageImage";
import { uploadAdminFile } from "@/lib/uploads";

const THUMB_BATCH = 12;

export function PdfCoverPicker({
  pdfUrl,
  coverUrl,
  onCoverChange,
  disabled = false,
  usageHint = "Así se ve en Gestión y en el aviso de la home.",
}: {
  pdfUrl: string;
  coverUrl?: string;
  onCoverChange: (url: string) => void;
  disabled?: boolean;
  usageHint?: string;
}) {
  const pdfKey = pdfUrl.trim();
  const [pageCount, setPageCount] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const [visibleThumbs, setVisibleThumbs] = useState(THUMB_BATCH);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [pagesOpen, setPagesOpen] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const prevPdfRef = useRef("");
  const thumbsRef = useRef<Record<number, string>>({});
  const onCoverChangeRef = useRef(onCoverChange);
  onCoverChangeRef.current = onCoverChange;
  const runIdRef = useRef(0);

  useEffect(() => {
    thumbsRef.current = thumbs;
  }, [thumbs]);

  const clearThumbs = useCallback(() => {
    for (const url of Object.values(thumbsRef.current)) URL.revokeObjectURL(url);
    thumbsRef.current = {};
    setThumbs({});
  }, []);

  useEffect(() => {
    return () => {
      for (const url of Object.values(thumbsRef.current)) URL.revokeObjectURL(url);
      void docRef.current?.destroy();
      docRef.current = null;
    };
  }, []);

  const generateCover = useCallback(async (doc: PDFDocumentProxy, pageNumber: number, runId?: number) => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await renderPdfPageToBlob(doc, pageNumber, {
        maxWidth: 1200,
        mimeType: "image/jpeg",
        quality: 0.86,
      });
      const file = new File([blob], `portada-p${pageNumber}.jpg`, { type: "image/jpeg" });
      const uploaded = await uploadAdminFile({ file, kind: "image", folder: "attachments" });
      if (runId != null && runId !== runIdRef.current) return;
      onCoverChangeRef.current(uploaded.url);
      setSelectedPage(pageNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la portada.");
    } finally {
      setGenerating(false);
    }
  }, []);

  const loadDocument = useCallback(async (): Promise<PDFDocumentProxy | null> => {
    if (docRef.current) return docRef.current;
    setLoadingPdf(true);
    setError(null);
    try {
      const doc = await openPdfDocument(pdfKey);
      docRef.current = doc;
      setPageCount(doc.numPages);
      return doc;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el PDF para la portada.");
      return null;
    } finally {
      setLoadingPdf(false);
    }
  }, [pdfKey]);

  const loadThumbRange = useCallback(async (doc: PDFDocumentProxy, from: number, to: number) => {
    const next: Record<number, string> = {};
    for (let page = from; page <= to; page++) {
      if (thumbsRef.current[page]) continue;
      try {
        next[page] = await renderPdfPageToDataUrl(doc, page, 88);
      } catch {
        /* skip */
      }
    }
    if (Object.keys(next).length === 0) return;
    setThumbs((prev) => {
      const merged = { ...prev, ...next };
      thumbsRef.current = merged;
      return merged;
    });
  }, []);

  useEffect(() => {
    if (!pdfKey) {
      runIdRef.current += 1;
      setPageCount(0);
      setSelectedPage(1);
      setPagesOpen(false);
      setError(null);
      clearThumbs();
      void docRef.current?.destroy();
      docRef.current = null;
      prevPdfRef.current = "";
      return;
    }

    const runId = ++runIdRef.current;
    const replaced = Boolean(prevPdfRef.current) && prevPdfRef.current !== pdfKey;
    prevPdfRef.current = pdfKey;
    const missingCover = !coverUrl?.trim();

    if (!replaced && !missingCover) return;

    let cancelled = false;
    (async () => {
      clearThumbs();
      await docRef.current?.destroy();
      docRef.current = null;
      const doc = await loadDocument();
      if (cancelled || runId !== runIdRef.current || !doc) return;
      setSelectedPage(1);
      await generateCover(doc, 1, runId);
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfKey, coverUrl, clearThumbs, loadDocument, generateCover]);

  const openPagePicker = async () => {
    setPagesOpen(true);
    const doc = await loadDocument();
    if (!doc) return;
    setVisibleThumbs(THUMB_BATCH);
    await loadThumbRange(doc, 1, Math.min(doc.numPages, THUMB_BATCH));
  };

  const choosePage = async (pageNumber: number) => {
    if (disabled || generating || loadingPdf) return;
    const doc = await loadDocument();
    if (!doc) return;
    await generateCover(doc, pageNumber);
  };

  const showMore = async () => {
    const doc = await loadDocument();
    if (!doc) return;
    const nextVisible = Math.min(pageCount, visibleThumbs + THUMB_BATCH);
    const from = visibleThumbs + 1;
    setVisibleThumbs(nextVisible);
    await loadThumbRange(doc, from, nextVisible);
  };

  if (!pdfKey) {
    return (
      <p className="text-xs leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Sube el PDF: se toma sola la primera página como miniatura. Después puedes elegir otra.
      </p>
    );
  }

  return (
    <div
      className="rounded-xl border bg-white p-4 space-y-3"
      style={{ borderColor: "rgba(22,61,89,0.10)" }}
    >
      <div>
        <p className="text-xs font-semibold" style={{ color: "var(--regu-gray-800)" }}>
          Miniatura (portada)
        </p>
        <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--regu-gray-500)" }}>
          Por defecto se usa la página 1. Si la portada es otra, elígela abajo.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <div
          className="relative h-[132px] w-[100px] shrink-0 overflow-hidden rounded-[3px]"
          style={{
            backgroundColor: "#f4f1eb",
            boxShadow: "0 8px 18px -10px rgba(22,61,89,0.35)",
          }}
        >
          {coverUrl?.trim() ? (
            <img src={coverUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px]" style={{ color: "var(--regu-gray-400)" }}>
              {loadingPdf || generating ? "Preparando…" : "Sin portada"}
            </div>
          )}
          {(loadingPdf || generating) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--regu-blue)" }} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium" style={{ color: "var(--regu-navy)" }}>
            {pageCount > 0 ? `Página ${selectedPage} de ${pageCount}` : coverUrl?.trim() ? "Portada lista" : "Leyendo el PDF…"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
            {generating ? "Subiendo la miniatura…" : usageHint}
          </p>
          {!pagesOpen && (
            <button
              type="button"
              disabled={disabled || generating || loadingPdf}
              onClick={() => void openPagePicker()}
              className="mt-2 text-[11px] font-semibold disabled:opacity-50"
              style={{ color: "var(--regu-blue)" }}
            >
              Elegir otra página
            </button>
          )}
        </div>
      </div>

      {pagesOpen && pageCount > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold" style={{ color: "var(--regu-gray-600)" }}>
            Elegir página
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: Math.min(visibleThumbs, pageCount) }, (_, i) => i + 1).map((page) => {
              const active = page === selectedPage;
              return (
                <button
                  key={page}
                  type="button"
                  disabled={disabled || generating || loadingPdf}
                  onClick={() => void choosePage(page)}
                  className="shrink-0 overflow-hidden rounded-md border-2 disabled:opacity-50"
                  style={{
                    width: 56,
                    height: 76,
                    borderColor: active ? "var(--regu-blue)" : "rgba(22,61,89,0.12)",
                    backgroundColor: "#f8f6f1",
                  }}
                  aria-label={`Usar página ${page} como portada`}
                  aria-pressed={active}
                >
                  {thumbs[page] ? (
                    <img src={thumbs[page]} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[10px] font-semibold" style={{ color: "var(--regu-gray-400)" }}>
                      {page}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {visibleThumbs < pageCount && (
            <button
              type="button"
              disabled={disabled || generating || loadingPdf}
              onClick={() => void showMore()}
              className="mt-2 text-[11px] font-semibold"
              style={{ color: "var(--regu-blue)" }}
            >
              Ver más páginas ({pageCount - visibleThumbs} restantes)
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
