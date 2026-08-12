/**
 * Gestión de usuarios admin y registro de auditoría.
 * Visible para usuarios con rol admin (definido en base de datos).
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import { AdminLockedScreen, useAdminOnlySection } from "@/components/admin/AdminLockedScreen";
import { normalizeAuditDetails, type AuditRow } from "@/lib/auditDisplay";
import { UserPlus, Users, Mail, Shield, PenLine, Calendar } from "lucide-react";

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toLowerCase() === "admin";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={
        isAdmin
          ? { backgroundColor: "rgba(68,137,198,0.16)", color: "var(--regu-blue)" }
          : { backgroundColor: "rgba(180,83,9,0.12)", color: "#b45309" }
      }
    >
      {isAdmin ? <Shield className="h-3 w-3" aria-hidden /> : <PenLine className="h-3 w-3" aria-hidden />}
      {isAdmin ? "Admin" : "Editor"}
    </span>
  );
}

export default function AdminUsuarios() {
  const { isChecking, allowed, locked } = useAdminOnlySection();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isChecking && !allowed && !locked) {
      navigate("/admin", { replace: true });
    }
  }, [isChecking, allowed, locked, navigate]);

  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; username: string | null; role: string; is_active: boolean; last_login_at: string | null; created_at: string }>>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("admin");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    const res = await api.admin.users.list();
    if (res.ok) setUsers(Array.isArray(res.data) ? res.data : []);
    else setError(res.error ?? "Error al cargar usuarios");
  }, []);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    const res = await api.admin.audit.list({ limit: 80 });
    if (res.ok) {
      setAudit(
        res.data.items.map((item) => ({
          ...item,
          details: normalizeAuditDetails(item.details),
        }))
      );
    }
    setAuditLoading(false);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
  }, [allowed, loadUsers]);

  useEffect(() => {
    if (!allowed) return;
    loadAudit();
  }, [allowed, loadAudit]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    if (!email.trim() || !password) {
      setFormError("Email y contraseña son obligatorios.");
      return;
    }
    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const res = await api.admin.users.create({
      email: email.trim(),
      password,
      name: name.trim() || undefined,
      role,
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(`Usuario ${res.data.email} creado correctamente.`);
      setEmail("");
      setPassword("");
      setName("");
      setRole("admin");
      loadUsers();
      loadAudit();
    } else {
      setFormError(res.error ?? "Error al crear usuario.");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("es-DO", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  if (isChecking) return null;
  if (locked) return <AdminLockedScreen title="Usuarios" />;
  if (!allowed) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Usuarios
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Quién puede entrar al panel, y más abajo el historial de lo que se ha cambiado en el sitio.
        </p>
        <div className="mt-3 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--regu-gray-200)", backgroundColor: "var(--regu-gray-50)", color: "var(--regu-gray-700)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--regu-navy)" }}>Roles</p>
          <p className="flex flex-wrap items-center gap-2">
            <RoleBadge role="admin" />
            <span>Puede editar el sitio y abrir Usuarios, Actas, Suscriptores y Archivos.</span>
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <RoleBadge role="editor" />
            <span>Puede editar el contenido del sitio. Esas cuatro secciones se ven en el menú, pero quedan con candado.</span>
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--regu-gray-500)" }}>Solo los administradores pueden crear usuarios y ver este historial.</p>
        </div>
      </div>

      {/* Crear nueva cuenta */}
      <section
        className="rounded-xl border bg-white p-6 shadow-sm"
        style={{ borderColor: "var(--regu-gray-200)" }}
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--regu-navy)" }}>
          <UserPlus className="h-5 w-5" />
          Crear nueva cuenta admin
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="usuario@dominio.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
              Nombre (opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "editor")}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: "var(--regu-teal)" }}
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creando…" : "Crear usuario"}
            </button>
            {formError && (
              <span className="text-sm" style={{ color: "var(--regu-salmon)" }}>{formError}</span>
            )}
            {success && (
              <span className="text-sm font-medium" style={{ color: "var(--regu-teal)" }}>{success}</span>
            )}
          </div>
        </form>
      </section>

      {/* Listado de usuarios */}
      <section
        className="rounded-xl border bg-white shadow-sm overflow-hidden"
        style={{ borderColor: "var(--regu-gray-200)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--regu-navy)" }}>
            <Users className="h-5 w-5" />
            Usuarios registrados
          </h2>
          <button
            type="button"
            onClick={() => { setError(null); loadUsers(); }}
            className="text-sm font-medium rounded-lg px-3 py-1.5 border transition-colors"
            style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
          >
            Actualizar lista
          </button>
        </div>
        {loading ? (
          <p className="px-6 pb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
        ) : error ? (
          <p className="px-6 pb-6 text-sm" style={{ color: "var(--regu-salmon)" }}>{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--regu-gray-50)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Email</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Rol</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Último acceso</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: "var(--regu-gray-100)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--regu-gray-900)" }}>{u.name}</td>
                    <td className="px-4 py-3 flex items-center gap-1.5" style={{ color: "var(--regu-gray-700)" }}>
                      <Mail className="h-3.5 w-3.5 opacity-70" />
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 flex items-center gap-1" style={{ color: "var(--regu-gray-500)" }}>
                      <Calendar className="h-3.5 w-3.5" />
                      {u.last_login_at ? formatDate(u.last_login_at) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminAuditLog items={audit} loading={auditLoading} />
    </div>
  );
}
