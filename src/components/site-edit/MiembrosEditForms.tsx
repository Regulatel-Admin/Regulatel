import { useMemo, useState, type ReactNode } from "react";
import { Send, Trash2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { slugify } from "@/lib/slugify";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { useSettingRemoval } from "@/hooks/useSettingRemoval";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import { enteLogoByRoute, logoKeyFromEnteRoute } from "@/data/miembrosVisuals";
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
  findDirectorioForEnte,
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

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border p-4" style={{ borderColor: "rgba(22,61,89,0.10)", backgroundColor: "#fbfcfd" }}>
      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: "var(--regu-navy)" }}>{title}</h3>
        {hint ? <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>{hint}</p> : null}
      </div>
      {children}
    </section>
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
  // La autoridad y el contacto viven en el Directorio de autoridades; aquí se edita esa misma entrada.
  const { directorioAutoridades } = useSiteSettings();
  const directorio = useMemo(
    () => stampDirectorioIds(directorioAutoridades ?? defaultDirectorioAutoridades),
    [directorioAutoridades]
  );
  const contact = findDirectorioForEnte(directorio, row);
  const [authority, setAuthority] = useState(() => ({
    presidente: contact?.presidente ?? "",
    cargo: contact?.cargo ?? "",
    corresponsal: contact?.corresponsal ?? "",
    correo: contact?.correo ?? "",
  }));
  const authorityFields = ["presidente", "cargo", "corresponsal", "correo"] as const;
  const authorityChanged = authorityFields.some((field) => (contact?.[field] ?? "") !== authority[field].trim());
  const hasAuthority = authorityFields.some((field) => authority[field].trim());
  const nextDirectorio = useMemo(() => {
    const update = Object.fromEntries(authorityFields.map((field) => [field, authority[field].trim()])) as Pick<DirectorioAutoridad, (typeof authorityFields)[number]>;
    const target = findDirectorioForEnte(directorio, row);
    if (target) return directorio.map((entry) => (entry.id === target.id ? { ...entry, ...update } : entry));
    if (!hasAuthority || !row.name.trim() || !row.country.trim()) return directorio;
    return [...directorio, { ...emptyDirectorio(), id: `dir-${row.id}`, pais: row.country.trim().toUpperCase(), acronym: row.name.trim(), ...update }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directorio, row, authority, hasAuthority]);
  const captureDirectorioBaseline = usePreviewSync("directorio", removed ? undefined : nextDirectorio);
  const currentLogo = row.logoUrl?.trim() || enteLogoByRoute[logoKeyFromEnteRoute(row.route, row.name)];

  const previewList = useMemo(() => {
    const list = allEntries.map((e) => ({ ...e }));
    if (removed) return stampEnteIds(list.filter((e) => e.id !== row.id));
    const idx = list.findIndex((e) => e.id === row.id);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    return stampEnteIds(list);
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("entes", previewList);

  const { remove, removing } = useSettingRemoval({
    settingsKey: ENTES_MIEMBROS_SETTINGS_KEY,
    previewKey: "entes",
    label: "ente regulador",
    fallbackValue: { entes: stampEnteIds(entesReguladoresMiembros ?? defaultEntesReguladoresMiembros) },
    removeFromValue: (value) => {
      const stamped = stampEnteIds(value.entes);
      return { ...value, entes: value.entes.filter((_, index) => stamped[index].id !== row.id) };
    },
    saving,
    setSaving,
    setError,
    onRemoved: () => setRemoved(true),
  });

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
          description: e.description?.trim() || undefined,
          route,
          externalUrl: e.externalUrl.trim(),
          linkExternalOnly: e.linkExternalOnly === true,
        };
      });
    setSaving(true);
    setError(null);
    const before = cloneJson(entesReguladoresMiembros ?? defaultEntesReguladoresMiembros);
    const res = await api.settings.set(ENTES_MIEMBROS_SETTINGS_KEY, { entes: prepared });
    if (!res.ok) {
      setSaving(false);
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    if (!removed && authorityChanged && (hasAuthority || contact)) {
      const dirRes = await api.settings.set(DIRECTORIO_AUTORIDADES_SETTINGS_KEY, { entries: nextDirectorio });
      if (!dirRes.ok) {
        setSaving(false);
        setError(`La tarjeta se publicó, pero el contacto del Directorio no: ${dirRes.error ?? "inténtalo otra vez."}`);
        await refetch();
        return;
      }
      notifyCmsSaved(DIRECTORIO_AUTORIDADES_SETTINGS_KEY);
      captureDirectorioBaseline(nextDirectorio);
      clearPreview("directorio");
    }
    setSaving(false);
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
        Todo lo de este miembro en un solo lugar. Lo que cambies se ve al instante en la tarjeta, en el Directorio y en su ficha.
      </p>
      <div
        className="flex items-center gap-4 rounded-2xl border bg-white p-4"
        style={{ borderColor: "rgba(68,137,198,0.35)", boxShadow: "0 4px 14px rgba(22,61,89,0.06)" }}
        aria-label="Vista previa del miembro"
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white p-1.5" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          {currentLogo ? (
            <img src={currentLogo} alt={`Logo de ${row.name || "este ente"}`} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-[11px]" style={{ color: "var(--regu-gray-400)" }}>Sin logo</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase" style={{ color: "var(--regu-navy)" }}>
            {(row.name || "Nombre corto") + " – " + (row.country || "País")}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[12px]" style={{ color: "var(--regu-gray-500)" }}>{row.fullName || "Nombre completo"}</p>
          <p className="mt-1.5 truncate text-[13px] font-semibold" style={{ color: "var(--regu-gray-800)" }}>
            {authority.presidente || "Autoridad sin indicar"}
            {authority.cargo ? <span className="font-normal" style={{ color: "var(--regu-gray-500)" }}> · {authority.cargo}</span> : null}
          </p>
        </div>
      </div>
      <Section title="Logo" hint="PNG o JPG con fondo claro. Se usa en la tarjeta, el Directorio y la ficha.">
        <AdminBlobUploadField
          label={row.logoUrl ? "Logo subido" : "Subir un logo nuevo"}
          value={row.logoUrl ?? ""}
          onChange={(url) => {
            setRow({ ...row, logoUrl: url || undefined });
            setPublished(false);
          }}
          kind="image"
          folder="attachments"
          showPreview={false}
          helpText={row.logoUrl ? "Quita el logo subido para volver al logo original del sitio." : "Ahora se muestra el logo original del sitio (arriba)."}
        />
      </Section>
      <Section title="Datos del ente">
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
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
      </Section>
      <Section
        title="Autoridad y contacto"
        hint={
          contact
            ? "Es la misma información de su tarjeta en el Directorio de autoridades."
            : "Este ente aún no está en el Directorio de autoridades; al publicar se añade."
        }
      >
        <Field label="Nombre">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={authority.presidente}
            placeholder="Nombre y apellidos"
            onChange={(e) => {
              setAuthority({ ...authority, presidente: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
        <Field label="Cargo">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={authority.cargo}
            placeholder="Presidente"
            onChange={(e) => {
              setAuthority({ ...authority, cargo: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Corresponsal">
            <input
              className={fieldClass}
              style={fieldStyle}
              value={authority.corresponsal}
              onChange={(e) => {
                setAuthority({ ...authority, corresponsal: e.target.value });
                setPublished(false);
              }}
            />
          </Field>
          <Field label="Correo">
            <input
              type="email"
              className={fieldClass}
              style={fieldStyle}
              value={authority.correo}
              placeholder="nombre@ente.gob"
              onChange={(e) => {
                setAuthority({ ...authority, correo: e.target.value });
                setPublished(false);
              }}
            />
          </Field>
        </div>
      </Section>
      <Section title="Ficha del ente">
        <Field label="Descripción" hint="Texto de la ficha. Déjalo vacío para usar el texto original.">
          <textarea
            rows={4}
            className={`${fieldClass} resize-y`}
            style={fieldStyle}
            value={row.description ?? ""}
            onChange={(e) => {
              setRow({ ...row, description: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
      </Section>
      <Section title="Enlaces">
        <Field label="Sitio web oficial">
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
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={row.linkExternalOnly === true}
            onChange={(e) => {
              setRow({ ...row, linkExternalOnly: e.target.checked });
              setPublished(false);
            }}
          />
          <span style={{ color: "var(--regu-gray-800)" }}>La tarjeta abre directamente el sitio web oficial (sin ficha en REGULATEL)</span>
        </label>
        {row.linkExternalOnly !== true && (
          <Field label="Página de la ficha en este sitio" hint="Ejemplo: /siget. Si lo dejas vacío, se crea a partir del nombre corto.">
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
        )}
      </Section>
      <PublishBar
        saving={saving}
        error={error}
        published={published}
        onPublish={() => void save()}
        extra={
          <button
            type="button"
            onClick={() => void remove()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            {removing ? "Quitando…" : "Quitar"}
          </button>
        }
      />
    </div>
  );
}

/** Una tarjeta del Directorio abre el mismo formulario del miembro; solo los contactos sin ente usan el formulario corto. */
export function DirectorioForm({ id }: { id?: string }) {
  const { directorioAutoridades, entesReguladoresMiembros } = useSiteSettings();
  const { preview } = useSiteEdit();
  const entry = id
    ? stampDirectorioIds(preview.directorio ?? directorioAutoridades ?? defaultDirectorioAutoridades).find((e) => e.id === id)
    : undefined;
  const ente = entry
    ? stampEnteIds(preview.entes ?? entesReguladoresMiembros ?? defaultEntesReguladoresMiembros).find(
        (candidate) => findDirectorioForEnte([entry], candidate) === entry
      )
    : undefined;
  if (ente?.id) return <EnteForm id={ente.id} />;
  return <DirectorioContactForm id={id} />;
}

function DirectorioContactForm({ id }: { id?: string }) {
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

  const { remove, removing } = useSettingRemoval({
    settingsKey: DIRECTORIO_AUTORIDADES_SETTINGS_KEY,
    previewKey: "directorio",
    label: "directorio",
    fallbackValue: { entries: stampDirectorioIds(directorioAutoridades ?? defaultDirectorioAutoridades) },
    removeFromValue: (value) => {
      const stamped = stampDirectorioIds(value.entries);
      return { ...value, entries: value.entries.filter((_, index) => stamped[index].id !== row.id) };
    },
    saving,
    setSaving,
    setError,
    onRemoved: () => setRemoved(true),
  });

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
            onClick={() => void remove()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            {removing ? "Quitando…" : "Quitar"}
          </button>
        }
      />
    </div>
  );
}
