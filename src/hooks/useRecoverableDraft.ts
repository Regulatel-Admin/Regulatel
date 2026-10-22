import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DRAFTS_CHANGED, DraftConflictError, DraftSession, draftKey, draftSignature, type DraftKind, type DraftRecord } from "@/lib/recoverableDrafts";

interface Options<T> {
  identity: string;
  kind: DraftKind;
  path: string;
  label: string;
  value: T;
  baseline: T;
  enabled: boolean;
  newEvent?: boolean;
  onRestore: (value: T) => void;
}
export interface DraftStatus {
  savedAt: number | null;
  recovered: boolean;
  changedPublished: boolean;
  error: string;
  conflict: boolean;
}
const empty: DraftStatus = { savedAt: null, recovered: false, changedPublished: false, error: "", conflict: false };

export function useRecoverableDraft<T>(options: Options<T>) {
  const { user, isAdmin } = useAuth();
  const enabled = options.enabled && isAdmin && Boolean(user?.id);
  const valueSignature = draftSignature(options.value);
  const baselineSignature = draftSignature(options.baseline);
  const key = user?.id ? draftKey(user.id, options.identity) : "";
  const latest = useRef(options);
  latest.current = options;
  const session = useRef<DraftSession<T> | null>(null);
  const pendingRestore = useRef<string | null>(null);
  const lastSaved = useRef<string | null>(null);
  const failed = useRef(false);
  const [status, setStatus] = useState<DraftStatus>(empty);
  const report = useCallback((err: unknown) => {
    failed.current = true;
    setStatus(current => ({ ...current, error: err instanceof DraftConflictError ? err.message : "No se pudo guardar el borrador en este navegador. Mantén esta pestaña abierta y vuelve a intentarlo.", conflict: err instanceof DraftConflictError }));
  }, []);
  const announce = () => window.dispatchEvent(new Event(DRAFTS_CHANGED));

  const flush = useCallback(() => {
    if (!session.current || pendingRestore.current !== null) return;
    const current = latest.current;
    const signature = draftSignature(current.value);
    if (signature === lastSaved.current && !failed.current) return;
    try {
      const dirty = signature !== draftSignature(current.baseline);
      const savedAt = Date.now();
      const record: DraftRecord<T> | null = dirty ? {
        version: 1, identity: current.identity, kind: current.kind, path: current.path,
        label: current.label || "Sin título", newEvent: current.newEvent,
        baseline: draftSignature(current.baseline), value: current.value, savedAt,
      } : null;
      session.current.write(record);
      lastSaved.current = signature;
      failed.current = false;
      setStatus(previous => ({ ...previous, savedAt: dirty ? savedAt : null, recovered: dirty && previous.recovered, error: "", conflict: false }));
      announce();
    } catch (err) { report(err); }
  }, [report]);

  const initialize = useCallback((recover = true) => {
    try {
      session.current = new DraftSession<T>(window.localStorage, key, latest.current.identity);
      const record = session.current.read();
      const current = latest.current;
      lastSaved.current = draftSignature(current.baseline);
      failed.current = false;
      if (record && recover) {
        pendingRestore.current = draftSignature(record.value);
        lastSaved.current = pendingRestore.current;
        setStatus({ ...empty, savedAt: record.savedAt, recovered: true, changedPublished: !current.newEvent && record.baseline !== draftSignature(current.baseline) });
        current.onRestore(record.value);
      } else { pendingRestore.current = null; setStatus(empty); }
    } catch (err) { session.current = null; report(err); }
  }, [key, report]);

  // Recovery runs only inside an authenticated editor, never on a public page.
  useLayoutEffect(() => {
    if (!enabled) { session.current = null; return; }
    initialize();
    return () => { session.current = null; };
  }, [initialize, enabled]);

  // No debounce: each committed input is stored before the next paint/navigation.
  useLayoutEffect(() => {
    if (!enabled) return;
    if (pendingRestore.current !== null) {
      if (draftSignature(options.value) !== pendingRestore.current) return;
      pendingRestore.current = null;
    }
    flush();
  }, [valueSignature, baselineSignature, enabled, flush]);

  useEffect(() => {
    if (!enabled) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      flush();
      if (failed.current) { event.preventDefault(); event.returnValue = ""; }
    };
    const visibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled, flush]);

  // Call only after an explicit successful publication or an explicit discard.
  const clear = useCallback((next: T) => {
    pendingRestore.current = draftSignature(next);
    lastSaved.current = pendingRestore.current;
    try { session.current?.write(null); failed.current = false; setStatus(empty); announce(); }
    catch (err) { report(err); }
  }, [report]);
  const discard = () => { const next = latest.current.baseline; clear(next); latest.current.onRestore(next); };
  const recoverLatest = () => {
    try {
      const record = session.current?.acceptLatest();
      const next = record?.value ?? latest.current.baseline;
      pendingRestore.current = draftSignature(next); lastSaved.current = pendingRestore.current;
      failed.current = false;
      setStatus({ ...empty, savedAt: record?.savedAt ?? null, recovered: Boolean(record), changedPublished: Boolean(record && record.baseline !== draftSignature(latest.current.baseline)) });
      latest.current.onRestore(next);
    } catch (err) { report(err); }
  };
  const keepCurrent = () => {
    try { session.current?.acceptLatest(); lastSaved.current = null; pendingRestore.current = null; flush(); }
    catch (err) { report(err); }
  };
  const retry = () => {
    // Retrying storage must retain text typed while storage was unavailable.
    if (!session.current && enabled) initialize(false);
    flush();
  };
  return { ...status, clear, discard, retry, recoverLatest, keepCurrent };
}
