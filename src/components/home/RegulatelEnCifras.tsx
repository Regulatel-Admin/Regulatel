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
      className="regulatelEnCifras mx-auto w-full px-4 pt-12 pb-20 md:px-8 md:pt-14 md:pb-24 lg:px-10"
      style={{
        fontFamily: "var(--token-font-body)",
        maxWidth: "1520px",
      }}
      aria-label={TITLE}
    >
      {/* Header: título + subtítulo a la izquierda, selector de año integrado a la derecha */}
      <div className="cifrasHeader mb-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 md:mb-12">
        <div className="min-w-0 flex-1">
          <h2
            className="text-xl font-bold uppercase tracking-tight text-[var(--regu-gray-900)] md:text-2xl lg:text-[1.75rem]"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            {TITLE}
          </h2>
          <p
            className="mt-2 text-sm text-[var(--regu-gray-500)] md:text-base lg:text-[1.0625rem] md:leading-relaxed"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {SUBTITLE}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Seleccionar año"
          className="cifrasYearToggle flex shrink-0 items-center gap-1.5 rounded-full p-1 shadow-sm"
          style={{
            backgroundColor: "var(--regu-gray-100)",
            border: "1px solid rgba(22, 61, 89, 0.08)",
          }}
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
                className="min-w-[4.25rem] rounded-full px-5 py-3 text-center text-[0.9375rem] font-semibold tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  backgroundColor: isSelected ? "var(--regu-blue)" : "transparent",
                  color: isSelected ? "#fff" : "var(--regu-gray-600)",
                  boxShadow: isSelected ? "0 2px 8px rgba(22, 61, 89, 0.18)" : "none",
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
      className="cifraCard group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(22,61,89,0.09)] bg-white/98 shadow-[0_1px_2px_rgba(22,61,89,0.04),0_4px_16px_rgba(22,61,89,0.06)] transition-all duration-300 ease-out hover:border-[rgba(22,61,89,0.14)] hover:shadow-[0_4px_12px_rgba(22,61,89,0.08),0_12px_32px_rgba(22,61,89,0.1)]"
    >
      <div className="flex h-full flex-1 flex-col p-7 md:p-8">
        {/* Icono: esquina superior derecha, integrado y sutil */}
        <div
          className="absolute right-6 top-6 flex items-center justify-center opacity-[0.42] transition-opacity duration-200 group-hover:opacity-55"
          aria-hidden
        >
          <Icon
            className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0"
            style={{ color: "var(--regu-gray-600)" }}
          />
        </div>

        {/* Número como ancla visual principal */}
        <p
          className="mt-1 font-bold tabular-nums leading-[1.1] tracking-tight"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "clamp(2.75rem, 5vw, 3.875rem)",
            color: "var(--regu-blue)",
            letterSpacing: "-0.02em",
          }}
        >
          {displayValue}
        </p>

        {/* Título del indicador */}
        <h3
          className="mt-5 font-semibold uppercase tracking-[0.06em] leading-tight text-[var(--regu-gray-900)]"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "clamp(0.8125rem, 1.1vw, 0.9375rem)",
          }}
        >
          {config.title}
        </h3>

        {/* Descripción */}
        <p
          className="mt-2.5 text-[0.9375rem] leading-[1.5] text-[var(--regu-gray-600)] md:text-[1rem]"
          style={{ fontFamily: "var(--token-font-body)" }}
        >
          {config.subtitle}
        </p>

        {/* Fuente: estilo editorial */}
        <div className="mt-6 flex-1 flex flex-col justify-end">
          <a
            href={config.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cifraSourceLink inline-flex items-baseline gap-0.5 text-[0.8125rem] font-medium tracking-wide text-[var(--regu-blue)] transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            <span className="uppercase tracking-wider text-[var(--regu-gray-500)]">
              Fuente:
            </span>{" "}
            {config.sourceLabel}
            {isExternal && (
              <span className="inline-block shrink-0" aria-hidden>
                ↗
              </span>
            )}
          </a>
        </div>
      </div>
    </article>
  );
}
