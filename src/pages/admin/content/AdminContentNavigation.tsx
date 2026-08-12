/**
 * Editor visual del menú del header.
 * Fusiona cambios si dos personas editan a la vez campos distintos.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type { NavigationColumn, NavigationItem, NavigationItemLink } from "@/data/navigation";
import { api } from "@/lib/api";
import NavMenuPreview from "@/components/admin/navigation/NavMenuPreview";
import {
  cloneNav,
  defaultNavigation,
  emptyNavColumn,
  emptyNavItem,
  emptyNavLink,
  moveItem,
  parseNavigationValue,
  SPECIAL_NAV_IDS,
  validateNavigation,
} from "@/lib/navigationModel";
import { timestampsEqual } from "@/lib/navigationMerge";

type Message = { type: "ok" | "err" | "info"; text: string };

const fieldClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;
const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-[0.10em]";
const labelStyle = { color: "var(--regu-gray-500)" } as const;

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass} style={labelStyle}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass}
        style={fieldStyle}
      />
      {hint && (
        <span className="mt-1 block text-[11px]" style={{ color: "var(--regu-gray-400)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: "var(--regu-gray-700)" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ accentColor: "var(--regu-blue)" }}
      />
      {label}
    </label>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-[rgba(68,137,198,0.08)] disabled:opacity-30"
      style={{
        borderColor: "rgba(22,61,89,0.12)",
        color: danger ? "#b91c1c" : "var(--regu-gray-600)",
      }}
    >
      {children}
    </button>
  );
}

function LinkEditor({
  link,
  onChange,
  onRemove,
  onMove,
  canUp,
  canDown,
  depth = 0,
}: {
  link: NavigationItemLink;
  onChange: (link: NavigationItemLink) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border bg-white"
      style={{ borderColor: "rgba(22,61,89,0.10)", marginLeft: depth ? 16 : 0 }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="h-3.5 w-3.5 shrink-0 opacity-40" />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold"
          style={{ color: "var(--regu-navy)" }}
        >
          {link.label || "Sin etiqueta"}
          <span className="ml-2 font-normal" style={{ color: "var(--regu-gray-400)" }}>
            {link.href}
          </span>
        </button>
        {link.restricted && <Lock className="h-3.5 w-3.5" style={{ color: "var(--regu-blue)" }} />}
        <IconButton label="Subir" onClick={() => onMove(-1)} disabled={!canUp}>
          <ChevronUp className="h-4 w-4" />
        </IconButton>
        <IconButton label="Bajar" onClick={() => onMove(1)} disabled={!canDown}>
          <ChevronDown className="h-4 w-4" />
        </IconButton>
        <IconButton label="Eliminar enlace" onClick={onRemove} danger>
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      {open && (
        <div className="space-y-3 border-t px-3 py-3" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etiqueta" value={link.label} onChange={(label) => onChange({ ...link, label })} />
            <Field label="URL" value={link.href} onChange={(href) => onChange({ ...link, href })} placeholder="/pagina" />
          </div>
          <Field
            label="Descripción"
            value={link.description ?? ""}
            onChange={(description) => onChange({ ...link, description })}
            placeholder="Texto corto bajo el enlace"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Subtítulo"
              value={link.subtitle ?? ""}
              onChange={(subtitle) => onChange({ ...link, subtitle })}
            />
            <Field
              label="Grupo"
              value={link.groupLabel ?? ""}
              onChange={(groupLabel) => onChange({ ...link, groupLabel })}
              placeholder="2026"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Check label="Enlace externo" checked={Boolean(link.external)} onChange={(external) => onChange({ ...link, external })} />
            <Check
              label="Acceso restringido"
              checked={Boolean(link.restricted)}
              onChange={(restricted) => onChange({ ...link, restricted })}
            />
          </div>
          {depth === 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className={labelClass} style={labelStyle}>
                  Subenlaces
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ ...link, children: [...(link.children ?? []), emptyNavLink()] })}
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "var(--regu-blue)" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir
                </button>
              </div>
              <div className="space-y-2">
                {(link.children ?? []).map((child, index) => (
                  <LinkEditor
                    key={child.uid || `${child.href}-${index}`}
                    link={child}
                    depth={1}
                    canUp={index > 0}
                    canDown={index < (link.children?.length ?? 0) - 1}
                    onMove={(direction) =>
                      onChange({ ...link, children: moveItem(link.children ?? [], index, direction) })
                    }
                    onRemove={() =>
                      onChange({
                        ...link,
                        children: (link.children ?? []).filter((_, childIndex) => childIndex !== index),
                      })
                    }
                    onChange={(next) => {
                      const children = (link.children ?? []).slice();
                      children[index] = next;
                      onChange({ ...link, children });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnEditor({
  column,
  onChange,
  onRemove,
  onMove,
  canUp,
  canDown,
}: {
  column: NavigationColumn;
  onChange: (column: NavigationColumn) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(22,61,89,0.10)", backgroundColor: "#FAFBFC" }}>
      <div className="mb-3 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Field label="Título de columna" value={column.title} onChange={(title) => onChange({ ...column, title })} />
        </div>
        <div className="mt-5 flex shrink-0 gap-1">
          <IconButton label="Subir columna" onClick={() => onMove(-1)} disabled={!canUp}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Bajar columna" onClick={() => onMove(1)} disabled={!canDown}>
            <ChevronDown className="h-4 w-4" />
          </IconButton>
          <IconButton label="Eliminar columna" onClick={onRemove} danger>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
      <div className="space-y-2">
        {column.links.map((link, index) => (
          <LinkEditor
            key={link.uid || `${link.href}-${index}`}
            link={link}
            canUp={index > 0}
            canDown={index < column.links.length - 1}
            onMove={(direction) => onChange({ ...column, links: moveItem(column.links, index, direction) })}
            onRemove={() => onChange({ ...column, links: column.links.filter((_, linkIndex) => linkIndex !== index) })}
            onChange={(next) => {
              const links = column.links.slice();
              links[index] = next;
              onChange({ ...column, links });
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...column, links: [...column.links, emptyNavLink()] })}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: "var(--regu-blue)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir enlace
      </button>
    </div>
  );
}

function ItemEditor({
  item,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  item: NavigationItem;
  index: number;
  total: number;
  onChange: (item: NavigationItem) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const special = SPECIAL_NAV_IDS[item.id];
  const columns = item.columns ?? [];

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: "rgba(22,61,89,0.10)", borderTop: "3px solid var(--regu-blue)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
            {item.label || "Sin nombre"}
          </p>
          <p className="text-[11px]" style={{ color: "var(--regu-gray-400)" }}>
            {item.id}
            {columns.length ? ` · ${columns.length} columna${columns.length === 1 ? "" : "s"}` : ""}
          </p>
        </button>
        <IconButton label="Subir" onClick={() => onMove(-1)} disabled={index === 0}>
          <ChevronUp className="h-4 w-4" />
        </IconButton>
        <IconButton label="Bajar" onClick={() => onMove(1)} disabled={index === total - 1}>
          <ChevronDown className="h-4 w-4" />
        </IconButton>
        <IconButton label="Eliminar ítem" onClick={onRemove} danger>
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      {open && (
        <div className="space-y-4 border-t px-4 py-4" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          {special && (
            <p
              className="rounded-xl px-3 py-2 text-xs"
              style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-navy)" }}
            >
              {special}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etiqueta en el header" value={item.label} onChange={(label) => onChange({ ...item, label })} />
            <Field
              label="Id interno"
              value={item.id}
              onChange={(id) => onChange({ ...item, id })}
              hint="No lo cambies si el ítem ya existe. Eventos y Convenios dependen de este id."
            />
            <Field label="URL" value={item.href ?? ""} onChange={(href) => onChange({ ...item, href })} placeholder="/pagina" />
            <Field
              label="Título del desplegable"
              value={item.panelLabel ?? ""}
              onChange={(panelLabel) => onChange({ ...item, panelLabel })}
            />
          </div>
          {!special && (
            <>
              <div className="space-y-3">
                {columns.map((column, columnIndex) => (
                  <ColumnEditor
                    key={column.uid || `${column.title}-${columnIndex}`}
                    column={column}
                    canUp={columnIndex > 0}
                    canDown={columnIndex < columns.length - 1}
                    onMove={(direction) => onChange({ ...item, columns: moveItem(columns, columnIndex, direction) })}
                    onRemove={() =>
                      onChange({ ...item, columns: columns.filter((_, current) => current !== columnIndex) })
                    }
                    onChange={(next) => {
                      const nextColumns = columns.slice();
                      nextColumns[columnIndex] = next;
                      onChange({ ...item, columns: nextColumns });
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...item, columns: [...columns, emptyNavColumn()] })}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir columna al desplegable
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function AdminContentNavigation() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [baseItems, setBaseItems] = useState<NavigationItem[]>([]);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
  const [remoteNewer, setRemoteNewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const dirty = useMemo(() => JSON.stringify(items) !== JSON.stringify(baseItems), [items, baseItems]);

  const showMessage = (type: Message["type"], text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 7000);
  };

  const applyLoaded = useCallback((value: unknown, updatedAt?: string | null) => {
    const parsed = parseNavigationValue(value) ?? defaultNavigation();
    setItems(parsed);
    setBaseItems(cloneNav(parsed));
    setBaseUpdatedAt(updatedAt ?? null);
    setRemoteNewer(false);
  }, []);

  const loadFromServer = useCallback(
    async (opts?: { silent?: boolean }) => {
      const res = await api.settings.get("navigation");
      if (res.ok) {
        applyLoaded(res.data.value, res.data.updated_at);
        if (!opts?.silent) showMessage("ok", "Menú cargado del servidor.");
        return;
      }
      applyLoaded(defaultNavigation(), null);
      if (!opts?.silent) showMessage("info", "No había menú guardado. Se cargó el menú por defecto.");
    },
    [applyLoaded]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get("navigation");
      if (cancelled) return;
      if (res.ok && res.data.value) applyLoaded(res.data.value, res.data.updated_at);
      else applyLoaded(defaultNavigation(), res.ok ? res.data.updated_at : null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyLoaded]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (!baseUpdatedAt) return;
      const res = await api.settings.get("navigation");
      if (!res.ok || !res.data.updated_at) return;
      setRemoteNewer(!timestampsEqual(res.data.updated_at, baseUpdatedAt));
    }, 12000);
    return () => window.clearInterval(timer);
  }, [baseUpdatedAt]);

  const save = async () => {
    const errors = validateNavigation(items);
    if (errors.length) {
      showMessage("err", errors[0]);
      return;
    }
    setSaving(true);
    const res = await api.settings.set("navigation", items, {
      baseUpdatedAt: baseUpdatedAt ?? undefined,
      baseValue: baseItems,
    });
    setSaving(false);
    if (!res.ok) {
      showMessage("err", res.error ?? "No se pudo guardar el menú.");
      return;
    }
    const saved = parseNavigationValue(res.data.value) ?? items;
    setItems(saved);
    setBaseItems(cloneNav(saved));
    setBaseUpdatedAt(res.data.updated_at);
    setRemoteNewer(false);
    if (res.data.merge?.applied) {
      const warnings = res.data.merge.notes.filter((note) => note.level === "warn");
      const extras = res.data.merge.notes.filter((note) => note.level === "info");
      const parts = [
        "Guardado. Se fusionó con lo que había guardado la otra persona.",
        ...warnings.map((note) => note.text),
        ...extras.map((note) => note.text),
      ];
      showMessage(warnings.length ? "info" : "ok", parts.join(" "));
    } else {
      showMessage("ok", "Menú guardado. El header del sitio ya usa esta versión.");
    }
  };

  const restoreDefault = () => {
    if (!window.confirm("¿Volver al menú original de REGULATEL? Se pueden perder cambios no guardados.")) return;
    const next = defaultNavigation();
    setItems(next);
    showMessage("info", "Se cargó el menú por defecto. Pulsa Guardar para publicarlo.");
  };

  const reload = async () => {
    if (dirty && !window.confirm("Hay cambios sin guardar. ¿Recargar el menú del servidor?")) return;
    await loadFromServer();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando menú…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-navy)" }}>
          Menú del sitio
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
          Edita el menú de arriba con fichas. Si dos personas cambian cosas distintas a la vez, al guardar se
          juntan los dos cambios. Si las dos tocan lo mismo, se queda lo de quien pulsa Guardar.
        </p>
      </div>

      <div
        className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm"
        style={{ borderColor: "rgba(22,61,89,0.10)" }}
      >
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar menú"}
        </button>
        <button
          type="button"
          onClick={() => void reload()}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-gray-700)" }}
        >
          <RefreshCw className="h-4 w-4" />
          Recargar
        </button>
        <button
          type="button"
          onClick={restoreDefault}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Volver al menú original
        </button>
        <span className="text-xs" style={{ color: dirty ? "var(--regu-blue)" : "var(--regu-gray-400)" }}>
          {dirty ? "Hay cambios sin guardar" : "Todo guardado"}
        </span>
        {baseUpdatedAt && (
          <span className="text-xs" style={{ color: "var(--regu-gray-400)" }}>
            Última versión: {new Date(baseUpdatedAt).toLocaleString("es-DO")}
          </span>
        )}
      </div>

      {remoteNewer && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "#f59e0b", backgroundColor: "#fffbeb", color: "#92400e" }}
        >
          Alguien más ya guardó el menú. Puedes seguir editando: al guardar se fusionará con esa versión. O pulsa
          Recargar si prefieres partir de lo último.
        </div>
      )}

      {message && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === "err" ? "#dc2626" : "var(--regu-blue)",
            backgroundColor: message.type === "err" ? "#fef2f2" : "rgba(68,137,198,0.08)",
            color: message.type === "err" ? "#991b1b" : "var(--regu-navy)",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {items.map((item, index) => (
            <ItemEditor
              key={item.uid || item.id}
              item={item}
              index={index}
              total={items.length}
              onMove={(direction) => setItems((current) => moveItem(current, index, direction))}
              onRemove={() => {
                if (!window.confirm(`¿Quitar «${item.label}» del menú?`)) return;
                setItems((current) => current.filter((_, currentIndex) => currentIndex !== index));
              }}
              onChange={(next) => {
                setItems((current) => {
                  const copy = current.slice();
                  copy[index] = next;
                  return copy;
                });
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => setItems((current) => [...current, emptyNavItem(current.map((item) => item.id))])}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-3 text-sm font-semibold"
            style={{ borderColor: "rgba(68,137,198,0.35)", color: "var(--regu-blue)" }}
          >
            <Plus className="h-4 w-4" />
            Añadir ítem al menú
          </button>
        </div>
        <aside className="xl:sticky xl:top-24 h-fit overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          <NavMenuPreview items={items} />
        </aside>
      </div>
    </div>
  );
}
