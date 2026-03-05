import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import { authorities } from "@/data/authorities";

function AuthorityCard({ authority }: { authority: (typeof authorities)[number] }) {
  return (
    <Link
      to={`/autoridades/${authority.slug}`}
      className="flex flex-col items-center text-center transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="mb-4 flex justify-center">
        <img
          src={authority.image}
          alt={authority.name}
          className="w-[10rem] h-[10rem] rounded-lg object-cover bg-[#E5E7EB]"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        <div
          className="hidden w-[10rem] h-[10rem] rounded-lg bg-[#E5E7EB] items-center justify-center text-[#9CA3AF] text-4xl"
          aria-hidden
        >
          —
        </div>
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-1">{authority.name}</h3>
      <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280] mb-3">
        {authority.role}
      </p>
      <p className="text-sm text-[#4B5563] leading-[1.6] max-w-[420px] mx-auto">
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
        description="Una de las fortalezas que tiene REGULATEL está en otorgar un amplio y eficiente reconocimiento 
        a los Entes Reguladores de Telecomunicaciones. Las autoridades de REGULATEL son líderes 
        reconocidos en el sector de las telecomunicaciones, comprometidos con la cooperación regional 
        y el desarrollo de políticas que promuevan la innovación y el acceso universal a los servicios 
        de telecomunicaciones en América Latina."
      />
      <div className="w-full py-16 md:py-20 bg-[#FAFAFA]">
        <div className="mx-auto px-4 md:px-6" style={{ maxWidth: "1100px" }}>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-16"
            style={{ gap: "64px" }}
          >
            {authorities.map((authority) => (
              <AuthorityCard key={authority.id} authority={authority} />
            ))}
          </div>

          <section
            className="mx-auto pt-20"
            style={{ marginTop: "80px", maxWidth: "700px" }}
          >
            <hr className="border-0 h-px bg-[#E5E7EB] mb-10" />
            <h2 className="text-xl font-semibold text-[#111827] mb-4">
              Sobre las Autoridades
            </h2>
            <div className="space-y-4 text-base leading-[1.65] text-[#374151]">
              <p>
                Las autoridades de REGULATEL son designadas por los países miembros y representan a los
                principales entes reguladores de telecomunicaciones de América Latina. Su función es
                fundamental para el desarrollo de políticas regionales, la promoción de mejores prácticas
                y el fortalecimiento de la cooperación entre los países miembros.
              </p>
              <p>
                Cada autoridad aporta su experiencia y conocimiento para avanzar en los objetivos comunes
                de REGULATEL, trabajando en conjunto para enfrentar los desafíos del sector de las
                telecomunicaciones y promover el desarrollo digital inclusivo en la región.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
