import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import MejoresPracticasSearch from "@/components/mejoresPracticas/MejoresPracticasSearch";
import MejoresPracticasSidebar from "@/components/mejoresPracticas/MejoresPracticasSidebar";
import CategoryAccordion from "@/components/mejoresPracticas/CategoryAccordion";
import CountryFlag from "@/components/buenasPracticas/CountryFlag";
import {
  mejoresPracticasData,
  getLinkCountByCountry,
  normalizeScrapedRegulatelJson,
  type CountryPracticesData,
  type ScrapedRegulatelEntry,
} from "@/data/mejoresPracticas";
import { Globe, ChevronDown, ChevronUp, LayoutList } from "lucide-react";

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
  const [dataList, setDataList] = useState<CountryPracticesData[]>(mejoresPracticasData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/mejoresPracticasRegulatel.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No JSON"))))
      .then((raw: ScrapedRegulatelEntry[]) => {
        const normalized = normalizeScrapedRegulatelJson(raw);
        if (normalized.length > 0) setDataList(normalized);
      })
      .catch(() => {});
  }, []);

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
        title="Buenas Prácticas Regulatorias"
        description="Consulte prácticas, iniciativas y recursos regulatorios de telecomunicaciones por país y categoría. Información proporcionada por los miembros de REGULATEL."
        breadcrumb={[
          { label: "Inicio", path: "/" },
          { label: "Recursos", path: "/gestion" },
          { label: "Buenas Prácticas Regulatorias" },
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
              placeholder="Buscar por país, categoría o recurso…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="cat-filter" className="text-sm font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Categoría:
              </label>
              <select
                id="cat-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-800)" }}
              >
                <option value="">Todas</option>
                {categoriesForFilter.map((name) => (
                  <option key={name} value={name}>{name}</option>
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
                Expandir todo
              </button>
              <button
                type="button"
                onClick={() => setExpandAll(false)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-white"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)" }}
              >
                <ChevronUp className="h-4 w-4" />
                Colapsar todo
              </button>
            </div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="mb-8 flex flex-wrap gap-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
            {dataList.length} países
          </span>
          <span className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
            {totalLinks} recursos en total
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
                Países
              </h2>
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border"
                style={{ borderColor: "rgba(22,61,89,0.12)" }}
                aria-expanded={sidebarOpen}
                aria-label={sidebarOpen ? "Cerrar lista de países" : "Abrir lista de países"}
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
              <div>
                <header className="mb-6 flex flex-wrap items-center gap-4">
                  <CountryFlag flag={selectedCountry.flag} size="md" />
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
                      {selectedCountry.name}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--regu-gray-500)" }}>
                      {getLinkCountByCountry(selectedCountry)} recursos en {selectedCountry.categories.filter((c) => c.links.length > 0).length} categorías
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
                      <p className="font-medium">No hay recursos que coincidan con la búsqueda o el filtro.</p>
                      <p className="text-sm mt-1">Pruebe otro país o quite filtros.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed py-12 text-center"
                style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-500)" }}
              >
                <p className="font-medium">Seleccione un país en el panel izquierdo.</p>
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
            ← Volver a inicio
          </Link>
          <Link
            to="/miembros"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            Ver miembros REGULATEL →
          </Link>
        </div>
      </div>
    </div>
  );
}
