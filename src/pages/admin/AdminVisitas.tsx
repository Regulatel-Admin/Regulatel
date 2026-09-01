import { useCallback, useEffect, useRef, useState } from "react";
import { BarChart3, Clock3, Eye, RefreshCw, Users } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLockedScreen, useAdminOnlySection } from "@/components/admin/AdminLockedScreen";

const TZ = "America/Santo_Domingo";
const REFRESH_MS = 15_000;

type PeriodCounts = { visitors: number; views: number };

type AnalyticsStats = {
  timezone: string;
  generatedAt?: string;
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

function dominicanParts(now: Date) {
  const map: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

function dominicanDateKey(now: Date) {
  const parts = dominicanParts(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function msUntilNextDominicanMidnight(now: Date) {
  const parts = dominicanParts(now);
  const elapsed =
    (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)) * 1000;
  return 24 * 60 * 60 * 1000 - elapsed;
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

function formatDominicanClock(now: Date) {
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

function formatAgo(from: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - from) / 1000));
  if (seconds < 4) return "ahora mismo";
  if (seconds < 60) return `hace ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "hace 1 min";
  return `hace ${minutes} min`;
}

function chartDayLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return { weekday: isoDate, dayMonth: "" };
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat("es-DO", { weekday: "short", timeZone: "UTC" })
    .format(date)
    .replace(".", "");
  return { weekday, dayMonth: `${day}/${month}` };
}

function VisitorsChart({ days }: { days: Array<{ date: string; visitors: number; views: number }> }) {
  const width = 840;
  const height = 240;
  const padL = 28;
  const padR = 12;
  const padT = 28;
  const padB = 44;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const max = Math.max(1, ...days.map((day) => day.visitors));
  const gap = 8;
  const barW = days.length ? (innerW - gap * (days.length - 1)) / days.length : innerW;
  const ticks = [0, 0.5, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Personas distintas que visitaron el sitio en los últimos 14 días"
    >
      {ticks.map((tick) => {
        const y = padT + innerH - tick * innerH;
        return (
          <g key={tick}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="rgba(22,61,89,0.12)" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#7E909E" fontSize="10">
              {Math.round(tick * max)}
            </text>
          </g>
        );
      })}
      {days.map((day, index) => {
        const barH = day.visitors > 0 ? Math.max(6, (day.visitors / max) * innerH) : 3;
        const x = padL + index * (barW + gap);
        const y = padT + innerH - barH;
        const label = chartDayLabel(day.date);
        return (
          <g key={day.date}>
            <rect
              x={x}
              y={y}
              width={Math.max(barW, 4)}
              height={barH}
              rx="5"
              fill={day.visitors > 0 ? "#4489C6" : "rgba(22,61,89,0.12)"}
            >
              <title>{`${formatDayLabel(day.date)}: ${day.visitors} personas, ${day.views} páginas`}</title>
            </rect>
            {day.visitors > 0 ? (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#163D59" fontSize="11" fontWeight="700">
                {day.visitors}
              </text>
            ) : null}
            <text x={x + barW / 2} y={height - 22} textAnchor="middle" fill="#7E909E" fontSize="10">
              {label.weekday}
            </text>
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fill="#7E909E" fontSize="10">
              {label.dayMonth}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
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

function DayResetClock({
  now,
  lastLoadedAt,
  refreshing,
  onRefresh,
}: {
  now: number;
  lastLoadedAt: number | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const remaining = msUntilNextDominicanMidnight(new Date(now));
  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white px-5 py-4"
      style={{ borderColor: "rgba(68,137,198,0.28)", background: "linear-gradient(180deg, #fff 0%, #f4f8fc 100%)" }}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
        >
          <Clock3 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>
            Reinicio de «Hoy»
          </p>
          <p className="mt-0.5 font-mono text-3xl font-bold tabular-nums leading-none" style={{ color: "var(--regu-navy)" }}>
            {formatCountdown(remaining)}
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
            A las 00:00 hora de República Dominicana. Ahora allá son las {formatDominicanClock(new Date(now))}.
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--regu-gray-500)" }}>
            Las visitas se cuentan al momento, cuando alguien abre el sitio público. Esta pantalla se refresca sola cada{" "}
            {REFRESH_MS / 1000} s
            {lastLoadedAt ? ` · última lectura ${formatAgo(lastLoadedAt, now)}` : ""}.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-60"
        style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Actualizando…" : "Actualizar ahora"}
      </button>
    </div>
  );
}

export default function AdminVisitas() {
  const { isChecking, allowed, locked } = useAdminOnlySection();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);
  const dominicanDay = dominicanDateKey(new Date(now));
  const seenDay = useRef(dominicanDay);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setRefreshing(true);
    const res = await api.admin.analytics.stats();
    if (res.ok) {
      setStats(res.data);
      setError(null);
      setLastLoadedAt(Date.now());
    } else {
      setError(res.error ?? "No se pudieron cargar las visitas.");
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    setLoading(true);
    void load();
    const poll = window.setInterval(() => {
      if (document.hidden) return;
      void load({ silent: true });
    }, REFRESH_MS);
    return () => window.clearInterval(poll);
  }, [allowed, load]);

  useEffect(() => {
    if (!allowed) return;
    if (seenDay.current === dominicanDay) return;
    seenDay.current = dominicanDay;
    void load({ silent: true });
  }, [allowed, dominicanDay, load]);

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
        Cifras reales del sitio público: cada persona anónima que abre una página. No hay números de prueba. No se guarda
        nombre, correo ni IP.
      </p>

      <DayResetClock
        now={now}
        lastLoadedAt={lastLoadedAt}
        refreshing={refreshing}
        onRefresh={() => void load({ silent: true })}
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading && !stats ? (
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

          <div className="mb-8 overflow-x-auto rounded-2xl border bg-white p-5" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                  Personas por día (14 días)
                </h2>
              </div>
              <p className="text-[11px]" style={{ color: "var(--regu-gray-500)" }}>
                Cada barra es un día real en hora de República Dominicana
              </p>
            </div>
            {stats.days.length ? <VisitorsChart days={stats.days} /> : (
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                Aún no hay días con visitas.
              </p>
            )}
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
