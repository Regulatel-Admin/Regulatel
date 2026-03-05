import type { BerecFeatureCard } from "@/data/home";
import BerecCard from "./BerecCard";

interface FeatureCardGridProps {
  items: BerecFeatureCard[];
}

/**
 * Grid de cards estilo BEREC (reutiliza BerecCard).
 * Usado en páginas que muestran los 6 cuadros fuera del hero (ej. /recursos).
 * En Home los 6 cuadros viven solo en HomeHeroGradientBerec.
 */
export default function FeatureCardGrid({ items }: FeatureCardGridProps) {
  return (
    <section
      className="py-12 md:py-16"
      style={{
        background: "var(--token-gradient-hero)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div className="mx-auto w-full px-4 md:px-6" style={{ maxWidth: "var(--token-container-max)" }}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((card) => (
            <BerecCard key={card.title} card={card} minHeight="260px" />
          ))}
        </div>
      </div>
    </section>
  );
}
