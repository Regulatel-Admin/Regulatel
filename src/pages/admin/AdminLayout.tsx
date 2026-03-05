import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Hash,
  FileText,
  BookOpen,
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
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [isAdmin, navigate]);

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
                logout();
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
        <Outlet />
      </main>
    </div>
  );
}
