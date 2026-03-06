import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";

export interface NewsItemBerec {
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  excerpt: string;
  imageUrl?: string;
  additionalImages?: string[];
}

interface NewsSectionBerecProps {
  news: NewsItemBerec[];
}

/** Fecha editorial: "11 DIC 2025" — pequeño, gris, letter-spacing tipo BEREC */
function formatDateEditorial(dateStr: string, fallback: string): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = "ENE,FEB,MAR,ABR,MAY,JUN,JUL,AGO,SEP,OCT,NOV,DIC".split(",");
    const month = months[d.getMonth()] ?? "DIC";
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return fallback;
  }
}

const PLACEHOLDER_GRADIENT =
  "linear-gradient(135deg, var(--regu-navy) 0%, var(--regu-blue) 50%, var(--regu-navy-deep) 100%)";

export default function NewsSectionBerec({ news }: NewsSectionBerecProps) {
  const sorted = [...news].sort((a, b) => (a.date > b.date ? -1 : 1));
  const featuredNews = sorted[0];
  const listNews = sorted.slice(1, 7);

  if (!featuredNews) {
    return null;
  }

  const featuredDate = formatDateEditorial(featuredNews.date, featuredNews.dateFormatted);

  return (
    <section
      className="newsSection mx-auto w-full max-w-[1280px] bg-white px-4 py-20 md:px-6 md:py-24 lg:px-8 lg:py-[110px]"
      style={{ fontFamily: "var(--token-font-body)" }}
    >
      {/* Header: mismo grid 5+7 que el contenido para alinear VER TODAS con la columna derecha */}
      <div className="newsHeader mb-10 grid grid-cols-1 gap-4 lg:mb-12 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-0">
        <h2 className="newsSectionTitle text-3xl font-bold tracking-tight text-[var(--regu-gray-900)] md:text-4xl lg:col-span-5 lg:text-[2.625rem]">
          Noticias
        </h2>
        <div className="flex items-end justify-start lg:col-span-7 lg:justify-end">
          <Link
            to="/noticias"
            className="newsVerTodas text-xs font-semibold uppercase tracking-[0.14em] text-[var(--news-accent)] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
          >
            VER TODAS
          </Link>
        </div>
      </div>

      {/* Grid 12 columnas: featured izquierda (5), lista derecha (7) — imagen NUNCA arriba en desktop */}
      <div className="newsGrid grid grid-cols-12 gap-x-0 gap-y-12 lg:gap-x-16 lg:gap-y-0">
        {/* Columna izquierda — Featured (col-span-5 en desktop). Imagen SOLO aquí. */}
        <article className="featured col-span-12 min-w-0 lg:col-span-5">
          <Link to={`/noticias/${featuredNews.slug}`} className="block group">
            {/* Imagen o carrusel 16:9 */}
            <div
              className="featuredImage relative w-full overflow-hidden rounded-[16px] bg-[var(--regu-gray-100)]"
              style={{ aspectRatio: "16/9" }}
            >
              {(() => {
                const allImages = [
                  featuredNews.imageUrl,
                  ...(featuredNews.additionalImages ?? []),
                ].filter(Boolean) as string[];
                if (allImages.length === 0) {
                  return (
                    <div
                      className="h-full w-full"
                      style={{ background: PLACEHOLDER_GRADIENT }}
                      aria-hidden
                    />
                  );
                }
                if (allImages.length === 1) {
                  return (
                    <>
                      <img
                        src={allImages[0]}
                        alt=""
                        className="h-full w-full object-cover transition duration-200 group-hover:opacity-98"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const next = e.currentTarget.nextElementSibling;
                          if (next) (next as HTMLElement).classList.remove("hidden");
                        }}
                      />
                      <div
                        className="hidden h-full w-full absolute inset-0"
                        style={{ background: PLACEHOLDER_GRADIENT }}
                        aria-hidden
                      />
                    </>
                  );
                }
                return (
                  <ImageCarousel
                    images={allImages}
                    variant="card"
                    autoPlayMs={5000}
                    className="!rounded-[16px] [&_img]:!object-cover"
                  />
                );
              })()}
            </div>

            {/* Meta: FECHA (gris) + NOTICIAS (magenta uppercase) */}
            <div className="featuredMeta mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--regu-gray-500)]">
                {featuredDate}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--news-accent)]">
                NOTICIAS
              </span>
            </div>

            {/* Título grande H3/H2 */}
            <h3
              className="mt-4 line-clamp-3 text-[1.625rem] font-bold text-[var(--regu-gray-900)] lg:text-[1.875rem]"
              style={{ lineHeight: 1.2, maxWidth: "40rem" }}
            >
              {featuredNews.title}
            </h3>

            {/* LEER MÁS > magenta, hover */}
            <span className="newsReadMore mt-4 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--news-accent)] transition hover:underline group-hover:gap-2">
              LEER MÁS
              <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </article>

        {/* Columna derecha — Lista (col-span-7 en desktop). Divisores finos full width. */}
        <div className="newsList col-span-12 flex flex-col lg:col-span-7">
          {listNews.map((item, index) => {
            const itemDate = formatDateEditorial(item.date, item.dateFormatted);
            return (
              <div key={item.slug} className="newsItem">
                <Link
                  to={`/noticias/${item.slug}`}
                  className="block py-5 first:pt-0 lg:py-6"
                >
                  {/* Meta: FECHA + NOTICIAS */}
                  <div className="featuredMeta flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--regu-gray-500)]">
                      {itemDate}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--news-accent)]">
                      NOTICIAS
                    </span>
                  </div>
                  {/* Título 2 líneas máx */}
                  <h4 className="mt-2.5 line-clamp-2 text-base font-bold leading-snug text-[var(--regu-gray-900)] lg:text-[1.125rem]">
                    {item.title}
                  </h4>
                  {/* LEER MÁS > */}
                  <span className="newsReadMore mt-2.5 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--news-accent)] transition hover:underline">
                    LEER MÁS
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
                {/* Divider fino: mismo margen arriba/abajo, línea muy sutil */}
                {index < listNews.length - 1 && (
                  <div
                    className="newsDivider h-px w-full shrink-0"
                    style={{ marginTop: "1rem", marginBottom: "1rem", backgroundColor: "rgba(22, 61, 89, 0.06)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fila de 3 botones outline — integrada con borde sutil, mismo ancho lógico que el grid */}
      <div
        className="newsCtas flex flex-col items-stretch justify-center gap-4 pt-12 sm:flex-row sm:flex-wrap sm:gap-5 lg:pt-14"
        style={{ borderTop: "1px solid rgba(22, 61, 89, 0.08)" }}
      >
        <Link
          to="/noticias"
          className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--news-accent)] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
          style={{ borderColor: "var(--news-accent)" }}
        >
          VER TODAS LAS NOTICIAS
        </Link>
        <Link
          to="/noticias"
          className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--news-accent)] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
          style={{ borderColor: "var(--news-accent)" }}
        >
          VER COMUNICADOS
        </Link>
        <Link
          to="/noticias"
          className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--news-accent)] transition hover:bg-[var(--news-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-accent)] focus-visible:ring-offset-2"
          style={{ borderColor: "var(--news-accent)" }}
        >
          VER PUBLICACIONES
        </Link>
      </div>
    </section>
  );
}
