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
  GRUPOS_TRABAJO_SETTINGS_KEY,
  GRUPO_ICON_KEYS,
  defaultGruposTrabajo,
  type GrupoTrabajoIconKey,
  type GrupoTrabajoSerialized,
} from "@/data/gruposTrabajo";

const fieldClass =
  "w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-snug outline-none transition-colors focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

const ICON_LABELS: Record<GrupoTrabajoIconKey, string> = {
  Shield: "Escudo",
  Wifi: "Conectividad",
  BarChart3: "Gráfico",
  TrendingUp: "Tendencia",
  Network: "Red",
  Briefcase: "Maletín",
  Sparkles: "Destellos",
  Users: "Personas",
};

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

function cloneGrupos(list: GrupoTrabajoSerialized[]): GrupoTrabajoSerialized[] {
  return list.map((g) => ({
    ...g,
    coordinadores: [...g.coordinadores],
    miembros: [...g.miembros],
  }));
}

function emptyGrupo(): GrupoTrabajoSerialized {
  return {
    id: `grupo-new-${Date.now()}`,
    title: "",
    description: "",
    coordinadores: [],
    miembros: [],
    iconKey: "Shield",
    imageUrl: "",
  };
}

function linesToList(text: string): string[] {
  return text.split("\n");
}

function uniqueGrupoId(title: string, currentId: string, others: GrupoTrabajoSerialized[]): string {
  const base = slugify(title) || currentId;
  if (!others.some((g) => g.id === base)) return base;
  let n = 2;
  while (others.some((g) => g.id === `${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function GrupoForm({ id }: { id?: string }) {
  const { gruposTrabajo, refetch } = useSiteSettings();
  const { clearPreview, preview, recordPersistedChange } = useSiteEdit();
  const persisted = cloneGrupos(preview.grupos ?? gruposTrabajo ?? defaultGruposTrabajo);

  const { value: row, setValue: setRow } = useDraftHistory<GrupoTrabajoSerialized>(() => {
    const found = id ? persisted.find((g) => g.id === id) : undefined;
    return found
      ? { ...found, coordinadores: [...found.coordinadores], miembros: [...found.miembros] }
      : emptyGrupo();
  });

  const [allEntries, setAllEntries] = useState(() => cloneGrupos(persisted));
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const previewList = useMemo(() => {
    const list = cloneGrupos(allEntries);
    if (removed) return list.filter((g) => g.id !== row.id);
    const idx = list.findIndex((g) => g.id === row.id);
    if (idx >= 0) list[idx] = { ...row, coordinadores: [...row.coordinadores], miembros: [...row.miembros] };
    else list.unshift({ ...row, coordinadores: [...row.coordinadores], miembros: [...row.miembros] });
    return list;
  }, [allEntries, row, removed]);

  const captureBaseline = usePreviewSync("grupos", previewList);

  const save = async () => {
    if (!removed && !row.title.trim()) {
      setError("El grupo necesita un título.");
      return;
    }
    const next = removed
      ? previewList
      : previewList.map((g) => (g.id === row.id ? { ...row } : g));
    const prepared = next
      .filter((g) => g.title.trim())
      .map((g, i, arr) => {
        const others = arr.filter((x) => x.id !== g.id);
        const idNeedsSlug = !g.id.trim() || g.id.startsWith("grupo-new-");
        return {
          ...g,
          id: idNeedsSlug ? uniqueGrupoId(g.title, g.id || `grupo-${i + 1}`, others) : g.id.trim(),
          title: g.title.trim(),
          description: g.description.trim(),
          coordinadores: g.coordinadores.map((c) => c.trim()).filter(Boolean),
          miembros: g.miembros.map((m) => m.trim()).filter(Boolean),
          imageUrl: g.imageUrl.trim(),
          termsUrl: g.termsUrl?.trim() || undefined,
          informeUrl: g.informeUrl?.trim() || undefined,
        };
      });
    setSaving(true);
    setError(null);
    const before = cloneJson(gruposTrabajo ?? defaultGruposTrabajo);
    const res = await api.settings.set(GRUPOS_TRABAJO_SETTINGS_KEY, { entries: prepared });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo publicar.");
      return;
    }
    recordPersistedChange({
      label: "grupos de trabajo",
      undo: async () => {
        const r = await api.settings.set(GRUPOS_TRABAJO_SETTINGS_KEY, { entries: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(GRUPOS_TRABAJO_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(GRUPOS_TRABAJO_SETTINGS_KEY, { entries: prepared });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(GRUPOS_TRABAJO_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(GRUPOS_TRABAJO_SETTINGS_KEY);
    await refetch();
    captureBaseline();
    clearPreview("grupos");
    setPublished(true);
    if (!removed) {
      const saved = prepared.find((g) => g.title === row.title.trim()) ?? prepared.find((g) => g.id === row.id);
      if (saved) setRow({ ...saved, coordinadores: [...saved.coordinadores], miembros: [...saved.miembros] });
      setAllEntries(cloneGrupos(prepared));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Título, texto, coordinadores y documentos. La ficha se actualiza al instante.
      </p>
      <Field label="Título">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.title}
          placeholder="Protección y empoderamiento de los usuarios"
          onChange={(e) => {
            setRow({ ...row, title: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Descripción">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.description}
          onChange={(e) => {
            setRow({ ...row, description: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Icono (si no hay foto)">
        <select
          className={fieldClass}
          style={fieldStyle}
          value={row.iconKey}
          onChange={(e) => {
            setRow({ ...row, iconKey: e.target.value as GrupoTrabajoIconKey });
            setPublished(false);
          }}
        >
          {GRUPO_ICON_KEYS.map((k) => (
            <option key={k} value={k}>
              {ICON_LABELS[k]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Coordinadores (una por línea)">
        <textarea
          rows={3}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.coordinadores.join("\n")}
          placeholder={"OSIPTEL, Perú"}
          onChange={(e) => {
            setRow({ ...row, coordinadores: linesToList(e.target.value) });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Miembros (una por línea)">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.miembros.join("\n")}
          placeholder={"SUTEL, Costa Rica\nATT, Bolivia"}
          onChange={(e) => {
            setRow({ ...row, miembros: linesToList(e.target.value) });
            setPublished(false);
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Foto del grupo"
        value={row.imageUrl}
        onChange={(url) => {
          setRow({ ...row, imageUrl: url });
          setPublished(false);
        }}
        kind="image"
        folder="attachments"
        helpText="Foto que se ve en la ficha."
      />
      <AdminBlobUploadField
        label="Términos de referencia (opcional)"
        value={row.termsUrl ?? ""}
        onChange={(url) => {
          setRow({ ...row, termsUrl: url.trim() || undefined });
          setPublished(false);
        }}
        kind="document"
        folder="documents"
      />
      <AdminBlobUploadField
        label="Informe (opcional)"
        value={row.informeUrl ?? ""}
        onChange={(url) => {
          setRow({ ...row, informeUrl: url.trim() || undefined });
          setPublished(false);
        }}
        kind="document"
        folder="documents"
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
              setAllEntries((prev) => prev.filter((g) => g.id !== row.id));
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
