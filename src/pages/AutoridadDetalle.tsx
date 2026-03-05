import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import {
  getAuthorityBySlug,
  getOtherAuthorities,
  type Authority,
} from "@/data/authorities";

function DetailHero({ a }: { a: Authority }) {
  return (
    <div className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
      <div
        className="mx-auto px-4 md:px-6 py-10 md:py-12"
        style={{ maxWidth: "1100px" }}
      >
        <nav
          className="flex items-center gap-2 text-sm text-[#6B7280] mb-8"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-[#111827] flex items-center gap-1">
            <Home className="w-4 h-4" />
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <Link to="/autoridades" className="hover:text-[#111827]">
            Autoridades
          </Link>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <span className="text-[#111827] font-medium">{a.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <img
              src={a.image}
              alt={a.name}
              className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-lg object-cover bg-[#E5E7EB] aspect-square"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (next) next.classList.remove("hidden");
              }}
            />
            <div
              className="hidden w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-lg bg-[#E5E7EB] items-center justify-center text-[#9CA3AF] text-4xl aspect-square"
              aria-hidden
            >
              —
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] tracking-tight mb-3">
              {a.name}
            </h1>
            <span className="inline-block text-xs uppercase tracking-[0.08em] text-[#6B7280] bg-[#E5E7EB] px-3 py-1.5 rounded mb-4">
              {a.role}
            </span>
            <p className="text-base text-[#374151] mb-1">
              <span className="font-medium text-[#111827]">{a.institution}</span>
              {a.country && ` · ${a.country}`}
            </p>
            {a.period && (
              <p className="text-sm text-[#6B7280]">{a.period}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type DataRow = { label: string; value: string; href?: string };

function DatosClaveCard({ a }: { a: Authority }) {
  const rows: DataRow[] = [
    { label: "Cargo", value: a.role },
    { label: "Institución", value: a.institution },
    { label: "País", value: a.country },
    ...(a.period ? [{ label: "Período", value: a.period }] : []),
    ...(a.email ? [{ label: "Email", value: a.email }] : []),
    ...(a.linkedin ? [{ label: "LinkedIn", value: "Ver perfil", href: a.linkedin }] : []),
  ];

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280] mb-4">
        Datos clave
      </h3>
      <dl className="space-y-3">
        {rows.map((row, i) => (
          <div key={i}>
            <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm text-[#111827] font-medium">
              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4489C6] hover:underline"
                >
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function BioSections({ a }: { a: Authority }) {
  const sections = a.sections && a.sections.length > 0
    ? a.sections
    : [{ title: "Perfil", content: a.fullBio }];

  return (
    <div className="space-y-10">
      {sections.map((sec, i) => (
        <section key={i}>
          <h2 className="text-lg font-semibold text-[#111827] mb-3">{sec.title}</h2>
          <div className="text-base text-[#374151] leading-[1.7] whitespace-pre-line">
            {sec.content}
          </div>
        </section>
      ))}
    </div>
  );
}

function OtrasAutoridades({ currentSlug }: { currentSlug: string }) {
  const others = getOtherAuthorities(currentSlug, 4);

  if (others.length === 0) return null;

  return (
    <section className="pt-16 border-t border-[#E5E7EB] mt-16">
      <h2 className="text-xl font-semibold text-[#111827] mb-6">Otras autoridades</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {others.map((a) => (
          <Link
            key={a.id}
            to={`/autoridades/${a.slug}`}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2"
          >
            <img
              src={a.image}
              alt={a.name}
              className="w-full aspect-square max-w-[140px] mx-auto rounded-lg object-cover bg-[#E5E7EB] mb-3"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h3 className="text-base font-semibold text-[#111827] line-clamp-2">{a.name}</h3>
            <p className="text-xs uppercase tracking-wider text-[#6B7280] mt-1">{a.role}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Link
          to="/autoridades"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4489C6] hover:underline"
        >
          Ver todas las autoridades
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

export default function AutoridadDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const authority = slug ? getAuthorityBySlug(slug) : undefined;

  if (!authority) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2">No encontrada</h1>
        <p className="text-[#6B7280] mb-6">La autoridad solicitada no existe.</p>
        <Link
          to="/autoridades"
          className="text-[#4489C6] font-medium hover:underline"
        >
          Volver a Autoridades
        </Link>
      </div>
    );
  }

  return (
    <>
      <DetailHero a={authority} />

      <div
        className="mx-auto px-4 md:px-6 py-12 md:py-16"
        style={{ maxWidth: "1100px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
          <div className="min-w-0">
            <BioSections a={authority} />
          </div>
          <div className="lg:sticky lg:top-24 h-fit">
            <DatosClaveCard a={authority} />
          </div>
        </div>

        <OtrasAutoridades currentSlug={authority.slug} />
      </div>
    </>
  );
}
