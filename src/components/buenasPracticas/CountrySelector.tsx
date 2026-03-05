import type { Country } from "@/data/buenasPracticas/countries";
import CountryFlag from "./CountryFlag";

interface CountrySelectorProps {
  countries: Country[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  label: string;
  comparisonMode?: boolean;
}

export default function CountrySelector({
  countries,
  selectedCountryId,
  onSelectCountry,
  label,
  comparisonMode = false,
}: CountrySelectorProps) {
  return (
    <div>
      <label className="block">
        {label}
        {comparisonMode && (
          <span className="ml-2 text-[0.6875rem] font-medium uppercase tracking-wider opacity-80">
            (Benchmark)
          </span>
        )}
      </label>
      <div className="flex flex-wrap" style={{ gap: "6px", marginTop: "10px" }}>
        {countries.map((country) => {
          const isActive = selectedCountryId === country.id;
          return (
            <button
              key={country.id}
              type="button"
              onClick={() => onSelectCountry(country.id)}
              className={`countryOption ${isActive ? "countryOptionActive" : ""}`}
              title={country.name}
            >
              <CountryFlag flag={country.flag} size="xs" />
              <span>{country.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
