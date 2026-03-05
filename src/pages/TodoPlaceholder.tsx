import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TodoPlaceholder() {
  const params = useParams<{ slug: string }>();
  const title = useMemo(
    () => (params.slug ? formatSlug(params.slug) : "Contenido pendiente"),
    [params.slug],
  );

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-start justify-center px-4 py-16 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">TODO</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-3 text-slate-600">
        Esta ruta fue creada como placeholder seguro para completar el enlace oficial
        sin romper navegación ni build.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
