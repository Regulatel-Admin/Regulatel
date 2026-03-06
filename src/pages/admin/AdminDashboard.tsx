import { Link } from "react-router-dom";
import { Newspaper, Calendar, Hash, FileText, BookOpen, Info } from "lucide-react";
import { projectInfo } from "@/config/projectInfo";

const cards = [
  { to: "/admin/noticias", icon: Newspaper, title: "Noticias", desc: "Añadir, editar o eliminar noticias. Se publican en la sección Noticias." },
  { to: "/admin/eventos", icon: Calendar, title: "Eventos", desc: "Gestionar eventos que aparecen en la home y en la sección Eventos." },
  { to: "/admin/cifras", icon: Hash, title: "REGULATEL en cifras", desc: "Modificar los números (grupos de trabajo, países, etc.)." },
  { to: "/admin/documentos", icon: FileText, title: "Documentos", desc: "Subir documentos y colocarlos en su sección correcta." },
  { to: "/admin/revista", icon: BookOpen, title: "Revista Digital", desc: "Añadir ediciones de la revista digital." },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1
        className="mb-2 text-2xl font-bold"
        style={{ color: "var(--regu-gray-900)" }}
      >
        Panel de administración
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--regu-gray-500)" }}>
        Elige una sección para gestionar el contenido de la página.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, desc }) => (
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

      {/* Información del proyecto (uso interno, no público) */}
      <section
        className="mt-12 rounded-xl border bg-[var(--regu-offwhite)] p-5"
        style={{ borderColor: "var(--regu-gray-100)" }}
        aria-label="Información del proyecto"
      >
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--regu-gray-700)]">
          <Info className="h-4 w-4" />
          Información del proyecto
        </h2>
        <ul className="space-y-1 text-sm text-[var(--regu-gray-600)]">
          <li><strong>Portal:</strong> {projectInfo.project}</li>
          <li><strong>Versión inicial desarrollada por:</strong> {projectInfo.initialVersionBy}</li>
          <li><strong>Cargo:</strong> {projectInfo.role}</li>
          <li><strong>Correo institucional:</strong> {projectInfo.institutionalEmail}</li>
          <li><strong>Año:</strong> {projectInfo.year}</li>
        </ul>
      </section>
    </div>
  );
}
