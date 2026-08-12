import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileDown,
  Eye,
  X,
  BookOpen,
  Search,
  Lock,
  Check,
  ClipboardList,
  ArrowRight,
  Crown,
} from "lucide-react";
import { getRestrictedDocument, isRestrictedUnlocked, markAllRestrictedUnlocked } from "@/config/restrictedDocuments";
import { api } from "@/lib/api";
import PageHero from "@/components/PageHero";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { canPreviewDocument, type DocumentPreviewTarget } from "@/lib/documentPreview";
import {
  filterByTipo,
  GESTION_TIPO_VALUES,
  getCategoryDisplayLabel,
  type GestionTipo,
  type GestionDocument,
} from "@/data/gestion";
import { useMergedGestionDocuments } from "@/contexts/AdminDataContext";
import { EditableSpot } from "@/components/site-edit/EditableSpot";

function normalizeSearch(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

function filterBySearch(docs: GestionDocument[], query: string): GestionDocument[] {
  const q = normalizeSearch(query);
  if (!q) return docs;
  return docs.filter((d) => {
    const titleNorm = normalizeSearch(d.title);
    const yearStr = d.year ? normalizeSearch(d.year) : "";
    const quarterStr = d.quarter ? normalizeSearch(d.quarter) : "";
    const catNorm = normalizeSearch(d.category);
    return (
      titleNorm.includes(q) ||
      yearStr.includes(q) ||
      quarterStr.includes(q) ||
      catNorm.includes(q)
    );
  });
}

function getBlockHeadingHref(tipo: GestionTipo): string {
  if (tipo === "todo") return "/gestion";
  return `/gestion?tipo=${tipo}`;
}

const SEARCH_DEBOUNCE_MS = 200;

/* ——————————————————————————————————————————
   Íconos por categoría
—————————————————————————————————————————— */
/* Íconos y colores por categoría (banco se mantiene para docs legacy que ya tienen esa category). */
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  revista: BookOpen,
  "planes-actas": ClipboardList,
  "comite-ejecutivo": Crown,
  documentos: FileText,
  banco: FileText,
  otros: FileText,
};
const CATEGORY_BADGE: Record<string, { bg: string; color: string }> = {
  revista:      { bg: "rgba(68,137,198,0.10)",  color: "var(--regu-blue)"  },
  "planes-actas": { bg: "rgba(22,61,89,0.07)",   color: "var(--regu-navy)"  },
  "comite-ejecutivo": { bg: "rgba(22,61,89,0.07)", color: "var(--regu-navy)" },
  documentos:   { bg: "rgba(68,137,198,0.08)",  color: "var(--regu-blue)"  },
  banco:        { bg: "rgba(22,61,89,0.06)",    color: "var(--regu-navy)"  },
  otros:        { bg: "rgba(22,61,89,0.05)",    color: "var(--regu-gray-600)" },
};

export default function Gestion() {
  const { t } = useTranslation();
  const rawDocuments = useMergedGestionDocuments();
  const allDocuments = Array.isArray(rawDocuments) ? rawDocuments : [];
  const [searchParams, setSearchParams] = useSearchParams();
  const tipo = (searchParams.get("tipo") ?? "todo") as GestionTipo;
  const docId = searchParams.get("id") ?? null;
  const searchQuery = searchParams.get("q") ?? "";
  const validTipo = GESTION_TIPO_VALUES.includes(tipo) ? tipo : "todo";
  /* Redirigir ?tipo=banco a vista "Todo" (categoría banco ya no es filtro visible). */
  useEffect(() => {
    if (searchParams.get("tipo") === "banco") {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("tipo");
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewTarget | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [, setRestrictedSessionTick] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedRevistaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const docRes = await api.documentAccess.session();
      if (cancelled) return;
      if (docRes.ok && docRes.data?.ok) {
        markAllRestrictedUnlocked();
        setRestrictedSessionTick((n) => n + 1);
        return;
      }
      const adminRes = await api.admin.session();
      if (cancelled) return;
      if (adminRes.ok && adminRes.data?.authenticated && adminRes.data?.user) {
        markAllRestrictedUnlocked();
        setRestrictedSessionTick((n) => n + 1);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredByTipo = filterByTipo(allDocuments, validTipo === "todo" ? null : validTipo);
  const filtered = filterBySearch(filteredByTipo, searchQuery);
  const hasDocId = Boolean(docId && filtered.some((d) => d.id === docId));
  const displayList = docId && hasDocId ? filtered.filter((d) => d.id === docId) : filtered;
  const isRevistaDeepLink = validTipo === "revista" && Boolean(docId) && hasDocId;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const q = searchInput.trim();
        if (q) next.set("q", q);
        else next.delete("q");
        return next;
      }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput, setSearchParams]);

  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  useEffect(() => {
    if (isRevistaDeepLink && selectedRevistaRef.current) {
      const t = setTimeout(() => {
        selectedRevistaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 320);
      return () => clearTimeout(t);
    }
  }, [isRevistaDeepLink, docId]);

  const setTipo = (value: GestionTipo) => {
    if (value === "todo") {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("tipo");
        next.delete("id");
        return next;
      }, { replace: true });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tipo", value);
        return next;
      }, { replace: true });
    }
  };

  useEffect(() => {
    if (validTipo !== "todo" && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [validTipo]);

  useEffect(() => {
    if (!docId || !hasDocId) return;
    const id = docId;
    const scrollToEl = () => {
      const el = document.getElementById(`doc-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const t1 = setTimeout(scrollToEl, 180);
    const t2 = setTimeout(scrollToEl, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [docId, hasDocId, displayList.length]);

  const blockTitle =
    validTipo === "todo"
      ? t("pages.gestion.allDocuments")
      : t(`pages.gestion.blocks.${validTipo}`);

  return (
    <>
      <PageHero
        title={t("pages.gestion.title")}
        breadcrumb={[{ label: t("pages.gestion.breadcrumb") }]}
        description={t("pages.gestion.description")}
      />

      <div
        className="w-full"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        {/* ── Barra de búsqueda + tabs ── */}
        <div
          className="w-full border-b"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "rgba(22,61,89,0.08)",
          }}
        >
          <div
            className="mx-auto px-4 md:px-6 lg:px-8 py-6"
            style={{ maxWidth: "var(--token-container-max)" }}
          >
            {/* Buscador */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border bg-[#F8F9FB] px-4 py-3 transition-all focus-within:border-[var(--regu-blue)] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(68,137,198,0.10)]"
              style={{ borderColor: "rgba(22,61,89,0.12)", maxWidth: "560px" }}
            >
              <Search className="h-5 w-5 flex-shrink-0" style={{ color: "var(--regu-gray-500)" }} aria-hidden />
              <input
                id="gestion-search"
                type="search"
                placeholder={t("pages.gestion.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-w-0 border-0 bg-transparent text-base outline-none placeholder:text-[var(--regu-gray-400)]"
                style={{ color: "var(--regu-gray-900)" }}
                aria-label={t("pages.gestion.searchLabel")}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[rgba(22,61,89,0.08)]"
                  style={{ color: "var(--regu-gray-500)" }}
                  aria-label={t("pages.shared.clearSearch")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tabs de categoría */}
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label={t("pages.gestion.filterCategory")}
            >
              {GESTION_TIPO_VALUES.map((value) => {
                const isActive = validTipo === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTipo(value)}
                    className="gestionTab rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: isActive ? "var(--regu-blue)" : "rgba(22,61,89,0.05)",
                      color: isActive ? "#ffffff" : "var(--regu-gray-700)",
                      boxShadow: isActive ? "0 2px 8px rgba(22,61,89,0.18)" : "none",
                      border: "none",
                    }}
                  >
                    {t(`pages.gestion.tabs.${value}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Contenido principal ── */}
        <div
          className="mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14"
          style={{ maxWidth: "var(--token-container-max)" }}
          ref={contentRef}
        >
          {displayList.length === 0 ? (
            <div
              className="rounded-2xl border bg-white p-12 text-center"
              style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 8px rgba(22,61,89,0.05)" }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
              >
                <Search className="h-7 w-7" />
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--regu-gray-900)" }}>
                {searchQuery ? t("pages.gestion.noSearchResults") : t("pages.gestion.noCategoryResults")}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {searchQuery ? t("pages.gestion.noSearchHint") : t("pages.gestion.noCategoryHint")}
              </p>
            </div>
          ) : (
            <>
              {/* Header de sección con acento */}
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-8 w-[3px] flex-shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                    aria-hidden
                  />
                  <div>
                    <Link
                      to={getBlockHeadingHref(validTipo)}
                      className="text-xl font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] rounded"
                      style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                    >
                      {blockTitle}
                    </Link>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                      {t("pages.gestion.documentCount", { count: displayList.length })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {displayList.map((doc, index) => {
                    const isSelectedRevista = isRevistaDeepLink && doc.id === docId;
                    return (
                      <div
                        key={doc.id}
                        id={`doc-${doc.id}`}
                        className="scroll-mt-24"
                        ref={isSelectedRevista ? selectedRevistaRef : undefined}
                      >
                        <DocCard
                          doc={doc}
                          index={index}
                          deepLink={`/gestion?tipo=${doc.category}&id=${doc.id}`}
                          onPreview={() =>
                            setPreviewDoc({
                              url: doc.url,
                              title: doc.title,
                              fileType: doc.fileType,
                              fileName: doc.fileName,
                            })
                          }
                          isSelectedRevista={isSelectedRevista}
                        />
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
}

/* ——————————————————————————————————————————
   DocCard — premium, acento top, jerarquía
—————————————————————————————————————————— */
function DocCard({
  doc,
  index,
  deepLink,
  onPreview,
  isSelectedRevista = false,
}: {
  doc: GestionDocument;
  index: number;
  deepLink: string;
  onPreview: () => void;
  isSelectedRevista?: boolean;
}) {
  const { t } = useTranslation();
  const isRestrictedDoc = getRestrictedDocument(doc.id) !== null;
  const isUnlocked = isRestrictedDoc && isRestrictedUnlocked(doc.id);
  const isRestricted = isRestrictedDoc && !isUnlocked;
  const accessUrl = `/acceso-documentos?doc=${encodeURIComponent(doc.id)}&solicitar=1`;
  const canPreview = canPreviewDocument(doc.url, doc.fileType, doc.fileName);

  const TypeIcon = isRestricted
    ? Lock
    : CATEGORY_ICONS[doc.category] ?? FileText;

  const badge = CATEGORY_BADGE[doc.category] ?? CATEGORY_BADGE.otros;
  const editTarget =
    doc.category === "revista"
      ? ({ kind: "revista" as const, id: doc.id })
      : ({ kind: "panel" as const, path: "/admin/documentos", label: "Documentos" });

  return (
    <EditableSpot target={editTarget} label="Editar este documento" className="h-full">
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      className={`gestionDocCard relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 ${isSelectedRevista ? "gestion-card-selected" : ""}`}
      style={{
        borderColor: isSelectedRevista ? undefined : "rgba(22,61,89,0.10)",
        boxShadow: isSelectedRevista ? undefined : "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)",
      }}
    >
      {/* Acento top */}
      <div
        className="gestionDocCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
        style={{ backgroundColor: isSelectedRevista ? "var(--regu-lime)" : "var(--regu-blue)" }}
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-6">
        {/* Badge de "revista seleccionada" */}
        {isSelectedRevista && (
          <div
            className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em]"
            style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)", border: "1px solid rgba(68,137,198,0.20)" }}
          >
            <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
            {t("pages.gestion.selectedBadge")}
          </div>
        )}

        {/* Icono + meta badge */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
            aria-hidden
          >
            <TypeIcon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          {(doc.quarter || doc.year) && (
            <span
              className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
              style={{ backgroundColor: badge.bg, color: badge.color }}
            >
              {doc.quarter ? `${doc.quarter} ${doc.year}` : doc.year}
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="mb-1 font-bold leading-snug" style={{ color: "var(--regu-gray-900)", fontSize: "1.0625rem", fontFamily: "var(--token-font-heading)" }}>
          <Link
            to={isRestricted ? accessUrl : deepLink}
            className="hover:text-[var(--regu-blue)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
            style={{ color: "inherit" }}
          >
            {doc.title}
          </Link>
        </h3>

        {/* Categoría */}
        <p className="mb-auto mt-1 text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "var(--regu-gray-500)" }}>
          {getCategoryDisplayLabel(doc.category)}
        </p>

        {/* Acceso restringido aviso */}
        {isRestricted && (
          <div
            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: "rgba(22,61,89,0.04)", color: "var(--regu-gray-600)" }}
          >
            <Lock className="h-3.5 w-3.5 flex-shrink-0 opacity-70" aria-hidden />
            <span className="text-xs font-medium">{t("pages.shared.restrictedAccess")}</span>
          </div>
        )}

        {/* CTAs */}
        <div
          className="mt-5 flex flex-wrap items-center gap-2.5 pt-4"
          style={{ borderTop: "1px solid rgba(22,61,89,0.07)" }}
        >
          {isRestricted ? (
            <>
              <Link
                to={accessUrl}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                {t("pages.gestion.requestAccess")}
              </Link>
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] opacity-40 cursor-not-allowed"
                style={{ borderColor: "rgba(22,61,89,0.15)", color: "var(--regu-gray-500)" }}
              >
                <FileDown className="h-3.5 w-3.5 shrink-0" />
                {t("common.download")}
              </span>
            </>
          ) : (
            <>
              {canPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Eye className="h-3.5 w-3.5 shrink-0" />
                {t("common.preview")}
              </button>
              )}
              <a
                href={doc.url}
                download={!doc.url.startsWith("http")}
                target={doc.url.startsWith("http") ? "_blank" : undefined}
                rel={doc.url.startsWith("http") ? "noreferrer noopener" : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
              >
                <FileDown className="h-3.5 w-3.5 shrink-0" />
                {t("common.download")}
              </a>
              {canPreview ? (
                <button
                  type="button"
                  onClick={onPreview}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold transition-all duration-150 hover:gap-2 opacity-60 hover:opacity-100"
                  style={{ color: "var(--regu-blue)" }}
                  aria-label={`${t("common.view")} ${doc.title}`}
                >
                  {t("common.view")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : (
                <Link
                  to={deepLink}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold transition-all duration-150 hover:gap-2 opacity-60 hover:opacity-100"
                  style={{ color: "var(--regu-blue)" }}
                  aria-label={`${t("common.view")} ${doc.title}`}
                >
                  {t("common.view")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
    </EditableSpot>
  );
}
