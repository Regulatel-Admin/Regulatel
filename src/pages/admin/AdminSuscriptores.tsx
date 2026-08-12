import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";

type Subscriber = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AdminSuscriptores() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api.admin.subscribers.list();
    if (res.ok) {
      setItems(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } else {
      setError(res.error ?? "No se pudo cargar la lista.");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  const handleUnsubscribe = async (id: string) => {
    setWorkingId(id);
    const res = await api.admin.subscribers.unsubscribe(id);
    setWorkingId(null);
    if (res.ok) {
      await load();
    } else {
      setError(res.error ?? "No se pudo dar de baja.");
    }
  };

  const activeCount = items.filter((item) => !item.unsubscribed_at).length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Suscriptores
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--regu-gray-500)" }}>
        Personas inscritas en <strong>Suscribirse a actualizaciones</strong>. Reciben un correo cuando se publica una noticia o un evento.
      </p>

      <div
        className="mb-6 inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm"
        style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-navy)" }}
      >
        <Bell className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
        {activeCount} activos · {items.length} en total
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
        {loading ? (
          <p className="px-5 py-8 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Cargando…
          </p>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Todavía no hay suscriptores.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead style={{ backgroundColor: "#FAFBFC", color: "var(--regu-gray-500)" }}>
              <tr>
                <th className="px-5 py-3 font-semibold">Correo</th>
                <th className="px-5 py-3 font-semibold">Alta</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--regu-navy)" }}>
                    {item.email}
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--regu-gray-600)" }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    {item.unsubscribed_at ? (
                      <span style={{ color: "var(--regu-gray-500)" }}>Dado de baja</span>
                    ) : (
                      <span style={{ color: "var(--regu-blue)" }}>Activo</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!item.unsubscribed_at && (
                      <button
                        type="button"
                        onClick={() => void handleUnsubscribe(item.id)}
                        disabled={workingId === item.id}
                        className="text-xs font-semibold disabled:opacity-60"
                        style={{ color: "#b91c1c" }}
                      >
                        {workingId === item.id ? "…" : "Dar de baja"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
