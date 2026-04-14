import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import { api } from "@/lib/api";
import {
  COMITE_EJECUTIVO_SETTINGS_KEY,
  defaultComiteEjecutivoCmsDocument,
  parseComiteEjecutivoCmsFromSettingValue,
  resolveComiteEjecutivoUi,
  type ComiteEjecutivoCmsDocument,
  type ComiteMemberLogo,
} from "@/data/comiteEjecutivo";

type LogoCardSize = "xl" | "lg" | "md";

function LogoBlock({
  item,
  size,
  label,
}: {
  item: ComiteMemberLogo;
  size: LogoCardSize;
  label?: string;
}) {
  const card = (
    <div className="flex flex-col items-center gap-4">
      {label && (
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--regu-blue)" }}
        >
          {label}
        </span>
      )}
      <div
        className={`logoCard logoCard--${size} transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(22,61,89,0.14)]`}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <img
            src={item.logoUrl}
            alt={item.name}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const next = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (next) next.classList.remove("hidden");
            }}
          />
          <div
            className="absolute inset-0 hidden items-center justify-center rounded-[1.125rem] text-sm font-bold"
            style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
            aria-hidden
          >
            {item.name.slice(0, 2)}
          </div>
        </div>
      </div>
      <p className="text-sm font-semibold text-center" style={{ color: "var(--regu-navy)" }}>
        {item.name}
      </p>
    </div>
  );

  if (item.linkUrl) {
    return (
      <a
        href={item.linkUrl}
        target="_blank"
        rel="noreferrer"
        className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded-2xl"
        aria-label={`Sitio web de ${item.name}`}
      >
        {card}
      </a>
    );
  }
  return card;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 flex items-start gap-4 md:mb-12">
      <div
        className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
        style={{ backgroundColor: "var(--regu-blue)" }}
        aria-hidden
      />
      <div>
        <h2
          className="text-xl font-bold md:text-2xl"
          style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ComiteEjecutivo() {
  const [doc, setDoc] = useState<ComiteEjecutivoCmsDocument>(() => defaultComiteEjecutivoCmsDocument());

  const load = useCallback(async () => {
    const res = await api.settings.get(COMITE_EJECUTIVO_SETTINGS_KEY);
    if (res.ok && res.data && res.data.value != null) {
      const parsed = parseComiteEjecutivoCmsFromSettingValue(res.data.value);
      if (parsed) {
        setDoc(parsed);
        return;
      }
    }
    setDoc(defaultComiteEjecutivoCmsDocument());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const ui = resolveComiteEjecutivoUi(doc);
  const miembrosOrdenados = [...doc.miembros].sort((a, b) =>
    (a.country || a.name).localeCompare(b.country || b.name, "es")
  );

  return (
    <>
      <PageHero
        title={ui.heroTitle}
        subtitle={ui.heroSubtitle}
        breadcrumb={[{ label: ui.heroTitle }]}
        description={ui.heroDescription}
      />

      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-8 lg:px-10"
          style={{ maxWidth: "1180px" }}
        >
          {/* Presidente + Vicepresidentes en una sola línea */}
          <section className="mb-16 md:mb-20">
            <SectionHeader title={ui.presidenciaTitle} subtitle={ui.presidenciaSubtitle} />
            <div className="flex flex-row flex-wrap items-start justify-center gap-8 md:gap-12 lg:gap-16">
              {/* Presidente */}
              <div className="flex flex-col items-center gap-3">
                <span
                  className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
                >
                  Presidente
                </span>
                <LogoBlock item={doc.presidente} size="xl" />
              </div>
              {/* Vicepresidentes (misma línea, orden mantenido) */}
              <div className="flex flex-col items-center gap-3">
                <span
                  className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ backgroundColor: "rgba(22,61,89,0.07)", color: "var(--regu-navy)" }}
                >
                  Vicepresidencias
                </span>
                <div className="flex flex-wrap items-center justify-center gap-10 md:gap-12">
                  {doc.vicepresidentes.map((v, i) => (
                    <LogoBlock key={i} item={v} size="lg" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Miembros del Comité */}
          <section className="mb-16 md:mb-20">
            <SectionHeader title={ui.miembrosTitle} subtitle={ui.miembrosSubtitle} />
            <div className="grid grid-cols-2 place-items-center gap-8 sm:gap-10 md:grid-cols-3 lg:gap-12 mx-auto max-w-[900px]">
              {miembrosOrdenados.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  {m.country && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--regu-gray-500)" }}>
                      {m.country}
                    </span>
                  )}
                  <LogoBlock item={m} size="md" />
                </div>
              ))}
            </div>
          </section>

          {/* Funciones principales */}
          <section
            className="rounded-2xl border bg-white p-8 md:p-10"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
            }}
          >
            <h2
              className="mb-2 flex items-center gap-3 text-lg font-bold md:text-xl"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              <span
                className="inline-block h-5 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              {ui.funcionesSectionTitle}
            </h2>
            <p
              className="mb-6 mt-3 text-base leading-relaxed md:text-[1.0625rem]"
              style={{ color: "var(--regu-gray-600)" }}
            >
              {doc.funcionesIntro}
            </p>
            <ul className="space-y-3">
              {doc.funciones.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-base leading-relaxed md:text-[1.0625rem]"
                  style={{ color: "var(--regu-gray-700)" }}
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    style={{ color: "var(--regu-blue)" }}
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* Footer nav */}
          <nav
            className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ color: "var(--regu-blue)", borderColor: "var(--regu-blue)", backgroundColor: "rgba(68,137,198,0.06)" }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Inicio
            </Link>
            <Link
              to="/autoridades"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Autoridades actuales <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
