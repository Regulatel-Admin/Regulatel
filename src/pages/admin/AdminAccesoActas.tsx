/**
 * Crear y listar usuarios con acceso solo a documentos restringidos (actas).
 * No tienen acceso al panel admin; al ingresar email y contraseña en /acceso-documentos desbloquean el acta.
 * Solo usuarios con rol admin.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Lock, UserPlus, Mail, Calendar, Pencil, Trash2, X } from "lucide-react";

export default function AdminAccesoActas() {
  const { isChecking, isAdmin, canManageUsers } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null; is_active: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [position, setPosition] = useState("");
  const [country, setCountry] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [editName, setEditName] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isChecking && (!isAdmin || !canManageUsers)) {
      navigate("/admin", { replace: true });
    }
  }, [isChecking, isAdmin, canManageUsers, navigate]);

  const loadUsers = useCallback(async () => {
    const res = await api.admin.documentAccessUsers.list();
    if (res.ok) setUsers(Array.isArray(res.data) ? res.data : []);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
  }, [loadUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    if (!email.trim()) {
      setFormError("El email es obligatorio.");
      return;
    }
    if (!password || password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const res = await api.admin.documentAccessUsers.create({
      email: email.trim(),
      password,
      name: name.trim() || undefined,
      institution: institution.trim() || undefined,
      position: position.trim() || undefined,
      country: country.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(`Cuenta creada: ${res.data.email}. Esa persona podrá desbloquear las actas en /acceso-documentos con su email y contraseña.`);
      setEmail("");
      setPassword("");
      setName("");
      setInstitution("");
      setPosition("");
      setCountry("");
      loadUsers();
    } else {
      setFormError(res.error ?? "Error al crear la cuenta.");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  const openEdit = (u: typeof users[0]) => {
    setEditingUser(u);
    setEditName(u.name ?? "");
    setEditInstitution(u.institution ?? "");
    setEditPosition(u.position ?? "");
    setEditCountry(u.country ?? "");
    setEditPassword("");
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);
    setEditSubmitting(true);
    const res = await api.admin.documentAccessUsers.update(editingUser.id, {
      name: editName.trim() || undefined,
      institution: editInstitution.trim() || undefined,
      position: editPosition.trim() || undefined,
      country: editCountry.trim() || undefined,
      password: editPassword.trim() ? editPassword : undefined,
    });
    setEditSubmitting(false);
    if (res.ok) {
      setEditingUser(null);
      loadUsers();
    } else {
      setEditError(res.error ?? "Error al actualizar.");
    }
  };

  const handleDelete = async (u: typeof users[0]) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.email}? Esta persona ya no podrá acceder a las actas.`)) return;
    setDeletingId(u.id);
    const res = await api.admin.documentAccessUsers.delete(u.id);
    setDeletingId(null);
    if (res.ok) {
      setSuccess("Cuenta eliminada.");
      loadUsers();
    } else {
      setFormError(res.error ?? "No se pudo eliminar la cuenta.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--regu-gray-900)" }}>
          <Lock className="h-7 w-7" style={{ color: "var(--regu-blue)" }} />
          Acceso a actas restringidas
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Crea cuentas para personas que puedan desbloquear las actas (Acta No. 26, 27, 28, etc.) desde la página pública. Estas cuentas <strong>no</strong> tienen acceso al panel de administración.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: "var(--regu-gray-200)" }}>
        <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--regu-navy)" }}>
          <UserPlus className="h-5 w-5" />
          Crear cuenta (solo acceso a actas)
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="persona@dominio.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Contraseña</label>
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
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Nombre (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="Nombre"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Institución (opcional)</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="Institución"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Cargo (opcional)</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="Cargo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>País (opcional)</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--regu-gray-200)" }}
              placeholder="País"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creando…" : "Crear cuenta"}
            </button>
          </div>
        </form>
        {formError && <p className="mt-3 text-sm font-medium" style={{ color: "var(--regu-salmon)" }}>{formError}</p>}
        {success && <p className="mt-3 text-sm font-medium" style={{ color: "var(--regu-teal)" }}>{success}</p>}
      </section>

      <section className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--regu-gray-200)" }}>
        <h2 className="px-6 py-4 text-lg font-semibold" style={{ color: "var(--regu-navy)" }}>
          Cuentas con acceso a actas
        </h2>
        {loading ? (
          <p className="px-6 pb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
        ) : users.length === 0 ? (
          <p className="px-6 pb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>Aún no hay cuentas. Crea una arriba.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: "var(--regu-gray-50)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Email</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Institución</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Cargo</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>País</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "var(--regu-gray-700)" }}>Creado</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--regu-gray-700)" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: "var(--regu-gray-100)" }}>
                    <td className="px-4 py-3 align-top" style={{ color: "var(--regu-gray-900)" }}>{u.name ?? "—"}</td>
                    <td className="px-4 py-3 align-top" style={{ color: "var(--regu-gray-700)" }}>
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 opacity-70 shrink-0" />
                        <span className="break-all">{u.email}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top" style={{ color: "var(--regu-gray-600)" }}>{u.institution ?? "—"}</td>
                    <td className="px-4 py-3 align-top" style={{ color: "var(--regu-gray-600)" }}>{u.position ?? "—"}</td>
                    <td className="px-4 py-3 align-top" style={{ color: "var(--regu-gray-600)" }}>{u.country ?? "—"}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap" style={{ color: "var(--regu-gray-500)" }}>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(u.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-lg p-2 transition"
                          style={{ color: "var(--regu-blue)" }}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          className="rounded-lg p-2 transition"
                          style={{ color: "var(--regu-salmon)" }}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal editar cuenta */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-doc-access-title"
        >
          <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl overflow-hidden" style={{ borderColor: "var(--regu-gray-200)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--regu-gray-100)", backgroundColor: "var(--regu-gray-50)" }}>
              <h2 id="edit-doc-access-title" className="text-lg font-bold" style={{ color: "var(--regu-navy)" }}>
                Editar cuenta
              </h2>
              <button type="button" onClick={() => setEditingUser(null)} className="rounded-lg p-2 hover:bg-white/80" aria-label="Cerrar">
                <X className="h-5 w-5" style={{ color: "var(--regu-gray-600)" }} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>Email: {editingUser.email}</p>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Nombre</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--regu-gray-200)" }} placeholder="Nombre" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Institución</label>
                <input type="text" value={editInstitution} onChange={(e) => setEditInstitution(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--regu-gray-200)" }} placeholder="Institución" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Cargo</label>
                <input type="text" value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--regu-gray-200)" }} placeholder="Cargo" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>País</label>
                <input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--regu-gray-200)" }} placeholder="País" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--regu-gray-700)" }}>Nueva contraseña (opcional)</label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--regu-gray-200)" }} placeholder="Dejar en blanco para no cambiar" />
              </div>
              {editError && <p className="text-sm font-medium" style={{ color: "var(--regu-salmon)" }}>{editError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}>Cancelar</button>
                <button type="submit" disabled={editSubmitting} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "var(--regu-blue)" }}>{editSubmitting ? "Guardando…" : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
