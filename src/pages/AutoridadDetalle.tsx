import { useParams, Link } from "react-router-dom";
import {
  getAuthorityBySlug,
  getOtherAuthorities,
  type Authority,
} from "@/data/authorities";
import {
  User,
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

function DetailHero({ a }: { a: Authority }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white"
      style={{
        borderColor: "rgba(22,61,89,0.10)",
        boxShadow: "0 4px 20px rgba(22,61,89,0.08)",
        borderTop: "3px solid var(--regu-blue)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-stretch gap-0">
        {/* Foto */}
        <div
          className="relative flex-shrink-0 w-full md:w-[280px] md:min-h-[280px] bg-[var(--regu-gray-100)]"
          style={{ aspectRatio: "1" }}
        >
          <img
            src={a.image}
            alt=""
            className="h-full w-full object-cover object-[center_top]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const next = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (next) next.classList.remove("hidden");
            }}
          />
          <div
            className="hidden h-full w-full items-center justify-center text-6xl font-bold"
            style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
            aria-hidden
          >
            {a.name.charAt(0)}
          </div>
        </div>

        {/* Meta */}
        <div className="flex min-w-0 flex-1 flex-col justify-center p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
            >
              {a.role}
            </span>
            {a.period && (
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--regu-gray-500)" }}>
                <Calendar size={12} />
                {a.period}
              </span>
            )}
          </div>
          <h1
            className="break-words"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "var(--regu-navy)",
              lineHeight: 1.2,
              marginBottom: 12,
              fontFamily: "var(--token-font-heading)",
            }}
          >
            {a.name}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
            {a.institutionUrl ? (
              <a
                href={a.institutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
                style={{ color: "var(--regu-gray-600)" }}
              >
                <Building2 size={14} style={{ color: "var(--regu-blue)" }} />
                {a.institution}
              </a>
            ) : (
              <span className="flex items-center gap-1.5">
                <Building2 size={14} style={{ color: "var(--regu-blue)" }} />
                {a.institution}
              </span>
            )}
            {a.country && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: "var(--regu-blue)" }} />
                {a.country}
              </span>
            )}
          </div>
          {a.bio && (
            <p className="mt-4 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--regu-gray-600)" }}>
              {a.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BioSections({ a }: { a: Authority }) {
  const sections =
    a.sections && a.sections.length > 0
      ? a.sections
      : [{ title: "Perfil", content: a.fullBio }];

  return (
    <div className="space-y-8">
      {sections.map((sec, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border bg-white"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 flex items-center gap-2 text-base font-bold uppercase tracking-wider"
              style={{ color: "var(--regu-gray-500)", fontFamily: "var(--token-font-heading)" }}
            >
              <span
                className="h-5 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              {sec.title}
            </h2>
            <div
              className="text-[0.9375rem] md:text-[1rem] leading-[1.75] whitespace-pre-line"
              style={{ color: "var(--regu-gray-700)", maxWidth: "720px" }}
            >
              {sec.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OtrasAutoridades({ currentSlug }: { currentSlug: string }) {
  const others = getOtherAuthorities(currentSlug, 4);

  if (others.length === 0) return null;

  return (
    <section className="pt-10 border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
      <div className="mb-6 flex items-center gap-3">
        <div
          className="h-8 w-[3px] flex-shrink-0 rounded-full"
          style={{ backgroundColor: "var(--regu-blue)" }}
          aria-hidden
        />
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
        >
          Otras autoridades
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {others.map((auth) => (
          <Link
            key={auth.id}
            to={`/autoridades/${auth.slug}`}
            className="group overflow-hidden rounded-2xl border bg-white transition-all hover:border-[rgba(22,61,89,0.18)] hover:shadow-[0_4px_12px_rgba(22,61,89,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
              borderTop: "3px solid var(--regu-blue)",
            }}
          >
            <div
              className="relative w-full overflow-hidden bg-[var(--regu-gray-100)]"
              style={{ aspectRatio: "1" }}
            >
              <img
                src={auth.image}
                alt=""
                className="h-full w-full object-cover object-[center_top] transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (next) next.classList.remove("hidden");
                }}
              />
              <div
                className="absolute inset-0 hidden items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-blue)" }}
                aria-hidden
              >
                {auth.name.charAt(0)}
              </div>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-blue)" }}>
                {auth.role}
              </p>
              <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-[var(--regu-blue)] transition-colors" style={{ color: "var(--regu-navy)", fontSize: "0.9375rem" }}>
                {auth.name}
              </h3>
              <p className="mt-0.5 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                {auth.institution}
                {auth.country && ` · ${auth.country}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link
          to="/autoridades"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
        >
          Ver todas las autoridades
          <ArrowRight size={16} />
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
      <div
        className="relative min-h-[60vh] flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#FAFBFC", fontFamily: "var(--token-font-body)" }}
      >
        <div style={{ height: 4, background: "var(--regu-blue)", width: "100%", position: "absolute", top: 0, left: 0, right: 0 }} aria-hidden />
        <div className="rounded-2xl border bg-white p-10 text-center" style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 8px rgba(22,61,89,0.04)", borderTop: "3px solid var(--regu-blue)", maxWidth: 440 }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(68,137,198,0.12)" }}>
            <User size={28} style={{ color: "var(--regu-blue)" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
            Autoridad no encontrada
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            La autoridad solicitada no existe o no está disponible.
          </p>
          <Link
            to="/autoridades"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            Volver a Autoridades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} aria-hidden />

      <div className="mx-auto px-4 pb-14 pt-8 md:px-6 md:pt-10" style={{ maxWidth: 900 }}>
        <nav
          className="mb-6 flex items-center gap-2 text-sm"
          style={{ color: "var(--regu-gray-400)" }}
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <Link to="/autoridades" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>
            Autoridades
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>
            {authority.name}
          </span>
        </nav>

        <DetailHero a={authority} />

        <div className="mt-8 space-y-8">
          <BioSections a={authority} />
        </div>

        <OtrasAutoridades currentSlug={authority.slug} />

        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
          style={{ borderColor: "rgba(22,61,89,0.08)" }}
        >
          <Link
            to="/autoridades"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
            style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-gray-700)", textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            Volver a Autoridades
          </Link>
          <Link
            to="/comite-ejecutivo"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: "var(--regu-blue)", textDecoration: "none" }}
          >
            Comité Ejecutivo
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
