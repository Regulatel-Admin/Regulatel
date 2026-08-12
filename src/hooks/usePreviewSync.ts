import { useCallback, useEffect, useRef } from "react";
import { useSiteEdit, type SiteEditPreview } from "@/contexts/SiteEditContext";

/**
 * Muestra el borrador en la página en cuanto cambia, sin escribir en la base.
 * El primer valor se toma como base: si vuelves a él, se quita la vista previa.
 */
export function usePreviewSync<K extends keyof SiteEditPreview>(
  key: K,
  value: SiteEditPreview[K] | undefined,
  ready = true
) {
  const { enabled, setPreview, clearPreview } = useSiteEdit();
  const baselineRef = useRef<string | null>(null);
  const primedRef = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!enabled || !ready || value === undefined) {
      if (!ready) {
        primedRef.current = false;
        baselineRef.current = null;
      }
      return;
    }
    const serialized = JSON.stringify(value);
    if (!primedRef.current) {
      primedRef.current = true;
      baselineRef.current = serialized;
      return;
    }
    if (serialized === baselineRef.current) {
      clearPreview(key);
      return;
    }
    setPreview({ [key]: value } as Partial<SiteEditPreview>);
  }, [enabled, ready, key, value, setPreview, clearPreview]);

  const captureBaseline = useCallback(() => {
    if (valueRef.current === undefined) return;
    baselineRef.current = JSON.stringify(valueRef.current);
  }, []);

  return captureBaseline;
}
