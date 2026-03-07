import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  buildSearchDocs,
  searchSiteDocs,
  getTypeLabel,
  type SiteSearchResult,
  type SiteSearchType,
} from "@/lib/siteSearch";
import { useAdminData, useEvents, useMergedGestionDocuments } from "@/contexts/AdminDataContext";
import { noticiasData } from "@/pages/noticiasData";

const DEBOUNCE_MS = 200;
const AUTCOMPLETE_LIMIT = 8;

function formatDate(dateStr: string, type: SiteSearchType): string {
  if (!dateStr) return "";
  if (type === "evento" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
  if (type === "noticia" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
  return dateStr;
}

interface SiteSearchAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onResultSelect?: () => void;
  placeholder?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  /** When true, dropdown is shown below (e.g. mobile panel) */
  compact?: boolean;
}

export default function SiteSearchAutocomplete({
  value,
  onChange,
  onResultSelect,
  placeholder = "BUSCAR EN EL SITIO",
  id,
  className = "",
  style,
  compact = false,
}: SiteSearchAutocompleteProps) {
  const navigate = useNavigate();
  const { adminNews, contentSource } = useAdminData();
  const events = useEvents();
  const documents = useMergedGestionDocuments();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SiteSearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchDocs = useMemo(
    () =>
      buildSearchDocs({
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
    [adminNews, contentSource, documents, events]
  );

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const next = searchSiteDocs(searchDocs, q, { limit: AUTCOMPLETE_LIMIT });
    setResults(next);
    setOpen(next.length > 0);
  }, [searchDocs]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runSearch(value);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (r: SiteSearchResult) => {
    if (r.url.startsWith("http")) {
      window.open(r.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(r.url);
    }
    setOpen(false);
    onResultSelect?.();
  };

  return (
    <div ref={containerRef} className={`relative flex-1 min-w-0 ${className}`} style={style}>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim() && runSearch(value)}
        className="w-full border-0 p-0 outline-none bg-transparent"
        style={{
          fontSize: compact ? "14px" : "13px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: "#1C1C1C",
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls="site-search-listbox"
        aria-expanded={open}
      />

      {open && results.length > 0 && (
        <ul
          id="site-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(400px,70vh)] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white py-2 shadow-lg"
          style={{ minWidth: "280px" }}
        >
          {results.map((r) => (
            <li
              key={r.id}
              role="option"
              tabIndex={0}
              className="cursor-pointer border-b border-[#F3F4F6] last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault();
                handleResultClick(r);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleResultClick(r);
                }
              }}
            >
              <div className="px-4 py-3 hover:bg-[#F9FAFB]">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider shrink-0"
                    style={{ color: "var(--news-accent)" }}
                  >
                    {getTypeLabel(r.type)}
                  </span>
                  {r.date && (
                    <span className="text-[11px] text-[#6B7280] shrink-0">
                      {formatDate(r.date, r.type)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#111827] line-clamp-2 mb-0.5">
                  {r.title}
                </p>
                <p
                  className="text-xs text-[#6B7280] line-clamp-2 [&_mark]:bg-amber-200 [&_mark]:rounded [&_mark]:px-0.5"
                  dangerouslySetInnerHTML={{ __html: r.snippetHighlighted }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
