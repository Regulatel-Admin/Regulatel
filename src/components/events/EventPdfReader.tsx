import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openPdfDocument, renderPdfPageToBlob } from "@/lib/pdfPageImage";

const readerLabels = {
  es: { page: "página", loadingPage: "Cargando página", pageError: "No se pudo mostrar la página", downloadHint: "Puedes descargar el PDF.", loadError: "No se pudo cargar la vista previa. Puedes abrir o descargar el PDF.", scroll: "Desplázate hacia abajo para leer el documento", pages: "Páginas del documento", loading: "Cargando documento…" },
  en: { page: "page", loadingPage: "Loading page", pageError: "The page could not be displayed", downloadHint: "You can download the PDF.", loadError: "The preview could not be loaded. You can open or download the PDF.", scroll: "Scroll down to read the document", pages: "Document pages", loading: "Loading document…" },
  pt: { page: "página", loadingPage: "A carregar a página", pageError: "Não foi possível apresentar a página", downloadHint: "Pode descarregar o PDF.", loadError: "Não foi possível carregar a pré-visualização. Pode abrir ou descarregar o PDF.", scroll: "Desloque-se para baixo para ler o documento", pages: "Páginas do documento", loading: "A carregar o documento…" },
  it: { page: "pagina", loadingPage: "Caricamento della pagina", pageError: "Impossibile visualizzare la pagina", downloadHint: "Puoi scaricare il PDF.", loadError: "Impossibile caricare l'anteprima. Puoi aprire o scaricare il PDF.", scroll: "Scorri verso il basso per leggere il documento", pages: "Pagine del documento", loading: "Caricamento del documento…" },
};

function labelsFor(language: string) {
  return readerLabels[language.split("-")[0] as keyof typeof readerLabels] ?? readerLabels.es;
}

function PdfPage({ doc, page, title, ratio, scrollRoot }: {
  doc: PDFDocumentProxy;
  page: number;
  title: string;
  ratio: number;
  scrollRoot: HTMLDivElement | null;
}) {
  const { i18n } = useTranslation();
  const labels = labelsFor(i18n.resolvedLanguage ?? i18n.language);
  const container = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    let started = false;
    const render = async () => {
      if (started) return;
      started = true;
      try {
        const blob = await renderPdfPageToBlob(doc, page, { maxWidth: 1600, quality: 0.95 });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImage(objectUrl);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        void render();
      }
    }, { root: scrollRoot, rootMargin: "800px 0px" });
    if (container.current) observer.observe(container.current);
    if (page === 1) void render();
    return () => {
      cancelled = true;
      observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, page, scrollRoot]);

  return <div ref={container} className="mx-auto w-full max-w-[1600px]">
    {image ? <img src={image} alt={`${title} · ${labels.page} ${page}`} className="block h-auto w-full bg-white shadow-md" /> :
      <div style={{ aspectRatio: ratio }} className="flex items-center justify-center bg-white text-sm text-slate-500 shadow-sm">
        {error ? `${labels.pageError} ${page}. ${labels.downloadHint}` : `${labels.loadingPage} ${page}…`}
      </div>}
    <p className="py-2 text-center text-xs tabular-nums text-slate-400">{page} / {doc.numPages}</p>
  </div>;
}

export default function EventPdfReader({ url, title }: { url: string; title: string }) {
  const { t, i18n } = useTranslation();
  const labels = labelsFor(i18n.resolvedLanguage ?? i18n.language);
  const [document, setDocument] = useState<{ doc: PDFDocumentProxy; ratio: number } | null>(null);
  const [error, setError] = useState(false);
  const scrollRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    setError(false);
    setDocument(null);
    openPdfDocument(url).then(async doc => {
      if (cancelled) { void doc.destroy(); return; }
      loaded = doc;
      const first = await doc.getPage(1);
      const viewport = first.getViewport({ scale: 1 });
      if (!cancelled) setDocument({ doc, ratio: viewport.width / viewport.height });
    }).catch(() => {
      if (!cancelled) setError(true);
    });
    return () => { cancelled = true; if (loaded) void loaded.destroy(); };
  }, [url]);

  return <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">{labels.scroll}</span>
      <a href={url} download className="font-semibold text-[var(--regu-blue)]">{t("common.downloadPdf")}</a>
    </div>
    <div ref={scrollRoot} className="min-h-0 flex-1 space-y-3 overflow-auto overscroll-contain p-3 md:p-5" aria-label={labels.pages}>
      {error ? <p className="py-10 text-center text-slate-600">{labels.loadError}</p> : !document ? <p className="py-10 text-center text-slate-500">{labels.loading}</p> :
        Array.from({ length: document.doc.numPages }, (_, index) => <PdfPage key={`${url}-${index}`} doc={document.doc} page={index + 1} title={title} ratio={document.ratio} scrollRoot={scrollRoot.current} />)}
    </div>
  </div>;
}
