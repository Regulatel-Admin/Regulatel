/** Browser-only drafts. This module deliberately has no API/publication dependency. */
export const DRAFTS_CHANGED = "regulatel:drafts-changed";
const PREFIX = "regulatel:private-draft:v1:";
export type DraftKind = "event" | "news" | "event-order";
export interface DraftRecord<T = unknown> {
  version: 1;
  identity: string;
  kind: DraftKind;
  path: string;
  label: string;
  newEvent?: boolean;
  baseline: string;
  value: T;
  savedAt: number;
}

// Ignore API bookkeeping and object insertion order when comparing published content.
export function draftSignature(value: unknown): string {
  return JSON.stringify(value, (key, item) => {
    if (key === "updatedAt" || key === "createdAt") return undefined;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.fromEntries(Object.keys(item).sort().map(name => [name, item[name]]));
    }
    return item;
  });
}

export function draftKey(userId: string, identity: string): string {
  return `${PREFIX}${encodeURIComponent(userId)}:${encodeURIComponent(identity)}`;
}

export function parseDraft(raw: string, identity?: string): DraftRecord {
  const record = JSON.parse(raw) as DraftRecord;
  if (record?.version !== 1 || typeof record.identity !== "string" || (identity && identity !== record.identity)
    || !["event", "news", "event-order"].includes(record.kind) || typeof record.baseline !== "string"
    || typeof record.savedAt !== "number" || !Number.isFinite(record.savedAt) || typeof record.label !== "string"
    || typeof record.path !== "string" || !/^\/(eventos|noticias)([/?]|$)/.test(record.path)) throw new Error("El borrador guardado no se pudo leer. Se conserva para evitar perderlo.");
  const value = record.value as Record<string, unknown>;
  if (record.kind === "event-order") {
    if (!Array.isArray(value) || !value.every(id => typeof id === "string")) throw new Error("Orden guardado no válido.");
  } else if (!value || typeof value !== "object" || typeof value.id !== "string" || typeof value.title !== "string"
    || (record.kind === "event" && ["startDate", "organizer", "location"].some(key => typeof value[key] !== "string"))
    || (record.kind === "news" && ["slug", "date", "excerpt", "category"].some(key => typeof value[key] !== "string"))) {
    throw new Error("El contenido del borrador no se pudo leer. Se conserva para evitar perderlo.");
  }
  return record;
}

export class DraftConflictError extends Error {
  constructor() { super("Este borrador cambió en otra pestaña. Elige qué versión conservar."); }
}

/** Compare before writing: another tab must never silently lose its saved draft. */
export class DraftSession<T> {
  private expected: string | null;
  constructor(private storage: Storage, readonly key: string, readonly identity: string) {
    this.expected = storage.getItem(key);
  }
  read(): DraftRecord<T> | null {
    return this.expected === null ? null : parseDraft(this.expected, this.identity) as DraftRecord<T>;
  }
  acceptLatest(): DraftRecord<T> | null {
    this.expected = this.storage.getItem(this.key);
    return this.read();
  }
  write(record: DraftRecord<T> | null): void {
    if (this.storage.getItem(this.key) !== this.expected) throw new DraftConflictError();
    const raw = record ? JSON.stringify(record) : null;
    if (raw === this.expected) return;
    if (raw === null) this.storage.removeItem(this.key);
    else this.storage.setItem(this.key, raw);
    this.expected = raw; // Only acknowledge successful writes (quota/private mode may throw).
  }
}

export function listDrafts(storage: Storage, userId: string): DraftRecord[] {
  const prefix = `${PREFIX}${encodeURIComponent(userId)}:`;
  const records: DraftRecord[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(prefix)) continue;
    try { const raw = storage.getItem(key); if (raw) records.push(parseDraft(raw)); } catch { /* Preserve unreadable entries. */ }
  }
  return records.sort((a, b) => b.savedAt - a.savedAt);
}
