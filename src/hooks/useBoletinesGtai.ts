import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  parseBoletinesGtaiFromSettingValue,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";

export function useBoletinesGtai(): { entries: BoletinGtaiSerialized[]; loading: boolean; reload: () => Promise<void> } {
  const [entries, setEntries] = useState<BoletinGtaiSerialized[]>(defaultBoletinesGtai);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
    if (res.ok && res.data && res.data.value != null) {
      const parsed = parseBoletinesGtaiFromSettingValue(res.data.value);
      if (parsed !== null) {
        setEntries(parsed);
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
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  return { entries, loading, reload: load };
}
