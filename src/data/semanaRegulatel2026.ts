import type { EventAttachment } from "@/types/event";

export const SEMANA_REGULATEL_2026_EVENT_ID = "cumbre-regulatel-asiet-comtelca-2026";
export const SEMANA_REGULATEL_2026_NEWS_SLUG = "semana-regulatel-montevideo-2026";
export const SEMANA_REGULATEL_2026_IMAGE = "/images/noticias/semana-regulatel-montevideo-2026.png";
export const SEMANA_REGULATEL_2026_NEWS_IMAGE = "/images/noticias/semana-regulatel-montevideo-2026-card.png";
export const SEMANA_REGULATEL_2026_CAROUSEL_IMAGE = "/images/semana-regulatel-montevideo-2026-carousel.jpg";

export function isSemanaRegulatelNews(slug: string | undefined | null): boolean {
  return (slug ?? "").toLowerCase() === SEMANA_REGULATEL_2026_NEWS_SLUG;
}

/** Banner panorámico original: artículo y home. */
export function semanaRegulatelArticleImage(slug: string | undefined | null, fallback?: string | null): string {
  if (isSemanaRegulatelNews(slug)) return SEMANA_REGULATEL_2026_IMAGE;
  return fallback?.trim() || "";
}

/** Versión 4:3 solo para el listado /noticias. */
export function semanaRegulatelListingImage(slug: string | undefined | null, fallback?: string | null): string {
  if (isSemanaRegulatelNews(slug)) return SEMANA_REGULATEL_2026_NEWS_IMAGE;
  return fallback?.trim() || "";
}

export const SEMANA_REGULATEL_2026_CAROUSEL_ITEM = {
  id: SEMANA_REGULATEL_2026_EVENT_ID,
  type: "eventos" as const,
  date: "16 de octubre de 2026",
  title: "Cumbre REGULATEL - ASIET - COMTELCA",
  imageUrl: SEMANA_REGULATEL_2026_CAROUSEL_IMAGE,
  href: `/eventos/${SEMANA_REGULATEL_2026_EVENT_ID}`,
  ctaPrimaryLabel: "Ver Cumbre",
  location: "Montevideo, Uruguay",
  imagePosition: "center right",
  imageFit: "cover" as const,
};

const DOCS_BASE = "/documents/semana-regulatel-montevideo-2026";

/** Documentos por defecto en la noticia (sin la nota de prensa en Word). */
export const SEMANA_REGULATEL_2026_NEWS_ATTACHMENTS: EventAttachment[] = [
  {
    id: "boletin-semana-regulatel-2026",
    title: "Boletín informativo — Semana REGULATEL Uruguay",
    url: `${DOCS_BASE}/boletin-informativo-semana-regulatel-uruguay.pdf`,
    fileName: "boletin-informativo-semana-regulatel-uruguay.pdf",
    fileType: "application/pdf",
  },
];

export const SEMANA_REGULATEL_2026_ATTACHMENTS: EventAttachment[] = [
  ...SEMANA_REGULATEL_2026_NEWS_ATTACHMENTS,
  {
    id: "nota-prensa-semana-regulatel-2026",
    title: "Nota de prensa — REGULATEL reunirá en Montevideo a reguladores y organizaciones aliadas",
    url: `${DOCS_BASE}/regulatel-reunira-en-montevideo-a-reguladores.docx`,
    fileName: "regulatel-reunira-en-montevideo-a-reguladores.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

/** Si el admin aún no guardó documentos, se usa el PDF por defecto de esta noticia. Un array vacío (aunque sea `[]`) se respeta. */
export function resolveNewsAttachments(
  slug: string | undefined | null,
  stored?: EventAttachment[] | null
): EventAttachment[] {
  if (Array.isArray(stored)) return stored;
  if (isSemanaRegulatelNews(slug)) return SEMANA_REGULATEL_2026_NEWS_ATTACHMENTS;
  return [];
}
