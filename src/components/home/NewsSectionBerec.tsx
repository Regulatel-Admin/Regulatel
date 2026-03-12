import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

  if (!featuredNews) return null;

  const featuredDate = formatDateEditorial(featuredNews.date, featuredNews.dateFormatted);

  return (
    <section
      className="newsSection w-full"
      style={{
        fontFamily: "var(--token-font-body)",
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        borderBottom: "1px solid rgba(22,61,89,0.07)",
      }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 md:px-6 md:py-20 lg:px-8 lg:py-24">

        {/* ── Header editorial ── */}
        <div className="newsHeader mb-10 flex items-end justify-between gap-4 lg:mb-12">
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-[3px] flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <div>
              <h2
                className="text-3xl font-bold tracking-tight md:text-4xl"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                Noticias
              </h2>
              <p className="mt-0.5 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Últimas novedades de REGULATEL y el sector
              </p>
            </div>
          </div>
          <Link
            to="/noticias"
            className="flex-shrink-0 text-xs font-bold uppercase tracking-[0.14em] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ color: "var(--regu-blue)" }}
          >
            Ver todas
          </Link>
        </div>

        {/* ── Grid principal 5 + 7 ── */}
        <div className="newsGrid grid grid-cols-12 gap-x-0 gap-y-10 lg:gap-x-16 lg:gap-y-0">

          {/* Columna izquierda — Noticia destacada */}
          <article className="featured col-span-12 min-w-0 lg:col-span-5">
            <Link to={`/noticias/${featuredNews.slug}`} className="group block">
              {/* Imagen */}
              <div
                className="featuredImage relative w-full overflow-hidden rounded-2xl bg-[var(--regu-gray-100)]"
                style={{ aspectRatio: "16/9" }}
              >
                {/* Borde acento superior */}
                <div
                  className="absolute inset-x-0 top-0 z-10 h-[3px]"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                  aria-hidden
                />
                {(() => {
                  const allImages = [
                    featuredNews.imageUrl,
                    ...(featuredNews.additionalImages ?? []),
                  ].filter(Boolean) as string[];
                  if (allImages.length === 0) {
                    return (
                      <div className="h-full w-full" style={{ background: PLACEHOLDER_GRADIENT }} aria-hidden />
                    );
                  }
                  if (allImages.length === 1) {
                    return (
                      <>
                        <img
                          src={allImages[0]}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="eager"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const next = e.currentTarget.nextElementSibling;
                            if (next) (next as HTMLElement).classList.remove("hidden");
                          }}
                        />
                        <div
                          className="absolute inset-0 hidden h-full w-full"
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
                      className="!rounded-2xl [&_img]:!object-cover"
                    />
                  );
                })()}
              </div>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                >
                  Noticias
                </span>
                <span
                  className="text-xs font-medium uppercase tracking-[0.08em]"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {featuredDate}
                </span>
              </div>

              {/* Título */}
              <h3
                className="mt-3 line-clamp-3 font-bold leading-snug"
                style={{
                  fontSize: "clamp(1.25rem, 2vw, 1.625rem)",
                  color: "var(--regu-gray-900)",
                  fontFamily: "var(--token-font-heading)",
                }}
              >
                {featuredNews.title}
              </h3>

              {/* LEER MÁS */}
              <span
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-150 group-hover:gap-2.5"
                style={{ color: "var(--regu-blue)" }}
              >
                Leer más
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </article>

          {/* Columna derecha — Lista de noticias */}
          <div className="newsList col-span-12 flex flex-col divide-y lg:col-span-7" style={{ borderColor: "rgba(22,61,89,0.07)" }}>
            {listNews.map((item) => {
              const itemDate = formatDateEditorial(item.date, item.dateFormatted);
              return (
                <Link
                  key={item.slug}
                  to={`/noticias/${item.slug}`}
                  className="newsListItem group block py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    {/* Acento lateral izquierdo */}
                    <div
                      className="mt-1 hidden h-full w-[2px] flex-shrink-0 self-stretch rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block"
                      style={{ backgroundColor: "var(--regu-blue)", minHeight: "40px" }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                          style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                        >
                          Noticias
                        </span>
                        <span
                          className="text-xs font-medium uppercase tracking-[0.08em]"
                          style={{ color: "var(--regu-gray-500)" }}
                        >
                          {itemDate}
                        </span>
                      </div>
                      {/* Título */}
                      <h4
                        className="mt-2 line-clamp-2 font-bold leading-snug transition-colors duration-150 group-hover:text-[var(--regu-blue)]"
                        style={{
                          fontSize: "clamp(0.9375rem, 1.1vw, 1.0625rem)",
                          color: "var(--regu-gray-900)",
                          fontFamily: "var(--token-font-heading)",
                        }}
                      >
                        {item.title}
                      </h4>
                      {/* LEER MÁS */}
                      <span
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-150 group-hover:gap-2"
                        style={{ color: "var(--regu-blue)", opacity: 0.75 }}
                      >
                        Leer más
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── CTAs — primario + secundarios ── */}
        <div
          className="newsCtas mt-12 flex flex-col items-stretch justify-center gap-3 pt-10 sm:flex-row sm:flex-wrap sm:gap-4 lg:mt-14"
          style={{ borderTop: "1px solid rgba(22,61,89,0.08)" }}
        >
          {/* Primario: relleno */}
          <Link
            to="/noticias"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            Ver todas las noticias
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          {/* Secundarios: outline */}
          <Link
            to="/noticias"
            className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] transition hover:bg-[var(--regu-blue)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
          >
            Ver comunicados
          </Link>
          <Link
            to="/noticias"
            className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] transition hover:bg-[var(--regu-blue)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
          >
            Ver publicaciones
          </Link>
        </div>
      </div>
    </section>
  );
}
