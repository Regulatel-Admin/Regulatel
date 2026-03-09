import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHero from "@/components/PageHero";
import { authorities } from "@/data/authorities";

function AuthorityCard({ authority }: { authority: (typeof authorities)[number] }) {
  return (
    <Link
      to={`/autoridades/${authority.slug}`}
      className="flex flex-col items-center text-center transition-all hover:opacity-92 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2 rounded-2xl flex-1 min-w-[300px] md:min-w-[340px] max-w-full md:max-w-[520px] xl:max-w-[600px] p-6 md:p-8 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md"
    >
      <div className="relative mb-5 flex justify-center overflow-hidden rounded-xl bg-[#F3F4F6] shadow-md w-[17rem] h-[17rem] min-[900px]:w-[19rem] min-[900px]:h-[19rem] md:w-[20rem] md:h-[20rem]">
        <img
          src={authority.image}
          alt={authority.name}
          className="w-full h-full object-cover object-[center_top] rounded-xl"
          style={{ objectPosition: "center top" }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        <div
          className="hidden absolute inset-0 rounded-xl bg-[#F3F4F6] items-center justify-center text-[#9CA3AF] text-4xl"
          aria-hidden
        >
          —
        </div>
      </div>
      <h3 className="text-2xl md:text-[1.75rem] font-semibold text-[#111827] mb-2 leading-tight">
        {authority.name}
      </h3>
      <p className="text-sm md:text-base uppercase tracking-[0.06em] text-[#4B5563] font-medium mb-4">
        {authority.role}
      </p>
      <p className="text-[1.0625rem] md:text-lg text-[#111827] leading-[1.8] w-full max-w-[36rem] mx-auto text-left">
        {authority.bio}
      </p>
    </Link>
  );
}

export default function Autoridades() {
  return (
    <>
      <PageHero
        title="AUTORIDADES"
        breadcrumb={[{ label: "AUTORIDADES" }]}
      />
      <div className="w-full py-16 md:py-24 bg-[#F3F4F6]">
        <div className="mx-auto px-4 md:px-8 lg:px-10" style={{ maxWidth: "var(--token-content-wrap-max, 1920px)" }}>
          {/* Bloque con estructura: encabezado + fila de autoridades en contenedor */}
          <div className="rounded-2xl bg-white border border-[#E5E7EB] px-6 py-8 md:px-12 md:py-12 lg:px-16 xl:px-20 shadow-sm" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <header className="text-center mb-10 md:mb-12 pb-1 border-b border-[#E5E7EB]" style={{ borderBottomWidth: "1px" }}>
              <p
                className="text-xs font-bold uppercase tracking-[0.14em] mb-2.5"
                style={{ color: "#4B5563" }}
              >
                Comité Ejecutivo
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-[#111827] tracking-tight">
                Autoridades actuales del Foro
              </h2>
            </header>

            <div className="flex flex-col md:flex-row md:flex-nowrap items-stretch justify-between gap-10 md:gap-20 lg:gap-28 xl:gap-32">
              {authorities.map((authority) => (
                <AuthorityCard key={authority.id} authority={authority} />
              ))}
            </div>
          </div>

          {/* Bloque editorial */}
          <section
            className="mx-auto mt-10 md:mt-12"
            style={{ maxWidth: "var(--token-content-inner-max, 1600px)" }}
          >
            <div
              className="rounded-2xl bg-white border border-[#E5E7EB] p-10 md:p-12 text-center md:text-left shadow-sm"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-2xl font-semibold text-[#111827] mb-6 tracking-tight">
                Sobre las Autoridades
              </h2>
              <div className="space-y-6 text-[1.0625rem] md:text-lg leading-[1.8] text-left text-[#111827]">
                <p>
                  Las autoridades de REGULATEL están integradas por la presidencia de turno, el presidente saliente y el próximo presidente. Son designadas por los países miembros anualmente, en cada Asamblea y representan a los principales entes reguladores de telecomunicaciones de América Latina. Su función es fundamental para el desarrollo de políticas regionales, la promoción de mejores prácticas y el fortalecimiento de la cooperación entre los países miembros.
                </p>
                <p>
                  Cada autoridad aporta su experiencia y conocimiento para avanzar en los objetivos comunes de REGULATEL, trabajando en conjunto para enfrentar los desafíos del sector de las telecomunicaciones y promover el desarrollo digital inclusivo en la región.
                </p>
              </div>
            </div>
          </section>

          <nav
            className="mx-auto mt-10 md:mt-12 pt-8 pb-2 border-t border-[#E5E7EB] flex justify-center md:justify-start"
            style={{ maxWidth: "var(--token-content-inner-max, 1600px)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors bg-[#4489C6]/10 hover:bg-[#4489C6]/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2"
              style={{ color: "#4489C6" }}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
              Volver a inicio
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
