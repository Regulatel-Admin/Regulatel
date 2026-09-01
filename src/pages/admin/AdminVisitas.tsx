import { useCallback, useEffect, useRef, useState } from "react";
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

function countryLabel(code: string) {
  if (!code) return "Sin país";
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
  return key || "Sin dato";
}

function referrerLabel(key: string) {
  if (!key || key === "(directo)") return "Entrada directa";
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
  empty,
}: {
  rows: BreakdownRow[];
  labelOf: (key: string) => string;
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.visitors));
  if (!rows.length) {
    return (
      <p className="px-3 pb-3 text-xs" style={{ color: "var(--regu-gray-500)" }}>
        {empty}
      </p>
    );
  }
  return (
    <ul className="space-y-2 px-3 pb-3">
      {rows.map((row) => {
        const name = labelOf(row.key);
        return (
          <li key={row.key}>
            <div className="mb-0.5 flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0 font-medium leading-snug" style={{ color: "var(--regu-navy)" }} title={name}>
                {name}
              </span>
              <span className="shrink-0 text-right leading-snug tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                <span className="block font-semibold" style={{ color: "var(--regu-navy)" }}>
                  {formatInt(row.visitors)} personas
                </span>
                <span className="block text-[10px]">{formatInt(row.views)} páginas</span>
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

function changeLabel(current: number, previous: number) {
  if (previous === 0 && current === 0) return "sin movimiento";
  if (previous === 0) return "sin cifra previa";
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "igual";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
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
  if (seconds < 4) return "ahora";
  if (seconds < 60) return `hace ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "hace 1 min";
  return `hace ${minutes} min`;
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
  const barMaxH = 112;

  return (
    <div>
      <div className="flex gap-2" role="img" aria-label="Personas distintas por día en los últimos 14 días">
        <div className="flex w-7 shrink-0 flex-col">
          <div className="h-4" />
          <div
            className="flex h-[112px] flex-col justify-between text-right text-[10px] leading-none"
            style={{ color: "#7E909E" }}
          >
            <span>{max}</span>
            <span>{Math.round(max / 2)}</span>
            <span>0</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-end gap-[3px]">
          {days.map((day) => {
            const label = chartAxisLabel(day.date);
            const barH = day.visitors > 0 ? Math.max(6, Math.round((day.visitors / max) * barMaxH)) : 3;
            const isToday = day.date === todayKey;
            return (
              <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex h-[128px] w-full flex-col items-center justify-end">
                  {day.visitors > 0 ? (
                    <span className="mb-0.5 text-[11px] font-bold leading-none tabular-nums" style={{ color: "var(--regu-navy)" }}>
                      {day.visitors}
                    </span>
                  ) : (
                    <span className="mb-0.5 h-[11px]" />
                  )}
                  <div
                    className="w-full rounded-t-md"
                    title={`${formatDayLabel(day.date)}: ${day.visitors} personas distintas, ${day.views} páginas vistas`}
                    style={{
                      height: barH,
                      backgroundColor: day.visitors > 0 ? (isToday ? "#2F6FA8" : "#4489C6") : "rgba(22,61,89,0.12)",
                    }}
                  />
                </div>
                <span className="mt-1.5 text-[10px] font-semibold leading-none" style={{ color: "var(--regu-navy)" }}>
                  {label.weekday}
                </span>
                <span className="mt-0.5 text-[10px] leading-none" style={{ color: "var(--regu-gray-500)" }}>
                  {label.dayMonth}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-[10px]" style={{ color: "var(--regu-gray-500)" }}>
        El número encima de cada barra es cuántas personas distintas hubo ese día. Pasa el cursor para ver las páginas
        vistas.
      </p>
    </div>
  );
}

function MiniStat({
  label,
  visitors,
  views,
  hint,
  accent,
}: {
  label: string;
  visitors: number;
  views: number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg border bg-white px-3 py-2"
      style={{
        borderColor: accent ? "rgba(68,137,198,0.35)" : "rgba(22,61,89,0.10)",
        background: accent ? "linear-gradient(180deg, #fff 0%, #f4f8fc 100%)" : "#fff",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--regu-gray-500)" }}>
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold leading-none tabular-nums" style={{ color: "var(--regu-navy)" }}>
        {formatInt(visitors)}
      </p>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: "var(--regu-gray-600)" }}>
        personas distintas
      </p>
      <p className="text-[11px] leading-snug" style={{ color: "var(--regu-gray-600)" }}>
        {formatInt(views)} páginas vistas · {hint}
      </p>
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
  const countries = (stats?.countries ?? []).filter((row) => row.key);
  const referrers = stats?.referrers ?? [];
  const devices = stats?.devices ?? [];
  const recent = stats?.recent ?? [];
  const todayNew = stats?.todayNew ?? 0;
  const todayReturning = stats?.todayReturning ?? 0;
  const unknownCountry = stats?.unknownCountry ?? { visitors: 0, views: 0 };
  const remaining = msUntilNextDominicanMidnight(new Date(now));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--regu-gray-900)" }}>
            Visitas
          </h1>
          <p className="mt-0.5 max-w-2xl text-[11px] leading-snug" style={{ color: "var(--regu-gray-500)" }}>
            Una persona = un navegador con cookie de un año. Cerrar y volver a entrar en la misma PC no suma otra
            persona. El país se detecta en el servidor, sin guardar IP.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load({ silent: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold disabled:opacity-60"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      <div
        className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-xs"
        style={{ borderColor: "rgba(68,137,198,0.28)", background: "#f7fbfe" }}
      >
        <span className="inline-flex items-center gap-1.5" style={{ color: "var(--regu-navy)" }}>
          <Clock3 className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />
          Hoy se reinicia en{" "}
          <span className="font-mono font-bold tabular-nums">{formatCountdown(remaining)}</span>
          <span style={{ color: "var(--regu-gray-500)" }}>({formatDominicanClock(new Date(now))} RD)</span>
        </span>
        <span style={{ color: "var(--regu-gray-500)" }}>
          {lastLoadedAt ? `Lectura ${formatAgo(lastLoadedAt, now)}` : "Leyendo…"}
        </span>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p>
      )}

      {loading && !stats ? (
        <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
          Cargando…
        </p>
      ) : stats ? (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <MiniStat
              label="Hoy"
              visitors={stats.today.visitors}
              views={stats.today.views}
              hint={changeLabel(stats.today.visitors, stats.yesterday.visitors)}
              accent
            />
            <MiniStat
              label="7 días"
              visitors={stats.week.visitors}
              views={stats.week.views}
              hint={changeLabel(stats.week.visitors, stats.prevWeek.visitors)}
            />
            <MiniStat
              label="Ayer"
              visitors={stats.yesterday.visitors}
              views={stats.yesterday.views}
              hint={`${formatInt(todayNew)} nuevas hoy`}
            />
            <MiniStat
              label="Semana previa"
              visitors={stats.prevWeek.visitors}
              views={stats.prevWeek.views}
              hint={`${formatInt(todayReturning)} ya conocían el sitio`}
            />
          </div>

          {empty && (
            <p
              className="mb-3 rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: "rgba(22,61,89,0.10)", color: "var(--regu-gray-600)", backgroundColor: "#FAFBFC" }}
            >
              Todavía no hay visitas del sitio público.
            </p>
          )}

          <div className="mb-3 rounded-lg border bg-white p-2.5" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />
                <h2 className="text-xs font-bold" style={{ color: "var(--regu-navy)" }}>
                  Personas por día
                </h2>
              </div>
              <p className="text-[10px]" style={{ color: "var(--regu-gray-500)" }}>
                14 días, hora de República Dominicana
              </p>
            </div>
            {stats.days.length ? (
              <VisitorsChart days={stats.days} />
            ) : (
              <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                Aún no hay días con visitas.
              </p>
            )}
          </div>

          <div className="mb-3 grid items-start gap-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <div className="flex items-center gap-1.5 px-3 py-2">
                <Globe2 className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />
                <h2 className="text-xs font-bold" style={{ color: "var(--regu-navy)" }}>
                  Países
                </h2>
              </div>
              <BreakdownList
                rows={countries}
                labelOf={(key) => `${flagEmoji(key)} ${countryLabel(key)}`}
                empty="Aún no hay países. No se puede recuperar el de las visitas viejas: no se guardó. Las nuevas sí salen aquí."
              />
              {unknownCountry.visitors > 0 ? (
                <p className="border-t px-3 py-2 text-[10px]" style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-gray-500)" }}>
                  {formatInt(unknownCountry.visitors)} personas de esta semana todavía sin país. Si vuelven a entrar, se
                  completa.
                </p>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <div className="flex items-center gap-1.5 px-3 py-2">
                <Link2 className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />
                <h2 className="text-xs font-bold" style={{ color: "var(--regu-navy)" }}>
                  De dónde llegaron
                </h2>
              </div>
              <BreakdownList rows={referrers} labelOf={referrerLabel} empty="Aún no hay procedencias." />
            </div>
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <div className="flex items-center gap-1.5 px-3 py-2">
                <MonitorSmartphone className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />
                <h2 className="text-xs font-bold" style={{ color: "var(--regu-navy)" }}>
                  Dispositivo
                </h2>
              </div>
              <BreakdownList rows={devices} labelOf={deviceLabel} empty="Aún no hay tipo de aparato." />
            </div>
          </div>

          <div className="grid items-start gap-2 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <div className="px-3 py-2">
                <h2 className="text-xs font-bold" style={{ color: "var(--regu-navy)" }}>
                  Actividad reciente
                </h2>
              </div>
              {recent.length === 0 ? (
                <p className="px-3 pb-3 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                  Todavía no hay actividad.
                </p>
              ) : (
                <table className="w-full text-left text-[11px]">
                  <thead style={{ backgroundColor: "#FAFBFC", color: "var(--regu-gray-500)" }}>
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Cuándo</th>
                      <th className="px-3 py-1.5 font-semibold">Página</th>
                      <th className="px-3 py-1.5 font-semibold">País</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.slice(0, 10).map((hit, index) => (
                      <tr key={`${hit.visitedAt}-${hit.path}-${index}`} className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        <td className="whitespace-nowrap px-3 py-1.5 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                          {formatRecentTime(hit.visitedAt)}
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-1.5 font-medium" style={{ color: "var(--regu-navy)" }}>
                          {hit.path === "/" ? "Portada" : hit.path}
                        </td>
                        <td className="px-3 py-1.5" style={{ color: "var(--regu-gray-600)" }}>
                          {hit.country
                            ? `${flagEmoji(hit.country)} ${countryLabel(hit.country)}${hit.city ? ` · ${hit.city}` : ""}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <div className="px-3 py-2">
                <h2 className="text-xs font-bold" style={{ color: "var(--regu-navy)" }}>
                  Páginas más vistas
                </h2>
              </div>
              {stats.topPages.length === 0 ? (
                <p className="px-3 pb-3 text-xs" style={{ color: "var(--regu-gray-500)" }}>
                  Aún no hay páginas con visitas.
                </p>
              ) : (
                <table className="w-full text-left text-[11px]">
                  <thead style={{ backgroundColor: "#FAFBFC", color: "var(--regu-gray-500)" }}>
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Página</th>
                      <th className="px-3 py-1.5 font-semibold">Personas distintas</th>
                      <th className="px-3 py-1.5 font-semibold">Páginas vistas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages.slice(0, 10).map((page) => (
                      <tr key={page.path} className="border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        <td className="max-w-[180px] truncate px-3 py-1.5 font-medium" style={{ color: "var(--regu-navy)" }}>
                          {page.path === "/" ? "Portada" : page.path}
                        </td>
                        <td className="px-3 py-1.5 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                          {formatInt(page.visitors)}
                        </td>
                        <td className="px-3 py-1.5 tabular-nums" style={{ color: "var(--regu-gray-600)" }}>
                          {formatInt(page.views)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
