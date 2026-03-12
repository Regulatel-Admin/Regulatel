import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
const SIDEBAR_WIDTH = "220px";
const COL_GAP = "48px";

type SidebarFilter = "Todas" | "Noticias" | "Reuniones" | "Mesas" | "Eventos";

const SIDEBAR_LINKS: { id: SidebarFilter; label: string }[] = [
  { id: "Todas", label: "Últimas noticias" },
  { id: "Noticias", label: "Noticias" },
  { id: "Reuniones", label: "Reuniones" },
  { id: "Mesas", label: "Mesas" },
  { id: "Eventos", label: "Eventos" },
];

const ITEMS_PER_PAGE = 8;

function extractYear(dateStr: string): string {
  if (!dateStr || dateStr.length < 4) return "";
  return dateStr.slice(0, 4);
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
      style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
    >
      {label}
    </span>
  );
}

function Noticias() {
  const { adminNews, contentSource } = useAdminData();
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
    if (contentSource !== "database") {
      return [...staticItems].sort((a, b) => (a.date > b.date ? -1 : 1));
    }
    const dbSlugs = new Set(
      (adminNews ?? []).filter((n) => n.published).map((n) => (n.slug || n.id).toLowerCase())
    );
    const staticFiltered = staticItems.filter((item) => !dbSlugs.has(item.slug.toLowerCase()));
    const dbItems: NewsListItem[] = (adminNews ?? [])
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
    return [...staticFiltered, ...dbItems].sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [adminNews, contentSource]);

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
      className="newsPage w-full"
      style={{
        fontFamily: "var(--token-font-body)",
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        paddingTop: "44px",
        paddingBottom: "64px",
      }}
    >
      <div className="newsLayout mx-auto px-4 md:px-6" style={{ maxWidth: CONTAINER_MAX }}>
        <div className="flex flex-col lg:flex-row" style={{ gap: COL_GAP }}>

          {/* ── Sidebar desktop ── */}
          <aside className="newsSidebar hidden lg:block flex-shrink-0" style={{ width: SIDEBAR_WIDTH }}>
            <nav
              className="sticky top-24 overflow-hidden rounded-2xl border bg-white"
              style={{
                borderColor: "rgba(22,61,89,0.10)",
                boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
              }}
              aria-label="Filtrar noticias"
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "rgba(22,61,89,0.02)" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  Categorías
                </p>
              </div>
              <ul className="list-none p-0 m-0 py-2">
                {SIDEBAR_LINKS.map(({ id, label }) => {
                  const isActive = sidebarFilter === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSidebarFilter(id)}
                        className="w-full text-left py-2.5 px-4 bg-transparent cursor-pointer text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 rounded-none"
                        style={{
                          color: isActive ? "var(--regu-blue)" : "var(--regu-gray-700)",
                          borderLeft: isActive ? "3px solid var(--regu-blue)" : "3px solid transparent",
                          fontWeight: isActive ? 700 : 500,
                          backgroundColor: isActive ? "rgba(68,137,198,0.05)" : "transparent",
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

          {/* ── Main ── */}
          <main className="flex-1 min-w-0">
            {/* Mobile category select */}
            <div className="lg:hidden mb-5">
              <button
                type="button"
                onClick={() => setMobileFilterOpen((o) => !o)}
                className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl border text-left text-sm font-semibold bg-white"
                style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-navy)" }}
                aria-expanded={mobileFilterOpen}
              >
                {SIDEBAR_LINKS.find((l) => l.id === sidebarFilter)?.label ?? "Todas"}
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileFilterOpen && (
                <ul
                  className="mt-1 rounded-xl border overflow-hidden list-none p-0 m-0 bg-white"
                  style={{ borderColor: "rgba(22,61,89,0.10)" }}
                >
                  {SIDEBAR_LINKS.map(({ id, label }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => { setSidebarFilter(id); setMobileFilterOpen(false); setPage(1); }}
                        className="w-full text-left py-2.5 px-4 text-sm font-medium border-b last:border-b-0"
                        style={{
                          borderColor: "rgba(22,61,89,0.07)",
                          color: sidebarFilter === id ? "var(--regu-blue)" : "var(--regu-gray-700)",
                          fontWeight: sidebarFilter === id ? 700 : 500,
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Page header */}
            <div className="mb-8 flex items-start gap-4">
              <div
                className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              <div>
                <h1
                  className="text-2xl font-bold leading-tight md:text-[1.875rem]"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  {sidebarFilter === "Todas" ? "Noticias" : sidebarFilter}
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {filtered.length} {filtered.length === 1 ? "publicación" : "publicaciones"}
                </p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm py-10" style={{ color: "var(--regu-gray-500)" }}>
                No hay noticias en esta categoría.
              </p>
            ) : (
              <>
                {/* Featured */}
                {featured && (
                  <div className="mb-8">
                    <NewsItemRow item={featured} isFeatured />
                  </div>
                )}

                {/* Year filter */}
                {yearOptions.length > 2 && (
                  <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>
                      {rest.length} artículo{rest.length !== 1 ? "s" : ""} más
                    </span>
                    <label className="flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
                      <span className="font-medium">Año:</span>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="rounded-lg border px-3 h-9 text-sm font-semibold bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-1"
                        style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-navy)" }}
                      >
                        <option value="all">Todos los años</option>
                        {yearOptions.filter((y) => y !== "all").map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {/* List */}
                <div className="newsList rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04)" }}>
                  {rest.map((item, idx) => (
                    <div
                      key={item.slug}
                      className={idx < rest.length - 1 ? "border-b" : ""}
                      style={{ borderColor: "rgba(22,61,89,0.07)" }}
                    >
                      <NewsItemRow item={item} isFeatured={false} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-10" aria-label="Paginación">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgba(68,137,198,0.07)]"
                  style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-600)" }}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className="h-9 min-w-[36px] rounded-lg text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: currentPage === p ? "var(--regu-blue)" : "transparent",
                      color: currentPage === p ? "#fff" : "var(--regu-gray-600)",
                      border: currentPage === p ? "none" : "1px solid rgba(22,61,89,0.12)",
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgba(68,137,198,0.07)]"
                  style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-600)" }}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
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
}

function NewsItemRow({ item, isFeatured }: NewsItemRowProps) {
  const href = `/noticias/${item.slug}`;

  return (
    <article className={`group ${isFeatured ? "py-0" : "py-5 px-5 md:py-6 md:px-6"}`}>
      <Link to={href} className="block">
        <div className={`flex gap-4 md:gap-6 ${isFeatured ? "flex-col md:flex-row" : "flex-row items-start"}`}>
          {/* Image */}
          <div
            className={`relative flex-shrink-0 overflow-hidden bg-[var(--regu-gray-100)] ${
              isFeatured
                ? "w-full rounded-2xl md:w-[480px] lg:w-[520px]"
                : "w-28 rounded-xl sm:w-36 md:w-44"
            }`}
            style={{
              height: isFeatured ? "300px" : "110px",
            }}
          >
            {(() => {
              const allImages = [item.imageUrl, ...(item.additionalImages ?? [])].filter(Boolean);
              if (allImages.length === 0) {
                return (
                  <div
                    className="w-full h-full"
                    style={{ background: "linear-gradient(135deg, rgba(68,137,198,0.08) 0%, rgba(22,61,89,0.05) 100%)" }}
                    aria-hidden
                  />
                );
              }
              if (allImages.length === 1) {
                return (
                  <img
                    src={allImages[0]}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                );
              }
              return (
                <ImageCarousel
                  images={allImages}
                  variant="card"
                  fillContainer
                  autoPlayMs={5000}
                  className="h-full w-full"
                />
              );
            })()}
          </div>

          {/* Content */}
          <div className={`flex-1 min-w-0 flex flex-col ${isFeatured ? "justify-center py-2 md:py-4" : "justify-start"}`}>
            {/* Meta */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CategoryBadge label={item.category} />
              <span
                className="text-[11px] font-medium uppercase tracking-[0.08em]"
                style={{ color: "var(--regu-gray-500)" }}
              >
                {item.dateFormatted.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h2
              className="font-bold leading-snug transition-colors group-hover:text-[var(--regu-blue)]"
              style={{
                color: "var(--regu-navy)",
                fontSize: isFeatured
                  ? "clamp(1.35rem, 1.8vw, 1.875rem)"
                  : "clamp(0.9375rem, 1.1vw, 1.0625rem)",
                lineHeight: isFeatured ? 1.2 : 1.35,
                fontFamily: "var(--token-font-heading)",
              }}
            >
              {item.title}
            </h2>

            {/* Excerpt */}
            {item.excerpt && (
              <p
                className={`mt-2 leading-relaxed ${isFeatured ? "line-clamp-3 text-sm md:text-base" : "line-clamp-2 text-sm"}`}
                style={{ color: "var(--regu-gray-600)" }}
              >
                {item.excerpt}
              </p>
            )}

            {/* Read more */}
            <span
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] transition-all group-hover:gap-2"
              style={{ color: "var(--regu-blue)" }}
            >
              Leer más
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default Noticias;
