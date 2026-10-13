import { useCallback, useEffect, useState } from "react";
import { Check, Inbox, RefreshCw, X } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLockedScreen, useAdminOnlySection } from "@/components/admin/AdminLockedScreen";

type ReviewStatus = "pending" | "sending" | "approved" | "discarded" | "failed";
type ReviewMessage = {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  message: string;
  reasons: string[];
  status: ReviewStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  last_error: string | null;
};
const statusLabels: Record<ReviewStatus, string> = {
  pending: "Pendiente de revisión",
  sending: "Envío en curso",
  approved: "Aprobado y enviado",
  discarded: "Descartado",
  failed: "Entrega sin confirmar",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
}

export default function ContactMessages() {
  const { isChecking, allowed, locked } = useAdminOnlySection();
  const [items, setItems] = useState<ReviewMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.admin.contactMessages.list(filter, 50, offset);
    setLoading(false);
    if (res.ok) {
      setItems(res.data.items);
      setTotal(res.data.total);
      setError(null);
    } else setError(res.error || "No se pudieron cargar los mensajes.");
  }, [filter, offset]);

  useEffect(() => { if (allowed) void load(); }, [allowed, load]);

  const review = async (id: string, action: "approve" | "discard") => {
    setWorkingId(id);
    setNotice(null);
    setError(null);
    const res = action === "approve" ? await api.admin.contactMessages.approve(id) : await api.admin.contactMessages.discard(id);
    await load();
    setWorkingId(null);
    if (res.ok) setNotice(action === "approve" ? "Mensaje aprobado y enviado a Secretaría." : "Mensaje descartado. Se conserva en el historial.");
    else setError(res.error || "No se pudo completar la revisión.");
  };

  if (isChecking) return null;
  if (locked) return <AdminLockedScreen title="Mensajes de contacto" />;
  if (!allowed) return null;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>Mensajes de contacto</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>
        Los mensajes con señales de spam esperan aquí. Revise el contenido antes de enviarlo a Secretaría. También se conserva el historial de los mensajes enviados y descartados.
      </p>
      <p className="mb-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>Si hubo un problema con el correo, consulte <strong>Entrega sin confirmar</strong> y compruebe la entrega con el proveedor antes de reenviar.</p>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-700)" }}>
          Estado
          <select value={filter} onChange={(e) => { setFilter(e.target.value as ReviewStatus | "all"); setOffset(0); }} className="rounded-lg border bg-white px-3 py-2" disabled={!!workingId}>
            <option value="pending">Pendientes</option>
            <option value="all">Todos</option>
            <option value="approved">Aprobados</option>
            <option value="discarded">Descartados</option>
            <option value="sending">Envío en curso</option>
            <option value="failed">Entrega sin confirmar</option>
          </select>
        </label>
        <button type="button" onClick={() => void load()} disabled={loading || !!workingId} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden /> Actualizar
        </button>
        <span className="text-sm" style={{ color: "var(--regu-gray-500)" }}>{total} mensajes</span>
      </div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}
      {loading && <p className="mb-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>Cargando mensajes…</p>}
      {!loading && items.length === 0 && <div className="rounded-2xl border bg-white px-6 py-10 text-center" style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-gray-500)" }}><Inbox className="mx-auto mb-3 h-7 w-7" aria-hidden />No hay mensajes en este estado.</div>}
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold" style={{ color: "var(--regu-navy)" }}>{item.subject}</h2>
                <p className="break-words text-sm" style={{ color: "var(--regu-gray-700)" }}>{item.name} · {item.email}{item.organization ? ` · ${item.organization}` : ""}</p>
                <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>{formatDate(item.created_at)}</p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: "var(--regu-navy)", backgroundColor: "rgba(68,137,198,0.10)" }}>{statusLabels[item.status]}</span>
            </div>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="mb-1 font-semibold">Motivo de revisión</p>
              {item.reasons.map((reason, index) => <p key={index}>{reason}</p>)}
            </div>
            <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>{item.message}</p>
            {item.last_error && <p className="mb-4 text-sm text-red-700">{item.last_error}</p>}
            {item.status === "sending" && <p className="mb-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>Si este estado continúa, compruebe la entrega con el proveedor antes de reenviar el mensaje.</p>}
            {item.reviewed_at && <p className="mb-3 text-xs" style={{ color: "var(--regu-gray-500)" }}>{item.reviewed_by === "system:public-contact" ? "Procesado automáticamente" : "Revisado"} el {formatDate(item.reviewed_at)}</p>}
            {(item.status === "pending" || item.status === "failed") && <div className="flex flex-wrap gap-2">
              {item.status === "pending" && <button type="button" disabled={!!workingId} onClick={() => void review(item.id, "approve")} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--regu-blue)" }}><Check className="h-4 w-4" aria-hidden />{workingId === item.id ? "Procesando…" : "Aprobar y enviar"}</button>}
              <button type="button" disabled={!!workingId} onClick={() => void review(item.id, "discard")} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-red-700 disabled:opacity-50"><X className="h-4 w-4" aria-hidden />Descartar</button>
            </div>}
          </article>
        ))}
      </div>
      {total > 50 && <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <button type="button" disabled={offset === 0 || loading || !!workingId} onClick={() => setOffset(Math.max(0, offset - 50))} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-50">Anterior</button>
        <span style={{ color: "var(--regu-gray-500)" }}>{offset + 1}–{Math.min(offset + 50, total)} de {total}</span>
        <button type="button" disabled={offset + 50 >= total || loading || !!workingId} onClick={() => setOffset(offset + 50)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-50">Siguiente</button>
      </div>}
    </div>
  );
}
