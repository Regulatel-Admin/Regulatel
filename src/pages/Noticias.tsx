import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { noticiasData } from "./noticiasData";
import { useAdminData } from "@/contexts/AdminDataContext";

/** Item para listado: estático o admin (misma forma). */
export interface NewsListItem {
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  additionalImages?: string[];
}

const CONTAINER_MAX = "1220px";
const SIDEBAR_WIDTH = "240px";
const COL_GAP = "56px";
const TEXT_SECONDARY = "#6B7280";
const DIVIDER = "#E5E7EB";
const ACCENT = "var(--news-accent)";

type SidebarFilter = "Todas" | "Noticias" | "Reuniones" | "Mesas" | "Eventos";

const SIDEBAR_LINKS: { id: SidebarFilter; label: string }[] = [
  { id: "Todas", label: "Últimas noticias" },
  { id: "Noticias", label: "Noticias" },
  { id: "Reuniones", label: "Reuniones" },
  { id: "Mesas", label: "Mesas" },
  { id: "Eventos", label: "Eventos" },
];

const ITEMS_PER_PAGE = 8;

function formatMetaDate(dateFormatted: string): string {
  return dateFormatted.toUpperCase();
}

function extractYear(dateStr: string): string {
  if (!dateStr || dateStr.length < 4) return "";
  return dateStr.slice(0, 4);
}

function Noticias() {
  const { adminNews } = useAdminData();
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>("Todas");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [sidebarFilter, yearFilter]);

  const mergedList = useMemo(() => {
    const staticItems: NewsListItem[] = noticiasData.map((n) => ({
      slug: n.slug,
      title: n.title,
      date: n.date,
      dateFormatted: n.dateFormatted,
      category: n.category,
      excerpt: n.excerpt,
      imageUrl: n.imageUrl,
    }));
    const adminItems: NewsListItem[] = (adminNews ?? [])
      .filter((n) => n.published)
      .map((n) => ({
        slug: n.slug || n.id,
        title: n.title,
        date: n.date,
        dateFormatted: n.dateFormatted,
        category: n.category || "Noticias",
        excerpt: n.excerpt || "",
        imageUrl: n.imageUrl || "",
        additionalImages: n.additionalImages ?? [],
      }));
    const merged = [...staticItems, ...adminItems];
    merged.sort((a, b) => (a.date > b.date ? -1 : 1));
    return merged;
  }, [adminNews]);

  const yearOptions = useMemo(() => {
    const years = new Set(mergedList.map((n) => extractYear(n.date)).filter(Boolean));
    return ["all", ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, [mergedList]);

  const filtered = useMemo(() => {
    let list = mergedList;
    if (sidebarFilter !== "Todas") {
      const norm = sidebarFilter.toLowerCase();
      list = list.filter((n) => n.category.toLowerCase() === norm);
    }
    if (yearFilter !== "all") {
      list = list.filter((n) => extractYear(n.date) === yearFilter);
    }
    return list;
  }, [mergedList, sidebarFilter, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const featured = paginated[0];
  const rest = paginated.slice(1);

  return (
    <div
      className="newsPage w-full bg-white"
      style={{
        fontFamily: "var(--token-font-body)",
        paddingTop: "40px",
        paddingBottom: "56px",
      }}
    >
      <div
        className="newsLayout mx-auto px-4 md:px-6"
        style={{ maxWidth: CONTAINER_MAX }}
      >
        <div className="flex flex-col lg:flex-row" style={{ gap: COL_GAP }}>
          {/* Sidebar - desktop */}
          <aside
            className="newsSidebar hidden lg:block flex-shrink-0"
            style={{ width: SIDEBAR_WIDTH }}
          >
            <nav
              className="sticky top-24 rounded-xl py-4"
              style={{
                backgroundColor: "#fff",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              aria-label="Filtrar noticias"
            >
              <ul className="list-none p-0 m-0">
                {SIDEBAR_LINKS.map(({ id, label }) => {
                  const isActive = sidebarFilter === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSidebarFilter(id)}
                        className="w-full text-left py-2 px-4 border-0 bg-transparent cursor-pointer text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 rounded"
                        style={{
                          color: isActive ? ACCENT : "#111",
                          borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                          marginLeft: 0,
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {/* Mobile category select */}
            <div className="lg:hidden mb-5">
              <button
                type="button"
                onClick={() => setMobileFilterOpen((o) => !o)}
                className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg border text-left text-sm font-medium"
                style={{ borderColor: DIVIDER, backgroundColor: "#fff", color: "#111" }}
                aria-expanded={mobileFilterOpen}
              >
                {SIDEBAR_LINKS.find((l) => l.id === sidebarFilter)?.label ?? "Todas"}
                <ChevronDown className={`h-4 w-4 ${mobileFilterOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileFilterOpen && (
                <ul
                  className="mt-1 rounded-lg border overflow-hidden list-none p-0 m-0"
                  style={{ borderColor: DIVIDER, backgroundColor: "#fff" }}
                >
                  {SIDEBAR_LINKS.map(({ id, label }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarFilter(id);
                          setMobileFilterOpen(false);
                          setPage(1);
                        }}
                        className="w-full text-left py-2.5 px-3 text-sm font-medium border-b last:border-b-0"
                        style={{
                          borderColor: DIVIDER,
                          color: sidebarFilter === id ? ACCENT : "#111",
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="divider text-[0.8125rem] font-medium mb-3" style={{ color: TEXT_SECONDARY }}>
              Inicio &gt; Noticias
            </div>
            <h1
              className="newsTitle mb-8"
              style={{
                fontSize: "clamp(2rem, 2.5vw, 2.35rem)",
                fontWeight: 600,
                letterSpacing: "0",
                lineHeight: 1.1,
                color: "#111",
                fontFamily: "var(--token-font-heading)",
              }}
            >
              Noticias
            </h1>

            {filtered.length === 0 ? (
              <p className="text-sm py-10" style={{ color: TEXT_SECONDARY }}>
                No hay noticias en esta categoría.
              </p>
            ) : (
              <>
                {featured && (
                  <div className="featuredRow mb-10">
                    <NewsItemRow item={featured} isFeatured dividerColor={DIVIDER} />
                  </div>
                )}

                {/* Year filter - below featured, BEREC style */}
                <div className="yearFilter flex justify-end mb-6">
                  <label className="flex items-center gap-2 text-sm" style={{ color: TEXT_SECONDARY }}>
                    <span>Año:</span>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="rounded-lg border px-3 h-10 text-sm font-medium bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-1"
                      style={{ borderColor: DIVIDER, color: "#111" }}
                    >
                      <option value="all">Todos los años</option>
                      {yearOptions.filter((y) => y !== "all").map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="newsList">
                  {rest.map((item, idx) => (
                    <div key={item.slug} className="newsItemRow">
                      <NewsItemRow item={item} isFeatured={false} dividerColor={DIVIDER} />
                      {idx < rest.length - 1 && (
                        <div className="divider my-0 h-px w-full" style={{ backgroundColor: DIVIDER }} />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination - minimal BEREC */}
            {totalPages > 1 && (
              <nav
                className="newsPagination flex flex-wrap items-center justify-center gap-1.5 mt-10"
                aria-label="Paginación"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-[32px] h-8 rounded px-2 text-[0.8125rem] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: TEXT_SECONDARY }}
                  aria-label="Anterior"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className="min-w-[32px] h-8 rounded text-[0.8125rem] font-medium transition-colors"
                    style={{
                      backgroundColor: currentPage === p ? ACCENT : "transparent",
                      color: currentPage === p ? "#fff" : TEXT_SECONDARY,
                    }}
                    aria-current={currentPage === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-w-[32px] h-8 rounded px-2 text-[0.8125rem] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: TEXT_SECONDARY }}
                  aria-label="Siguiente"
                >
                  →
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

interface NewsItemRowProps {
  item: NewsListItem;
  isFeatured: boolean;
  dividerColor: string;
}

/** Fila editorial BEREC: imagen izquierda, meta + título + extracto + readMoreLink. */
function NewsItemRow({ item, isFeatured, dividerColor }: NewsItemRowProps) {
  const href = `/noticias/${item.slug}`;

  return (
    <article className="py-5 md:py-6 first:pt-0">
      <Link to={href} className="block group">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div
            className="newsThumb relative flex-shrink-0 rounded-[12px] overflow-hidden bg-[var(--regu-gray-100)]"
            style={{
              width: "100%",
              maxWidth: isFeatured ? 540 : 280,
              height: isFeatured ? 320 : 160,
            }}
          >
            {(() => {
              const allImages = [item.imageUrl, ...(item.additionalImages ?? [])].filter(Boolean);
              if (allImages.length === 0) {
                return (
                  <div
                    className="w-full h-full"
                    style={{ background: "linear-gradient(135deg, var(--regu-gray-100) 0%, var(--regu-offwhite) 100%)" }}
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
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        if (next) next.style.display = "block";
                      }}
                    />
                    <div
                      className="w-full h-full hidden absolute inset-0"
                      style={{ background: "linear-gradient(135deg, var(--regu-gray-100) 0%, var(--regu-offwhite) 100%)" }}
                      aria-hidden
                    />
                  </>
                );
              }
              return (
                <ImageCarousel
                  images={allImages}
                  variant="card"
                  fillContainer
                  autoPlayMs={5000}
                  className="h-full w-full !rounded-[12px] [&_img]:!object-cover"
                />
              );
            })()}
          </div>

          <div className="newsContent flex-1 min-w-0 flex flex-col justify-center">
            <div
              className="newsMeta text-xs md:text-[0.8125rem] font-medium uppercase tracking-wide mb-1.5"
              style={{ color: TEXT_SECONDARY }}
            >
              {formatMetaDate(item.dateFormatted)}
              <span className="mx-1.5" style={{ color: dividerColor }}>|</span>
              <span style={{ color: ACCENT }}>{item.category.toUpperCase()}</span>
            </div>
            <h2
              className="font-semibold leading-tight mb-2 group-hover:underline"
              style={{
                color: "#111",
                fontSize: isFeatured ? "clamp(1.5rem, 1.8vw, 2rem)" : "clamp(1.05rem, 1.2vw, 1.2rem)",
                fontWeight: 600,
                lineHeight: isFeatured ? 1.15 : 1.25,
                fontFamily: "var(--token-font-heading)",
                textUnderlineOffset: 3,
              }}
            >
              {item.title}
            </h2>
            {!isFeatured && (
              <p className="text-xs md:text-[0.8125rem] mb-1.5" style={{ color: TEXT_SECONDARY }}>
                {formatMetaDate(item.dateFormatted)}
              </p>
            )}
            {item.excerpt && (
              <p
                className="text-[0.8125rem] md:text-sm leading-snug mb-3 line-clamp-2 md:line-clamp-3"
                style={{ color: TEXT_SECONDARY }}
              >
                {item.excerpt}
              </p>
            )}
            <span
              className="readMoreLink text-[0.8125rem] font-semibold inline-flex items-center gap-0.5 hover:underline"
              style={{ color: ACCENT, textUnderlineOffset: 3 }}
            >
              Leer más &gt;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default Noticias;
