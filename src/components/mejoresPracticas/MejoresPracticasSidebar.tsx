import type { CountryPracticesData } from "@/data/mejoresPracticas";
import { getLinkCountByCountry } from "@/data/mejoresPracticas";
import CountryFlag from "@/components/buenasPracticas/CountryFlag";

interface MejoresPracticasSidebarProps {
  countries: CountryPracticesData[];
  selectedSlug: string | null;
  onSelectCountry: (slug: string) => void;
  searchQuery: string;
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

export default function MejoresPracticasSidebar({
  countries,
  selectedSlug,
  onSelectCountry,
  searchQuery,
}: MejoresPracticasSidebarProps) {
  const filtered = searchQuery.trim()
    ? countries.filter((c) => countryMatchesSearch(c, searchQuery))
    : countries;

  return (
    <nav
      className="space-y-0.5"
      aria-label="Países con prácticas regulatorias"
    >
      {filtered.map((data) => {
        const count = getLinkCountByCountry(data);
        const isActive = selectedSlug === data.slug;
        return (
          <button
            key={data.countryId}
            type="button"
            onClick={() => onSelectCountry(data.slug)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isActive ? "bg-[rgba(68,137,198,0.12)]" : "hover:bg-[rgba(22,61,89,0.06)]"}`}
            style={{
              color: isActive ? "var(--regu-blue)" : "var(--regu-gray-800)",
            }}
          >
            <CountryFlag flag={data.flag} size="xs" />
            <span className="min-w-0 flex-1 truncate">{data.name}</span>
            {count > 0 && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: isActive ? "rgba(68,137,198,0.2)" : "var(--regu-gray-100)",
                  color: isActive ? "var(--regu-blue)" : "var(--regu-gray-600)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      {filtered.length === 0 && (
        <p className="px-3 py-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          No hay países que coincidan con la búsqueda.
        </p>
      )}
    </nav>
  );
}
