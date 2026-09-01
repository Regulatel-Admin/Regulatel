import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { BlobStorageProvider } from "@/contexts/BlobStorageContext";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import { AdminBlobStorageBar } from "@/components/admin/AdminBlobStorageBar";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Hash,
  FileText,
  FilePlus2,
  BookOpen,
  Users,
  Lock,
  LogOut,
  Home,
  Menu,
  X,
  ImageIcon,
  Zap,
  FolderOpen,
  Images,
  Contact,
  Briefcase,
  UserCircle,
  Handshake,
  Building2,
  Scale,
  Crown,
  Bell,
  ChevronDown,
  ExternalLink,
  PenLine,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  adminOnly?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    id: "pages",
    label: "El sitio",
    items: [
      { to: "/admin", label: "Inicio", icon: LayoutDashboard, end: true },
      { to: "/admin/content/home", label: "Portada", icon: Home },
      { to: "/admin/content/navigation", label: "Menú del sitio", icon: Menu },
      { to: "/admin/content/paginas", label: "Páginas de categorías", icon: FilePlus2 },
      { to: "/admin/content/galeria", label: "Galería", icon: FolderOpen },
      { to: "/admin/content/cumbres", label: "Cumbres", icon: Zap },
      { to: "/admin/content/accesos", label: "Accesos de la portada", icon: ImageIcon },
    ],
  },
  {
    id: "publish",
    label: "Publicar",
    items: [
      { to: "/admin/noticias", label: "Noticias", icon: Newspaper },
      { to: "/admin/eventos", label: "Eventos", icon: Calendar },
      { to: "/admin/documentos", label: "Documentos", icon: FileText },
      { to: "/admin/boletines-gtai", label: "Boletines GTAI", icon: Newspaper },
      { to: "/admin/revista", label: "Revista digital", icon: BookOpen },
      { to: "/admin/cifras", label: "Cifras", icon: Hash },
    ],
  },
  {
    id: "org",
    label: "Institución",
    items: [
      { to: "/admin/autoridades-actuales", label: "Autoridades", icon: UserCircle },
      { to: "/admin/directorio-autoridades", label: "Directorio", icon: Contact },
      { to: "/admin/entes-miembros", label: "Entes miembros", icon: Building2 },
      { to: "/admin/convenios", label: "Convenios", icon: Handshake },
      { to: "/admin/grupos-trabajo", label: "Grupos de trabajo", icon: Briefcase },
      { to: "/admin/comite-ejecutivo", label: "Comité Ejecutivo", icon: Crown },
      { to: "/admin/buenas-practicas", label: "Buenas prácticas", icon: Scale },
    ],
  },
  {
    id: "settings",
    label: "Ajustes",
    items: [
      { to: "/admin/media", label: "Archivos", icon: Images, adminOnly: true },
      { to: "/admin/visitas", label: "Visitas", icon: BarChart3, adminOnly: true },
      { to: "/admin/suscriptores", label: "Suscriptores", icon: Bell, adminOnly: true },
      { to: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
      { to: "/admin/acceso-actas", label: "Acceso a actas", icon: Lock, adminOnly: true },
    ],
  },
];

function groupContainsPath(group: NavGroup, pathname: string) {
  return group.items.some((item) => {
    if (item.end) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });
}

function NavItemLink({
  item,
  onNavigate,
  locked,
}: {
  item: NavItem;
  onNavigate: () => void;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        title="Solo un administrador puede abrir esto"
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium"
        style={{ color: "var(--regu-gray-400)" }}
      >
        <item.icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <Lock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      </NavLink>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition " +
        (isActive ? "bg-[rgba(68,137,198,0.14)]" : "hover:bg-[rgba(22,61,89,0.04)]")
      }
      style={({ isActive }) =>
        isActive ? { color: "var(--regu-blue)" } : { color: "var(--regu-gray-800)" }
      }
    >
      <item.icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      {item.label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { isAdmin, isChecking, canManageUsers, user, logout } = useAuth();
  const { enter: enterSiteEdit } = useSiteEdit();
  const { contentSource, contentError, recheckContentSource } = useAdminData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [legacyDismissed, setLegacyDismissed] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [isChecking, isAdmin, navigate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void logout();
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout, navigate]);

  useEffect(() => {
    setOpenGroups((current) => {
      let changed = false;
      const next = { ...current };
      for (const group of groups) {
        if (groupContainsPath(group, location.pathname) && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }
      }
      if (next.pages === undefined) {
        next.pages = true;
        changed = true;
      }
      return changed ? next : current;
    });
  }, [location.pathname, canManageUsers]);

  if (isChecking) return null;
  if (!isAdmin) return null;

  const showLegacyBanner = contentSource !== "database" && !legacyDismissed;
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <BlobStorageProvider>
    <div className="flex min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border bg-white shadow md:hidden"
        style={{ borderColor: "var(--regu-gray-200)" }}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col border-r bg-white transition-transform duration-200 md:relative md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ borderColor: "rgba(22,61,89,0.08)" }}
      >
        <div className="px-4 pb-3 pt-5">
          <Link
            to="/admin"
            onClick={closeSidebar}
            className="block text-[15px] font-bold leading-tight"
            style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
          >
            Editar el sitio
          </Link>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--regu-gray-500)" }}>
            REGULATEL
          </p>
          <button
            type="button"
            onClick={() => {
              closeSidebar();
              enterSiteEdit();
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold text-white"
            style={{ backgroundColor: "#0f766e" }}
          >
            <PenLine className="h-4 w-4 shrink-0" aria-hidden />
            Editar en el sitio
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3" aria-label="Administración">
          {groups.map((group) => {
            const isOpen = openGroups[group.id] ?? group.id === "pages";
            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((current) => ({ ...current, [group.id]: !isOpen }))
                  }
                  className="flex w-full items-center justify-between px-2.5 py-1 text-[11px] font-semibold tracking-wide"
                  style={{ color: "var(--regu-gray-500)" }}
                  aria-expanded={isOpen}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-0" : "-rotate-90"}`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {group.items.map((item) => (
                      <NavItemLink
                        key={item.to}
                        item={item}
                        onNavigate={closeSidebar}
                        locked={Boolean(item.adminOnly && !canManageUsers)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto border-t px-3 py-3" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <div className="mb-2 hidden md:block">
            <AdminBlobStorageBar variant="sidebar" />
          </div>
          {user && (
            <p className="mb-2 truncate px-2 text-[11px]" style={{ color: "var(--regu-gray-500)" }} title={user.email}>
              {user.name || user.email}
            </p>
          )}
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium hover:bg-[rgba(22,61,89,0.04)]"
            style={{ color: "var(--regu-gray-700)" }}
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            Ver el sitio
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout();
              navigate("/login");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium hover:bg-[rgba(22,61,89,0.04)]"
            style={{ color: "var(--regu-gray-700)" }}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Salir
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 pt-14 md:p-8 md:pt-8">
        <div className="mb-4 rounded-xl border bg-white px-3 py-2 md:hidden" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <AdminBlobStorageBar variant="field" />
        </div>
        {showLegacyBanner && (
          <div
            className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            <span>
              El contenido principal no está saliendo de la base de datos en este momento.
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
    </BlobStorageProvider>
  );
}
