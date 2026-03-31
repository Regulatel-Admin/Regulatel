import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  AUTORIDADES_ACTUALES_SETTINGS_KEY,
  authorities,
  parseAuthoritiesFromSettingValue,
  type Authority,
  type AuthoritySection,
} from "@/data/authorities";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";

function emptyAuthority(): Authority {
  return {
    id: `nuevo-${Date.now()}`,
    slug: "",
    name: "",
    role: "",
    institution: "",
    country: "",
    image: "",
    bio: "",
    fullBio: "",
  };
}

export default function AdminAutoridadesActuales() {
  const [entries, setEntries] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(AUTORIDADES_ACTUALES_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseAuthoritiesFromSettingValue(res.data.value);
        if (parsed !== null) setEntries(parsed.map((a) => ({ ...a, sections: a.sections?.map((s) => ({ ...s })) })));
        else setEntries(authorities.map((a) => ({ ...a, sections: a.sections?.map((s) => ({ ...s })) })));
      } else {
        setEntries(authorities.map((a) => ({ ...a, sections: a.sections?.map((s) => ({ ...s })) })));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateAuth = (index: number, patch: Partial<Authority>) => {
    setEntries((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateSection = (authIndex: number, secIndex: number, patch: Partial<AuthoritySection>) => {
    setEntries((prev) =>
      prev.map((row, i) => {
        if (i !== authIndex) return row;
        const sections = [...(row.sections ?? [])];
        sections[secIndex] = { ...sections[secIndex], ...patch };
        return { ...row, sections };
      })
    );
  };

  const addSection = (authIndex: number) => {
    setEntries((prev) =>
      prev.map((row, i) => {
        if (i !== authIndex) return row;
        const sections = [...(row.sections ?? []), { title: "", content: "" }];
        return { ...row, sections };
      })
    );
  };

  const removeSection = (authIndex: number, secIndex: number) => {
    setEntries((prev) =>
      prev.map((row, i) => {
        if (i !== authIndex) return row;
        const sections = (row.sections ?? []).filter((_, j) => j !== secIndex);
        return { ...row, sections: sections.length ? sections : undefined };
      })
    );
  };

  const removeAuth = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addAuth = () => {
    setEntries((prev) => [...prev, emptyAuthority()]);
  };

  const resetDefaults = () => {
    setEntries(authorities.map((a) => ({ ...a, sections: a.sections?.map((s) => ({ ...s })) })));
    showMessage("ok", "Restaurado al listado del código. Pulse Guardar para publicar.");
  };

  const save = async () => {
    const slugs = entries.map((e) => e.slug.trim().toLowerCase());
    const dup = slugs.find((s, i) => s && slugs.indexOf(s) !== i);
    if (dup) {
      showMessage("err", `Slug duplicado: ${dup}`);
      return;
    }
    const missing = entries.filter((e) => !e.slug.trim() || !e.name.trim());
    if (missing.length) {
      showMessage("err", "Cada autoridad debe tener slug y nombre.");
      return;
    }
    setSaving(true);
    const res = await api.settings.set(AUTORIDADES_ACTUALES_SETTINGS_KEY, { authorities: entries });
    setSaving(false);
    if (res.ok) showMessage("ok", "Guardado. La página /autoridades muestra estos datos.");
    else showMessage("err", res.error ?? "Error al guardar.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "var(--regu-gray-500)" }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Autoridades actuales
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Presidente y vicepresidentes en{" "}
          <a href="/autoridades" className="font-medium underline" style={{ color: "var(--regu-blue)" }}>
            /autoridades
          </a>
          . Se guardan en la base de datos (site settings).
        </p>
      </div>

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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ borderColor: "var(--regu-blue)", backgroundColor: "var(--regu-blue)", color: "white" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar en base de datos"}
        </button>
        <button
          type="button"
          onClick={addAuth}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-800)" }}
        >
          <Plus className="h-4 w-4" />
          Añadir autoridad
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar desde código
        </button>
      </div>

      <div className="space-y-8">
        {entries.map((row, aidx) => (
          <div
            key={row.id + String(aidx)}
            className="rounded-xl border bg-white p-4 shadow-sm space-y-4"
            style={{ borderColor: "var(--regu-gray-100)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-500)" }}>
                Autoridad {aidx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAuth(aidx)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="ID (interno)" value={row.id} onChange={(v) => updateAuth(aidx, { id: v })} placeholder="ej. 1" />
              <Field label="Slug URL" value={row.slug} onChange={(v) => updateAuth(aidx, { slug: v })} placeholder="guido-gomez-mazara" />
              <Field label="Nombre" value={row.name} onChange={(v) => updateAuth(aidx, { name: v })} />
              <Field label="Rol" value={row.role} onChange={(v) => updateAuth(aidx, { role: v })} placeholder="Presidente" />
              <Field label="Institución" value={row.institution} onChange={(v) => updateAuth(aidx, { institution: v })} />
              <Field label="URL institución" value={row.institutionUrl ?? ""} onChange={(v) => updateAuth(aidx, { institutionUrl: v || undefined })} />
              <Field label="País" value={row.country} onChange={(v) => updateAuth(aidx, { country: v })} />
              <Field label="Período (opc.)" value={row.period ?? ""} onChange={(v) => updateAuth(aidx, { period: v || undefined })} />
              <Field label="Email (opc.)" value={row.email ?? ""} onChange={(v) => updateAuth(aidx, { email: v || undefined })} type="email" />
              <Field label="Linkedin (opc.)" value={row.linkedin ?? ""} onChange={(v) => updateAuth(aidx, { linkedin: v || undefined })} />
            </div>
            <AdminBlobUploadField
              label="Foto de la autoridad"
              value={row.image}
              onChange={(v) => updateAuth(aidx, { image: v })}
              kind="image"
              folder="attachments"
              helpText="Sube la imagen a almacenamiento (blob) o despliega «Pegar URL manual» para una ruta local u otra URL."
            />
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Resumen (tarjeta)
              </span>
              <textarea
                value={row.bio}
                onChange={(e) => updateAuth(aidx, { bio: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
                Biografía completa (página detalle)
              </span>
              <textarea
                value={row.fullBio}
                onChange={(e) => updateAuth(aidx, { fullBio: e.target.value })}
                rows={8}
                className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
                style={{ borderColor: "var(--regu-gray-200)" }}
              />
            </label>

            <div className="rounded-lg border p-3 space-y-3" style={{ borderColor: "var(--regu-gray-100)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
                  Secciones (perfil)
                </span>
                <button
                  type="button"
                  onClick={() => addSection(aidx)}
                  className="text-xs font-semibold"
                  style={{ color: "var(--regu-blue)" }}
                >
                  + Bloque
                </button>
              </div>
              {(row.sections ?? []).map((sec, sidx) => (
                <div key={sidx} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] border-t pt-3" style={{ borderColor: "var(--regu-gray-100)" }}>
                  <input
                    value={sec.title}
                    onChange={(e) => updateSection(aidx, sidx, { title: e.target.value })}
                    placeholder="Título"
                    className="rounded border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--regu-gray-200)" }}
                  />
                  <textarea
                    value={sec.content}
                    onChange={(e) => updateSection(aidx, sidx, { content: e.target.value })}
                    placeholder="Texto"
                    rows={2}
                    className="rounded border px-2 py-1.5 text-sm sm:col-span-1"
                    style={{ borderColor: "var(--regu-gray-200)" }}
                  />
                  <button type="button" onClick={() => removeSection(aidx, sidx)} className="text-red-600 text-xs self-start">
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--regu-gray-200)" }}
      />
    </label>
  );
}
