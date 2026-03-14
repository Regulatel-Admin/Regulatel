/**
 * Admin: Navegación — editar menú principal del header.
 * Persiste en site_settings con clave navigation.
 */
import { useState, useEffect } from "react";
import { navigationItems } from "@/data/navigation";
import { api } from "@/lib/api";
import { Save } from "lucide-react";
import type { NavigationItem } from "@/data/navigation";

const defaultNav: NavigationItem[] = navigationItems;

export default function AdminContentNavigation() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.getAll();
      if (cancelled) return;
      if (res.ok && res.data?.navigation && Array.isArray(res.data.navigation)) {
        setJson(JSON.stringify(res.data.navigation as NavigationItem[], null, 2));
      } else {
        setJson(JSON.stringify(defaultNav, null, 2));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const save = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      showMessage("err", "JSON inválido. Revisa la sintaxis.");
      return;
    }
    if (!Array.isArray(parsed)) {
      showMessage("err", "El valor debe ser un array de ítems de menú.");
      return;
    }
    setSaving(true);
    const res = await api.settings.set("navigation", parsed);
    setSaving(false);
    if (res.ok) showMessage("ok", "Navegación guardada. El header usará el nuevo menú.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  const loadDefault = () => {
    setJson(JSON.stringify(defaultNav, null, 2));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
        Navegación del sitio
      </h1>
      <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
        Estructura del menú principal (header). Cada ítem puede tener <code className="rounded bg-[var(--regu-gray-100)] px-1">id</code>,{" "}
        <code className="rounded bg-[var(--regu-gray-100)] px-1">label</code>, <code className="rounded bg-[var(--regu-gray-100)] px-1">href</code>,{" "}
        <code className="rounded bg-[var(--regu-gray-100)] px-1">panelLabel</code> y <code className="rounded bg-[var(--regu-gray-100)] px-1">columns</code> (array de{" "}
        <code className="rounded bg-[var(--regu-gray-100)] px-1">&#123; title, links: [&#123; label, href, external?, ... &#125;] &#125;</code>).
      </p>

      {message && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === "ok" ? "var(--regu-blue)" : "#dc2626",
            backgroundColor: message.type === "ok" ? "rgba(68,137,198,0.08)" : "#fef2f2",
            color: message.type === "ok" ? "var(--regu-navy)" : "#991b1b",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--regu-gray-100)" }}>
        <label className="mb-2 block text-xs font-semibold uppercase text-[var(--regu-gray-500)]">
          JSON del menú
        </label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={24}
          className="w-full rounded-lg border border-[var(--regu-gray-200)] bg-[#FAFBFC] p-3 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar navegación"}
        </button>
        <button
          type="button"
          onClick={loadDefault}
          className="rounded-lg border-2 border-[var(--regu-gray-200)] px-4 py-2 text-sm font-semibold text-[var(--regu-gray-700)] transition hover:bg-[var(--regu-gray-100)]"
        >
          Restaurar valores por defecto
        </button>
      </div>
    </div>
  );
}
