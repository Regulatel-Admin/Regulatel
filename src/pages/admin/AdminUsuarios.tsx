/**
 * Gestión de usuarios admin y registro de auditoría.
 * Visible para usuarios con rol admin (definido en base de datos).
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { UserPlus, Users, History, Mail, Shield, Calendar, X, FileText, Hash } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  created: "Creó",
  updated: "Actualizó",
  deleted: "Eliminó",
  uploaded: "Subió",
};

const RESOURCE_LABELS: Record<string, string> = {
  news: "Noticia",
  event: "Evento",
  document: "Documento",
  upload: "Archivo",
  admin_user: "Usuario admin",
  cifras: "REGULATEL en cifras",
};

function AuditActionBadge({ action }: { action: string }) {
  const label = ACTION_LABELS[action] ?? action;
  const style =
    action === "deleted"
      ? { backgroundColor: "rgba(200, 80, 80, 0.12)", color: "var(--regu-salmon)" }
      : action === "uploaded"
        ? { backgroundColor: "rgba(100, 120, 180, 0.12)", color: "var(--regu-navy)" }
        : action === "created"
          ? { backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }
          : { backgroundColor: "var(--regu-gray-100)", color: "var(--regu-gray-700)" };
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium" style={style}>
      {label}
    </span>
  );
}

function AuditDetailCell({ row, onViewDetail }: { row: AuditRow; onViewDetail: () => void }) {
  const display =
    row.details?.title != null
      ? String(row.details.title).slice(0, 40) + (String(row.details.title).length > 40 ? "…" : "")
      : row.resource_id != null
        ? String(row.resource_id).slice(0, 36) + (String(row.resource_id).length > 36 ? "…" : "")
        : "Ver detalle";
  const fullTitle =
    row.details?.title != null
      ? String(row.details.title)
      : row.resource_id != null
        ? String(row.resource_id)
        : "Ver detalle";
  return (
    <button
      type="button"
      onClick={onViewDetail}
      className="text-left text-sm font-medium rounded-md px-2 py-1.5 -mx-2 w-full min-w-0 truncate hover:bg-[var(--regu-gray-100)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-0"
      style={{ color: "var(--regu-blue)" }}
      title={fullTitle}
    >
      {display}
    </button>
  );
}

type AuditRow = {
  id: string;
  user_email: string;
  user_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

function formatAuditDetailSummary(row: AuditRow): { sentence: string; lines: string[]; url?: string } {
  const d = row.details ?? {};
  const lines: string[] = [];
  let url: string | undefined;
  const who = row.user_name ?? row.user_email ?? "Un administrador";
  const actionVerb = ACTION_LABELS[row.action] ?? row.action;
  const resourceLabel = RESOURCE_LABELS[row.resource_type] ?? row.resource_type;

  if (row.resource_type === "admin_user") {
    const name = typeof d.name === "string" ? d.name : null;
    const email = typeof d.email === "string" ? d.email : null;
    const role = typeof d.role === "string" ? d.role : "admin";
    const targetName = name || email || "usuario";
    const sentence =
      row.action === "created"
        ? `Admin ${who} creó usuario ${role} ${targetName}${email ? ` con correo ${email}` : ""}.`
        : row.action === "updated"
          ? `Admin ${who} actualizó usuario admin ${targetName}${email ? ` (${email})` : ""}.`
          : `Admin ${who} ${actionVerb} usuario admin ${targetName}${email ? ` (${email})` : ""}.`;
    if (d.email) lines.push(`Email: ${String(d.email)}`);
    if (d.role) lines.push(`Rol: ${String(d.role)}`);
    return { sentence, lines };
  }

  if (row.resource_type === "news") {
    const title = typeof d.title === "string" ? d.title : null;
    const sentence = title
      ? `Admin ${who} ${actionVerb} la noticia «${title}».`
      : `Admin ${who} ${actionVerb} ${resourceLabel} (ID: ${row.resource_id ?? "—"}).`;
    if (title) lines.push(`Título: ${title}`);
    if (d.slug) lines.push(`Slug: ${String(d.slug)}`);
    return { sentence, lines };
  }

  if (row.resource_type === "event") {
    const title = typeof d.title === "string" ? d.title : null;
    const sentence = title
      ? `Admin ${who} ${actionVerb} el evento «${title}».`
      : `Admin ${who} ${actionVerb} ${resourceLabel} (ID: ${row.resource_id ?? "—"}).`;
    if (title) lines.push(`Evento: ${title}`);
    return { sentence, lines };
  }

  if (row.resource_type === "document") {
    const title = typeof d.title === "string" ? d.title : null;
    const sentence = title
      ? `Admin ${who} ${actionVerb} el documento «${title}».`
      : `Admin ${who} ${actionVerb} ${resourceLabel} (ID: ${row.resource_id ?? "—"}).`;
    if (title) lines.push(`Documento: ${title}`);
    return { sentence, lines };
  }

  if (row.resource_type === "upload") {
    const u = d.url ?? row.resource_id;
    if (typeof u === "string" && (u.startsWith("http://") || u.startsWith("https://"))) {
      url = u;
      lines.push(`Archivo subido: ${u.length > 60 ? u.slice(0, 60) + "…" : u}`);
    } else {
      lines.push(`ID o referencia: ${row.resource_id ?? "—"}`);
    }
    const sentence = `Admin ${who} ${actionVerb} un archivo.`;
    return { sentence, lines, url };
  }

  if (row.resource_type === "cifras") {
    if (row.action === "deleted" && d.restoredDefault) {
      const sentence = `Admin ${who} restauró las cifras del año ${row.resource_id ?? d.year ?? "?"} a los valores por defecto.`;
      return { sentence, lines };
    }
    const y = d.year ?? row.resource_id;
    lines.push(`Año ${y}:`);
    if (typeof d.gruposTrabajo === "number") lines.push(`  • Grupos de trabajo: ${d.gruposTrabajo}`);
    if (typeof d.comitesEjecutivos === "number") lines.push(`  • Comités ejecutivos: ${d.comitesEjecutivos}`);
    if (typeof d.revistaDigital === "number") lines.push(`  • Revista digital: ${d.revistaDigital}`);
    if (typeof d.paises === "number") lines.push(`  • Países: ${d.paises}`);
    const sentence = `Admin ${who} ${actionVerb} REGULATEL en cifras (año ${y}).`;
    return { sentence, lines };
  }

  const sentence = `Admin ${who} ${actionVerb} ${resourceLabel} (ID: ${row.resource_id ?? "—"}).`;
  if (Object.keys(d).length > 0) {
    Object.entries(d).forEach(([k, v]) => {
      if (v != null && v !== "") lines.push(`${k}: ${String(v)}`);
    });
  }
  if (lines.length === 0 && row.resource_id) lines.push(`ID: ${row.resource_id}`);
  return { sentence, lines };
}

export default function AdminUsuarios() {
  const { isChecking, isAdmin, canManageUsers } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isChecking && (!isAdmin || !canManageUsers)) {
      navigate("/admin", { replace: true });
    }
  }, [isChecking, isAdmin, canManageUsers, navigate]);

  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; username: string | null; role: string; is_active: boolean; last_login_at: string | null; created_at: string }>>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [detailAudit, setDetailAudit] = useState<AuditRow | null>(null);
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
    if (res.ok) setAudit(res.data.items);
    setAuditLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
  }, [loadUsers]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Usuarios y auditoría
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Solo las cuentas con rol <strong>admin</strong> pueden ver esta página. La lista muestra <strong>todos</strong> los usuarios del sistema con acceso al panel.
        </p>
        <div className="mt-3 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--regu-gray-200)", backgroundColor: "var(--regu-gray-50)", color: "var(--regu-gray-700)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--regu-navy)" }}>Roles</p>
          <p><strong>Admin:</strong> Acceso completo al panel (noticias, eventos, documentos, REGULATEL en cifras, revista).</p>
          <p className="mt-1"><strong>Editor:</strong> Mismo acceso al contenido que Admin. La diferencia está reservada para futuras restricciones (por ejemplo, solo editar sin eliminar).</p>
          <p className="mt-2 text-xs" style={{ color: "var(--regu-gray-500)" }}>Solo los usuarios con rol admin pueden crear usuarios y ver este registro de auditoría.</p>
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
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-navy)" }}>
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
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

      {/* Auditoría */}
      <section
        className="rounded-xl border bg-white shadow-sm overflow-hidden"
        style={{ borderColor: "var(--regu-gray-200)" }}
      >
        <h2 className="flex items-center gap-2 px-6 py-4 text-lg font-semibold" style={{ color: "var(--regu-navy)" }}>
          <History className="h-5 w-5" />
          Registro de auditoría
        </h2>
        {auditLoading ? (
          <p className="px-6 pb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
        ) : audit.length === 0 ? (
          <p className="px-6 pb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>Aún no hay registros.</p>
        ) : (
          <div
            className="overflow-y-auto overflow-x-auto rounded-lg border"
            style={{
              maxHeight: "28rem",
              borderColor: "var(--regu-gray-200)",
              backgroundColor: "var(--regu-white)",
            }}
          >
            <table className="w-full text-sm border-collapse" style={{ tableLayout: "fixed", minWidth: "36rem" }}>
              <colgroup>
                <col style={{ width: "10rem" }} />
                <col style={{ width: "10rem" }} />
                <col style={{ width: "6.5rem" }} />
                <col style={{ width: "8rem" }} />
                <col />
              </colgroup>
              <thead>
                <tr
                  className="sticky top-0 z-10 border-b"
                  style={{
                    backgroundColor: "var(--regu-gray-50)",
                    borderColor: "var(--regu-gray-200)",
                    boxShadow: "0 1px 0 0 var(--regu-gray-200)",
                  }}
                >
                  <th className="text-left px-4 py-3 font-semibold tracking-tight whitespace-nowrap" style={{ color: "var(--regu-gray-700)" }}>
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 font-semibold tracking-tight whitespace-nowrap" style={{ color: "var(--regu-gray-700)" }}>
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 font-semibold tracking-tight whitespace-nowrap" style={{ color: "var(--regu-gray-700)" }}>
                    Acción
                  </th>
                  <th className="text-left px-4 py-3 font-semibold tracking-tight whitespace-nowrap" style={{ color: "var(--regu-gray-700)" }}>
                    Recurso
                  </th>
                  <th className="text-left px-4 py-3 font-semibold tracking-tight whitespace-nowrap" style={{ color: "var(--regu-gray-700)" }}>
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b transition-colors hover:bg-[var(--regu-gray-50)]"
                    style={{ borderColor: "var(--regu-gray-100)" }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap align-top" style={{ color: "var(--regu-gray-600)", fontVariantNumeric: "tabular-nums" }}>
                      {formatDate(a.created_at)}
                    </td>
                    <td className="px-4 py-3 align-top" style={{ color: "var(--regu-gray-900)" }}>
                      {a.user_name ?? a.user_email}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AuditActionBadge action={a.action} />
                    </td>
                    <td className="px-4 py-3 align-top text-[13px]" style={{ color: "var(--regu-gray-700)" }}>
                      {RESOURCE_LABELS[a.resource_type] ?? a.resource_type}
                    </td>
                    <td className="px-4 py-3 align-top min-w-0">
                      <AuditDetailCell row={a} onViewDetail={() => setDetailAudit(a)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal detalle de auditoría */}
      {detailAudit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-detail-title"
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-white shadow-xl overflow-hidden"
            style={{ borderColor: "var(--regu-gray-200)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--regu-gray-100)", backgroundColor: "var(--regu-gray-50)" }}>
              <h2 id="audit-detail-title" className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--regu-navy)" }}>
                {detailAudit.resource_type === "cifras" ? <Hash className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                Detalle del registro
              </h2>
              <button
                type="button"
                onClick={() => setDetailAudit(null)}
                className="rounded-lg p-2 hover:bg-white/80 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" style={{ color: "var(--regu-gray-600)" }} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="font-medium" style={{ color: "var(--regu-gray-500)" }}>Fecha</span>
                <span style={{ color: "var(--regu-gray-900)" }}>{formatDate(detailAudit.created_at)}</span>
                <span className="font-medium" style={{ color: "var(--regu-gray-500)" }}>Usuario</span>
                <span style={{ color: "var(--regu-gray-900)" }}>{detailAudit.user_name ?? detailAudit.user_email}</span>
                <span className="font-medium" style={{ color: "var(--regu-gray-500)" }}>Acción</span>
                <span style={{ color: "var(--regu-gray-900)" }}>{ACTION_LABELS[detailAudit.action] ?? detailAudit.action}</span>
                <span className="font-medium" style={{ color: "var(--regu-gray-500)" }}>Recurso</span>
                <span style={{ color: "var(--regu-gray-900)" }}>{RESOURCE_LABELS[detailAudit.resource_type] ?? detailAudit.resource_type}</span>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: "var(--regu-gray-100)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--regu-gray-500)" }}>Qué se registró</p>
                <div className="rounded-xl border p-4 text-sm leading-relaxed" style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-800)", backgroundColor: "var(--regu-gray-50)" }}>
                  {(() => {
                    const { sentence, lines, url } = formatAuditDetailSummary(detailAudit);
                    return (
                      <>
                        <p className="font-medium mb-2" style={{ color: "var(--regu-gray-900)" }}>{sentence}</p>
                        {lines.length > 0 && <div className="text-sm font-mono mt-2 space-y-0.5">{lines.map((line, i) => <p key={i} className={line.startsWith("  •") ? "pl-2" : ""}>{line}</p>)}</div>}
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[var(--regu-blue)] hover:underline break-all">
                            Abrir archivo
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: "var(--regu-gray-100)" }}>
              <button
                type="button"
                onClick={() => setDetailAudit(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{ backgroundColor: "var(--regu-blue)", color: "white" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
