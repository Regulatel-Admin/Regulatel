/**
 * Copias locales de imágenes subidas a Vercel Blob. Si el almacén no responde
 * (p. ej. 403 "Your store is blocked"), se sustituye solo lo mostrado en
 * pantalla: los datos guardados no cambian y, al volver el almacén, se usa
 * otra vez la imagen original.
 */
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const RESPALDO = "/images/respaldo";
const HABLA = "/images/habla-el-regulador";

const FALLBACKS: ReadonlyArray<readonly [fragment: string, src: string]> = [
  ["1788444288234-", `${RESPALDO}/ledenika-mendez.jpg`],
  ["1787681166250-", `${RESPALDO}/romina-garrido.jpg`],
  ["1787681043970-", `${RESPALDO}/herbert-rubio.jpg`],
  ["1787231150150-", `${RESPALDO}/carlos-baigorri.jpg`],
  ["1787145990300-", `${HABLA}/johnny-marchan-pena.jpg`],
  ["1787145900476-", `${HABLA}/carlos-watson-carazo.jpg`],
  ["1787146036337-", `${HABLA}/angel-garcia-castillejo.jpg`],
  ["1787146126421-", `${HABLA}/felipe-diaz-suaza.jpg`],
  ["1787146143111-", `${HABLA}/raquel-brizida-castro.jpg`],
  ["1787146177622-", `${HABLA}/jorge-hoyos-zavala.jpg`],
  ["1787146561613-", `${HABLA}/guido-gomez-mazara.jpg`],
  ["1792415430776-", `${RESPALDO}/cumbre-montevideo-2026.jpg`],
  ["1792491568717-", `${RESPALDO}/cumbre-montevideo-2026.jpg`],
  ["1791382173917-", `${RESPALDO}/banner-registro-cumbre-2026-qr.jpg`],
];

/** Documentos con copia en el sitio: se sirven siempre desde aquí. */
const SEMANA_DOCS = "/documents/semana-regulatel-montevideo-2026";
const DOCUMENTS: ReadonlyArray<readonly [fragment: string, src: string]> = [
  ["1793278114474-", `${SEMANA_DOCS}/boletin-informativo-semana-regulatel-uruguay.pdf`],
  ["1793278136034-", `${SEMANA_DOCS}/regulatel-reunira-en-montevideo-a-reguladores.docx`],
  ["1792764045755-", "/documents/respaldo/agenda-regulatel-gt-ce-2026.pdf"],
  ["1791996227058-", "/documents/respaldo/programa-xviii-cumbre-regulatel-asiet-comtelca-2026.docx"],
];

/** Devuelve la copia local de un documento, o la misma URL si no existe. */
export function resolveBlobDocument(src: string): string {
  try {
    const url = new URL(src);
    if (!url.hostname.endsWith(BLOB_HOST_SUFFIX)) return src;
    return DOCUMENTS.find(([fragment]) => url.pathname.includes(`/${fragment}`))?.[1] ?? src;
  } catch {
    return src;
  }
}

export function blobImageFallback(src: string): string | undefined {
  try {
    const url = new URL(src);
    if (!url.hostname.endsWith(BLOB_HOST_SUFFIX)) return undefined;
    return FALLBACKS.find(([fragment]) => url.pathname.includes(`/${fragment}`))?.[1];
  } catch {
    return undefined;
  }
}

/** Los errores de <img> no burbujean; se escuchan en fase de captura. */
export function installBlobImageFallback(): void {
  window.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement)) return;
      const fallback = blobImageFallback(img.currentSrc || img.src);
      if (!fallback) return;
      // Evita que el onError del componente oculte la imagen.
      event.stopImmediatePropagation();
      img.removeAttribute("srcset");
      img.src = fallback;
    },
    true,
  );
  const redirectDocument = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>("a[href]");
    if (!link) return;
    const local = resolveBlobDocument(link.href);
    if (local !== link.href) link.href = local;
  };
  window.addEventListener("click", redirectDocument, true);
  window.addEventListener("auxclick", redirectDocument, true);
  window.addEventListener("contextmenu", redirectDocument, true);
}
