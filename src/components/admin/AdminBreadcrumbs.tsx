import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const PATH_LABELS: Record<string, string> = {
  "/admin": "Panel",
  "/admin/noticias": "Noticias",
  "/admin/eventos": "Eventos",
  "/admin/cifras": "REGULATEL en cifras",
  "/admin/documentos": "Documentos",
  "/admin/buenas-practicas": "Buenas Prácticas",
  "/admin/revista": "Revista Digital",
  "/admin/usuarios": "Usuarios y auditoría",
  "/admin/acceso-actas": "Acceso a actas",
};

export default function AdminBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname || "/admin";
  if (pathname === "/admin") return null;
  const label = (PATH_LABELS[pathname] ?? pathname.replace(/^\/admin\/?/, "")) || "Panel";
  return (
    <nav aria-label="Miga de pan" className="mb-4 flex items-center gap-1 text-sm">
      <Link
        to="/admin"
        className="font-medium transition hover:opacity-80"
        style={{ color: "var(--regu-blue)" }}
      >
        Panel
      </Link>
      <ChevronRight className="h-4 w-4 opacity-50" style={{ color: "var(--regu-gray-500)" }} aria-hidden />
      <span style={{ color: "var(--regu-gray-600)" }}>{label}</span>
    </nav>
  );
}
