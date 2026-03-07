import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Hash,
  FileText,
  BookOpen,
  Users,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Panel" },
  { to: "/admin/noticias", icon: Newspaper, label: "Noticias" },
  { to: "/admin/eventos", icon: Calendar, label: "Eventos" },
  { to: "/admin/cifras", icon: Hash, label: "REGULATEL en cifras" },
  { to: "/admin/documentos", icon: FileText, label: "Documentos" },
  { to: "/admin/revista", icon: BookOpen, label: "Revista Digital" },
];

export default function AdminLayout() {
  const { isAdmin, isChecking, canManageUsers, logout } = useAuth();
  const { contentSource, contentError } = useAdminData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [isAdmin, isChecking, navigate]);

  if (isChecking) return null;
  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--regu-gray-100)" }}>
      <aside
        className="w-56 shrink-0 border-r md:w-64"
        style={{
          backgroundColor: "var(--regu-white)",
          borderColor: "var(--regu-gray-100)",
        }}
      >
        <div className="sticky top-0 flex flex-col py-6">
          <Link
            to="/admin"
            className="px-4 pb-4 text-lg font-bold"
            style={{ color: "var(--regu-navy)" }}
          >
            Admin REGULATEL
          </Link>
          <nav className="space-y-0.5 px-2">
            {nav.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                style={{ color: "var(--regu-gray-900)" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {canManageUsers && (
              <Link
                to="/admin/usuarios"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                style={{ color: "var(--regu-gray-900)" }}
              >
                <Users className="h-4 w-4" />
                Usuarios y auditoría
              </Link>
            )}
          </nav>
          <div className="mt-auto border-t px-2 pt-4" style={{ borderColor: "var(--regu-gray-100)" }}>
            <Link
              to="/"
              className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={() => {
                void logout();
                navigate("/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: "var(--regu-gray-700)" }}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-8">
        {contentSource !== "database" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            El contenido principal no está saliendo de Neon en este momento. El portal quedó en modo
            legacy solo para lectura pública.
            {contentError ? ` Motivo: ${contentError}` : ""}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
