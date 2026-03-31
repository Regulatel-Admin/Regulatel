import { useSearchParams, Link } from "react-router-dom";
import { useMemo } from "react";
import {
  buildSearchDocs,
  searchSiteDocs,
  getTypeLabel,
  suggestQueryDocs,
} from "@/lib/siteSearch";
import type { SiteSearchResult, SiteSearchType } from "@/lib/siteSearch";
import { useAdminData, useEvents, useMergedGestionDocuments } from "@/contexts/AdminDataContext";
import { useAutoridadesActuales } from "@/contexts/SiteSettingsContext";
import { noticiasData } from "./noticiasData";
import {
  Search as SearchIcon,
  FileText,
  User,
  Newspaper,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

const TYPES: SiteSearchType[] = ["autoridad", "noticia", "evento", "documento"];
const PAGE_SIZE = 12;

const TYPE_ICONS: Record<SiteSearchType, React.ReactNode> = {
  autoridad: <User size={16} />,
  noticia: <Newspaper size={16} />,
  evento: <Calendar size={16} />,
  documento: <FileText size={16} />,
};

function formatDate(dateStr: string, type: SiteSearchType): string {
  if (!dateStr) return "";
  if ((type === "evento" || type === "noticia") && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
  return dateStr;
}

function ResultCard({ r }: { r: SiteSearchResult }) {
  const content = (
    <div
      className="group flex h-full flex-col rounded-2xl border bg-white p-5 transition-all hover:border-[rgba(22,61,89,0.18)] hover:shadow-[0_4px_12px_rgba(22,61,89,0.08)]"
      style={{
        borderColor: "rgba(22,61,89,0.10)",
        boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
        borderTop: "3px solid var(--regu-blue)",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
        >
          {TYPE_ICONS[r.type]}
          {getTypeLabel(r.type)}
        </span>
        {r.date && (
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--regu-gray-500)" }}>
            {formatDate(r.date, r.type)}
          </span>
        )}
      </div>
      <p
        className="mb-2 font-bold leading-tight transition-colors group-hover:text-[var(--regu-blue)]"
        style={{ color: "var(--regu-navy)", fontSize: "1rem", fontFamily: "var(--token-font-heading)" }}
      >
        {r.title}
      </p>
      <p
        className="mt-auto text-sm leading-relaxed line-clamp-2 [&_mark]:rounded [&_mark]:bg-[rgba(68,137,198,0.15)] [&_mark]:px-0.5 [&_mark]:font-medium [&_mark]:text-[var(--regu-navy)]"
        style={{ color: "var(--regu-gray-600)" }}
        dangerouslySetInnerHTML={{ __html: r.snippetHighlighted }}
      />
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--regu-blue)" }}>
        Ver
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );

  if (r.url.startsWith("http")) {
    return (
      <a href={r.url} target="_blank" rel="noreferrer noopener" className="block h-full">
        {content}
      </a>
    );
  }
  return (
    <Link to={r.url} className="block h-full">
      {content}
    </Link>
  );
}

export default function Search() {
  const { adminNews, contentSource } = useAdminData();
  const events = useEvents();
  const documents = useMergedGestionDocuments();
  const autoridadesActuales = useAutoridadesActuales();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const typeFilter = (searchParams.get("type") as SiteSearchType) || null;
  const searchDocs = useMemo(
    () =>
      buildSearchDocs({
        authorities: autoridadesActuales,
        news:
          contentSource === "database"
            ? adminNews
                .filter((n) => n.published)
                .map((n) => ({
                  id: n.id,
                  slug: n.slug || n.id,
                  title: n.title,
                  date: n.date,
                  dateFormatted: n.dateFormatted,
                  excerpt: n.excerpt,
                  category: n.category,
                  content: n.content,
                }))
            : noticiasData,
        events,
        documents,
      }),
    [adminNews, autoridadesActuales, contentSource, documents, events]
  );

  const results = q.trim()
    ? searchSiteDocs(searchDocs, q, { limit: 100, type: typeFilter ?? undefined })
    : [];
  const suggestion =
    results.length === 0 && q.trim().length >= 2 ? suggestQueryDocs(searchDocs, q) : null;

  const setType = (t: SiteSearchType | null) => {
    const next = new URLSearchParams(searchParams);
    if (t) next.set("type", t);
    else next.delete("type");
    next.set("page", "1");
    setSearchParams(next);
  };

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} aria-hidden />

      <div className="mx-auto px-4 pb-14 pt-8 md:px-6 md:pt-10" style={{ maxWidth: 900 }}>
        <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-400)" }} aria-label="Breadcrumb">
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>
            {q.trim() ? "Resultados de búsqueda" : "Buscar en el sitio"}
          </span>
        </nav>

        <header className="mb-8">
          <p
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--regu-gray-400)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <SearchIcon size={12} style={{ color: "var(--regu-blue)" }} />
            Búsqueda en el sitio · REGULATEL
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 4,
                minHeight: 40,
                borderRadius: 2,
                background: "var(--regu-blue)",
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
                  fontWeight: 700,
                  color: "var(--regu-navy)",
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: "var(--token-font-heading)",
                }}
              >
                {q.trim() ? "Resultados de búsqueda" : "Buscar en el sitio"}
              </h1>
              {q.trim() ? (
                <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  <strong style={{ color: "var(--regu-navy)" }}>&ldquo;{q}&rdquo;</strong>
                  {results.length > 0 && (
                    <span className="ml-1">
                      — {results.length} {results.length === 1 ? "resultado" : "resultados"}
                    </span>
                  )}
                </p>
              ) : (
                <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)", maxWidth: 520 }}>
                  Use la barra &quot;Buscar en el sitio&quot; del encabezado e ingrese un término (nombre, noticias, eventos, autoridades, etc.).
                </p>
              )}
            </div>
          </div>
        </header>

        {!q.trim() ? (
          <div
            className="rounded-2xl border p-8 md:p-10 text-center"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
              borderTop: "3px solid var(--regu-blue)",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(68,137,198,0.12)" }}
            >
              <SearchIcon size={28} style={{ color: "var(--regu-blue)" }} />
            </div>
            <p className="text-base font-semibold" style={{ color: "var(--regu-navy)" }}>
              Escriba su búsqueda en el encabezado
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)", maxWidth: 400, margin: "0.5rem auto 0" }}>
              Utilice el campo &quot;Buscar en el sitio&quot; en la parte superior de la página e ingrese un término (por ejemplo: miembros, noticias, eventos, autoridades).
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-95"
              style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
            >
              Ir al inicio
            </Link>
            <p className="mt-6 text-xs" style={{ color: "var(--regu-gray-400)" }}>
              Para buscar solo en documentos (revistas, planes, actas), use{" "}
              <Link to="/buscar-documentos" className="font-semibold underline" style={{ color: "var(--regu-blue)" }}>
                Buscar documentos
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                  Filtrar por tipo:
                </span>
                <button
                  type="button"
                  onClick={() => setType(null)}
                  className="rounded-xl border px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
                  style={{
                    borderColor: !typeFilter ? "var(--regu-blue)" : "rgba(22,61,89,0.12)",
                    color: !typeFilter ? "#fff" : "var(--regu-gray-700)",
                    backgroundColor: !typeFilter ? "var(--regu-blue)" : "#F4F6F8",
                  }}
                >
                  Todo
                </button>
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="rounded-xl border px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
                    style={{
                      borderColor: typeFilter === t ? "var(--regu-blue)" : "rgba(22,61,89,0.12)",
                      color: typeFilter === t ? "#fff" : "var(--regu-gray-700)",
                      backgroundColor: typeFilter === t ? "var(--regu-blue)" : "#F4F6F8",
                    }}
                  >
                    {getTypeLabel(t)}
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 ? (
              <ul className="space-y-4 list-none p-0 m-0">
                {paginated.map((r) => (
                  <li key={r.id}>
                    <ResultCard r={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="rounded-2xl border p-8 md:p-10 text-center"
                style={{
                  backgroundColor: "#fff",
                  borderColor: "rgba(22,61,89,0.10)",
                  boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
                  borderTop: "3px solid var(--regu-blue)",
                }}
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "rgba(68,137,198,0.08)" }}
                >
                  <SearchIcon size={28} style={{ color: "var(--regu-gray-400)" }} />
                </div>
                <p className="text-base font-bold" style={{ color: "var(--regu-navy)" }}>
                  No hay resultados para &ldquo;{q}&rdquo;
                </p>
                {suggestion ? (
                  <p className="mt-3 text-sm" style={{ color: "var(--regu-gray-600)" }}>
                    ¿Quisiste decir:{" "}
                    <Link
                      to={`/search?q=${encodeURIComponent(suggestion)}`}
                      className="font-bold underline"
                      style={{ color: "var(--regu-blue)" }}
                    >
                      {suggestion}
                    </Link>
                    ?
                  </p>
                ) : (
                  <p className="mt-3 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                    Pruebe con otros términos (por ejemplo: miembros, presidente, noticias, eventos, autoridades).
                  </p>
                )}
                <Link
                  to="/buscar-documentos"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
                  style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)", textDecoration: "none" }}
                >
                  <BookOpen size={16} />
                  Buscar en documentos
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t pt-8"
                style={{ borderColor: "rgba(22,61,89,0.08)" }}
                aria-label="Paginación"
              >
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page - 1));
                    setSearchParams(next);
                  }}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
                  style={{
                    borderColor: "rgba(22,61,89,0.12)",
                    color: "var(--regu-gray-700)",
                    backgroundColor: "#fff",
                  }}
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>
                <span className="text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page + 1));
                    setSearchParams(next);
                  }}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
                  style={{
                    borderColor: "rgba(22,61,89,0.12)",
                    color: "var(--regu-gray-700)",
                    backgroundColor: "#fff",
                  }}
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-4 border-t pt-8" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
            style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)", textDecoration: "none" }}
          >
            ← Volver al inicio
          </Link>
          <Link
            to="/buscar-documentos"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
          >
            Buscar documentos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
