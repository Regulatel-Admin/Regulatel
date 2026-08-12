import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  SITE_EDIT_STORAGE_KEY,
  publicPathForAdmin,
  type SiteEditTarget,
} from "@/lib/siteEdit";
import type { HomeHeroSetting, QuickLinkSettingItem, FeaturedCarouselItemSetting } from "@/types/siteSettings";
import type { BoletinGtaiSerialized } from "@/data/boletinesGtai";
import type { RevistaEdition } from "@/data/revistaDigital";

export type SiteEditNewsPreview = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateFormatted?: string;
  imageUrl?: string;
};

export type SiteEditPreview = {
  homeHero?: HomeHeroSetting;
  quickLinks?: QuickLinkSettingItem[];
  featuredCarousel?: FeaturedCarouselItemSetting[];
  boletines?: BoletinGtaiSerialized[];
  revista?: RevistaEdition[];
  news?: SiteEditNewsPreview;
};

export interface SiteEditDraftController {
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export interface SiteEditPersistedChange {
  label: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

interface SiteEditContextValue {
  enabled: boolean;
  target: SiteEditTarget | null;
  preview: SiteEditPreview;
  hasUnpublished: boolean;
  enter: (publicPath?: string) => void;
  exit: () => boolean;
  open: (target: SiteEditTarget) => void;
  close: () => void;
  setPreview: (patch: Partial<SiteEditPreview>) => void;
  clearPreview: (key?: keyof SiteEditPreview) => void;
  registerDraft: (controller: SiteEditDraftController | null) => void;
  recordPersistedChange: (change: SiteEditPersistedChange) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  historyBusy: boolean;
}

const SiteEditContext = createContext<SiteEditContextValue>({
  enabled: false,
  target: null,
  preview: {},
  hasUnpublished: false,
  enter: () => {},
  exit: () => true,
  open: () => {},
  close: () => {},
  setPreview: () => {},
  clearPreview: () => {},
  registerDraft: () => {},
  recordPersistedChange: () => {},
  undo: async () => {},
  redo: async () => {},
  canUndo: false,
  canRedo: false,
  historyBusy: false,
});

function readStored(): boolean {
  try {
    return sessionStorage.getItem(SITE_EDIT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const MAX_PERSISTED = 20;

export function SiteEditProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isChecking } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState<SiteEditTarget | null>(null);
  const [preview, setPreviewState] = useState<SiteEditPreview>({});
  const [draft, setDraft] = useState<SiteEditDraftController | null>(null);
  const [persistedUndo, setPersistedUndo] = useState<SiteEditPersistedChange[]>([]);
  const [persistedRedo, setPersistedRedo] = useState<SiteEditPersistedChange[]>([]);
  const [historyBusy, setHistoryBusy] = useState(false);
  const draftRef = useRef<SiteEditDraftController | null>(null);
  const persistedUndoRef = useRef<SiteEditPersistedChange[]>([]);
  const persistedRedoRef = useRef<SiteEditPersistedChange[]>([]);
  const previewRef = useRef<SiteEditPreview>({});
  const busyRef = useRef(false);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    persistedUndoRef.current = persistedUndo;
  }, [persistedUndo]);

  useEffect(() => {
    persistedRedoRef.current = persistedRedo;
  }, [persistedRedo]);

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    if (isChecking) return;
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("editar") === "1";
    if (!isAdmin) {
      setEnabled(false);
      setTarget(null);
      setPreviewState({});
      setPersistedUndo([]);
      setPersistedRedo([]);
      try {
        sessionStorage.removeItem(SITE_EDIT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    const wantEdit = fromQuery || readStored();
    if (!wantEdit) {
      setEnabled(false);
      return;
    }
    try {
      sessionStorage.setItem(SITE_EDIT_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    const onPublicSite = !location.pathname.startsWith("/admin") && location.pathname !== "/login";
    setEnabled(onPublicSite);
  }, [isAdmin, isChecking, location.search, location.pathname]);

  const enter = useCallback(
    (publicPath?: string) => {
      try {
        sessionStorage.setItem(SITE_EDIT_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setEnabled(true);
      setPreviewState({});
      setPersistedUndo([]);
      setPersistedRedo([]);
      const dest = publicPath ?? publicPathForAdmin(location.pathname);
      navigate(dest);
    },
    [location.pathname, navigate]
  );

  const exit = useCallback((): boolean => {
    if (Object.keys(previewRef.current).length > 0) {
      const ok = window.confirm(
        "Hay cambios que aún no publicaste. Si sales, se pierden y el sitio público no cambia."
      );
      if (!ok) return false;
    }
    try {
      sessionStorage.removeItem(SITE_EDIT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setEnabled(false);
    setTarget(null);
    setPreviewState({});
    setPersistedUndo([]);
    setPersistedRedo([]);
    return true;
  }, []);

  const setPreview = useCallback((patch: Partial<SiteEditPreview>) => {
    setPreviewState((current) => ({ ...current, ...patch }));
  }, []);

  const clearPreview = useCallback((key?: keyof SiteEditPreview) => {
    if (!key) {
      setPreviewState({});
      return;
    }
    setPreviewState((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const open = useCallback((next: SiteEditTarget) => {
    setTarget(next);
  }, []);

  const close = useCallback(() => {
    setTarget(null);
  }, []);

  const registerDraft = useCallback((controller: SiteEditDraftController | null) => {
    setDraft(controller);
  }, []);

  const recordPersistedChange = useCallback((change: SiteEditPersistedChange) => {
    setPersistedUndo((current) => [...current, change].slice(-MAX_PERSISTED));
    setPersistedRedo([]);
  }, []);

  const undo = useCallback(async () => {
    if (busyRef.current) return;
    const activeDraft = draftRef.current;
    if (activeDraft?.canUndo) {
      activeDraft.undo();
      return;
    }
    const stack = persistedUndoRef.current;
    const change = stack[stack.length - 1];
    if (!change) return;
    busyRef.current = true;
    setHistoryBusy(true);
    setTarget(null);
    try {
      await change.undo();
      setPersistedUndo((current) => current.slice(0, -1));
      setPersistedRedo((current) => [...current, change]);
    } finally {
      busyRef.current = false;
      setHistoryBusy(false);
    }
  }, []);

  const redo = useCallback(async () => {
    if (busyRef.current) return;
    const activeDraft = draftRef.current;
    if (activeDraft?.canRedo) {
      activeDraft.redo();
      return;
    }
    const stack = persistedRedoRef.current;
    const change = stack[stack.length - 1];
    if (!change) return;
    busyRef.current = true;
    setHistoryBusy(true);
    setTarget(null);
    try {
      await change.redo();
      setPersistedRedo((current) => current.slice(0, -1));
      setPersistedUndo((current) => [...current, change].slice(-MAX_PERSISTED));
    } finally {
      busyRef.current = false;
      setHistoryBusy(false);
    }
  }, []);

  const canUndo = Boolean(draft?.canUndo || persistedUndo.length > 0);
  const canRedo = Boolean(draft?.canRedo || (!draft?.canUndo && persistedRedo.length > 0));
  const hasUnpublished = Object.keys(preview).length > 0;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      const isUndo = key === "z" && !event.shiftKey;
      const isRedo = key === "y" || (key === "z" && event.shiftKey);
      if (isUndo) {
        if (!canUndo || historyBusy) return;
        event.preventDefault();
        void undo();
        return;
      }
      if (isRedo) {
        if (!canRedo || historyBusy) return;
        event.preventDefault();
        void redo();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [enabled, canUndo, canRedo, historyBusy, undo, redo]);

  const value = useMemo(
    () => ({
      enabled,
      target,
      preview,
      hasUnpublished,
      enter,
      exit,
      open,
      close,
      setPreview,
      clearPreview,
      registerDraft,
      recordPersistedChange,
      undo,
      redo,
      canUndo,
      canRedo,
      historyBusy,
    }),
    [
      enabled,
      target,
      preview,
      hasUnpublished,
      enter,
      exit,
      open,
      close,
      setPreview,
      clearPreview,
      registerDraft,
      recordPersistedChange,
      undo,
      redo,
      canUndo,
      canRedo,
      historyBusy,
    ]
  );

  return <SiteEditContext.Provider value={value}>{children}</SiteEditContext.Provider>;
}

export function useSiteEdit() {
  return useContext(SiteEditContext);
}
