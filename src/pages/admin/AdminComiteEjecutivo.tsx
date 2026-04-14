import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import {
  COMITE_EJECUTIVO_SETTINGS_KEY,
  defaultComiteEjecutivoCmsDocument,
  parseComiteEjecutivoCmsFromSettingValue,
  resolveComiteEjecutivoUi,
  type ComiteEjecutivoCmsDocument,
  type ComiteMemberLogo,
} from "@/data/comiteEjecutivo";
import { Save, Plus, Trash2, RotateCcw } from "lucide-react";

function emptyMember(): ComiteMemberLogo {
  return { name: "", logoUrl: "", linkUrl: "", country: "" };
}

export default function AdminComiteEjecutivo() {
  const [doc, setDoc] = useState<ComiteEjecutivoCmsDocument>(() => defaultComiteEjecutivoCmsDocument());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.settings.get(COMITE_EJECUTIVO_SETTINGS_KEY);
      if (cancelled) return;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseComiteEjecutivoCmsFromSettingValue(res.data.value);
        if (parsed) setDoc(parsed);
        else setDoc(defaultComiteEjecutivoCmsDocument());
      } else {
        setDoc(defaultComiteEjecutivoCmsDocument());
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

  const uiResolved = resolveComiteEjecutivoUi(doc);
  const ui = doc.ui ?? {};

  const setUiField = (key: keyof typeof uiResolved, value: string) => {
    setDoc((prev) => ({
      ...prev,
      ui: { ...prev.ui, [key]: value },
    }));
  };

  const setPresidente = (patch: Partial<ComiteMemberLogo>) => {
    setDoc((prev) => ({ ...prev, presidente: { ...prev.presidente, ...patch } }));
  };

  const setVice = (index: number, patch: Partial<ComiteMemberLogo>) => {
    setDoc((prev) => ({
      ...prev,
      vicepresidentes: prev.vicepresidentes.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  const addVice = () => {
    setDoc((prev) => ({ ...prev, vicepresidentes: [...prev.vicepresidentes, emptyMember()] }));
  };

  const removeVice = (index: number) => {
    setDoc((prev) => ({ ...prev, vicepresidentes: prev.vicepresidentes.filter((_, i) => i !== index) }));
  };

  const setMiembro = (index: number, patch: Partial<ComiteMemberLogo>) => {
    setDoc((prev) => ({
      ...prev,
      miembros: prev.miembros.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  };

  const addMiembro = () => {
    setDoc((prev) => ({ ...prev, miembros: [...prev.miembros, emptyMember()] }));
  };

  const removeMiembro = (index: number) => {
    setDoc((prev) => ({ ...prev, miembros: prev.miembros.filter((_, i) => i !== index) }));
  };

  const setFuncionesText = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setDoc((prev) => ({ ...prev, funciones: lines }));
  };

  const resetDefaults = () => {
    setDoc(defaultComiteEjecutivoCmsDocument());
    showMessage("ok", "Contenido restaurado al valor por defecto. Pulsa Guardar para publicar.");
  };

  const save = async () => {
    if (!doc.presidente.name.trim() || !doc.presidente.logoUrl.trim()) {
      showMessage("err", "El presidente necesita nombre y URL de logo.");
      return;
    }
    for (let i = 0; i < doc.vicepresidentes.length; i++) {
      const v = doc.vicepresidentes[i];
      if (!v.name.trim() || !v.logoUrl.trim()) {
        showMessage("err", `Vicepresidencia ${i + 1}: nombre y logo son obligatorios (o elimina la fila).`);
        return;
      }
    }
    for (let i = 0; i < doc.miembros.length; i++) {
      const m = doc.miembros[i];
      if (!m.name.trim() || !m.logoUrl.trim()) {
        showMessage("err", `Miembro ${i + 1}: nombre y logo son obligatorios (o elimina la fila).`);
        return;
      }
    }
    if (doc.funciones.length === 0) {
      showMessage("err", "Añade al menos una función (una línea por viñeta).");
      return;
    }
    setSaving(true);
    const payload: ComiteEjecutivoCmsDocument = {
      ...doc,
      vicepresidentes: doc.vicepresidentes.map((v) => ({
        ...v,
        linkUrl: v.linkUrl?.trim() || undefined,
        country: v.country?.trim() || undefined,
      })),
      miembros: doc.miembros.map((m) => ({
        ...m,
        linkUrl: m.linkUrl?.trim() || undefined,
        country: m.country?.trim() || undefined,
      })),
      presidente: {
        ...doc.presidente,
        linkUrl: doc.presidente.linkUrl?.trim() || undefined,
      },
    };
    const res = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, payload);
    setSaving(false);
    if (res.ok) showMessage("ok", "Comité Ejecutivo guardado. Ya se refleja en /comite-ejecutivo.");
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
          Comité Ejecutivo
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--regu-gray-600)" }}>
          Edita textos del hero, presidente, vicepresidencias, miembros del comité (país, nombre, logo, enlace) y el
          bloque de funciones. La página pública es{" "}
          <a href="/comite-ejecutivo" className="font-semibold underline" style={{ color: "var(--regu-blue)" }}>
            /comite-ejecutivo
          </a>
          .
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
          onClick={resetDefaults}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-700)" }}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar valores por defecto
        </button>
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4" style={{ borderColor: "var(--regu-gray-100)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-navy)" }}>
          Hero de la página
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Título" value={ui.heroTitle ?? ""} onChange={(v) => setUiField("heroTitle", v)} placeholder={uiResolved.heroTitle} />
          <Field label="Subtítulo (ej. QUIÉNES SOMOS)" value={ui.heroSubtitle ?? ""} onChange={(v) => setUiField("heroSubtitle", v)} />
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
            Descripción bajo el título
          </span>
          <textarea
            value={ui.heroDescription ?? ""}
            onChange={(e) => setUiField("heroDescription", e.target.value)}
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
          />
        </label>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4" style={{ borderColor: "var(--regu-gray-100)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-navy)" }}>
          Sección presidencia
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Título de sección" value={ui.presidenciaTitle ?? ""} onChange={(v) => setUiField("presidenciaTitle", v)} />
          <Field label="Subtítulo" value={ui.presidenciaSubtitle ?? ""} onChange={(v) => setUiField("presidenciaSubtitle", v)} />
        </div>
        <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--regu-gray-200)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--regu-gray-600)" }}>
            Presidente
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nombre / ente" value={doc.presidente.name} onChange={(v) => setPresidente({ name: v })} />
            <Field
              label="Sitio web (opcional)"
              value={doc.presidente.linkUrl ?? ""}
              onChange={(v) => setPresidente({ linkUrl: v })}
              placeholder="https://…"
            />
          </div>
          <Field
            label="URL del logo"
            value={doc.presidente.logoUrl}
            onChange={(v) => setPresidente({ logoUrl: v })}
            placeholder="/images/… o URL absoluta"
          />
          <AdminBlobUploadField
            label="Subir logo del presidente"
            value={doc.presidente.logoUrl}
            onChange={(url) => setPresidente({ logoUrl: url })}
            kind="image"
            folder="attachments"
            helpText="Se guarda la URL en Vercel Blob; puedes pegar una ruta local si prefieres."
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold" style={{ color: "var(--regu-gray-600)" }}>
              Vicepresidencias
            </p>
            <button
              type="button"
              onClick={addVice}
              className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium"
              style={{ borderColor: "var(--regu-gray-200)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir
            </button>
          </div>
          {doc.vicepresidentes.map((v, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--regu-gray-200)" }}>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeVice(i)}
                  className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nombre / ente" value={v.name} onChange={(val) => setVice(i, { name: val })} />
                <Field label="Sitio web (opcional)" value={v.linkUrl ?? ""} onChange={(val) => setVice(i, { linkUrl: val })} />
              </div>
              <Field label="URL del logo" value={v.logoUrl} onChange={(val) => setVice(i, { logoUrl: val })} />
              <AdminBlobUploadField
                label="Subir logo"
                value={v.logoUrl}
                onChange={(url) => setVice(i, { logoUrl: url })}
                kind="image"
                folder="attachments"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4" style={{ borderColor: "var(--regu-gray-100)" }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-navy)" }}>
            Miembros del comité
          </h2>
          <button
            type="button"
            onClick={addMiembro}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "var(--regu-gray-200)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir miembro
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Título de sección" value={ui.miembrosTitle ?? ""} onChange={(v) => setUiField("miembrosTitle", v)} />
          <Field label="Subtítulo" value={ui.miembrosSubtitle ?? ""} onChange={(v) => setUiField("miembrosSubtitle", v)} />
        </div>
        <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>
          En la web se ordenan alfabéticamente por país (o por nombre si no hay país).
        </p>
        {doc.miembros.map((m, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--regu-gray-200)" }}>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeMiembro(i)}
                className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="País (etiqueta)" value={m.country ?? ""} onChange={(val) => setMiembro(i, { country: val })} />
              <Field label="Nombre / ente" value={m.name} onChange={(val) => setMiembro(i, { name: val })} />
              <Field label="Sitio web (opcional)" value={m.linkUrl ?? ""} onChange={(val) => setMiembro(i, { linkUrl: val })} />
            </div>
            <Field label="URL del logo" value={m.logoUrl} onChange={(val) => setMiembro(i, { logoUrl: val })} />
            <AdminBlobUploadField
              label="Subir logo"
              value={m.logoUrl}
              onChange={(url) => setMiembro(i, { logoUrl: url })}
              kind="image"
              folder="attachments"
            />
          </div>
        ))}
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4" style={{ borderColor: "var(--regu-gray-100)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--regu-navy)" }}>
          Funciones principales
        </h2>
        <Field
          label="Título del bloque"
          value={ui.funcionesSectionTitle ?? ""}
          onChange={(v) => setUiField("funcionesSectionTitle", v)}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
            Párrafo introductorio
          </span>
          <textarea
            value={doc.funcionesIntro}
            onChange={(e) => setDoc((prev) => ({ ...prev, funcionesIntro: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
            Viñetas (una línea por función)
          </span>
          <textarea
            value={doc.funciones.join("\n")}
            onChange={(e) => setFuncionesText(e.target.value)}
            rows={6}
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
            style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
          />
        </label>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-gray-900)" }}
      />
    </label>
  );
}
