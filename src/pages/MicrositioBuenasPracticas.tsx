import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHero from "@/components/PageHero";
import MejoresPracticasSearch from "@/components/mejoresPracticas/MejoresPracticasSearch";
import MejoresPracticasSidebar from "@/components/mejoresPracticas/MejoresPracticasSidebar";
import CategoryAccordion from "@/components/mejoresPracticas/CategoryAccordion";
import CountryFlag from "@/components/buenasPracticas/CountryFlag";
import {
  mejoresPracticasData,
  getLinkCountByCountry,
  normalizeScrapedRegulatelJson,
  BUENAS_PRACTICAS_PAGE_DEFAULT_TITLE,
  BUENAS_PRACTICAS_PAGE_DEFAULT_DESCRIPTION,
  type CountryPracticesData,
  type ScrapedRegulatelEntry,
} from "@/data/mejoresPracticas";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  localizeBuenasPracticasCategory,
  localizeBuenasPracticasCountryName,
} from "@/hooks/useLocalizedBuenasPracticas";
import { Globe, ChevronDown, ChevronUp, LayoutList } from "lucide-react";
import { EditableSpot } from "@/components/site-edit/EditableSpot";

function getUniqueCategoryNamesFromData(data: CountryPracticesData[]): string[] {
  const set = new Set<string>();
  data.forEach((d) => {
    d.categories.forEach((cat) => {
      if (cat.links.length > 0) set.add(cat.name);
    });
  });
  return Array.from(set);
}

function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

function countryMatchesSearch(data: CountryPracticesData, query: string): boolean {
  if (!query.trim()) return true;
  const n = normalizeForSearch(query);
  if (normalizeForSearch(data.name).includes(n)) return true;
  for (const cat of data.categories) {
    if (normalizeForSearch(cat.name).includes(n)) return true;
    for (const link of cat.links) {
      if (normalizeForSearch(link.title).includes(n)) return true;
    }
  }
  return false;
}

export default function MicrositioBuenasPracticas() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const isSpanish = language.split("-")[0] === "es";
  const { buenasPracticasRegulatorias, loading: settingsLoading } = useSiteSettings();
  const [dataList, setDataList] = useState<CountryPracticesData[]>(mejoresPracticasData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = isSpanish
    ? !settingsLoading && buenasPracticasRegulatorias?.pageTitle?.trim()
      ? buenasPracticasRegulatorias.pageTitle.trim()
      : BUENAS_PRACTICAS_PAGE_DEFAULT_TITLE
    : t("pages.buenasPracticas.pageTitle");
  const pageDescription = isSpanish
    ? !settingsLoading && buenasPracticasRegulatorias?.pageDescription?.trim()
      ? buenasPracticasRegulatorias.pageDescription.trim()
      : BUENAS_PRACTICAS_PAGE_DEFAULT_DESCRIPTION
    : t("pages.buenasPracticas.pageDescription");

  useEffect(() => {
    if (settingsLoading) return;
    if (buenasPracticasRegulatorias != null && buenasPracticasRegulatorias.entries.length > 0) {
      const normalized = normalizeScrapedRegulatelJson(buenasPracticasRegulatorias.entries);
      if (normalized.length > 0) {
        setDataList(normalized);
        return;
      }
    }
    fetch("/mejoresPracticasRegulatel.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No JSON"))))
      .then((raw: ScrapedRegulatelEntry[]) => {
        const normalized = normalizeScrapedRegulatelJson(raw);
        if (normalized.length > 0) setDataList(normalized);
      })
      .catch(() => {});
  }, [settingsLoading, buenasPracticasRegulatorias]);

  const bySlug = useMemo(() => new Map(dataList.map((d) => [d.slug, d])), [dataList]);

  const [selectedSlug, setSelectedSlugState] = useState<string | null>(() => {
    const hash = window.location.hash.slice(1).trim();
    return hash || null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      setSelectedSlugState(window.location.hash.slice(1).trim() || null);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (dataList.length > 0 && selectedSlug && !bySlug.has(selectedSlug)) {
      const first = dataList[0];
      setSelectedSlugState(first.slug);
      window.location.hash = first.slug;
    } else if (dataList.length > 0 && !selectedSlug) {
      const first = dataList[0];
      setSelectedSlugState(first.slug);
      window.location.hash = first.slug;
    }
  }, [dataList, selectedSlug, bySlug]);

  const selectCountry = useCallback((slug: string) => {
    setSelectedSlugState(slug);
    window.location.hash = slug;
    setSidebarOpen(false);
    const main = document.getElementById("mejores-practicas-main");
    if (main) main.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredCountries = useMemo(() => {
    return searchQuery.trim()
      ? dataList.filter((c) => countryMatchesSearch(c, searchQuery))
      : [...dataList];
  }, [dataList, searchQuery]);

  const selectedCountry = selectedSlug ? bySlug.get(selectedSlug) ?? null : null;

  useEffect(() => {
    if (filteredCountries.length > 0 && selectedSlug && !filteredCountries.some((c) => c.slug === selectedSlug)) {
      const first = filteredCountries[0];
      setSelectedSlugState(first.slug);
      window.location.hash = first.slug;
    }
  }, [filteredCountries, selectedSlug]);

  const categoriesForFilter = useMemo(() => getUniqueCategoryNamesFromData(dataList), [dataList]);
  const totalLinks = useMemo(
    () => dataList.reduce((acc, c) => acc + getLinkCountByCountry(c), 0),
    [dataList]
  );

  const filteredCategoriesForCountry = useMemo(() => {
    if (!selectedCountry) return [];
    let cats = selectedCountry.categories;
    if (categoryFilter) {
      cats = cats.filter((c) => c.name === categoryFilter);
    }
    if (searchQuery.trim()) {
      const n = normalizeForSearch(searchQuery);
      cats = cats
        .map((cat) => {
          const categoryMatch = normalizeForSearch(cat.name).includes(n);
          const matchingLinks = categoryMatch
            ? cat.links
            : cat.links.filter((l) => normalizeForSearch(l.title).includes(n));
          return { ...cat, links: matchingLinks };
        })
        .filter((cat) => cat.links.length > 0 || normalizeForSearch(cat.name).includes(n));
    }
    return cats;
  }, [selectedCountry, categoryFilter, searchQuery]);

  const searchNorm = searchQuery.trim() ? normalizeForSearch(searchQuery) : "";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--regu-gray-50, #FAFBFC)",
        borderTop: "1px solid rgba(22,61,89,0.07)",
      }}
    >
      <PageHero
        title={pageTitle}
        description={pageDescription}
        breadcrumb={[
          { label: t("pages.shared.breadcrumbHome"), path: "/" },
          { label: t("pages.buenasPracticas.resourcesBreadcrumb"), path: "/gestion" },
          { label: t("pages.buenasPracticas.breadcrumbLabel") },
        ]}
      />

      <div
        className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8"
        style={{ fontFamily: "var(--token-font-body)" }}
      >
        {/* Barra: buscador + filtro categoría + expandir/colapsar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0 max-w-xl">
            <MejoresPracticasSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("pages.buenasPracticas.searchPlaceholder")}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="cat-filter" className="text-sm font-medium" style={{ color: "var(--regu-gray-600)" }}>
                {t("pages.buenasPracticas.categoryLabel")}
              </label>
              <select
                id="cat-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-800)" }}
              >
                <option value="">{t("pages.buenasPracticas.allCategories")}</option>
                {categoriesForFilter.map((name) => (
                  <option key={name} value={name}>
                    {localizeBuenasPracticasCategory(name, t, language)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setExpandAll(true)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-white"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }}
              >
                <ChevronDown className="h-4 w-4" />
                {t("pages.buenasPracticas.expandAll")}
              </button>
              <button
                type="button"
                onClick={() => setExpandAll(false)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-white"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }}
              >
                <ChevronUp className="h-4 w-4" />
                {t("pages.buenasPracticas.collapseAll")}
              </button>
            </div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="mb-8 flex flex-wrap gap-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
            {t("pages.buenasPracticas.countriesCount", { count: dataList.length })}
          </span>
          <span className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
            {t("pages.buenasPracticas.totalResources", { count: totalLinks })}
          </span>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar: selector de país */}
          <aside
            className="lg:w-64 shrink-0"
            style={{
              backgroundColor: "#fff",
              border: "1px solid rgba(22,61,89,0.08)",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-gray-600)" }}>
                {t("pages.buenasPracticas.countries")}
              </h2>
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border"
                style={{ borderColor: "rgba(22,61,89,0.12)" }}
                aria-expanded={sidebarOpen}
                aria-label={sidebarOpen ? t("pages.buenasPracticas.closeCountries") : t("pages.buenasPracticas.openCountries")}
              >
                <ChevronDown className={`h-5 w-5 transition ${sidebarOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            <div className={sidebarOpen ? "block" : "hidden lg:block"}>
              <MejoresPracticasSidebar
                countries={filteredCountries}
                selectedSlug={selectedSlug}
                onSelectCountry={selectCountry}
                searchQuery={searchQuery}
              />
            </div>
          </aside>

          {/* Contenido principal: detalle del país */}
          <main
            id="mejores-practicas-main"
            className="min-w-0 flex-1"
          >
            {selectedCountry ? (
              <EditableSpot
                className="rounded-2xl"
                target={{ kind: "panel", path: "/admin/buenas-practicas", label: "Mejores prácticas" }}
                label="Editar este observatorio"
              >
              <div>
                <header className="mb-6 flex flex-wrap items-center gap-4">
                  <CountryFlag flag={selectedCountry.flag} size="md" />
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
                      {localizeBuenasPracticasCountryName(selectedCountry.name, t, language)}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--regu-gray-500)" }}>
                      {t("pages.buenasPracticas.resourcesInCategories", {
                        resources: getLinkCountByCountry(selectedCountry),
                        categories: selectedCountry.categories.filter((c) => c.links.length > 0).length,
                      })}
                    </p>
                  </div>
                </header>

                <div className="space-y-3">
                  {filteredCategoriesForCountry.length > 0 ? (
                    filteredCategoriesForCountry.map((cat, idx) => (
                      <CategoryAccordion
                        key={`${selectedCountry.slug}-${cat.name}-${idx}`}
                        category={cat}
                        defaultOpen={expandAll === true || (expandAll === null && filteredCategoriesForCountry.length <= 4)}
                        searchNorm={searchNorm}
                      />
                    ))
                  ) : (
                    <div
                      className="rounded-xl border border-dashed py-12 text-center"
                      style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-500)" }}
                    >
                      <p className="font-medium">{t("pages.buenasPracticas.noMatchingResources")}</p>
                      <p className="text-sm mt-1">{t("pages.buenasPracticas.tryAnotherCountry")}</p>
                    </div>
                  )}
                </div>
              </div>
              </EditableSpot>
            ) : (
              <div
                className="rounded-xl border border-dashed py-12 text-center"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-500)" }}
              >
                <p className="font-medium">{t("pages.buenasPracticas.selectCountry")}</p>
              </div>
            )}
          </main>
        </div>

        {/* Footer nav */}
        <div
          className="mt-12 flex flex-wrap gap-4 border-t pt-8"
          style={{ borderColor: "rgba(22,61,89,0.08)" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)", backgroundColor: "rgba(22,61,89,0.06)" }}
          >
            ← {t("common.backToHomeShort")}
          </Link>
          <Link
            to="/miembros"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            {t("pages.buenasPracticas.viewMembers")}
          </Link>
        </div>
      </div>
    </div>
  );
}
