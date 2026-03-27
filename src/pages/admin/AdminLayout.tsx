import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Hash,
  FileText,
  BookOpen,
  Users,
  Lock,
  LogOut,
  Home,
  Menu,
  X,
  Layout,
  ImageIcon,
  Zap,
  FolderOpen,
  Images,
  Contact,
} from "lucide-react";

const navContenido = [
  { to: "/admin/content/home", icon: Layout, label: "Home" },
  { to: "/admin/content/cumbres", icon: Zap, label: "Cumbres destacadas" },
  { to: "/admin/content/galeria", icon: FolderOpen, label: "Galería" },
  { to: "/admin/content/accesos", icon: ImageIcon, label: "Accesos principales" },
  { to: "/admin/content/navigation", icon: Menu, label: "Navegación" },
];

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Panel" },
  { to: "/admin/media", icon: Images, label: "Media library" },
  { to: "/admin/noticias", icon: Newspaper, label: "Noticias" },
  { to: "/admin/eventos", icon: Calendar, label: "Eventos" },
  { to: "/admin/cifras", icon: Hash, label: "REGULATEL en cifras" },
  { to: "/admin/directorio-autoridades", icon: Contact, label: "Directorio de autoridades" },
  { to: "/admin/documentos", icon: FileText, label: "Documentos" },
  { to: "/admin/revista", icon: BookOpen, label: "Revista Digital" },
];

export default function AdminLayout() {
  const { isAdmin, isChecking, canManageUsers, user, logout } = useAuth();
  const { contentSource, contentError, recheckContentSource } = useAdminData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [legacyDismissed, setLegacyDismissed] = useState(false);
  const [rechecking, setRechecking] = useState(false);

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [isAdmin, isChecking, navigate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void logout();
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout, navigate]);

  if (isChecking) return null;
  if (!isAdmin) return null;

  const showLegacyBanner = contentSource !== "database" && !legacyDismissed;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--regu-gray-100)" }}>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border bg-white shadow md:hidden"
        style={{ borderColor: "var(--regu-gray-200)" }}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-56 shrink-0 border-r transition-transform duration-200 md:relative md:translate-x-0 md:w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          backgroundColor: "var(--regu-white)",
          borderColor: "var(--regu-gray-100)",
        }}
      >
        <div className="flex h-full flex-col py-6 pl-4 pr-2 md:pl-4 md:pr-2">
          <Link
            to="/admin"
            className="px-2 pb-4 text-lg font-bold"
            style={{ color: "var(--regu-navy)" }}
            onClick={() => setSidebarOpen(false)}
          >
            Admin REGULATEL
          </Link>
          <nav className="space-y-0.5 px-2" aria-label="Administración">
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--regu-gray-400)" }}>
              Contenido
            </p>
            {navContenido.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
                  (isActive ? "bg-[rgba(68,137,198,0.12)]" : "")
                }
                style={({ isActive }) =>
                  isActive ? { color: "var(--regu-blue)" } : { color: "var(--regu-gray-900)" }
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </NavLink>
            ))}
            <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--regu-gray-400)" }}>
              Gestión
            </p>
            {nav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
                  (isActive
                    ? "bg-[rgba(68,137,198,0.12)]"
                    : "")
                }
                style={({ isActive }) =>
                  isActive
                    ? { color: "var(--regu-blue)" }
                    : { color: "var(--regu-gray-900)" }
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </NavLink>
            ))}
            {canManageUsers && (
              <>
                <NavLink
                  to="/admin/usuarios"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
                    (isActive ? "bg-[rgba(68,137,198,0.12)]" : "")
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { color: "var(--regu-blue)" }
                      : { color: "var(--regu-gray-900)" }
                  }
                >
                  <Users className="h-4 w-4" aria-hidden />
                  Usuarios y auditoría
                </NavLink>
                <NavLink
                  to="/admin/acceso-actas"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
                    (isActive ? "bg-[rgba(68,137,198,0.12)]" : "")
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { color: "var(--regu-blue)" }
                      : { color: "var(--regu-gray-900)" }
                  }
                >
                  <Lock className="h-4 w-4" aria-hidden />
                  Acceso a actas
                </NavLink>
              </>
            )}
          </nav>

          {user && (
            <p
              className="mt-4 px-3 py-2 text-xs truncate rounded-lg"
              style={{ color: "var(--regu-gray-500)", backgroundColor: "var(--regu-gray-100)" }}
              title={user.email}
            >
              {user.name || user.email}
            </p>
          )}

          <div className="mt-auto border-t pt-4" style={{ borderColor: "var(--regu-gray-100)" }}>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="mb-2 flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition hover:opacity-90"
              style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)", backgroundColor: "rgba(22, 61, 89, 0.06)" }}
            >
              <Home className="h-4 w-4" aria-hidden />
              Ir a home
            </Link>
            <button
              type="button"
              onClick={() => {
                void logout();
                navigate("/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-80"
              style={{ color: "var(--regu-gray-700)" }}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 pt-14 md:pt-6 md:p-8">
        {showLegacyBanner && (
          <div
            className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            <span>
              El contenido principal no está saliendo de Neon en este momento. El portal quedó en modo
              legacy solo para lectura pública.
              {contentError ? ` Motivo: ${contentError}` : ""}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setRechecking(true);
                  await recheckContentSource?.();
                  setRechecking(false);
                }}
                disabled={rechecking}
                className="rounded bg-amber-200 px-2 py-1 text-amber-900 hover:bg-amber-300 disabled:opacity-50"
              >
                {rechecking ? "Comprobando…" : "Reintentar"}
              </button>
              <button
                type="button"
                onClick={() => setLegacyDismissed(true)}
                className="rounded px-2 py-1 text-amber-800 hover:bg-amber-100"
                aria-label="Ocultar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <AdminBreadcrumbs />
        <Outlet />
      </main>
    </div>
  );
}
