import type { BlobStorageUsage } from "@/types/uploads";

export const BLOB_STORAGE_EVENT = "regulatel:blob-storage";
export const BLOB_STORAGE_OPTIMISTIC_EVENT = "regulatel:blob-optimistic";
export const BLOB_STORAGE_REFRESH_EVENT = "regulatel:blob-refresh";

export function formatStorageBytes(bytes: number): string {
  const n = Math.max(0, Number(bytes) || 0);
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) {
    const kb = n / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  if (n < 1024 * 1024 * 1024) {
    const mb = n / (1024 * 1024);
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  }
  const gb = n / (1024 * 1024 * 1024);
  return `${gb < 10 ? gb.toFixed(2) : gb.toFixed(1)} GB`;
}

export function emitBlobStorage(usage: BlobStorageUsage, lastAddedBytes?: number) {
  window.dispatchEvent(
    new CustomEvent(BLOB_STORAGE_EVENT, { detail: { ...usage, lastAddedBytes } })
  );
}

export function emitBlobOptimistic(addedBytes: number) {
  window.dispatchEvent(new CustomEvent(BLOB_STORAGE_OPTIMISTIC_EVENT, { detail: { addedBytes } }));
}

export function emitBlobStorageRefresh() {
  window.dispatchEvent(new CustomEvent(BLOB_STORAGE_REFRESH_EVENT));
}
