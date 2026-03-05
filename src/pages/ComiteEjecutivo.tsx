import PageHero from "@/components/PageHero";
import {
  comiteEjecutivoData,
  type ComiteMemberLogo,
} from "@/data/comiteEjecutivo";

const SECTION_SPACING = "88px";

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

export default function ComiteEjecutivo() {
  const d = comiteEjecutivoData;

  return (
    <>
      <PageHero
        title="COMITÉ EJECUTIVO"
        breadcrumb={[{ label: "COMITÉ EJECUTIVO" }]}
        description="Autoridades que lideran la dirección estratégica del Foro y coordinan la ejecución del plan de trabajo."
      />

      <div
        className="mx-auto w-full px-4 py-16 md:px-6 md:py-24"
        style={{ maxWidth: 1100 }}
      >
        <header className="mb-16">
          <h1
            className="text-[#111827] font-medium tracking-tight"
            style={{
              fontFamily: "var(--token-font-heading, Georgia, serif)",
              fontSize: "clamp(1.75rem, 3vw + 1rem, 2.5rem)",
              lineHeight: 1.2,
            }}
          >
            Comité Ejecutivo
          </h1>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: "#6B7280", maxWidth: 640 }}
          >
            Autoridades que lideran la dirección estratégica del Foro y coordinan la ejecución del plan de trabajo.
          </p>
        </header>

        <div
          className="mx-auto flex flex-col items-center"
          style={{ maxWidth: 700 }}
        >
          {/* 1) Presidente — logo xl */}
          <section
            className="flex w-full flex-col items-center text-center"
            style={{ marginBottom: SECTION_SPACING }}
          >
            <h2
              className="mb-8 text-[#111827] font-semibold tracking-tight"
              style={{ fontSize: "1.125rem" }}
            >
              Presidente
            </h2>
            <LogoBlock item={d.presidente} size="xl" />
          </section>

          {/* 2) Vicepresidentes — logo lg, 1–2 columnas según ancho */}
          <section
            className="flex w-full flex-col items-center text-center"
            style={{ marginBottom: SECTION_SPACING }}
          >
            <h2
              className="mb-8 text-[#111827] font-semibold tracking-tight"
              style={{ fontSize: "1.125rem" }}
            >
              Vicepresidentes
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 md:gap-20">
              {d.vicepresidentes.map((v, i) => (
                <LogoBlock key={i} item={v} size="lg" />
              ))}
            </div>
          </section>

          {/* 3) Secretario Ejecutivo — logo xl */}
          <section
            className="flex w-full flex-col items-center text-center"
            style={{ marginBottom: SECTION_SPACING }}
          >
            <h2
              className="mb-8 text-[#111827] font-semibold tracking-tight"
              style={{ fontSize: "1.125rem" }}
            >
              Secretario Ejecutivo
            </h2>
            <LogoBlock item={d.secretarioEjecutivo} size="xl" />
          </section>

          {/* 4) Miembros del Comité — grid 2 cols mobile, 3 desktop; logo md (mín 140) */}
          <section
            className="flex w-full flex-col items-center text-center"
            style={{ marginBottom: SECTION_SPACING }}
          >
            <h2
              className="mb-8 text-[#111827] font-semibold tracking-tight"
              style={{ fontSize: "1.125rem" }}
            >
              Miembros del Comité
            </h2>
            <div className="grid w-full grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3 place-items-center">
              {d.miembros.map((m, i) => (
                <LogoBlock key={i} item={m} size="md" />
              ))}
            </div>
          </section>
        </div>

        {/* 5) Funciones principales */}
        <section
          className="mx-auto pt-4"
          style={{ maxWidth: 700, marginTop: SECTION_SPACING }}
        >
          <h2
            className="mb-6 text-[#111827] font-semibold tracking-tight text-left"
            style={{
              fontFamily: "var(--token-font-heading, Georgia, serif)",
              fontSize: "1.25rem",
            }}
          >
            Funciones principales
          </h2>
          <ul className="list-disc space-y-3 pl-5 text-base leading-relaxed" style={{ color: "#5B6B7B" }}>
            {d.funciones.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
