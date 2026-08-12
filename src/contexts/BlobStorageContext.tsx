import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import {
  BLOB_STORAGE_EVENT,
  BLOB_STORAGE_OPTIMISTIC_EVENT,
  BLOB_STORAGE_REFRESH_EVENT,
} from "@/lib/blobStorage";
import type { BlobStorageUsage } from "@/types/uploads";

type BlobStorageState = BlobStorageUsage & { lastAddedBytes?: number };

interface BlobStorageContextValue {
  usage: BlobStorageState | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BlobStorageContext = createContext<BlobStorageContextValue>({
  usage: null,
  loading: false,
  refresh: async () => {},
});

function withDerived(usage: BlobStorageUsage, lastAddedBytes?: number): BlobStorageState {
  const remainingBytes = Math.max(0, usage.limitBytes - usage.usedBytes);
  const percent = usage.limitBytes > 0 ? Math.min(100, (usage.usedBytes / usage.limitBytes) * 100) : 0;
  return { ...usage, remainingBytes, percent, lastAddedBytes };
}

export function BlobStorageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<BlobStorageState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await api.uploads.usage();
    if (!res.ok) {
      setLoading(false);
      return;
    }
    setUsage(withDerived(res.data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onExact = (event: Event) => {
      const detail = (event as CustomEvent<BlobStorageState>).detail;
      if (!detail || typeof detail.usedBytes !== "number") return;
      setUsage(withDerived(detail, detail.lastAddedBytes));
      setLoading(false);
    };
    const onOptimistic = (event: Event) => {
      const addedBytes = Number((event as CustomEvent<{ addedBytes?: number }>).detail?.addedBytes ?? 0);
      if (!addedBytes) return;
      setUsage((prev) => {
        if (!prev) return prev;
        return withDerived(
          { ...prev, usedBytes: prev.usedBytes + addedBytes, fileCount: prev.fileCount + 1 },
          addedBytes
        );
      });
    };
    const onRefresh = () => {
      void refresh();
    };
    window.addEventListener(BLOB_STORAGE_EVENT, onExact);
    window.addEventListener(BLOB_STORAGE_OPTIMISTIC_EVENT, onOptimistic);
    window.addEventListener(BLOB_STORAGE_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(BLOB_STORAGE_EVENT, onExact);
      window.removeEventListener(BLOB_STORAGE_OPTIMISTIC_EVENT, onOptimistic);
      window.removeEventListener(BLOB_STORAGE_REFRESH_EVENT, onRefresh);
    };
  }, [refresh]);

  const value = useMemo(() => ({ usage, loading, refresh }), [usage, loading, refresh]);

  return <BlobStorageContext.Provider value={value}>{children}</BlobStorageContext.Provider>;
}

export function useBlobStorage() {
  return useContext(BlobStorageContext);
}
