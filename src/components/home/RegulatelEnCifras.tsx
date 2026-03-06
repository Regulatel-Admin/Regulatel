import { useState, useEffect, useRef } from "react";
import { Users, Building2, BookOpen, Globe } from "lucide-react";
import {
  getCifrasAnos,
  cifrasCardsConfig,
  type CifrasAnuales,
  type CifraCardConfig,
} from "@/data/home";
import { useAdminData } from "@/contexts/AdminDataContext";

const TITLE = "REGULATEL EN CIFRAS";
const SUBTITLE = "Indicadores institucionales clave para seguimiento público.";
const COUNT_DURATION_MS = 450;
const FADE_OUT_MS = 120;
const FADE_IN_MS = 220;

const ICON_BY_KEY: Record<keyof CifrasAnuales, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  gruposTrabajo: Users,
  comitesEjecutivos: Building2,
  revistaDigital: BookOpen,
  paises: Globe,
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(
  target: number,
  key: string,
  durationMs: number,
  reduceMotion: boolean
): number {
  const [display, setDisplay] = useState(target);
  const prevTargetRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reduceMotion || target === prevTargetRef.current) {
      setDisplay(target);
      prevTargetRef.current = target;
      return;
    }
    const start = prevTargetRef.current;
    prevTargetRef.current = target;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      setDisplay(Math.round(start + (target - start) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, key, durationMs, reduceMotion]);

  return display;
}

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const fn = () => setReduce(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduce;
}

export default function RegulatelEnCifras() {
  const { getCifrasForYear } = useAdminData();
  const anos = getCifrasAnos();
  const [selectedYear, setSelectedYear] = useState<number>(anos[0] ?? 2026);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reduceMotion = useReducedMotion();

  const cifras = getCifrasForYear(selectedYear);
  const cardsConfig = cifrasCardsConfig[selectedYear];
  if (!cifras || !cardsConfig?.length) return null;

  const handleYearChange = (year: number) => {
    if (year === selectedYear) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedYear(year);
      setTimeout(() => setIsTransitioning(false), reduceMotion ? 0 : FADE_IN_MS);
    }, reduceMotion ? 0 : FADE_OUT_MS);
  };

  return (
    <section
      className="regulatelEnCifras mx-auto w-full px-4 pt-10 pb-16 md:px-6 md:pt-12 md:pb-20 lg:px-8"
      style={{
        fontFamily: "var(--token-font-body)",
        maxWidth: "var(--token-container-max)",
      }}
      aria-label={TITLE}
    >
      {/* Header: título + subtítulo a la izquierda, selector de año integrado a la derecha */}
      <div className="cifrasHeader mb-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 md:mb-10">
        <div className="min-w-0 flex-1">
          <h2
            className="text-xl font-bold uppercase tracking-tight text-[var(--regu-gray-900)] md:text-2xl"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            {TITLE}
          </h2>
          <p
            className="mt-2 text-sm text-[var(--regu-gray-500)] md:text-base md:leading-relaxed"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {SUBTITLE}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Seleccionar año"
          className="cifrasYearToggle flex shrink-0 items-center gap-2"
        >
          {anos.map((year, index) => {
            const isSelected = year === selectedYear;
            return (
              <button
                key={year}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Cifras ${year}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleYearChange(year)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft" && index > 0) {
                    e.preventDefault();
                    handleYearChange(anos[index - 1]);
                  }
                  if (e.key === "ArrowRight" && index < anos.length - 1) {
                    e.preventDefault();
                    handleYearChange(anos[index + 1]);
                  }
                }}
                className="rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  backgroundColor: isSelected ? "var(--regu-blue)" : "var(--regu-gray-100)",
                  color: isSelected ? "#fff" : "var(--regu-gray-700)",
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de 4 cards: limpio, institucional, BEREC */}
      <div
        className="cifrasGrid grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          opacity: isTransitioning && !reduceMotion ? 0 : 1,
          transition:
            reduceMotion ? "none" : `opacity ${isTransitioning ? FADE_OUT_MS : FADE_IN_MS}ms ease-out`,
        }}
      >
        {cardsConfig.map((card) => (
          <CifraCard
            key={card.key}
            value={cifras[card.key]}
            config={card}
            icon={ICON_BY_KEY[card.key]}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}

function CifraCard({
  value,
  config,
  icon: Icon,
  reduceMotion,
}: {
  value: number;
  config: CifraCardConfig;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  reduceMotion: boolean;
}) {
  const displayValue = useCountUp(
    value,
    `${config.key}-${config.title}`,
    COUNT_DURATION_MS,
    reduceMotion
  );

  const isExternal = config.sourceUrl.startsWith("http");

  return (
    <article
      className="cifraCard relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow duration-200 hover:shadow-[0_6px_24px_rgba(22,61,89,0.08)]"
      style={{
        borderColor: "rgba(22, 61, 89, 0.12)",
        boxShadow: "0 4px 20px rgba(22, 61, 89, 0.05)",
      }}
    >
      <div className="flex h-full flex-1 flex-col p-6 md:p-7">
        <div className="flex justify-end">
          <Icon
            className="h-6 w-6 flex-shrink-0 opacity-55"
            style={{ color: "var(--regu-gray-500)" }}
            aria-hidden
          />
        </div>
        <p
          className="mt-2 font-bold tabular-nums leading-none"
          style={{
            fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
            color: "var(--regu-blue)",
          }}
        >
          {displayValue}
        </p>
        <h3
          className="mt-3.5 font-bold uppercase tracking-wide leading-tight text-[var(--regu-gray-900)]"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "var(--token-heading-h3-size)",
          }}
        >
          {config.title}
        </h3>
        <p
          className="mt-2 text-sm leading-relaxed text-[var(--regu-gray-500)]"
          style={{ fontFamily: "var(--token-font-body)" }}
        >
          {config.subtitle}
        </p>
        <div className="mt-4 flex-1 flex flex-col justify-end">
          <a
            href={config.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cifraSourceLink inline-block text-sm font-medium text-[var(--regu-blue)] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            Fuente: {config.sourceLabel}
            {isExternal && (
              <span className="ml-0.5 inline-block" aria-hidden>
                ↗
              </span>
            )}
          </a>
        </div>
      </div>
    </article>
  );
}
