import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Users } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLockedScreen, useAdminOnlySection } from "@/components/admin/AdminLockedScreen";

type PeriodCounts = { visitors: number; views: number };

type AnalyticsStats = {
  timezone: string;
  today: PeriodCounts;
  yesterday: PeriodCounts;
  week: PeriodCounts;
  prevWeek: PeriodCounts;
  days: Array<{ date: string; visitors: number; views: number }>;
  topPages: Array<{ path: string; views: number; visitors: number }>;
};

function formatInt(n: number) {
  return new Intl.NumberFormat("es-DO").format(n);
}

function formatDayLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
}

function changeLabel(current: number, previous: number) {
  if (previous === 0 && current === 0) return "Sin movimiento";
  if (previous === 0) return "Sin cifra del periodo anterior";
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "Igual que el periodo anterior";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% respecto al periodo anterior`;
}

function StatCard({
  title,
  visitors,
  views,
  compare,
  accent,
}: {
  title: string;
  visitors: number;
  views: number;
  compare: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{
        borderColor: accent ? "rgba(68,137,198,0.35)" : "rgba(22,61,89,0.10)",
        background: accent ? "linear-gradient(180deg, #fff 0%, #f4f8fc 100%)" : "#fff",
      }}
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>
        {title}
      </p>
      <p className="mt-2 text-4xl font-bold tabular-nums" style={{ color: "var(--regu-navy)" }}>
        {formatInt(visitors)}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
        personas distintas · {formatInt(views)} páginas vistas
      </p>
      <p className="mt-3 text-xs" style={{ color: "var(--regu-gray-500)" }}>
        {compare}
      </p>
    </div>
  );
}

export default function AdminVisitas() {
  const { isChecking, allowed, locked } = useAdminOnlySection();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api.admin.analytics.stats();
    if (res.ok) {
      setStats(res.data);
      setError(null);
    } else {
      setError(res.error ?? "No se pudieron cargar las visitas.");
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [allowed, load]);

  const maxVisitors = useMemo(() => {
    if (!stats?.days.length) return 1;
    return Math.max(1, ...stats.days.map((day) => day.visitors));
  }, [stats]);

  if (isChecking) return null;
  if (locked) return <AdminLockedScreen title="Visitas" />;
  if (!allowed) return null;

  const empty = !loading && !error && stats && stats.week.views === 0 && stats.today.views === 0;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Visitas
      </h1>
      <p className="mb-6 max-w-2xl text-sm" style={{ color: "var(--regu-gray-500)" }}>
        Cuántas personas distintas abrieron el sitio público. No se guarda nombre, correo ni IP: solo un número anónimo
        y la página que vieron. El día empieza a las 00:00 hora de República Dominicana.
      </p>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Cargando…
        </p>
      ) : stats ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <StatCard
              title="Hoy"
              visitors={stats.today.visitors}
              views={stats.today.views}
              compare={changeLabel(stats.today.visitors, stats.yesterday.visitors)}
              accent
            />
            <StatCard
              title="Últimos 7 días"
              visitors={stats.week.visitors}
              views={stats.week.views}
              compare={changeLabel(stats.week.visitors, stats.prevWeek.visitors)}
            />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div
              className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm"
              style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-navy)" }}
            >
              <Users className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              Ayer: {formatInt(stats.yesterday.visitors)} personas · {formatInt(stats.yesterday.views)} páginas
            </div>
            <div
              className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm"
              style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-navy)" }}
            >
              <Eye className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              Semana previa: {formatInt(stats.prevWeek.visitors)} personas · {formatInt(stats.prevWeek.views)} páginas
            </div>
          </div>

          {empty && (
            <p
              className="mb-6 rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-gray-600)", backgroundColor: "#FAFBFC" }}
            >
              Todavía no hay visitas registradas. Los números empiezan a contar desde ahora, cuando alguien abre el sitio
              público (no el panel de administración).
            </p>
          )}

          <div className="mb-8 overflow-hidden rounded-2xl border bg-white p-5" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                Personas por día (14 días)
              </h2>
            </div>
            <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label="Personas distintas que visitaron el sitio en los últimos 14 días">
              {stats.days.map((day) => {
                const height = Math.max(day.visitors > 0 ? 8 : 2, Math.round((day.visitors / maxVisitors) * 100));
                return (
                  <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                      {day.visitors || ""}
                    </span>
                    <div
                      className="w-full max-w-8 rounded-t-md"
                      title={`${formatDayLabel(day.date)}: ${day.visitors} personas, ${day.views} páginas`}
                      style={{
                        height: `${height}%`,
                        backgroundColor: day.visitors > 0 ? "var(--regu-blue)" : "rgba(22,61,89,0.12)",
                      }}
                    />
                    <span className="w-full truncate text-center text-[10px] capitalize" style={{ color: "var(--regu-gray-500)" }}>
                      {formatDayLabel(day.date).replace(".", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
            <div className="px-5 py-4">
              <h2 className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                Páginas más vistas (7 días)
              </h2>
            </div>
            {stats.topPages.length === 0 ? (
              <p className="px-5 pb-5 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Aún no hay páginas con visitas.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead style={{ backgroundColor: "#FAFBFC", color: "var(--regu-gray-500)" }}>
                  <tr>
                    <th className="px-5 py-3 font-semibold">Página</th>
                    <th className="px-5 py-3 font-semibold">Personas</th>
                    <th className="px-5 py-3 font-semibold">Vistas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPages.map((page) => (
                    <tr key={page.path} className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                      <td className="px-5 py-3 font-medium" style={{ color: "var(--regu-navy)" }}>
                        {page.path === "/" ? "Portada" : page.path}
                      </td>
                      <td className="px-5 py-3 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                        {formatInt(page.visitors)}
                      </td>
                      <td className="px-5 py-3 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                        {formatInt(page.views)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
