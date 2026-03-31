import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import PageHero from "@/components/PageHero";
import type { Authority } from "@/data/authorities";
import { useAutoridadesActuales } from "@/contexts/SiteSettingsContext";

function AuthorityCard({ authority, index }: { authority: Authority; index: number }) {
  const isCenter = index === 1;
  return (
    <Link
      to={`/autoridades/${authority.slug}`}
      className="authorityCard group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-white text-center transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 w-full min-h-0"
      style={{
        borderColor: "rgba(22,61,89,0.10)",
        boxShadow: isCenter
          ? "0 4px 12px rgba(22,61,89,0.08), 0 16px 40px rgba(22,61,89,0.12)"
          : "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.07)",
        maxWidth: "380px",
      }}
    >
      {/* Acento top */}
      <div
        className="authorityCardAccent absolute inset-x-0 top-0 h-[3px] transition-colors duration-300"
        style={{ backgroundColor: isCenter ? "var(--regu-blue)" : "rgba(68,137,198,0.50)" }}
        aria-hidden
      />

      {/* Foto */}
      <div
        className="relative mt-3 w-full overflow-hidden"
        style={{ aspectRatio: "4/3", backgroundColor: "var(--regu-gray-100)" }}
      >
        <img
          src={authority.image}
          alt={authority.name}
          className="h-full w-full object-cover object-[center_top] transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            const fb = t.nextElementSibling as HTMLElement | null;
            if (fb) fb.classList.remove("hidden");
          }}
        />
        <div
          className="absolute inset-0 hidden flex items-center justify-center text-5xl font-bold"
          style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
          aria-hidden
        >
          {authority.name.charAt(0)}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <span
          className="mb-1.5 inline-block text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--regu-blue)" }}
        >
          {authority.role}
        </span>
        <h3
          className="mb-3 font-bold leading-tight"
          style={{
            color: "var(--regu-navy)",
            fontSize: "clamp(1.125rem, 1.5vw, 1.35rem)",
            fontFamily: "var(--token-font-heading)",
          }}
        >
          {authority.name}
        </h3>
        <p
          className="mb-4 flex-1 text-sm leading-relaxed"
          style={{ color: "var(--regu-gray-600)" }}
        >
          {authority.bio}
        </p>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-2"
          style={{ color: "var(--regu-blue)" }}
        >
          Ver perfil completo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function Autoridades() {
  const authoritiesList = useAutoridadesActuales();
  return (
    <>
      <PageHero
        title="Autoridades"
        subtitle="QUIÉNES SOMOS"
        breadcrumb={[{ label: "Autoridades actuales" }]}
        description="Presidente y Vicepresidentes del período actual del Foro"
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
          className="mx-auto px-4 md:px-6 lg:px-8"
          style={{ maxWidth: "1180px" }}
        >
          {/* Header de sección */}
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
                Autoridades actuales del Foro
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Comité Ejecutivo · Período vigente
              </p>
            </div>
          </div>

          {/* Grid de autoridades: 1 col móvil, 2 tablet, 3 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 justify-items-center">
            {authoritiesList.map((authority, index) => (
              <AuthorityCard key={authority.id} authority={authority} index={index} />
            ))}
          </div>

          {/* Bloque editorial */}
          <section
            className="mt-10 rounded-2xl border bg-white p-8 md:mt-12 md:p-10"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
            }}
          >
            <h2
              className="mb-5 flex items-center gap-3 text-lg font-bold md:text-xl"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              <span
                className="inline-block h-5 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              Sobre las Autoridades
            </h2>
            <div
              className="space-y-4 text-base leading-relaxed md:text-[1.0625rem]"
              style={{ color: "var(--regu-gray-700)" }}
            >
              <p>
                Las autoridades de REGULATEL están integradas por la presidencia de turno, el
                presidente saliente y el próximo presidente. Son designadas por los países miembros
                anualmente, en cada Asamblea y representan a los principales entes reguladores de
                telecomunicaciones de América Latina.
              </p>
              <p>
                Su función es fundamental para el desarrollo de políticas regionales, la promoción de
                mejores prácticas y el fortalecimiento de la cooperación entre los países miembros.
              </p>
            </div>
          </section>

          {/* Navegación footer */}
          <nav
            className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.06)",
              }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Inicio
            </Link>
            <Link
              to="/comite-ejecutivo"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Comité Ejecutivo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
