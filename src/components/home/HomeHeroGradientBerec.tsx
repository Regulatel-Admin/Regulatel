import type { BerecFeatureCard } from "@/data/home";
import HeroCardsGrid from "./HeroCardsGrid";

interface HomeHeroGradientBerecProps {
  hashtag: string;
  title: string;
  cards: BerecFeatureCard[];
}

/**
 * Hero superior idéntico a BEREC: gradiente + headline protagonista + bloque de cards (4+2).
 * Spacing y max-width del bloque de cards iguales a BEREC para look editorial y limpio.
 */
export default function HomeHeroGradientBerec({
  hashtag,
  title,
  cards,
}: HomeHeroGradientBerecProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "var(--hero-berec-min-height)",
        background: "var(--token-gradient-hero)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div
        className="mx-auto flex w-full flex-col"
        style={{
          maxWidth: "var(--token-container-max)",
          paddingLeft: "var(--hero-berec-padding-x)",
          paddingRight: "var(--hero-berec-padding-x)",
          paddingTop: "var(--hero-berec-padding-top)",
          paddingBottom: "var(--hero-berec-padding-bottom)",
        }}
      >
        {/* Headline más protagonista (BEREC: #empowering EUconnectivity) — jerarquía clara */}
        <div style={{ marginBottom: "var(--hero-berec-headline-margin-bottom)" }}>
          <p
            className="font-bold leading-tight text-white"
            style={{
              fontFamily: "var(--token-font-heading)",
              fontSize: "var(--hero-berec-hashtag-size)",
            }}
          >
            {hashtag}
          </p>
          <p
            className="mt-1 font-bold leading-tight text-white"
            style={{
              fontFamily: "var(--token-font-heading)",
              fontSize: "var(--hero-berec-title-size)",
            }}
          >
            {title}
          </p>
        </div>

        {/* Bloque de cards: max-width y gaps idénticos a BEREC (4 principales + 2 secundarias) */}
        <HeroCardsGrid items={cards} />
      </div>
    </section>
  );
}
