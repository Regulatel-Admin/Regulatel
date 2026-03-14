/**
 * Datos de la galería fotográfica REGULATEL.
 * Álbumes: portada, título, fecha, slug. Las imágenes se cargan desde galeriaImages.generated.ts
 * (generado por scripts/copy-galeria-images.mjs desde las carpetas del workspace).
 */

import { galeriaImages } from "./galeriaImages.generated";

const GALERIA_BASE = "/images/galeria";

export interface AlbumGaleria {
  slug: string;
  title: string;
  date: string;
  /** Ruta relativa a public: ej. asamblea-plenaria-12122025 */
  folder: string;
  /** Nombres de archivo en el folder. Se rellenan desde galeriaImages.generated.ts */
  images: string[];
}

const albumesBase: Omit<AlbumGaleria, "images">[] = [
  {
    slug: "asamblea-plenaria-12122025",
    title: "Asamblea Plenaria de REGULATEL 12/12/2025",
    date: "12 de diciembre de 2025",
    folder: "asamblea-plenaria-12122025",
  },
  {
    slug: "cumbre-regulatel-asiet-comtelca-11122025",
    title: "Cumbre REGULATEL ASIET COMTELCA 11/12/2025",
    date: "11 de diciembre de 2025",
    folder: "cumbre-regulatel-asiet-comtelca-11122025",
  },
];

/** Lista de álbumes con imágenes (fusionado con galeriaImages.generated). */
export const albumesGaleria: AlbumGaleria[] = albumesBase.map((a) => ({
  ...a,
  images: galeriaImages[a.slug] ?? [],
}));

/** URL completa de la portada del álbum: primera imagen (puede ser URL absoluta o path relativo). */
export function getAlbumCoverUrl(album: AlbumGaleria): string {
  const first = album.images[0];
  if (!first) return "";
  if (first.startsWith("http")) return first;
  return `${GALERIA_BASE}/${album.folder}/${first}`;
}

/** URLs completas de todas las fotos del álbum (soporta URLs absolutas o paths relativos). */
export function getAlbumImageUrls(album: AlbumGaleria): string[] {
  return album.images.map((img) =>
    img.startsWith("http") ? img : `${GALERIA_BASE}/${album.folder}/${img}`
  );
}

export function getAlbumBySlug(slug: string): AlbumGaleria | undefined {
  return albumesGaleria.find((a) => a.slug === slug);
}
