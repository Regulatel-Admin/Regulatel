import type { PDFDocumentProxy } from "pdfjs-dist";

let workerReady = false;

function polyfillMapGetOrInsertComputed() {
  const proto = Map.prototype as Map<unknown, unknown> & {
    getOrInsertComputed?: (key: unknown, callback: (key: unknown) => unknown) => unknown;
  };
  if (typeof proto.getOrInsertComputed === "function") return;
  proto.getOrInsertComputed = function (key, callback) {
    if (this.has(key)) return this.get(key);
    const value = callback(key);
    this.set(key, value);
    return value;
  };
}

function toAbsolutePdfUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;
  if (typeof window === "undefined") return trimmed;
  return new URL(trimmed, window.location.origin).href;
}

export async function configurePdfWorker(): Promise<void> {
  if (workerReady) return;
  polyfillMapGetOrInsertComputed();
  const [{ GlobalWorkerOptions }, workerMod] = await Promise.all([
    import("pdfjs-dist/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = workerMod.default;
  workerReady = true;
}

export async function openPdfDocument(url: string): Promise<PDFDocumentProxy> {
  await configurePdfWorker();
  const { getDocument } = await import("pdfjs-dist/build/pdf.mjs");
  const task = getDocument({
    url: toAbsolutePdfUrl(url),
    withCredentials: false,
  });
  return task.promise;
}

export async function renderPdfPageToBlob(
  doc: PDFDocumentProxy,
  pageNumber: number,
  options?: { maxWidth?: number; mimeType?: "image/jpeg" | "image/webp"; quality?: number }
): Promise<Blob> {
  const maxWidth = options?.maxWidth ?? 1200;
  const mimeType = options?.mimeType ?? "image/jpeg";
  const quality = options?.quality ?? 0.86;
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(maxWidth / base.width, 2.4);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("No se pudo dibujar la página del PDF.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error("No se pudo crear la imagen de portada.");
  return blob;
}

export async function renderPdfPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  maxWidth = 96
): Promise<string> {
  const blob = await renderPdfPageToBlob(doc, pageNumber, {
    maxWidth,
    mimeType: "image/jpeg",
    quality: 0.72,
  });
  return URL.createObjectURL(blob);
}
