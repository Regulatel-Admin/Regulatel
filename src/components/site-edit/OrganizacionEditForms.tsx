import { useMemo, useState, type ReactNode } from "react";
import { Send, Trash2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { slugify } from "@/lib/slugify";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import {
  AUTORIDADES_ACTUALES_SETTINGS_KEY,
  authorities as defaultAuthorities,
  type Authority,
} from "@/data/authorities";
import {
  COMITE_EJECUTIVO_SETTINGS_KEY,
  defaultComiteEjecutivoCmsDocument,
  stampComiteIds,
  type ComiteEjecutivoCmsDocument,
  type ComiteMemberLogo,
} from "@/data/comiteEjecutivo";

const fieldClass =
  "w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-snug outline-none transition-colors focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function PublishBar({
  saving,
  error,
  published,
  onPublish,
  extra,
}: {
  saving: boolean;
  error: string | null;
  published?: boolean;
  onPublish: () => void;
  extra?: ReactNode;
}) {
  return (
    <div
      className="sticky bottom-0 -mx-6 mt-8 border-t bg-white px-6 py-4"
      style={{ borderColor: "rgba(22,61,89,0.08)" }}
    >
      {error && (
        <p className="mb-2 text-sm" style={{ color: "#991b1b" }}>
          {error}
        </p>
      )}
      {published && !error && (
        <p className="mb-2 text-sm font-medium" style={{ color: "#0f766e" }}>
          Ya está en el sitio público.
        </p>
      )}
      <p className="mb-3 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Se ve al instante en esta página. Hasta que publiques, el sitio real no cambia.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Send className="h-4 w-4" />
          {saving ? "Publicando…" : published ? "Publicar otra vez" : "Publicar"}
        </button>
        {extra}
      </div>
    </div>
  );
}

function cloneAuthorities(list: Authority[]): Authority[] {
  return list.map((a) => ({ ...a, sections: a.sections?.map((s) => ({ ...s })) }));
}

function emptyAuthority(): Authority {
  return {
    id: `autoridad-new-${Date.now()}`,
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

export function AutoridadForm({ id }: { id?: string }) {
  const { autoridadesActuales, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneAuthorities(preview.autoridades ?? autoridadesActuales ?? defaultAuthorities);

  const { value: row, setValue: setRow } = useDraftHistory<Authority>(() => {
    const found = id ? persisted.find((a) => a.id === id) : undefined;
    return found ? { ...found, sections: found.sections?.map((s) => ({ ...s })) } : emptyAuthority();
  });

  const [allEntries, setAllEntries] = useState(() => cloneAuthorities(persisted));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneAuthorities(allEntries);
    if (removed) return list.filter((a) => a.id !== row.id);
    const idx = list.findIndex((a) => a.id === row.id);
    if (idx >= 0) list[idx] = { ...row };
    else list.push({ ...row });
    return list;
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("autoridades", previewList);

  const save = async () => {
    if (!removed && !row.name.trim()) {
      setError("La autoridad necesita un nombre.");
      return;
    }
    const next = removed ? previewList : previewList.map((a) => (a.id === row.id ? { ...row } : a));
    const prepared = next
      .filter((a) => a.name.trim())
      .map((a, i) => {
        const slug = a.slug.trim() || slugify(a.name) || `autoridad-${i + 1}`;
        return {
          ...a,
          name: a.name.trim(),
          slug,
          id: a.id.trim() || slug,
          role: a.role.trim(),
          institution: a.institution.trim(),
          country: a.country.trim(),
          bio: a.bio.trim(),
          fullBio: a.fullBio.trim() || a.bio.trim(),
          image: a.image.trim(),
        };
      });
    const slugs = prepared.map((a) => a.slug.toLowerCase());
    const dup = slugs.find((s, i) => s && slugs.indexOf(s) !== i);
    if (dup) {
      setError("Hay dos autoridades con el mismo enlace. Cambia el nombre de una.");
      return;
    }
    setSaving(true);
    setError(null);
    const before = cloneJson(autoridadesActuales ?? defaultAuthorities);
    const res = await api.settings.set(AUTORIDADES_ACTUALES_SETTINGS_KEY, { authorities: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "autoridades",
      undo: async () => {
        const r = await api.settings.set(AUTORIDADES_ACTUALES_SETTINGS_KEY, { authorities: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(AUTORIDADES_ACTUALES_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(AUTORIDADES_ACTUALES_SETTINGS_KEY, { authorities: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(AUTORIDADES_ACTUALES_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(AUTORIDADES_ACTUALES_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("autoridades");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((a) => a.id === row.id) ?? prepared.find((a) => a.name === row.name.trim());
      if (saved) setRow({ ...saved });
      setAllEntries(cloneAuthorities(prepared));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Foto, nombre y cargo de la ficha. Se ve al instante.
      </p>
      <Field label="Nombre">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.name}
          onChange={(e) => {
            setRow({ ...row, name: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Cargo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.role}
          placeholder="Presidente"
          onChange={(e) => {
            setRow({ ...row, role: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Institución">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.institution}
          onChange={(e) => {
            setRow({ ...row, institution: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="País">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.country}
          onChange={(e) => {
            setRow({ ...row, country: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Resumen (tarjeta)">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.bio}
          onChange={(e) => {
            setRow({ ...row, bio: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Biografía (ficha completa)">
        <textarea
          rows={8}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.fullBio}
          onChange={(e) => {
            setRow({ ...row, fullBio: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Foto"
        value={row.image}
        onChange={(url) => {
          setRow({ ...row, image: url });
          setPublished(false);
        }}
        kind="image"
        folder="attachments"
      />
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              setAllEntries((prev) => prev.filter((a) => a.id !== row.id));
              setPublished(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        }
      />
    </div>
  );
}

function cloneComite(doc: ComiteEjecutivoCmsDocument): ComiteEjecutivoCmsDocument {
  return stampComiteIds({
    ...doc,
    presidente: { ...doc.presidente },
    vicepresidentes: doc.vicepresidentes.map((v) => ({ ...v })),
    secretarioEjecutivo: { ...doc.secretarioEjecutivo },
    miembros: doc.miembros.map((m) => ({ ...m })),
    funciones: [...doc.funciones],
    ui: doc.ui ? { ...doc.ui } : undefined,
  });
}

function emptyComiteMember(): ComiteMemberLogo {
  return { id: `comite-new-${Date.now()}`, name: "", logoUrl: "", linkUrl: "", country: "" };
}

function memberComplete(m: ComiteMemberLogo): boolean {
  return Boolean(m.name.trim() && m.logoUrl.trim());
}

export function ComiteLogoForm({
  slot,
  id,
}: {
  slot: "presidente" | "vice" | "miembro";
  id?: string;
}) {
  const { comiteEjecutivo, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneComite(preview.comite ?? comiteEjecutivo ?? defaultComiteEjecutivoCmsDocument());

  const { value: doc, setValue: setDoc } = useDraftHistory<ComiteEjecutivoCmsDocument>(() => {
    const next = cloneComite(persisted);
    if (slot === "presidente") return next;
    const list = slot === "vice" ? next.vicepresidentes : next.miembros;
    if (id && list.some((m) => m.id === id)) return next;
    const created = emptyComiteMember();
    if (slot === "vice") next.vicepresidentes = [...next.vicepresidentes, created];
    else next.miembros = [...next.miembros, created];
    return next;
  });

  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const workingId = useMemo(() => {
    if (slot === "presidente") return doc.presidente.id;
    const list = slot === "vice" ? doc.vicepresidentes : doc.miembros;
    if (id) return id;
    return list[list.length - 1]?.id;
  }, [doc, id, slot]);

  const previewDoc = useMemo(() => {
    if (!removed || slot === "presidente") return doc;
    if (slot === "vice") {
      return { ...doc, vicepresidentes: doc.vicepresidentes.filter((m) => m.id !== workingId) };
    }
    return { ...doc, miembros: doc.miembros.filter((m) => m.id !== workingId) };
  }, [doc, removed, slot, workingId]);

  const captureBaseline = usePreviewSync("comite", previewDoc);

  const current: ComiteMemberLogo =
    slot === "presidente"
      ? doc.presidente
      : (slot === "vice" ? doc.vicepresidentes : doc.miembros).find((m) => m.id === workingId) ?? emptyComiteMember();

  const patchCurrent = (patch: Partial<ComiteMemberLogo>) => {
    setPublished(false);
    setDoc((prev) => {
      if (slot === "presidente") return { ...prev, presidente: { ...prev.presidente, ...patch } };
      const key = slot === "vice" ? "vicepresidentes" : "miembros";
      return {
        ...prev,
        [key]: prev[key].map((m) => (m.id === workingId ? { ...m, ...patch } : m)),
      };
    });
  };

  const save = async () => {
    const toSave = cloneComite(previewDoc);
    if (slot !== "presidente" && removed) {
      /* already filtered */
    } else if (!memberComplete(current) && !removed) {
      setError("Nombre y logo son obligatorios.");
      return;
    }
    toSave.vicepresidentes = toSave.vicepresidentes.filter(memberComplete);
    toSave.miembros = toSave.miembros.filter(memberComplete);
    if (!memberComplete(toSave.presidente)) {
      setError("El presidente necesita nombre y logo.");
      return;
    }
    setSaving(true);
    setError(null);
    const before = cloneJson(comiteEjecutivo ?? defaultComiteEjecutivoCmsDocument());
    const res = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, toSave);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "comité ejecutivo",
      undo: async () => {
        const r = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, before);
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(COMITE_EJECUTIVO_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, toSave);
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(COMITE_EJECUTIVO_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(COMITE_EJECUTIVO_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("comite");
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Logo y nombre. Se ve al instante en el comité.
      </p>
      <Field label="Nombre / ente">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={current.name}
          onChange={(e) => patchCurrent({ name: e.target.value })}
        />
      </Field>
      {slot === "miembro" && (
        <Field label="País">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={current.country ?? ""}
            onChange={(e) => patchCurrent({ country: e.target.value })}
          />
        </Field>
      )}
      <Field label="Sitio web (opcional)">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={current.linkUrl ?? ""}
          onChange={(e) => patchCurrent({ linkUrl: e.target.value })}
        />
      </Field>
      <AdminBlobUploadField
        label="Logo"
        value={current.logoUrl}
        onChange={(url) => patchCurrent({ logoUrl: url })}
        kind="image"
        folder="attachments"
      />
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          slot === "presidente" ? undefined : (
            <button
              type="button"
              onClick={() => {
                setRemoved(true);
                setPublished(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
              style={{ borderColor: "rgba(22,61,89,0.14)" }}
            >
              <Trash2 className="h-4 w-4" />
              Quitar
            </button>
          )
        }
      />
    </div>
  );
}

export function ComiteFuncionesForm() {
  const { comiteEjecutivo, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneComite(preview.comite ?? comiteEjecutivo ?? defaultComiteEjecutivoCmsDocument());
  const { value: doc, setValue: setDoc } = useDraftHistory(persisted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const captureBaseline = usePreviewSync("comite", doc);

  const save = async () => {
    const toSave = {
      ...doc,
      funciones: doc.funciones.map((f) => f.trim()).filter(Boolean),
      funcionesIntro: doc.funcionesIntro.trim(),
    };
    setSaving(true);
    setError(null);
    const before = cloneJson(comiteEjecutivo ?? defaultComiteEjecutivoCmsDocument());
    const res = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, toSave);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "funciones del comité",
      undo: async () => {
        const r = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, before);
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(COMITE_EJECUTIVO_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(COMITE_EJECUTIVO_SETTINGS_KEY, toSave);
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(COMITE_EJECUTIVO_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(COMITE_EJECUTIVO_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("comite");
    setPublished(true);
  };

  return (
    <div className="space-y-5">
      <Field label="Introducción">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={doc.funcionesIntro}
          onChange={(e) => {
            setDoc({ ...doc, funcionesIntro: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Funciones (una por línea)">
        <textarea
          rows={6}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={doc.funciones.join("\n")}
          onChange={(e) => {
            setDoc({ ...doc, funciones: e.target.value.split("\n") });
            setPublished(false);
          }}
        />
      </Field>
      <PublishBar saving={saving} error={error} published={published} onPublish={() => void save()} />
    </div>
  );
}
