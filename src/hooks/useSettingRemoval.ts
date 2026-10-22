import { useRef, useState } from "react";
import { useSiteEdit, type SiteEditPreview } from "@/contexts/SiteEditContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { api } from "@/lib/api";
import { cloneJson, notifyCmsSaved } from "@/lib/siteEdit";

/** Retira una ficha guardada sin publicar los demás cambios del formulario. */
export function useSettingRemoval<T>({
  settingsKey,
  previewKey,
  label,
  fallbackValue,
  removeFromValue,
  saving,
  setSaving,
  setError,
  onRemoved,
}: {
  settingsKey: string;
  previewKey: keyof SiteEditPreview;
  label: string;
  fallbackValue: T;
  removeFromValue: (value: T) => T;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  onRemoved?: () => void;
}) {
  const { clearPreview, close, recordPersistedChange } = useSiteEdit();
  const { refetch } = useSiteSettings();
  const [removing, setRemoving] = useState(false);
  const busy = useRef(false);

  const remove = async () => {
    if (saving || busy.current) return;
    busy.current = true;
    setRemoving(true);
    setSaving(true);
    setError(null);
    try {
      // Se lee de nuevo: nunca se envían otros borradores al pulsar Quitar.
      const loaded = await api.settings.get(settingsKey);
      if (!loaded.ok) throw new Error(loaded.error || "No se pudo cargar lo publicado. Intenta de nuevo.");
      const raw = loaded.data.value;
      const before = cloneJson((typeof raw === "string" ? JSON.parse(raw) : raw) ?? fallbackValue) as T;
      const after = removeFromValue(cloneJson(before));
      if (JSON.stringify(after) !== JSON.stringify(before)) {
        const result = await api.settings.set(settingsKey, after);
        if (!result.ok) throw new Error(result.error || "No se pudo quitar del sitio. Intenta de nuevo.");
        recordPersistedChange({
          label,
          undo: async () => {
            const result = await api.settings.set(settingsKey, before);
            if (!result.ok) throw new Error(result.error || "No se pudo deshacer.");
            notifyCmsSaved(settingsKey);
          },
          redo: async () => {
            const result = await api.settings.set(settingsKey, after);
            if (!result.ok) throw new Error(result.error || "No se pudo rehacer.");
            notifyCmsSaved(settingsKey);
          },
        });
        notifyCmsSaved(settingsKey);
        await refetch();
      }
      clearPreview(previewKey);
      onRemoved?.();
      close();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo quitar del sitio. Intenta de nuevo.");
    } finally {
      busy.current = false;
      setRemoving(false);
      setSaving(false);
    }
  };

  return { remove, removing };
}
