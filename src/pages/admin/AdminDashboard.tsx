import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Newspaper, Calendar, Hash, FileText, BookOpen, Info, Users, Lock, ChevronDown, ChevronUp, Layout, Zap, FolderOpen, ImageIcon, Menu, Images, Contact, Briefcase, Library } from "lucide-react";
import { projectInfo } from "@/config/projectInfo";

const contentCards = [
  { to: "/admin/content/home", icon: Layout, title: "Home", desc: "Hero institucional, título, CTAs e imágenes del slideshow; accesos principales." },
  { to: "/admin/content/cumbres", icon: Zap, title: "Cumbres destacadas", desc: "Crear, editar, reordenar slides del carrusel de cumbres." },
  { to: "/admin/content/galeria", icon: FolderOpen, title: "Galería", desc: "Crear y editar álbumes, subir y reordenar fotos." },
  { to: "/admin/content/accesos", icon: ImageIcon, title: "Accesos principales", desc: "Los 4 tiles de la home: etiquetas, enlaces e iconos." },
  { to: "/admin/content/navigation", icon: Menu, title: "Navegación", desc: "Editar el menú principal del header (JSON)." },
];

const cards = [
  { to: "/admin/media", icon: Images, title: "Media library", desc: "Referencia de dónde subir imágenes (noticias, eventos, galería)." },
  { to: "/admin/noticias", icon: Newspaper, title: "Noticias", desc: "Añadir, editar o eliminar noticias. Se publican en la sección Noticias." },
  { to: "/admin/eventos", icon: Calendar, title: "Eventos", desc: "Gestionar eventos que aparecen en la home y en la sección Eventos." },
  { to: "/admin/cifras", icon: Hash, title: "REGULATEL en cifras", desc: "Modificar los números (grupos de trabajo, países, etc.)." },
  { to: "/admin/directorio-autoridades", icon: Contact, title: "Directorio de autoridades", desc: "Editar contactos oficiales por país en la página Miembros." },
  { to: "/admin/grupos-trabajo", icon: Briefcase, title: "Grupos de trabajo", desc: "Coordinadores, miembros, enlaces e imágenes de cada GT." },
  { to: "/admin/boletines-gtai", icon: Library, title: "Boletines GTAI", desc: "Boletines del Grupo de Asuntos de Internet: PDF, metadatos, publicar y destacar." },
  { to: "/admin/documentos", icon: FileText, title: "Documentos", desc: "Subir documentos y colocarlos en su sección correcta." },
  { to: "/admin/revista", icon: BookOpen, title: "Revista Digital", desc: "Añadir ediciones de la revista digital." },
];

const adminOnlyCards = [
  { to: "/admin/usuarios", icon: Users, title: "Usuarios y auditoría", desc: "Gestionar usuarios admin y consultar el registro de auditoría." },
  { to: "/admin/acceso-actas", icon: Lock, title: "Acceso a actas", desc: "Crear cuentas para desbloquear actas restringidas desde la página pública." },
];

export default function AdminDashboard() {
  const { canManageUsers } = useAuth();
  const [projectInfoOpen, setProjectInfoOpen] = useState(false);
  const allCards = [...contentCards, ...cards, ...(canManageUsers ? adminOnlyCards : [])];
  return (
    <div>
      <h1
        className="mb-2 text-2xl font-bold"
        style={{ color: "var(--regu-gray-900)" }}
      >
        Panel de administración
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--regu-gray-500)" }}>
        Contenido del sitio (Home, Cumbres, Galería, Accesos) y gestión de noticias, eventos, documentos y cifras.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allCards.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "rgba(68, 137, 198, 0.12)",
                color: "var(--regu-blue)",
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: "var(--regu-gray-900)" }}>
                {title}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Información del proyecto (uso interno, no público) — colapsable */}
      <section
        className="mt-12 rounded-xl border bg-[var(--regu-offwhite)]"
        style={{ borderColor: "var(--regu-gray-100)" }}
        aria-label="Información del proyecto"
      >
        <button
          type="button"
          onClick={() => setProjectInfoOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 p-5 text-left"
          aria-expanded={projectInfoOpen}
        >
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--regu-gray-700)]">
            <Info className="h-4 w-4" />
            Información del proyecto
          </h2>
          {projectInfoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {projectInfoOpen && (
          <ul className="space-y-1 border-t px-5 pb-5 pt-1 text-sm text-[var(--regu-gray-600)]" style={{ borderColor: "var(--regu-gray-100)" }}>
            <li><strong>Portal:</strong> {projectInfo.project}</li>
            <li><strong>Versión inicial desarrollada por:</strong> {projectInfo.initialVersionBy}</li>
            <li><strong>Cargo:</strong> {projectInfo.role}</li>
            <li><strong>Correo institucional:</strong> {projectInfo.institutionalEmail}</li>
            <li><strong>Año:</strong> {projectInfo.year}</li>
          </ul>
        )}
      </section>
    </div>
  );
}
