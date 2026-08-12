import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { CMS_SAVED_EVENT } from "@/lib/siteEdit";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import {
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  mergeBoletinesGtaiWithDefaults,
  parseBoletinesGtaiFromSettingValue,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";

export function useBoletinesGtai(): { entries: BoletinGtaiSerialized[]; loading: boolean; reload: () => Promise<void> } {
  const [entries, setEntries] = useState<BoletinGtaiSerialized[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
    if (res.ok && res.data && res.data.value != null) {
      const parsed = parseBoletinesGtaiFromSettingValue(res.data.value);
      if (parsed !== null) {
        setEntries(mergeBoletinesGtaiWithDefaults(parsed));
        setLoading(false);
        return;
      }
    }
    setEntries(defaultBoletinesGtai);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    const onSaved = () => {
      void load();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener(CMS_SAVED_EVENT, onSaved);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener(CMS_SAVED_EVENT, onSaved);
    };
  }, [load]);

  const { enabled, preview } = useSiteEdit();
  const live = enabled && preview.boletines ? preview.boletines : entries;

  return { entries: live, loading, reload: load };
}
