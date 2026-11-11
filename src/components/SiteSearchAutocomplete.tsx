import { useRef, useState, useEffect, useCallback, useMemo, useId, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  buildSearchDocs, mergeSearchNews,
  searchSiteDocs,
  getTypeLabel,
  type SiteSearchResult,
} from "@/lib/siteSearch";
import { buildDocumentSearchDocs, gestionDocumentSearchPath } from "@/lib/documentSearch";
import { localizePublishedText } from "@/lib/publishedContent";
import { useAdminData, useEvents, useMergedGestionDocuments } from "@/contexts/AdminDataContext";
import { useAutoridadesActuales } from "@/contexts/SiteSettingsContext";
import { noticiasData } from "@/pages/noticiasData";
import { localizeNoticiaData, localizeNewsFields } from "@/hooks/useLocalizedNews";
import { useLocalizedEvents } from "@/hooks/useLocalizedEvents";

const DEBOUNCE_MS = 200;
const AUTCOMPLETE_LIMIT = 8;

function formatDate(dateStr: string, language: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(dateStr)) {
    const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
    const locale = ({ en: "en-GB", pt: "pt-PT", it: "it-IT" } as Record<string, string>)[language.split("-")[0]] ?? "es-ES";
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  }
  return dateStr;
}

interface SiteSearchAutocompleteProps {
  scope?: "site" | "documents";
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
  scope = "site",
  value,
  onChange,
  onResultSelect,
  placeholder,
  id,
  className = "",
  style,
  compact = false,
}: SiteSearchAutocompleteProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { adminNews, newsLoaded } = useAdminData();
  const eventsRaw = useEvents();
  const events = useLocalizedEvents(eventsRaw);
  const documents = useMergedGestionDocuments();
  const autoridadesActuales = useAutoridadesActuales();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SiteSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const instanceId = useId();
  const listboxId = `search-listbox-${instanceId}`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeOptionRef = useRef<HTMLLIElement>(null);
  const localizedNoticias = useMemo(
    () => noticiasData.map((n) => localizeNoticiaData(n, t, i18n.language)),
    [t, i18n.language]
  );
  const localizedStoredNews = useMemo(
    () => adminNews.map((item) => localizeNewsFields(item, t, i18n.language)),
    [adminNews, t, i18n.language]
  );
  const mergedNews = useMemo(
    () => mergeSearchNews(localizedNoticias, localizedStoredNews, newsLoaded),
    [localizedNoticias, localizedStoredNews, newsLoaded]
  );
  const searchDocs = useMemo(
    () => scope === "documents"
      ? buildDocumentSearchDocs({
        news: mergedNews,
        events,
        documents,
        localize: (text) => localizePublishedText(text, i18n.language),
      }) : buildSearchDocs({
        authorities: autoridadesActuales,
        news: mergedNews,
        events,
        documents: documents.map((document) => ({
          ...document,
          title: localizePublishedText(document.title, i18n.language),
          url: gestionDocumentSearchPath(document),
        })),
      }),
    [scope, autoridadesActuales, documents, events, mergedNews, i18n.language]
  );
  // Public hooks return fresh arrays on render; debounce only actual index changes.
  const indexSignature = JSON.stringify(searchDocs);
  const searchDocsRef = useRef(searchDocs);
  searchDocsRef.current = searchDocs;

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return [];
    }
    const next = searchSiteDocs(searchDocsRef.current, q, { limit: AUTCOMPLETE_LIMIT });
    setResults(next);
    setOpen(next.length > 0);
    setActiveIndex(-1);
    return next;
  }, []);

  useEffect(() => {
    if (open) activeOptionRef.current?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const closeDropdown = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    setOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      runSearch(value);
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runSearch(value);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, runSearch, indexSignature]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setOpen(false);
        setActiveIndex(-1);
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
    closeDropdown();
    onResultSelect?.();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = null;
      const available = open ? results : runSearch(value);
      if (!available.length) return;
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const previous = open ? activeIndex : -1;
      setActiveIndex(previous < 0 ? (direction === 1 ? 0 : available.length - 1)
        : (previous + direction + available.length) % available.length);
    } else if (event.key === "Enter") {
      if (open && activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault();
        handleResultClick(results[activeIndex]);
      } else closeDropdown(); // An unselected Enter keeps the existing form submit.
    } else if (event.key === "Tab") closeDropdown();
  };

  return (
    <div ref={containerRef} className={`relative flex-1 min-w-0 ${className}`} style={style}>
      <input
        id={id}
        type="search"
        placeholder={placeholder ?? t(scope === "documents" ? "common.topbar.searchDocuments" : "common.topbar.searchSite")}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          closeDropdown();
          setResults([]);
        }}
        onFocus={() => value.trim() && runSearch(value)}
        onKeyDown={handleInputKeyDown}
        className="w-full border-0 p-0 outline-none bg-transparent"
        style={{
          fontSize: compact ? "14px" : "13px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: "#1C1C1C",
        }}
        autoComplete="off"
        role="combobox"
        aria-label={t(scope === "documents" ? "common.topbar.searchDocumentsAria" : "common.topbar.searchSiteAria")}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        aria-expanded={open}
      />

      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(400px,70vh)] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white py-2 shadow-lg"
          style={{ minWidth: "280px" }}
        >
          {results.map((r, index) => (
            <li
              key={r.id}
              id={`${listboxId}-${index}`}
              ref={activeIndex === index ? activeOptionRef : undefined}
              role="option"
              aria-selected={activeIndex === index}
              tabIndex={0}
              className="cursor-pointer border-b border-[#F3F4F6] last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault();
                handleResultClick(r);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleResultClick(r);
                }
              }}
            >
              <div className={`px-4 py-3 hover:bg-[#F9FAFB] ${activeIndex === index ? "bg-[#F9FAFB]" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider shrink-0"
                    style={{ color: "var(--news-accent)" }}
                  >
                    {getTypeLabel(r.type, t)}
                  </span>
                  {r.date && (
                    <span className="text-[11px] text-[#6B7280] shrink-0">
                      {formatDate(r.date, i18n.language)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#111827] line-clamp-2 mb-0.5">
                  {r.title}
                </p>
                <p
                  className="text-xs text-[#6B7280] line-clamp-2 [&_mark]:bg-amber-200 [&_mark]:rounded [&_mark]:px-0.5"
                >
                  {r.snippetHighlighted.split(/(<mark>[\s\S]*?<\/mark>)/g).map((part, partIndex) =>
                    part.startsWith("<mark>") && part.endsWith("</mark>")
                      ? <mark key={partIndex}>{part.slice(6, -7)}</mark> : part)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
