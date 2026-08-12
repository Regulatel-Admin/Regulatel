import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { History, Search, X, ExternalLink, ArrowRight } from "lucide-react";
import {
  ACTION_LABELS,
  actionTone,
  actorInitials,
  actorName,
  auditFacts,
  auditHeadline,
  dayLabel,
  formatAuditDate,
  relativeAuditTime,
  resourceLabel,
  type AuditRow,
} from "@/lib/auditDisplay";

const FILTERS = [
  { id: "all", label: "Todo" },
  { id: "updated", label: "Guardó" },
  { id: "created", label: "Creó" },
  { id: "deleted", label: "Eliminó" },
  { id: "uploaded", label: "Subió" },
] as const;

export default function AdminAuditLog({
  items,
  loading,
  compact = false,
}: {
  items: AuditRow[];
  loading: boolean;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = items.filter((row) => {
      if (filter !== "all" && row.action !== filter) return false;
      if (!needle) return true;
      const haystack = [
        actorName(row),
        row.user_email,
        auditHeadline(row),
        resourceLabel(row),
        row.resource_id ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
    return compact ? next.slice(0, 6) : next;
  }, [items, query, filter, compact]);

  const groups = useMemo(() => {
    const map = new Map<string, AuditRow[]>();
    for (const row of filtered) {
      const label = dayLabel(row.created_at);
      const list = map.get(label) ?? [];
      list.push(row);
      map.set(label, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--regu-navy)" }}>
              <History className="h-5 w-5" style={{ color: "var(--regu-blue)" }} />
              {compact ? "Lo último que pasó" : "Actividad del sitio"}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
              {compact
                ? "Los cambios más recientes del equipo."
                : "Quién cambió qué, en lenguaje claro. Pulsa una fila para ver el detalle."}
            </p>
          </div>
          {compact ? (
            <Link
              to="/admin/usuarios"
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--regu-blue)" }}
            >
              Ver todo
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
            >
              {filtered.length} {filtered.length === 1 ? "cambio" : "cambios"}
            </span>
          )}
        </div>

        {!compact && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--regu-gray-400)" }} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar persona, noticia, sección…"
              className="w-full rounded-xl border bg-[rgba(22,61,89,0.02)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--regu-blue)]"
              style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-navy)" }}
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                style={
                  filter === item.id
                    ? { backgroundColor: "var(--regu-navy)", color: "white" }
                    : { backgroundColor: "rgba(22,61,89,0.06)", color: "var(--regu-gray-700)" }
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        )}
      </div>

      {loading ? (
        <p className="px-6 py-10 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Cargando actividad…
        </p>
      ) : filtered.length === 0 ? (
        <p className="px-6 py-10 text-sm" style={{ color: "var(--regu-gray-500)" }}>
          {items.length === 0 ? "Todavía no hay actividad registrada." : "Ningún cambio coincide con esa búsqueda."}
        </p>
      ) : (
        <div className={`${compact ? "max-h-[28rem]" : "max-h-[36rem]"} overflow-y-auto px-4 py-4 sm:px-6`}>
          {groups.map(([label, rows]) => (
            <div key={label} className="mb-6 last:mb-0">
              <p
                className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--regu-gray-400)" }}
              >
                {label}
              </p>
              <ol className="relative space-y-2 border-l-2 pl-5" style={{ borderColor: "rgba(68,137,198,0.22)" }}>
                {rows.map((row) => {
                  const tone = actionTone(row.action);
                  return (
                    <li key={row.id} className="relative">
                      <span
                        className="absolute -left-[1.45rem] top-5 h-2.5 w-2.5 rounded-full ring-4 ring-white"
                        style={{ backgroundColor: tone.dot }}
                      />
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="flex w-full items-start gap-3 rounded-2xl border bg-[rgba(22,61,89,0.015)] px-3 py-3 text-left transition hover:border-[rgba(68,137,198,0.45)] hover:bg-white hover:shadow-sm"
                        style={{ borderColor: "rgba(22,61,89,0.08)" }}
                      >
                        <span
                          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ backgroundColor: "rgba(68,137,198,0.16)", color: "var(--regu-navy)" }}
                        >
                          {actorInitials(row)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug" style={{ color: "var(--regu-navy)" }}>
                            {auditHeadline(row)}
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              style={{ backgroundColor: tone.bg, color: tone.fg }}
                            >
                              {ACTION_LABELS[row.action] ?? row.action}
                            </span>
                            <span className="text-[12px]" style={{ color: "var(--regu-gray-500)" }}>
                              {resourceLabel(row)}
                            </span>
                            <span className="text-[12px]" style={{ color: "var(--regu-gray-400)" }} title={formatAuditDate(row.created_at)}>
                              {relativeAuditTime(row.created_at)}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}

      {selected && <AuditDetailDrawer row={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function AuditDetailDrawer({ row, onClose }: { row: AuditRow; onClose: () => void }) {
  const tone = actionTone(row.action);
  const facts = auditFacts(row);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ backgroundColor: "rgba(15, 32, 48, 0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-title"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b px-6 py-5" style={{ borderColor: "rgba(22,61,89,0.08)", background: "linear-gradient(180deg, rgba(68,137,198,0.10), #fff 70%)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-blue)" }}>
                Detalle del cambio
              </p>
              <h2 id="audit-detail-title" className="mt-2 text-xl font-bold leading-snug" style={{ color: "var(--regu-navy)" }}>
                {auditHeadline(row)}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-white/80"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" style={{ color: "var(--regu-gray-600)" }} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: tone.bg, color: tone.fg }}
            >
              {ACTION_LABELS[row.action] ?? row.action}
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "rgba(22,61,89,0.08)", color: "var(--regu-navy)" }}
            >
              {resourceLabel(row)}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: "rgba(68,137,198,0.16)", color: "var(--regu-navy)" }}
            >
              {actorInitials(row)}
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
                {actorName(row)}
              </p>
              <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
                {row.user_email}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-400)" }}>
              Cuándo
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--regu-navy)" }}>
              {formatAuditDate(row.created_at)}
            </p>
            <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
              {relativeAuditTime(row.created_at)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-400)" }}>
              Qué se guardó
            </p>
            {facts.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
                No hay más detalle que el resumen de arriba.
              </p>
            ) : (
              <dl className="space-y-2">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-xl border px-3 py-2.5"
                    style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "rgba(22,61,89,0.02)" }}
                  >
                    <dt className="text-[11px] font-semibold" style={{ color: "var(--regu-gray-500)" }}>
                      {fact.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium break-words" style={{ color: "var(--regu-navy)" }}>
                      {fact.href ? (
                        <a
                          href={fact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                          style={{ color: "var(--regu-blue)" }}
                        >
                          Abrir archivo
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
