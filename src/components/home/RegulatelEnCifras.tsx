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
/** Duración del conteo al entrar en vista o al cambiar de año */
const COUNT_DURATION_MS = 1100;
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

/**
 * Anima el número desde el valor anterior (o 0 al montar) hasta `target`.
 * `countKey` debe cambiar cuando cambia el año para forzar una nueva animación coherente.
 */
function useCountUp(
  target: number,
  countKey: string,
  durationMs: number,
  reduceMotion: boolean
): number {
  const [display, setDisplay] = useState(() => (reduceMotion ? target : 0));
  /** Valor al que terminó la última animación (o 0 antes del primer conteo). */
  const fromRef = useRef(reduceMotion ? target : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const start = fromRef.current;
    if (start === target) {
      setDisplay(target);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      const next = Math.round(start + (target - start) * eased);
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, countKey, durationMs, reduceMotion]);

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

interface RegulatelEnCifrasProps {
  /** Año inicial (p. ej. para vista previa en admin) */
  initialYear?: number;
}

export default function RegulatelEnCifras({ initialYear }: RegulatelEnCifrasProps = {}) {
  const { getCifrasForYear } = useAdminData();
  const anos = getCifrasAnos();
  const [selectedYear, setSelectedYear] = useState<number>(initialYear ?? anos[0] ?? 2026);
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
      className="regulatelEnCifras w-full px-4 pt-12 pb-20 md:px-8 md:pt-14 md:pb-24 lg:px-10"
      style={{
        fontFamily: "var(--token-font-body)",
        backgroundColor: "rgba(68, 137, 198, 0.03)",
        borderTop: "1px solid rgba(68, 137, 198, 0.08)",
        borderBottom: "1px solid rgba(68, 137, 198, 0.08)",
      }}
      aria-label={TITLE}
    >
    <div style={{ maxWidth: "1520px", margin: "0 auto" }}>
      {/* Header: mismo tamaño que Accesos Principales para jerarquía consistente */}
      <div className="cifrasHeader mb-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 md:mb-12">
        <div className="min-w-0 flex-1">
          <h2
            className="text-xl font-bold uppercase tracking-tight text-[var(--regu-gray-900)] md:text-2xl"
            style={{
              fontFamily: "var(--token-font-heading)",
              fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
            }}
          >
            {TITLE}
          </h2>
          <p
            className="mt-2 text-sm text-[var(--regu-gray-500)] md:text-base md:leading-relaxed"
            style={{ fontFamily: "var(--token-font-body)", maxWidth: "42ch" }}
          >
            {SUBTITLE}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Seleccionar año"
          className="cifrasYearToggle flex shrink-0 items-center gap-1 rounded-full p-1 shadow-sm"
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
                className="min-w-[3.75rem] rounded-full px-4 py-2.5 text-center text-[0.9375rem] font-semibold tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
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
            countKey={String(selectedYear)}
          />
        ))}
      </div>
    </div>
    </section>
  );
}

function CifraCard({
  value,
  config,
  icon: Icon,
  reduceMotion,
  countKey,
}: {
  value: number;
  config: CifraCardConfig;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  reduceMotion: boolean;
  countKey: string;
}) {
  const displayValue = useCountUp(value, countKey, COUNT_DURATION_MS, reduceMotion);

  const isExternal = config.sourceUrl.startsWith("http");

  return (
    <article
      className="cifraCard group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(22,61,89,0.09)] bg-white shadow-[0_1px_2px_rgba(22,61,89,0.04),0_4px_16px_rgba(22,61,89,0.06)] transition-all duration-300 ease-out hover:border-[rgba(22,61,89,0.14)] hover:shadow-[0_4px_12px_rgba(22,61,89,0.08),0_14px_36px_rgba(22,61,89,0.10)] hover:-translate-y-0.5"
    >
      {/* Acento top: azul en reposo, lima en hover */}
      <div
        className="cifraAccentBar absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
        style={{ backgroundColor: "var(--regu-blue)" }}
        aria-hidden
      />

      <div className="flex h-full flex-1 flex-col px-7 pt-8 pb-7 md:px-8 md:pt-9">
        {/* Icono: esquina superior derecha */}
        <div
          className="absolute right-6 top-7 flex items-center justify-center opacity-[0.38] transition-opacity duration-200 group-hover:opacity-60"
          aria-hidden
        >
          <Icon
            className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0"
            style={{ color: "var(--regu-blue)" }}
          />
        </div>

        {/* Número — grande pero proporcionado al resto del home */}
        <p
          className="font-bold tabular-nums leading-[1.0] tracking-tight"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "clamp(2.75rem, 4.5vw, 3.5rem)",
            color: "var(--regu-blue)",
            letterSpacing: "-0.03em",
          }}
        >
          {displayValue}
        </p>

        {/* Separador fino entre número y título */}
        <div
          className="mt-4 mb-4 h-px w-8"
          style={{ backgroundColor: "rgba(68,137,198,0.25)" }}
          aria-hidden
        />

        {/* Título del indicador */}
        <h3
          className="font-bold uppercase tracking-[0.07em] leading-tight text-[var(--regu-gray-900)]"
          style={{
            fontFamily: "var(--token-font-heading)",
            fontSize: "clamp(0.8125rem, 1.1vw, 0.9375rem)",
          }}
        >
          {config.title}
        </h3>

        {/* Descripción */}
        <p
          className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-[var(--regu-gray-500)]"
          style={{ fontFamily: "var(--token-font-body)" }}
        >
          {config.subtitle}
        </p>

        {/* Fuente */}
        <div className="mt-5 pt-4 border-t border-[rgba(22,61,89,0.07)]">
          <a
            href={config.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cifraSourceLink inline-flex items-center gap-1 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[var(--regu-blue)] opacity-70 transition-opacity duration-150 hover:opacity-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {config.sourceLabel}
            {isExternal && <span aria-hidden>↗</span>}
          </a>
        </div>
      </div>
    </article>
  );
}
