import type { BerecFeatureCard } from "@/data/home";
import BerecCard from "./BerecCard";

interface HeroCardsGridProps {
  items: BerecFeatureCard[];
}

/**
 * Hero cards idéntico a BEREC: 4 cards principales (primera fila) + 2 secundarias (segunda fila centrada).
 * max-width 1200px, gap 24px, alineaciones y spacing como BEREC.
 */
export default function HeroCardsGrid({ items }: HeroCardsGridProps) {
  const primary = items.slice(0, 4);
  const secondary = items.slice(4, 6);

  return (
    <div
      className="w-full"
      style={{
        maxWidth: "var(--hero-berec-cards-max-width)",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily: "var(--token-font-body)",
      }}
    >
      {/* Fila 1: 4 cards principales (mismo tamaño que BEREC) */}
      <div
        className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        style={{
          gap: "var(--hero-berec-cards-gap)",
          rowGap: "var(--hero-berec-cards-gap)",
        }}
      >
        {primary.map((card) => (
          <BerecCard key={card.title} card={card} minHeight="240px" size="primary" />
        ))}
      </div>

      {/* Fila 2: 2 cards secundarias centradas, ligeramente más pequeñas (BEREC look) */}
      {secondary.length > 0 && (
        <div
          className="mt-6 flex flex-wrap justify-center gap-4 md:mt-0 md:gap-6"
          style={{
            marginTop: "var(--hero-berec-cards-row-gap)",
            gap: "var(--hero-berec-cards-gap)",
          }}
        >
          {secondary.map((card) => (
            <div key={card.title} className="w-full min-w-0 max-w-[280px] md:max-w-[320px]">
              <BerecCard card={card} minHeight="200px" size="secondary" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
