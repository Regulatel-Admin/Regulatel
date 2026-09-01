import { Link } from "react-router-dom";
import { ExternalLink, FilePlus2, PenLine, Trash2 } from "lucide-react";
import { useCustomPages, useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { customPageHref } from "@/data/customPages";
import { deleteCustomCategory } from "@/lib/customPagesSave";

export default function AdminContentPaginas() {
  const pages = useCustomPages();
  const { refetch } = useSiteSettings();
  const { enter } = useSiteEdit();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Páginas de categorías
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
          Estas páginas salen del + en el menú al editar el sitio. Entra a cada una para rellenar una plantilla o
          armarla en el lienzo libre.
        </p>
      </div>
      {pages.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed px-6 py-12 text-center"
          style={{ borderColor: "rgba(68,137,198,0.35)" }}
        >
          <FilePlus2 className="mx-auto h-8 w-8" style={{ color: "var(--regu-blue)" }} />
          <p className="mt-3 font-semibold" style={{ color: "var(--regu-navy)" }}>
            Todavía no hay categorías nuevas
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
            Entra a editar el sitio, abre Recursos (u otro menú) y pulsa + Añadir categoría.
          </p>
          <button
            type="button"
            onClick={() => enter("/")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "#0f766e" }}
          >
            <PenLine className="h-4 w-4" />
            Editar en el sitio
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          <ul className="divide-y" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
            {pages.map((page) => (
              <li key={page.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold" style={{ color: "var(--regu-navy)" }}>
                    {page.title}
                    {!page.published && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Borrador
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: "var(--regu-gray-400)" }}>
                    {customPageHref(page.slug)}
                    {page.mode === "template" ? " · Plantilla" : page.mode === "free" ? " · Edición libre" : " · Sin formato"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => enter(customPageHref(page.slug))}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: "#0f766e" }}
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Editar en el sitio
                </button>
                <Link
                  to={customPageHref(page.slug)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold"
                  style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                >
                  Ver
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`¿Quitar «${page.title}»?`)) return;
                    const res = await deleteCustomCategory(page);
                    if (res.ok) await refetch();
                    else window.alert(res.error);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold text-red-700"
                  style={{ borderColor: "rgba(22,61,89,0.14)" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
