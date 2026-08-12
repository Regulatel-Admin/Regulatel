import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteEdit, type SiteEditDraftController } from "@/contexts/SiteEditContext";

const COALESCE_MS = 450;
const MAX_STEPS = 40;

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Historial local del formulario abierto: cada cambio se puede deshacer / rehacer.
 * Los tecleos seguidos cuentan como un solo paso.
 */
export function useDraftHistory<T>(initial: T | (() => T)): {
  value: T;
  setValue: (next: T | ((prev: T) => T)) => void;
  reset: (next: T) => void;
} {
  const { registerDraft } = useSiteEdit();
  const [value, setValueState] = useState<T>(initial);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const lastPushAtRef = useRef(0);
  const skipRecordRef = useRef(false);

  const syncFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (skipRecordRef.current) {
          skipRecordRef.current = false;
          return resolved;
        }
        const now = Date.now();
        if (now - lastPushAtRef.current > COALESCE_MS || pastRef.current.length === 0) {
          pastRef.current = [...pastRef.current, cloneJson(prev)].slice(-MAX_STEPS);
        }
        lastPushAtRef.current = now;
        futureRef.current = [];
        return resolved;
      });
      queueMicrotask(() => {
        setCanUndo(pastRef.current.length > 0);
        setCanRedo(futureRef.current.length > 0);
      });
    },
    []
  );

  const reset = useCallback((next: T) => {
    pastRef.current = [];
    futureRef.current = [];
    lastPushAtRef.current = 0;
    skipRecordRef.current = false;
    setValueState(next);
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (prev === undefined) return false;
    setValueState((present) => {
      futureRef.current = [...futureRef.current, cloneJson(present)];
      return prev;
    });
    syncFlags();
    return true;
  }, [syncFlags]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (next === undefined) return false;
    setValueState((present) => {
      pastRef.current = [...pastRef.current, cloneJson(present)].slice(-MAX_STEPS);
      return next;
    });
    syncFlags();
    return true;
  }, [syncFlags]);

  useEffect(() => {
    const controller: SiteEditDraftController = { undo, redo, canUndo, canRedo };
    registerDraft(controller);
    return () => registerDraft(null);
  }, [undo, redo, canUndo, canRedo, registerDraft]);

  return { value, setValue, reset };
}
