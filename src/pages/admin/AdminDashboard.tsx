import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import { api } from "@/lib/api";
import { normalizeAuditDetails, type AuditRow } from "@/lib/auditDisplay";
import {
  Newspaper,
  Calendar,
  FileText,
  FilePlus2,
  Home,
  Menu,
  FolderOpen,
  ImageIcon,
  Zap,
  BookOpen,
  Hash,
  Library,
  UserCircle,
  Contact,
  Building2,
  Handshake,
  Briefcase,
  Crown,
  Scale,
  Images,
  Bell,
  Users,
  Lock,
  PenLine,
  ArrowUpRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";

type Shortcut = {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  featured?: boolean;
};

const featured: Shortcut[] = [
  { to: "/admin/content/home", icon: Home, title: "Portada", desc: "El banner, el texto y las fotos de entrada." },
  { to: "/admin/content/navigation", icon: Menu, title: "Menú del sitio", desc: "Lo que sale arriba en todas las páginas." },
  { to: "/admin/content/paginas", icon: FilePlus2, title: "Páginas de categorías", desc: "Las secciones nuevas que creas desde el menú." },
  { to: "/admin/noticias", icon: Newspaper, title: "Noticias", desc: "Escribir o corregir una noticia." },
  { to: "/admin/eventos", icon: Calendar, title: "Eventos", desc: "La agenda que ve la gente." },
];

const moreLinks: Shortcut[] = [
  { to: "/admin/content/galeria", icon: FolderOpen, title: "Galería", desc: "Álbumes y fotos." },
  { to: "/admin/content/cumbres", icon: Zap, title: "Cumbres", desc: "Carrusel de cumbres." },
  { to: "/admin/content/accesos", icon: ImageIcon, title: "Accesos de la portada", desc: "Los cuatro atajos." },
  { to: "/admin/documentos", icon: FileText, title: "Documentos", desc: "PDFs y Word." },
  { to: "/admin/boletines-gtai", icon: Library, title: "Boletines GTAI", desc: "Boletines del grupo." },
  { to: "/admin/revista", icon: BookOpen, title: "Revista digital", desc: "Ediciones." },
  { to: "/admin/cifras", icon: Hash, title: "Cifras", desc: "Números del foro." },
  { to: "/admin/autoridades-actuales", icon: UserCircle, title: "Autoridades", desc: "Presidencia." },
  { to: "/admin/directorio-autoridades", icon: Contact, title: "Directorio", desc: "Contactos por país." },
  { to: "/admin/entes-miembros", icon: Building2, title: "Entes miembros", desc: "Reguladores." },
  { to: "/admin/convenios", icon: Handshake, title: "Convenios", desc: "Acuerdos." },
  { to: "/admin/grupos-trabajo", icon: Briefcase, title: "Grupos de trabajo", desc: "Cada GT." },
  { to: "/admin/comite-ejecutivo", icon: Crown, title: "Comité Ejecutivo", desc: "Textos y actas." },
  { to: "/admin/buenas-practicas", icon: Scale, title: "Buenas prácticas", desc: "Micrositio." },
];

const adminOnlyLinks: Shortcut[] = [
  { to: "/admin/media", icon: Images, title: "Archivos", desc: "Fotos subidas." },
  { to: "/admin/visitas", icon: BarChart3, title: "Visitas", desc: "Personas por día y semana." },
  { to: "/admin/suscriptores", icon: Bell, title: "Suscriptores", desc: "Correos inscritos." },
  { to: "/admin/usuarios", icon: Users, title: "Usuarios", desc: "Cuentas del panel." },
  { to: "/admin/acceso-actas", icon: Lock, title: "Acceso a actas", desc: "Cuentas restringidas." },
];

function greeting(name: string | undefined) {
  const hour = new Date().getHours();
  const first = name?.split(/\s+/)[0] || "";
  const hello = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  return first ? `${hello}, ${first}` : hello;
}

function todayLabel() {
  return new Date().toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function AdminDashboard() {
  const { user, canManageUsers } = useAuth();
  const { enter: enterSiteEdit } = useSiteEdit();
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(canManageUsers);
  const [visits, setVisits] = useState<{ today: number; week: number } | null>(null);

  useEffect(() => {
    if (!canManageUsers) return;
    let cancelled = false;
    (async () => {
      const [auditRes, visitRes] = await Promise.all([
        api.admin.audit.list({ limit: 12 }),
        api.admin.analytics.stats(),
      ]);
      if (cancelled) return;
      if (auditRes.ok) {
        setAudit(auditRes.data.items.map((item) => ({ ...item, details: normalizeAuditDetails(item.details) })));
      }
      if (visitRes.ok) {
        setVisits({ today: visitRes.data.today.visitors, week: visitRes.data.week.visitors });
      }
      setAuditLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [canManageUsers]);

  const extraLinks = moreLinks;

  return (
    <div className="space-y-8">
      <div
        className="overflow-hidden rounded-3xl px-6 py-7 sm:px-8"
        style={{
          background: "linear-gradient(135deg, #163d59 0%, #2a6aa3 58%, #4489c6 100%)",
          color: "white",
        }}
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {todayLabel()}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{greeting(user?.name)}</h1>
        <p className="mt-2 max-w-xl text-sm text-white/80">
          Elige qué parte del sitio quieres tocar. Los cambios se ven en regulatel.org cuando los guardas.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => enterSiteEdit("/")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] transition hover:bg-white/90"
          >
            <PenLine className="h-4 w-4" />
            Editar en el sitio
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            Ver el sitio público
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          {canManageUsers && visits && (
            <Link
              to="/admin/visitas"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              <BarChart3 className="h-4 w-4" />
              Hoy {visits.today} · Semana {visits.week}
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
          Lo de todos los días
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(68,137,198,0.5)] hover:shadow-md"
              style={{ borderColor: "rgba(22,61,89,0.08)" }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "rgba(68,137,198,0.14)", color: "var(--regu-blue)" }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--regu-navy)" }}>
                  {title}
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" style={{ color: "var(--regu-blue)" }} />
                </span>
                <span className="mt-1 block text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {canManageUsers && <AdminAuditLog items={audit} loading={auditLoading} compact />}

      <section>
        <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
          El resto del sitio
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {extraLinks.map(({ to, icon: Icon, title }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 rounded-xl border bg-white px-3 py-3 text-sm font-medium transition hover:border-[rgba(68,137,198,0.45)]"
              style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-navy)" }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--regu-blue)" }} />
              {title}
            </Link>
          ))}
          {adminOnlyLinks.map(({ to, icon: Icon, title }) =>
            canManageUsers ? (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 rounded-xl border bg-white px-3 py-3 text-sm font-medium transition hover:border-[rgba(68,137,198,0.45)]"
                style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-navy)" }}
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--regu-blue)" }} />
                {title}
              </Link>
            ) : (
              <Link
                key={to}
                to={to}
                title="Solo un administrador puede abrir esto"
                className="flex items-center gap-2.5 rounded-xl border bg-white px-3 py-3 text-sm font-medium"
                style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-gray-400)" }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{title}</span>
                <Lock className="h-3.5 w-3.5 shrink-0" />
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}
