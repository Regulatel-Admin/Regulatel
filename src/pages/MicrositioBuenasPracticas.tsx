import { useState } from "react";
import {
  categories,
  countries,
  type Category,
} from "@/data/buenasPracticas/countries";
import CountrySelector from "@/components/buenasPracticas/CountrySelector";
import CategoryTabs from "@/components/buenasPracticas/CategoryTabs";
import ComparisonPanel from "@/components/buenasPracticas/ComparisonPanel";

export default function MicrositioBuenasPracticas() {
  const [selectedCountryA, setSelectedCountryA] = useState<string | null>(
    "rep_dominicana"
  );
  const [selectedCountryB, setSelectedCountryB] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0]
  );

  const countryA = countries.find((c) => c.id === selectedCountryA) ?? null;
  const countryB = countries.find((c) => c.id === selectedCountryB) ?? null;

  return (
    <div className="obsWrap min-h-screen">
      <header className="obsHeader">
        <h1
          className="text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-tight"
          style={{ color: "#111827", lineHeight: 1.2 }}
        >
          Observatorio de Mejores Prácticas Regulatorias
        </h1>
        <p
          className="mt-3 max-w-2xl text-base leading-relaxed"
          style={{ color: "#6B7280" }}
        >
          Compare prácticas regulatorias de telecomunicaciones entre países miembros de REGULATEL.
        </p>
        <hr className="obsDivider mt-6" />
      </header>

      <section className="obsControls" style={{ marginBottom: "28px" }}>
        <div className="countryGroup">
          <CountrySelector
            countries={countries}
            selectedCountryId={selectedCountryA}
            onSelectCountry={setSelectedCountryA}
            label="País principal (A)"
          />
        </div>
        <div className="countryGroup">
          <CountrySelector
            countries={countries.filter((c) => c.id !== selectedCountryA)}
            selectedCountryId={selectedCountryB}
            onSelectCountry={setSelectedCountryB}
            label="País comparador (B)"
            comparisonMode
          />
        </div>
      </section>

      {countryA && countryB && (
        <>
          <div style={{ marginBottom: "32px" }}>
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              countryAName={countryA.name}
              countryBName={countryB.name}
            />
          </div>

          <ComparisonPanel
            countryA={countryA}
            countryB={countryB}
            category={selectedCategory}
          />
        </>
      )}

      {(!countryA || !countryB) && (
        <p
          className="text-center py-12 text-base"
          style={{ color: "#6B7280" }}
        >
          Seleccione dos países para ver la comparación por categorías.
        </p>
      )}
    </div>
  );
}
