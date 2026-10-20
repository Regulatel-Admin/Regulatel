import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openPdfDocument, renderPdfPageToBlob } from "@/lib/pdfPageImage";

function PdfPage({ doc, page, title, ratio, scrollRoot }: {
  doc: PDFDocumentProxy;
  page: number;
  title: string;
  ratio: number;
  scrollRoot: HTMLDivElement | null;
}) {
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
    {image ? <img src={image} alt={`${title} · página ${page}`} className="block h-auto w-full bg-white shadow-md" /> :
      <div style={{ aspectRatio: ratio }} className="flex items-center justify-center bg-white text-sm text-slate-500 shadow-sm">
        {error ? `No se pudo mostrar la página ${page}. Puedes descargar el PDF.` : `Cargando página ${page}…`}
      </div>}
    <p className="py-2 text-center text-xs tabular-nums text-slate-400">{page} / {doc.numPages}</p>
  </div>;
}

export default function EventPdfReader({ url, title }: { url: string; title: string }) {
  const [document, setDocument] = useState<{ doc: PDFDocumentProxy; ratio: number } | null>(null);
  const [error, setError] = useState("");
  const scrollRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    setError("");
    setDocument(null);
    openPdfDocument(url).then(async doc => {
      if (cancelled) { void doc.destroy(); return; }
      loaded = doc;
      const first = await doc.getPage(1);
      const viewport = first.getViewport({ scale: 1 });
      if (!cancelled) setDocument({ doc, ratio: viewport.width / viewport.height });
    }).catch(() => {
      if (!cancelled) setError("No se pudo cargar la vista previa. Puedes abrir o descargar el PDF.");
    });
    return () => { cancelled = true; if (loaded) void loaded.destroy(); };
  }, [url]);

  return <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">Desplázate hacia abajo para leer el documento</span>
      <a href={url} download className="font-semibold text-[var(--regu-blue)]">Descargar PDF</a>
    </div>
    <div ref={scrollRoot} className="min-h-0 flex-1 space-y-3 overflow-auto overscroll-contain p-3 md:p-5" aria-label="Páginas del documento">
      {error ? <p className="py-10 text-center text-slate-600">{error}</p> : !document ? <p className="py-10 text-center text-slate-500">Cargando documento…</p> :
        Array.from({ length: document.doc.numPages }, (_, index) => <PdfPage key={`${url}-${index}`} doc={document.doc} page={index + 1} title={title} ratio={document.ratio} scrollRoot={scrollRoot.current} />)}
    </div>
  </div>;
}
