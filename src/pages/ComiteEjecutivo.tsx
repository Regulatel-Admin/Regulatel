import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHero from "@/components/PageHero";
import {
  comiteEjecutivoData,
  type ComiteMemberLogo,
} from "@/data/comiteEjecutivo";

const SECTION_SPACING = "96px";
const CONTENT_MAX_WIDTH = 1320;

type LogoCardSize = "xl" | "lg" | "md";

function LogoBlock({
  item,
  size,
  className = "",
}: {
  item: ComiteMemberLogo;
  size: LogoCardSize;
  className?: string;
}) {
  const cardClass = `logoCard logoCard--${size} ${className}`.trim();
  const card = (
    <div className={`${cardClass} relative flex items-center justify-center`}>
      <div className="relative flex-1 min-w-0 min-h-0 flex items-center justify-center w-full h-full">
        <img
          src={item.logoUrl}
          alt={item.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const next = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (next) next.classList.remove("hidden");
          }}
        />
        <div
          className="hidden absolute inset-0 flex items-center justify-center bg-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-[1.125rem]"
          aria-hidden
        >
          {item.name.slice(0, 2)}
        </div>
      </div>
    </div>
  );

  if (item.linkUrl) {
    return (
      <a
        href={item.linkUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2 rounded-[18px]"
      >
        {card}
      </a>
    );
  }
  return card;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-8 md:mb-10 text-[#111827] font-bold tracking-tight"
      style={{
        fontFamily: "var(--token-font-heading)",
        fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)",
      }}
    >
      {children}
    </h2>
  );
}

export default function ComiteEjecutivo() {
  const d = comiteEjecutivoData;
  const miembrosOrdenados = [...d.miembros].sort((a, b) =>
    (a.country || a.name).localeCompare(b.country || b.name, "es")
  );

  return (
    <>
      <PageHero
        title="COMITÉ EJECUTIVO"
        breadcrumb={[{ label: "COMITÉ EJECUTIVO" }]}
        description="Autoridades que lideran la dirección estratégica del Foro y coordinan la ejecución del plan de trabajo."
      />

      <div
        className="mx-auto w-full px-4 py-14 md:px-8 md:py-20 lg:px-10"
        style={{ maxWidth: CONTENT_MAX_WIDTH }}
      >
        {/* Fila: Presidente + Vicepresidentes lado a lado */}
        <section
          className="flex flex-col lg:flex-row lg:items-flex-start lg:justify-center gap-14 lg:gap-16 xl:gap-20"
          style={{ marginBottom: SECTION_SPACING }}
        >
          <div className="flex flex-col items-center text-center lg:flex-1 lg:max-w-[420px]">
            <SectionTitle>Presidente</SectionTitle>
            <LogoBlock item={d.presidente} size="xl" />
          </div>
          <div className="flex flex-col items-center text-center lg:flex-1 lg:max-w-[520px]">
            <SectionTitle>Vicepresidentes</SectionTitle>
            <div className="flex flex-nowrap items-center justify-center gap-8 md:gap-12">
              {d.vicepresidentes.map((v, i) => (
                <LogoBlock key={i} item={v} size="lg" />
              ))}
            </div>
          </div>
        </section>

        {/* Secretario Ejecutivo */}
        <section
          className="flex flex-col items-center text-center"
          style={{ marginBottom: SECTION_SPACING }}
        >
          <SectionTitle>Secretario Ejecutivo</SectionTitle>
          <LogoBlock item={d.secretarioEjecutivo} size="xl" />
        </section>

        {/* Miembros del Comité — orden alfabético por país */}
        <section
          className="flex flex-col items-center text-center"
          style={{ marginBottom: SECTION_SPACING }}
        >
          <SectionTitle>Miembros del Comité</SectionTitle>
          <div className="grid w-full grid-cols-2 gap-8 sm:gap-10 md:grid-cols-3 lg:gap-12 place-items-center max-w-[1000px] mx-auto">
            {miembrosOrdenados.map((m, i) => (
              <LogoBlock key={i} item={m} size="md" />
            ))}
          </div>
        </section>

        {/* Funciones principales */}
        <section
          className="mx-auto pt-6 border-t border-[#E5E7EB]"
          style={{ maxWidth: 720, marginTop: SECTION_SPACING, paddingTop: 48 }}
        >
          <h2
            className="mb-6 text-[#111827] font-bold tracking-tight"
            style={{
              fontFamily: "var(--token-font-heading)",
              fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
            }}
          >
            Funciones principales
          </h2>
          <p
            className="mb-6 text-base md:text-lg leading-relaxed"
            style={{ color: "#5B6B7B" }}
          >
            {d.funcionesIntro}
          </p>
          <ul
            className="list-disc space-y-4 pl-6 text-base md:text-lg leading-relaxed"
            style={{ color: "#5B6B7B" }}
          >
            {d.funciones.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>

        {/* Volver a inicio */}
        <nav
          className="mx-auto mt-16 md:mt-20 pt-10 pb-6 border-t border-[#E5E7EB] flex justify-center"
          aria-label="Navegación final"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors bg-[#4489C6]/10 hover:bg-[#4489C6]/16 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2"
            style={{ color: "#4489C6" }}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Volver a inicio
          </Link>
        </nav>
      </div>
    </>
  );
}
