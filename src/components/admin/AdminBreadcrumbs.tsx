import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { adminPathLabel } from "@/lib/adminPathLabels";

export default function AdminBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname || "/admin";
  if (pathname === "/admin") return null;
  const label = adminPathLabel(pathname);
  return (
    <nav aria-label="Miga de pan" className="mb-5 flex items-center gap-1.5 text-[13px]">
      <Link
        to="/admin"
        className="font-medium transition hover:opacity-80"
        style={{ color: "var(--regu-blue)" }}
      >
        Inicio
      </Link>
      <ChevronRight className="h-3.5 w-3.5 opacity-40" style={{ color: "var(--regu-gray-500)" }} aria-hidden />
      <span className="font-medium" style={{ color: "var(--regu-navy)" }}>
        {label}
      </span>
    </nav>
  );
}
