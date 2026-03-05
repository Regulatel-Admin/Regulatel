import { useSearchParams, Link } from "react-router-dom";
import { searchSite, getTypeLabel, suggestQuery } from "@/lib/siteSearch";
import type { SiteSearchResult, SiteSearchType } from "@/lib/siteSearch";

const TYPES: SiteSearchType[] = ["autoridad", "noticia", "evento", "documento"];
const PAGE_SIZE = 12;

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
    <div className="rounded-xl border border-[var(--regu-gray-100)] bg-white px-4 py-4 transition hover:border-[var(--news-accent)]">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--news-accent)" }}
        >
          {getTypeLabel(r.type)}
        </span>
        {r.date && (
          <span className="text-xs text-[var(--regu-gray-500)]">
            {formatDate(r.date, r.type)}
          </span>
        )}
      </div>
      <p className="font-semibold text-[var(--regu-gray-900)] mb-1 line-clamp-2">{r.title}</p>
      <p
        className="text-sm text-[var(--regu-gray-600)] line-clamp-2 [&_mark]:bg-amber-200 [&_mark]:rounded [&_mark]:px-0.5"
        dangerouslySetInnerHTML={{ __html: r.snippetHighlighted }}
      />
    </div>
  );

  if (r.url.startsWith("http")) {
    return (
      <a href={r.url} target="_blank" rel="noreferrer noopener" className="block">
        {content}
      </a>
    );
  }
  return <Link to={r.url}>{content}</Link>;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const typeFilter = (searchParams.get("type") as SiteSearchType) || null;

  const results = q.trim()
    ? searchSite(q, { limit: 100, type: typeFilter ?? undefined })
    : [];
  const suggestion = results.length === 0 && q.trim().length >= 2 ? suggestQuery(q) : null;

  const setType = (t: SiteSearchType | null) => {
    const next = new URLSearchParams(searchParams);
    if (t) next.set("type", t);
    else next.delete("type");
    setSearchParams(next);
  };

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8 md:py-12"
      style={{ fontFamily: "var(--token-font-body)" }}
    >
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--regu-gray-900)" }}
      >
        Buscar en el sitio
      </h1>

      {q ? (
        <>
          <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Resultados para: <strong style={{ color: "var(--regu-gray-900)" }}>{q}</strong>
            {results.length > 0 && (
              <span className="ml-1">({results.length} {results.length === 1 ? "resultado" : "resultados"})</span>
            )}
          </p>

          {results.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => setType(null)}
                className="rounded-full border px-3 py-1.5 text-sm font-medium transition"
                style={{
                  borderColor: !typeFilter ? "var(--news-accent)" : "#E5E7EB",
                  color: !typeFilter ? "var(--news-accent)" : "var(--regu-gray-700)",
                  background: !typeFilter ? "rgba(196,0,90,0.06)" : "transparent",
                }}
              >
                Todo
              </button>
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="rounded-full border px-3 py-1.5 text-sm font-medium transition"
                  style={{
                    borderColor: typeFilter === t ? "var(--news-accent)" : "#E5E7EB",
                    color: typeFilter === t ? "var(--news-accent)" : "var(--regu-gray-700)",
                    background: typeFilter === t ? "rgba(196,0,90,0.06)" : "transparent",
                  }}
                >
                  {getTypeLabel(t)}
                </button>
              ))}
            </div>
          )}

          {results.length > 0 ? (
            <ul className="mt-6 space-y-4 list-none p-0 m-0">
              {paginated.map((r) => (
                <li key={r.id}>
                  <ResultCard r={r} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                No hay resultados que coincidan con &quot;{q}&quot;.
              </p>
              {suggestion && (
                <p className="mt-2 text-sm">
                  ¿Quisiste decir:{" "}
                  <Link
                    to={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="font-medium"
                    style={{ color: "var(--news-accent)" }}
                  >
                    {suggestion}
                  </Link>
                  ?
                </p>
              )}
              {!suggestion && (
                <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  Pruebe con otros términos (por ejemplo: miembros, presidente, noticias, eventos, autoridades).
                </p>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex flex-wrap gap-2 mt-8 justify-center" aria-label="Paginación">
              {page > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page - 1));
                    setSearchParams(next);
                  }}
                  className="rounded border border-[#E5E7EB] px-3 py-2 text-sm font-medium hover:bg-[#F9FAFB]"
                >
                  Anterior
                </button>
              )}
              <span className="py-2 text-sm text-[var(--regu-gray-600)]">
                Página {page} de {totalPages}
              </span>
              {page < totalPages && (
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page + 1));
                    setSearchParams(next);
                  }}
                  className="rounded border border-[#E5E7EB] px-3 py-2 text-sm font-medium hover:bg-[#F9FAFB]"
                >
                  Siguiente
                </button>
              )}
            </nav>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Use la barra &quot;Buscar en el sitio&quot; del encabezado e ingrese un término (por ejemplo:
          un nombre, &quot;noticias&quot;, &quot;eventos&quot;, &quot;guido&quot;).
        </p>
      )}

      <Link
        to="/"
        className="mt-8 inline-block text-sm font-medium"
        style={{ color: "var(--news-accent)" }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
