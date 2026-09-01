import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BarChart3, Clock3, Globe2, Link2, MonitorSmartphone, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLockedScreen, useAdminOnlySection } from "@/components/admin/AdminLockedScreen";

const TZ = "America/Santo_Domingo";
const REFRESH_MS = 15_000;

type PeriodCounts = { visitors: number; views: number };
type BreakdownRow = { key: string; visitors: number; views: number };
type RecentHit = {
  path: string;
  country: string | null;
  city: string | null;
  device: string | null;
  referrer: string | null;
  visitedAt: string;
};

type AnalyticsStats = {
  timezone: string;
  generatedAt?: string;
  today: PeriodCounts;
  yesterday: PeriodCounts;
  week: PeriodCounts;
  prevWeek: PeriodCounts;
  todayNew: number;
  todayReturning: number;
  days: Array<{ date: string; visitors: number; views: number }>;
  topPages: Array<{ path: string; views: number; visitors: number }>;
  countries: BreakdownRow[];
  unknownCountry?: PeriodCounts;
  referrers: BreakdownRow[];
  devices: BreakdownRow[];
  recent: RecentHit[];
};

function formatInt(n: number) {
  return new Intl.NumberFormat("es-DO").format(n);
}

function countPhrase(n: number, one: string, many: string) {
  return `${formatInt(n)} ${n === 1 ? one : many}`;
}

function countryLabel(code: string) {
  if (!code) return "—";
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function flagEmoji(code: string) {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code.toUpperCase()].map((ch) => 127397 + ch.charCodeAt(0)));
}

function deviceLabel(key: string) {
  if (key === "mobile") return "Celular";
  if (key === "tablet") return "Tableta";
  if (key === "desktop") return "Computadora";
  return key || "—";
}

function referrerLabel(key: string) {
  if (!key || key === "(directo)") return "Directo";
  return key;
}

function formatRecentTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-DO", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BreakdownList({
  rows,
  labelOf,
}: {
  rows: BreakdownRow[];
  labelOf: (key: string) => string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.visitors));
  if (!rows.length) {
    return (
      <p className="px-4 pb-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>
        Sin datos
      </p>
    );
  }
  return (
    <ul className="space-y-2.5 px-4 pb-4">
      {rows.map((row) => {
        const name = labelOf(row.key);
        return (
          <li key={row.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm font-medium" style={{ color: "var(--regu-navy)" }} title={name}>
                {name}
              </span>
              <span className="shrink-0 text-right text-xs tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                {countPhrase(row.visitors, "persona", "personas")} · {countPhrase(row.views, "página", "páginas")}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(22,61,89,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(8, Math.round((row.visitors / max) * 100))}%`, backgroundColor: "#4489C6" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatDayLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "0%";
  return `${pct > 0 ? "+" : ""}${pct}%`;
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

function chartAxisLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return { weekday: isoDate, dayMonth: "" };
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat("es-DO", { weekday: "short", timeZone: "UTC" })
    .format(date)
    .replace(".", "")
    .replace(/^\w/, (ch) => ch.toUpperCase());
  const monthShort = new Intl.DateTimeFormat("es-DO", { month: "short", timeZone: "UTC" })
    .format(date)
    .replace(".", "");
  return { weekday, dayMonth: `${String(day).padStart(2, "0")} ${monthShort}` };
}

function VisitorsChart({ days }: { days: Array<{ date: string; visitors: number; views: number }> }) {
  const todayKey = dominicanDateKey(new Date());
  const max = Math.max(1, ...days.map((day) => day.visitors));
  const barMaxH = 120;

  return (
    <div className="flex gap-3" role="img" aria-label="Personas distintas por día en los últimos 14 días">
      <div className="flex w-8 shrink-0 flex-col">
        <div className="h-5" />
        <div className="flex h-[120px] flex-col justify-between text-right text-[11px] tabular-nums" style={{ color: "#7E909E" }}>
          <span>{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-end gap-[2px]">
        {days.map((day) => {
          const label = chartAxisLabel(day.date);
          const barH = day.visitors > 0 ? Math.max(6, Math.round((day.visitors / max) * barMaxH)) : 3;
          const isToday = day.date === todayKey;
          return (
            <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex h-[140px] w-full flex-col items-center justify-end">
                <span className="mb-1 h-4 text-[11px] font-bold leading-none tabular-nums" style={{ color: "var(--regu-navy)" }}>
                  {day.visitors > 0 ? day.visitors : ""}
                </span>
                <div
                  className="w-full rounded-t-md"
                  title={`${formatDayLabel(day.date)}: ${day.visitors} personas, ${day.views} páginas`}
                  style={{
                    height: barH,
                    backgroundColor: day.visitors > 0 ? (isToday ? "#2F6FA8" : "#4489C6") : "rgba(22,61,89,0.12)",
                  }}
                />
              </div>
              <span className="mt-2 text-[11px] font-semibold leading-none" style={{ color: "var(--regu-navy)" }}>
                {label.weekday}
              </span>
              <span className="mt-1 text-[11px] leading-none" style={{ color: "var(--regu-gray-500)" }}>
                {label.dayMonth}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({
  label,
  visitors,
  views,
  delta,
  extra,
  accent,
}: {
  label: string;
  visitors: number;
  views: number;
  delta?: string | null;
  extra?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-white px-4 py-3"
      style={{
        borderColor: accent ? "rgba(68,137,198,0.35)" : "rgba(22,61,89,0.10)",
        background: accent ? "linear-gradient(180deg, #fff 0%, #f4f8fc 100%)" : "#fff",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--regu-gray-500)" }}>
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--regu-navy)" }}>
          {formatInt(visitors)}
        </p>
        {delta ? (
          <span className="text-xs font-semibold tabular-nums" style={{ color: delta.startsWith("-") ? "#B45309" : "#0F766E" }}>
            {delta}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
        {countPhrase(views, "página", "páginas")}
        {extra ? ` · ${extra}` : ""}
      </p>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
      <div className="flex items-center gap-2 px-4 py-3">
        {icon}
        <h2 className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
          {title}
        </h2>
      </div>
      {children}
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
  const dominicanDay = dominicanDateKey(new Date(now));
  const seenDay = useRef(dominicanDay);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setRefreshing(true);
    const res = await api.admin.analytics.stats();
    if (res.ok) {
      setStats({
        ...res.data,
        todayNew: res.data.todayNew ?? 0,
        todayReturning: res.data.todayReturning ?? 0,
        countries: res.data.countries ?? [],
        unknownCountry: res.data.unknownCountry ?? { visitors: 0, views: 0 },
        referrers: res.data.referrers ?? [],
        devices: res.data.devices ?? [],
        recent: res.data.recent ?? [],
      });
      setError(null);
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

  const countries = (stats?.countries ?? []).filter((row) => row.key);
  const referrers = (stats?.referrers ?? []).filter((row) => {
    const key = row.key.toLowerCase();
    return !key.includes("localhost") && key !== "127.0.0.1";
  });
  const devices = stats?.devices ?? [];
  const recent = stats?.recent ?? [];
  const remaining = msUntilNextDominicanMidnight(new Date(now));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Visitas
        </h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
            <Clock3 className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />
            Reinicio {formatCountdown(remaining)}
          </span>
          <button
            type="button"
            onClick={() => void load({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-60"
            style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading && !stats ? (
        <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Cargando…
        </p>
      ) : stats ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Hoy"
              visitors={stats.today.visitors}
              views={stats.today.views}
              delta={pctChange(stats.today.visitors, stats.yesterday.visitors)}
              extra={`${formatInt(stats.todayNew)} nuevas · ${formatInt(stats.todayReturning)} recurrentes`}
              accent
            />
            <Kpi
              label="Ayer"
              visitors={stats.yesterday.visitors}
              views={stats.yesterday.views}
            />
            <Kpi
              label="7 días"
              visitors={stats.week.visitors}
              views={stats.week.views}
              delta={pctChange(stats.week.visitors, stats.prevWeek.visitors)}
            />
            <Kpi
              label="Semana previa"
              visitors={stats.prevWeek.visitors}
              views={stats.prevWeek.views}
            />
          </div>

          <div className="mb-4 rounded-xl border bg-white p-4" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                  Personas por día
                </h2>
              </div>
              <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                Últimos 14 días
              </p>
            </div>
            {stats.days.length ? <VisitorsChart days={stats.days} /> : (
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Sin datos</p>
            )}
          </div>

          <div className={`mb-4 grid items-start gap-3 ${countries.length ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
            {countries.length > 0 ? (
              <Panel title="Países" icon={<Globe2 className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />}>
                <BreakdownList
                  rows={countries}
                  labelOf={(key) => `${flagEmoji(key)} ${countryLabel(key)}`.trim()}
                />
              </Panel>
            ) : null}
            <Panel title="Origen" icon={<Link2 className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />}>
              <BreakdownList rows={referrers} labelOf={referrerLabel} />
            </Panel>
            <Panel title="Dispositivo" icon={<MonitorSmartphone className="h-4 w-4" style={{ color: "var(--regu-blue)" }} />}>
              <BreakdownList rows={devices} labelOf={deviceLabel} />
            </Panel>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-2">
            <Panel title="Actividad reciente">
              {recent.length === 0 ? (
                <p className="px-4 pb-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>Sin datos</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead style={{ backgroundColor: "#FAFBFC", color: "var(--regu-gray-500)" }}>
                    <tr>
                      <th className="px-4 py-2 text-xs font-semibold">Hora</th>
                      <th className="px-4 py-2 text-xs font-semibold">Página</th>
                      <th className="px-4 py-2 text-xs font-semibold">País</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.slice(0, 10).map((hit, index) => (
                      <tr key={`${hit.visitedAt}-${hit.path}-${index}`} className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        <td className="whitespace-nowrap px-4 py-2 text-xs tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                          {formatRecentTime(hit.visitedAt)}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-2 font-medium" style={{ color: "var(--regu-navy)" }}>
                          {hit.path === "/" ? "Portada" : hit.path}
                        </td>
                        <td className="px-4 py-2 text-xs" style={{ color: "var(--regu-gray-600)" }}>
                          {hit.country
                            ? `${flagEmoji(hit.country)} ${countryLabel(hit.country)}${hit.city ? `, ${hit.city}` : ""}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
            <Panel title="Páginas más vistas">
              {stats.topPages.length === 0 ? (
                <p className="px-4 pb-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>Sin datos</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead style={{ backgroundColor: "#FAFBFC", color: "var(--regu-gray-500)" }}>
                    <tr>
                      <th className="px-4 py-2 text-xs font-semibold">Página</th>
                      <th className="px-4 py-2 text-xs font-semibold">Personas</th>
                      <th className="px-4 py-2 text-xs font-semibold">Páginas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages.slice(0, 10).map((page) => (
                      <tr key={page.path} className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        <td className="max-w-[220px] truncate px-4 py-2 font-medium" style={{ color: "var(--regu-navy)" }}>
                          {page.path === "/" ? "Portada" : page.path}
                        </td>
                        <td className="px-4 py-2 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                          {formatInt(page.visitors)}
                        </td>
                        <td className="px-4 py-2 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                          {formatInt(page.views)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
