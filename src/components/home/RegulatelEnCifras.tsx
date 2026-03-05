import { useState, useEffect, useRef } from "react";
import { Users, Building2, BookOpen, Globe } from "lucide-react";
import { getCifrasAnos, type CifrasAnuales } from "@/data/home";
import { useAdminData } from "@/contexts/AdminDataContext";

const TITLE = "REGULATEL EN CIFRAS";
const COUNT_DURATION_MS = 450;
const FADE_OUT_MS = 120;
const FADE_IN_MS = 220;

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
  const startRef = useRef(0);

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
    startRef.current = performance.now();
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

const CARD_CONFIG: {
  key: keyof CifrasAnuales;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}[] = [
  {
    key: "gruposTrabajo",
    label: "GRUPOS DE TRABAJO",
    description: "Equipos técnicos activos en agenda regional.",
    icon: Users,
  },
  {
    key: "comitesEjecutivos",
    label: "COMITÉS EJECUTIVOS",
    description: "Instancias de coordinación institucional.",
    icon: Building2,
  },
  {
    key: "revistaDigital",
    label: "REVISTA DIGITAL",
    description: "Publicación periódica de avances.",
    icon: BookOpen,
  },
  {
    key: "paises",
    label: "PAÍSES",
    description: "Miembros de REGULATEL en la región.",
    icon: Globe,
  },
];

export default function RegulatelEnCifras() {
  const { getCifrasForYear } = useAdminData();
  const anos = getCifrasAnos();
  const [selectedYear, setSelectedYear] = useState<number>(anos[0] ?? 2026);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reduceMotion = useReducedMotion();

  const cifras = getCifrasForYear(selectedYear);
  if (!cifras) return null;

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
      className="mx-auto w-full px-4 py-14 md:px-6"
      style={{ fontFamily: "var(--token-font-body)", maxWidth: "var(--token-container-max)" }}
      aria-label={TITLE}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2
          className="font-bold uppercase tracking-wide"
          style={{
            color: "var(--token-text-primary)",
            fontSize: "var(--token-heading-h2-size)",
          }}
        >
          {TITLE}
        </h2>

        <div
          role="tablist"
          aria-label="Seleccionar año"
          className="flex items-center gap-2"
          style={{ gap: 8 }}
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
                className="rounded-full border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{
                  height: 34,
                  padding: "6px 14px",
                  borderColor: isSelected ? "#B7D400" : "transparent",
                  backgroundColor: isSelected ? "#B7D400" : "#F3F5F7",
                  color: isSelected ? "#0B1F2A" : "#2C3E50",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          opacity: isTransitioning && !reduceMotion ? 0 : 1,
          transition: reduceMotion ? "none" : `opacity ${isTransitioning ? FADE_OUT_MS : FADE_IN_MS}ms ease-out`,
        }}
      >
        {CARD_CONFIG.map(({ key, label, description, icon: Icon }) => (
          <CifraCard
            key={key}
            value={cifras[key]}
            label={label}
            description={description}
            icon={Icon}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}

function CifraCard({
  value,
  label,
  description,
  icon: Icon,
  reduceMotion,
}: {
  value: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  reduceMotion: boolean;
}) {
  const displayValue = useCountUp(value, label, COUNT_DURATION_MS, reduceMotion);

  return (
    <article
      className="relative overflow-hidden rounded-[18px] border bg-white transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transition-none hover:shadow-[0_8px_24px_rgba(22,61,89,0.1)]"
      style={{
        borderColor: "rgba(22, 61, 89, 0.08)",
        boxShadow: "0 2px 12px rgba(22, 61, 89, 0.06)",
      }}
    >
      <div className="p-6">
        <div className="flex justify-end">
          <Icon
            className="w-6 h-6 flex-shrink-0"
            style={{ color: "var(--regu-gray-500)" }}
            aria-hidden
          />
        </div>
        <p
          className="mt-2 font-bold tabular-nums"
          style={{
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            lineHeight: 1.1,
            color: "#B7D400",
          }}
        >
          {displayValue}
        </p>
        <h3
          className="mt-3 font-bold uppercase tracking-wide"
          style={{
            color: "var(--token-text-primary)",
            fontSize: "var(--token-heading-h3-size)",
          }}
        >
          {label}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--token-text-secondary)" }}>
          {description}
        </p>
      </div>
    </article>
  );
}
