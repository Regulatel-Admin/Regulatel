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
  ENTES_MIEMBROS_SETTINGS_KEY,
  defaultEntesReguladoresMiembros,
  normalizeEnteInternalRoute,
  stampEnteIds,
  type EnteReguladorMiembro,
} from "@/data/entesReguladoresMiembros";
import {
  DIRECTORIO_AUTORIDADES_SETTINGS_KEY,
  defaultDirectorioAutoridades,
  stampDirectorioIds,
  type DirectorioAutoridad,
} from "@/data/directorioAutoridades";

const fieldClass =
  "w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-snug outline-none transition-colors focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
          {hint}
        </span>
      ) : null}
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

function emptyEnte(): EnteReguladorMiembro {
  return {
    id: `ente-new-${Date.now()}`,
    name: "",
    country: "",
    fullName: "",
    logoUrl: undefined,
    route: "/",
    externalUrl: "",
    linkExternalOnly: true,
  };
}

function emptyDirectorio(): DirectorioAutoridad {
  return {
    id: `dir-new-${Date.now()}`,
    pais: "",
    acronym: "",
    presidente: "",
    cargo: "",
    corresponsal: "",
    correo: "",
  };
}

export function EnteForm({ id }: { id?: string }) {
  const { entesReguladoresMiembros, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = stampEnteIds(preview.entes ?? entesReguladoresMiembros ?? defaultEntesReguladoresMiembros);

  const { value: row, setValue: setRow } = useDraftHistory<EnteReguladorMiembro>(() => {
    const found = id ? persisted.find((e) => e.id === id) : undefined;
    return found ? { ...found } : emptyEnte();
  });

  const [allEntries, setAllEntries] = useState(() => persisted.map((e) => ({ ...e })));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = allEntries.map((e) => ({ ...e }));
    if (removed) return stampEnteIds(list.filter((e) => e.id !== row.id));
    const idx = list.findIndex((e) => e.id === row.id);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    return stampEnteIds(list);
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("entes", previewList);

  const save = async () => {
    const next = removed ? previewList : previewList.map((e) => (e.id === row.id ? { ...row } : e));
    if (!removed) {
      if (!row.name.trim() || !row.country.trim() || !row.externalUrl.trim()) {
        setError("Nombre, país y sitio web son obligatorios.");
        return;
      }
    }
    const prepared = next
      .filter((e) => e.name.trim() && e.country.trim() && e.externalUrl.trim())
      .map((e) => {
        const route =
          normalizeEnteInternalRoute(e.route) ||
          (e.route.trim() && e.route.trim() !== "/" ? `/${slugify(e.route)}` : "") ||
          `/${slugify(e.name) || "ente"}`;
        return {
          ...e,
          name: e.name.trim(),
          country: e.country.trim(),
          fullName: e.fullName?.trim() || undefined,
          logoUrl: e.logoUrl?.trim() || undefined,
          route,
          externalUrl: e.externalUrl.trim(),
          linkExternalOnly: e.linkExternalOnly === true,
        };
      });
    setSaving(true);
    setError(null);
    const before = cloneJson(entesReguladoresMiembros ?? defaultEntesReguladoresMiembros);
    const res = await api.settings.set(ENTES_MIEMBROS_SETTINGS_KEY, { entes: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "entes miembros",
      undo: async () => {
        const r = await api.settings.set(ENTES_MIEMBROS_SETTINGS_KEY, { entes: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(ENTES_MIEMBROS_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(ENTES_MIEMBROS_SETTINGS_KEY, { entes: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(ENTES_MIEMBROS_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(ENTES_MIEMBROS_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("entes");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((e) => e.id === row.id);
      if (saved) setRow(saved);
      setAllEntries(prepared);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Logo, nombre y país de la tarjeta. Se ve en el carrusel al instante.
      </p>
      <Field label="Nombre corto">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.name}
          placeholder="ENACOM"
          onChange={(e) => {
            setRow({ ...row, name: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="País">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.country}
          placeholder="Argentina"
          onChange={(e) => {
            setRow({ ...row, country: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Nombre completo">
        <textarea
          rows={2}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.fullName ?? ""}
          onChange={(e) => {
            setRow({ ...row, fullName: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Sitio web">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.externalUrl}
          placeholder="https://"
          onChange={(e) => {
            setRow({ ...row, externalUrl: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field
        label="Página en este sitio (opcional)"
        hint="La tarjeta abre esta ficha en REGULATEL. Ejemplo: /siget. Si marcas “solo el sitio web”, no se usa."
      >
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.route === "/" ? "" : row.route}
          placeholder="/siget"
          onChange={(e) => {
            setRow({ ...row, route: e.target.value || "/" });
            setPublished(false);
          }}
          onBlur={() => {
            const next = normalizeEnteInternalRoute(row.route) || "/";
            if (next !== row.route) setRow({ ...row, route: next });
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Logo"
        value={row.logoUrl ?? ""}
        onChange={(url) => {
          setRow({ ...row, logoUrl: url || undefined });
          setPublished(false);
        }}
        kind="image"
        folder="attachments"
        helpText="Si no subes foto, se usa el logo que ya hay en el sitio."
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={row.linkExternalOnly === true}
          onChange={(e) => {
            setRow({ ...row, linkExternalOnly: e.target.checked });
            setPublished(false);
          }}
        />
        <span style={{ color: "var(--regu-gray-800)" }}>Abrir solo el sitio web (sin ficha en REGULATEL)</span>
      </label>
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
              setAllEntries((prev) => prev.filter((e) => e.id !== row.id));
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

export function DirectorioForm({ id }: { id?: string }) {
  const { directorioAutoridades, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = stampDirectorioIds(
    preview.directorio ?? directorioAutoridades ?? defaultDirectorioAutoridades
  );

  const { value: row, setValue: setRow } = useDraftHistory<DirectorioAutoridad>(() => {
    const found = id ? persisted.find((e) => e.id === id) : undefined;
    return found ? { ...found } : emptyDirectorio();
  });

  const [allEntries, setAllEntries] = useState(() => persisted.map((e) => ({ ...e })));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = allEntries.map((e) => ({ ...e }));
    if (removed) return stampDirectorioIds(list.filter((e) => e.id !== row.id));
    const idx = list.findIndex((e) => e.id === row.id);
    if (idx >= 0) list[idx] = row;
    else list.unshift(row);
    return stampDirectorioIds(list);
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("directorio", previewList);

  const save = async () => {
    if (!removed && (!row.pais.trim() || !row.acronym.trim())) {
      setError("País y acrónimo son obligatorios.");
      return;
    }
    const next = removed
      ? previewList
      : previewList.map((e) => (e.id === row.id ? { ...row } : e));
    const prepared = next
      .filter((e) => e.pais.trim() && e.acronym.trim())
      .map((e) => ({
        ...e,
        pais: e.pais.trim(),
        acronym: e.acronym.trim(),
        presidente: e.presidente.trim(),
        cargo: e.cargo.trim(),
        corresponsal: e.corresponsal.trim(),
        correo: e.correo.trim(),
      }));
    setSaving(true);
    setError(null);
    const before = cloneJson(directorioAutoridades ?? defaultDirectorioAutoridades);
    const res = await api.settings.set(DIRECTORIO_AUTORIDADES_SETTINGS_KEY, { entries: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "directorio de autoridades",
      undo: async () => {
        const r = await api.settings.set(DIRECTORIO_AUTORIDADES_SETTINGS_KEY, { entries: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(DIRECTORIO_AUTORIDADES_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(DIRECTORIO_AUTORIDADES_SETTINGS_KEY, { entries: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(DIRECTORIO_AUTORIDADES_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(DIRECTORIO_AUTORIDADES_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("directorio");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((e) => e.id === row.id);
      if (saved) setRow(saved);
      setAllEntries(prepared);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Contacto oficial de este miembro. La tarjeta del directorio se actualiza al instante.
      </p>
      <Field label="País">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.pais}
          placeholder="ARGENTINA"
          onChange={(e) => {
            setRow({ ...row, pais: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Acrónimo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.acronym}
          placeholder="ENACOM"
          onChange={(e) => {
            setRow({ ...row, acronym: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Autoridad (nombre)">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.presidente}
          onChange={(e) => {
            setRow({ ...row, presidente: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Cargo">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.cargo}
          onChange={(e) => {
            setRow({ ...row, cargo: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Corresponsal">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.corresponsal}
          onChange={(e) => {
            setRow({ ...row, corresponsal: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Correo">
        <input
          type="email"
          className={fieldClass}
          style={fieldStyle}
          value={row.correo}
          onChange={(e) => {
            setRow({ ...row, correo: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
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
              setAllEntries((prev) => prev.filter((e) => e.id !== row.id));
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
