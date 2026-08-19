import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pencil, Plus, X } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { adminPathForPublic, type SiteEditTarget } from "@/lib/siteEdit";
import { SiteEditUndoRedo } from "@/components/site-edit/SiteEditUndoRedo";

function addTargetForPath(pathname: string, search: string): SiteEditTarget | null {
  if (pathname === "/boletines-gtai" || pathname.startsWith("/boletines-gtai/")) {
    return { kind: "boletin" };
  }
  if (pathname === "/noticias" || pathname.startsWith("/noticias/")) {
    return { kind: "noticia" };
  }
  if (pathname === "/miembros" || pathname.startsWith("/miembros/")) {
    return { kind: "ente" };
  }
  if (pathname === "/grupos-de-trabajo" || pathname.startsWith("/grupos-de-trabajo/")) {
    return { kind: "grupo" };
  }
  if (pathname === "/autoridades" || pathname.startsWith("/autoridades/")) {
    return { kind: "autoridad" };
  }
  if (pathname === "/comite-ejecutivo" || pathname.startsWith("/comite-ejecutivo/")) {
    return { kind: "comite-logo", slot: "miembro" };
  }
  if (pathname === "/convenios" || pathname.startsWith("/convenios/")) {
    return { kind: "convenio" };
  }
  if (pathname === "/galeria" || pathname.startsWith("/galeria/")) {
    return { kind: "album" };
  }
  if (pathname === "/estudios-e-investigacion") {
    return { kind: "estudio" };
  }
  if (pathname === "/habla-el-regulador") {
    return { kind: "entrevista" };
  }
  if (pathname === "/eventos" || pathname.startsWith("/eventos/")) {
    return { kind: "evento" };
  }
  if (pathname !== "/gestion" && pathname !== "/recursos") return null;
  const tipo = new URLSearchParams(search).get("tipo");
  if (tipo === "revista") return { kind: "revista" };
  if (tipo === "planes-actas" || tipo === "comite-ejecutivo" || tipo === "documentos" || tipo === "otros") {
    return { kind: "documento", category: tipo };
  }
  return { kind: "documento", category: "documentos" };
}

export function SiteEditBar() {
  const { enabled, exit, open, target, hasUnpublished } = useSiteEdit();
  const location = useLocation();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty("--site-edit-bar-h", `${el.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-edit-bar-h");
    };
  }, [enabled, target, hasUnpublished]);

  if (!enabled) return null;

  const panelPath = adminPathForPublic(location.pathname, location.search) ?? "/admin";
  const addTarget = addTargetForPath(location.pathname, location.search);

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-[100] flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 text-white md:px-5"
      style={{ backgroundColor: "#0f766e" }}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <p className="text-[13px] font-semibold">
          {target
            ? "Los cambios se ven al instante · publica para que salgan en el sitio"
            : "Editando el sitio · pulsa lo marcado en verde para cambiarlo"}
        </p>
        {hasUnpublished && (
          <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-teal-950">
            Sin publicar
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SiteEditUndoRedo variant="bar" />
        {addTarget && (
          <button
            type="button"
            onClick={() => open(addTarget)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir
          </button>
        )}
        <Link
          to={panelPath}
          onClick={(event) => {
            if (!exit()) event.preventDefault();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"
        >
          <Pencil className="h-3.5 w-3.5" />
          Formulario del panel
        </Link>
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#0f766e]"
        >
          <X className="h-3.5 w-3.5" />
          Salir
        </button>
      </div>
    </div>
  );
}
