import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { KPIItem, CifrasAnuales } from "@/data/home";
import { statsKpis, cifrasPorAno } from "@/data/home";
import { EVENTS_SEED } from "@/data/eventsSeed";
import { homeNews } from "@/data/news";
import { noticiasData } from "@/pages/noticiasData";
import type { Event } from "@/types/event";
import { getEventStatus, getEventYear, normalizeEvent, slugifyEventId } from "@/types/event";
import type { GestionDocument } from "@/data/gestion";
import { gestionDocuments } from "@/data/gestion";
import { api } from "@/lib/api";
import type { UploadedFileMeta } from "@/types/uploads";

const KEY_CIFRAS = "regulatel_admin_cifras";
const KEY_CIFRAS_POR_ANO = "regulatel_admin_cifras_por_ano";

/** Noticia creada/editada por el admin (compatible con listado y detalle) */
export interface AdminNewsItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  imageFileName?: string;
  imageMimeType?: string;
  imageSize?: number;
  additionalImages?: string[];
  additionalImageNames?: (string | undefined)[];
  additionalImageMeta?: UploadedFileMeta[];
  content: string;
  author?: string;
  link?: string;
  videoUrl?: string;
  published: boolean;
}

function loadJson<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const s = localStorage.getItem(key);
    if (!s) return defaultVal;
    return JSON.parse(s) as T;
  } catch {
    return defaultVal;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

interface AdminDataContextValue {
  contentSource: "database" | "legacy" | "loading";
  contentError: string | null;
  /** Vuelve a comprobar si la API/Neon está disponible (p. ej. desde el banner "Reintentar"). */
  recheckContentSource: () => Promise<void>;
  adminNews: AdminNewsItem[];
  setAdminNews: (v: AdminNewsItem[] | ((prev: AdminNewsItem[]) => AdminNewsItem[])) => void;
  addNews: (item: Omit<AdminNewsItem, "id">) => Promise<void>;
  updateNews: (id: string, item: Partial<AdminNewsItem>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;

  /** Lista completa de eventos (source of truth). Gestionar en /admin/eventos. */
  events: Event[];
  setEvents: (v: Event[] | ((prev: Event[]) => Event[])) => void;
  /** status y year se derivan en el contexto si no se pasan. */
  addEvent: (item: Omit<Event, "createdAt" | "updatedAt" | "status" | "year"> & { status?: Event["status"]; year?: number }) => Promise<void>;
  updateEvent: (id: string, item: Partial<Omit<Event, "id" | "createdAt">>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  duplicateEvent: (id: string) => Promise<void>;

  adminCifras: KPIItem[] | null;
  setAdminCifras: (v: KPIItem[] | null | ((prev: KPIItem[] | null) => KPIItem[] | null)) => void;

  /** Cifras editadas por año (2025, 2026, …). Si no hay override para un año, se usa cifrasPorAno. */
  adminCifrasPorAno: Record<number, CifrasAnuales>;
  getCifrasForYear: (year: number) => CifrasAnuales;
  setCifrasForYear: (year: number, data: CifrasAnuales) => void;
  clearCifrasForYear: (year: number) => void;

  /** Documentos añadidos por el admin. Se muestran en Gestión junto a los estáticos. */
  adminDocuments: GestionDocument[];
  addDocument: (item: Omit<GestionDocument, "id">) => Promise<void>;
  updateDocument: (id: string, item: Partial<Omit<GestionDocument, "id">>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [contentSource, setContentSource] = useState<"database" | "legacy" | "loading">("loading");
  const [contentError, setContentError] = useState<string | null>(null);
  const [adminNews, setAdminNewsState] = useState<AdminNewsItem[]>([]);
  const [events, setEventsState] = useState<Event[]>([]);
  const [adminCifras, setAdminCifrasState] = useState<KPIItem[] | null>(() =>
    loadJson<KPIItem[] | null>(KEY_CIFRAS, null)
  );
  const [adminCifrasPorAno, setAdminCifrasPorAnoState] = useState<Record<number, CifrasAnuales>>(() =>
    loadJson<Record<number, CifrasAnuales>>(KEY_CIFRAS_POR_ANO, {})
  );
  const [adminDocuments, setAdminDocumentsState] = useState<GestionDocument[]>([]);

  /** Comprueba si la API/Neon está disponible. Si GET /api/settings responde JSON, se considera "database" aunque news/events/docs fallen. */
  const checkContentSource = useCallback(async () => {
    const [newsRes, eventsRes, docsRes, cifrasRes, settingsRes] = await Promise.all([
      api.news.list(),
      api.events.list(),
      api.documents.list(),
      api.cifras.list(),
      api.settings.getAll(),
    ]);
    const newsItems = newsRes.ok && Array.isArray(newsRes.data) ? (newsRes.data as AdminNewsItem[]) : [];
    const eventItems = eventsRes.ok && Array.isArray(eventsRes.data) ? (eventsRes.data as Event[]) : [];
    const docItems = docsRes.ok && Array.isArray(docsRes.data) ? (docsRes.data as GestionDocument[]) : [];
    setAdminNewsState(newsItems.map((n) => ({ ...n, published: n.published !== false })));
    setEventsState(eventItems.map((e) => normalizeEvent(e)));
    setAdminDocumentsState(docItems);
    if (cifrasRes.ok && cifrasRes.data && typeof cifrasRes.data === "object") {
      const raw = cifrasRes.data as Record<string, { gruposTrabajo: number; comitesEjecutivos: number; revistaDigital: number; paises: number }>;
      const byYear: Record<number, CifrasAnuales> = {};
      for (const [k, v] of Object.entries(raw)) {
        const y = parseInt(k, 10);
        if (!Number.isNaN(y) && v && typeof v.gruposTrabajo === "number") {
          byYear[y] = {
            gruposTrabajo: v.gruposTrabajo,
            comitesEjecutivos: v.comitesEjecutivos,
            revistaDigital: v.revistaDigital,
            paises: v.paises,
          };
        }
      }
      setAdminCifrasPorAnoState(byYear);
    }
    if (newsRes.ok && eventsRes.ok && docsRes.ok) {
      setContentSource("database");
      setContentError(null);
      return;
    }
    if (settingsRes.ok) {
      setContentSource("database");
      setContentError(null);
      return;
    }
    setContentSource("legacy");
    setContentError(
      !newsRes.ok ? newsRes.error : !eventsRes.ok ? eventsRes.error : !docsRes.ok ? docsRes.error : "API no disponible"
    );
  }, []);

  useEffect(() => {
    void checkContentSource();
  }, [checkContentSource]);

  useEffect(() => {
    saveJson(KEY_CIFRAS, adminCifras);
  }, [adminCifras]);

  useEffect(() => {
    saveJson(KEY_CIFRAS_POR_ANO, adminCifrasPorAno);
  }, [adminCifrasPorAno]);

  const setAdminNews = useCallback(
    (v: AdminNewsItem[] | ((prev: AdminNewsItem[]) => AdminNewsItem[])) => {
      setAdminNewsState(v);
    },
    []
  );

  const addNews = useCallback(
    async (item: Omit<AdminNewsItem, "id">) => {
      const id = "admin-" + Date.now();
      const payload = { ...item, id, published: item.published !== false };
      const res = await api.news.create(payload);
      if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo crear la noticia." : res.error);
      setAdminNewsState((prev) => [...prev, res.data as AdminNewsItem]);
    },
    []
  );

  const updateNews = useCallback(async (id: string, item: Partial<AdminNewsItem>) => {
    const res = await api.news.update(id, item);
    if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo actualizar la noticia." : res.error);
    setAdminNewsState((prev) =>
      prev.map((n) => (n.id === id ? (res.data as AdminNewsItem) : n))
    );
  }, []);

  const deleteNews = useCallback(async (id: string) => {
    const res = await api.news.delete(id);
    if (!res.ok) throw new Error(res.error);
    setAdminNewsState((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const setEvents = useCallback((v: Event[] | ((prev: Event[]) => Event[])) => {
    setEventsState(v);
  }, []);

  const addEvent = useCallback(
    async (item: Omit<Event, "createdAt" | "updatedAt" | "status" | "year"> & { status?: Event["status"]; year?: number }) => {
      const now = new Date().toISOString();
      const status = getEventStatus({ startDate: item.startDate, endDate: item.endDate ?? null });
      const year = item.year ?? getEventYear(item.startDate);
      const newEvent: Event = {
        ...item,
        id: item.id || slugifyEventId(item.title, year),
        year,
        status,
        createdAt: now,
        updatedAt: now,
      };
      const res = await api.events.create(newEvent);
      if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo crear el evento." : res.error);
      setEventsState((prev) => [...prev, normalizeEvent(res.data as Event)]);
    },
    []
  );

  const updateEvent = useCallback(async (id: string, item: Partial<Omit<Event, "id" | "createdAt">>) => {
    const res = await api.events.update(id, item);
    if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo actualizar el evento." : res.error);
    setEventsState((prev) =>
      prev.map((e) => (e.id === id ? normalizeEvent(res.data as Event) : e))
    );
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const res = await api.events.delete(id);
    if (!res.ok) throw new Error(res.error);
    setEventsState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const duplicateEvent = useCallback(async (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const now = new Date().toISOString();
    const newId = `${ev.id}-copia-${Date.now()}`;
    const dup: Event = normalizeEvent({
      ...ev,
      id: newId,
      title: `${ev.title} (copia)`,
      createdAt: now,
      updatedAt: now,
    });
    const res = await api.events.create(dup);
    if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo duplicar el evento." : res.error);
    setEventsState((prev) => [...prev, normalizeEvent(res.data as Event)]);
  }, [events]);

  const setAdminCifras = useCallback(
    (
      v:
        | KPIItem[]
        | null
        | ((prev: KPIItem[] | null) => KPIItem[] | null)
    ) => {
      setAdminCifrasState(
        typeof v === "function" ? v(adminCifras) : v
      );
    },
    [adminCifras]
  );

  const getCifrasForYear = useCallback((year: number): CifrasAnuales => {
    return adminCifrasPorAno[year] ?? cifrasPorAno[year] ?? {
      gruposTrabajo: 0,
      comitesEjecutivos: 0,
      revistaDigital: 0,
      paises: 0,
    };
  }, [adminCifrasPorAno]);

  const setCifrasForYear = useCallback(async (year: number, data: CifrasAnuales) => {
    setAdminCifrasPorAnoState((prev) => ({ ...prev, [year]: data }));
    if (contentSource === "database") {
      const res = await api.cifras.setForYear(year, data);
      if (!res.ok) {
        console.warn("No se pudieron guardar las cifras en la base de datos:", res.error);
      }
    }
  }, [contentSource]);

  const clearCifrasForYear = useCallback(async (year: number) => {
    if (contentSource === "database") {
      const res = await api.cifras.clearYear(year);
      if (!res.ok) {
        console.warn("No se pudo restaurar el año en la base de datos:", res.error);
      }
    }
    setAdminCifrasPorAnoState((prev) => {
      const next = { ...prev };
      delete next[year];
      return next;
    });
  }, [contentSource]);

  const addDocument = useCallback(async (item: Omit<GestionDocument, "id">) => {
    const id = "admin-doc-" + Date.now();
    const payload = { ...item, id };
    const res = await api.documents.create(payload);
    if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo crear el documento." : res.error);
    setAdminDocumentsState((prev) => [...prev, res.data as GestionDocument]);
  }, []);

  const updateDocument = useCallback(async (id: string, item: Partial<Omit<GestionDocument, "id">>) => {
    const res = await api.documents.update(id, item);
    if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo actualizar el documento." : res.error);
    setAdminDocumentsState((prev) =>
      prev.map((d) => (d.id === id ? (res.data as GestionDocument) : d))
    );
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    const res = await api.documents.delete(id);
    if (!res.ok) throw new Error(res.error);
    setAdminDocumentsState((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const recheckContentSource = useCallback(async () => {
    setContentSource("loading");
    setContentError(null);
    await checkContentSource();
  }, [checkContentSource]);

  return (
    <AdminDataContext.Provider
      value={{
        contentSource,
        contentError,
        recheckContentSource,
        adminNews,
        setAdminNews,
        addNews,
        updateNews,
        deleteNews,
        events,
        setEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        duplicateEvent,
        adminCifras,
        setAdminCifras,
        adminCifrasPorAno,
        getCifrasForYear,
        setCifrasForYear,
        clearCifrasForYear,
        adminDocuments,
        addDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}

/** Datos de noticia para listado en home/noticias (compatible con HomeNewsItem + imageUrl para featured) */
export interface HomeNewsItemLike {
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  excerpt: string;
  imageUrl?: string;
  /** Para carrusel cuando la noticia tiene varias imágenes. */
  additionalImages?: string[];
}

/** Para que la home y noticias muestren siempre estáticos + los de la base de datos. Si un estático fue editado en admin (mismo slug en DB), se muestra solo la versión DB. */
export function useMergedNews(): HomeNewsItemLike[] {
  const ctx = useContext(AdminDataContext);
  const staticWithImages = homeNews.map((item) => {
    const full = noticiasData.find((n) => n.slug === item.slug);
    return { ...item, imageUrl: full?.imageUrl };
  });
  if (ctx?.contentSource !== "database") {
    return [...staticWithImages].sort((a, b) => (a.date > b.date ? -1 : 1));
  }
  const dbSlugs = new Set(
    (ctx.adminNews ?? []).filter((n) => n.published).map((n) => (n.slug || n.id).toLowerCase())
  );
  const staticFiltered = staticWithImages.filter((item) => !dbSlugs.has(item.slug.toLowerCase()));
  const dbItems = (ctx.adminNews ?? [])
    .filter((n) => n.published)
    .map((n) => ({
      slug: n.slug || n.id,
      title: n.title,
      date: n.date,
      dateFormatted: n.dateFormatted,
      excerpt: n.excerpt,
      imageUrl: n.imageUrl || undefined,
      additionalImages: n.additionalImages || undefined,
    }));
  return [...staticFiltered, ...dbItems].sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Lista de eventos para el sitio público y búsqueda.
 * Siempre muestra el seed estático como base; cuando la API responde (database),
 * los eventos guardados en la BD sobreescriben al seed con el mismo id.
 * Así la página siempre tiene eventos aunque la BD esté vacía, y al importar
 * desde el panel se pueden editar sin tocar el código.
 */
export function useEvents(): Event[] {
  const ctx = useContext(AdminDataContext);
  const seedNormalized = EVENTS_SEED.map(normalizeEvent);
  if (!ctx || ctx.contentSource !== "database") return seedNormalized;
  const dbIds = new Set((ctx.events ?? []).map((e) => e.id));
  const staticFiltered = seedNormalized.filter((e) => !dbIds.has(e.id));
  return [...staticFiltered, ...(ctx.events ?? []).map(normalizeEvent)].sort((a, b) => {
    const dA = a.startDate;
    const dB = b.startDate;
    return dA > dB ? -1 : dA < dB ? 1 : 0;
  });
}

export function useMergedCifras(): KPIItem[] {
  const ctx = useContext(AdminDataContext);
  return ctx?.adminCifras ?? statsKpis;
}

/** Documentos estáticos + los añadidos por el admin. Si un estático fue editado (mismo id en DB), se muestra solo la versión DB. */
export function useMergedGestionDocuments(): GestionDocument[] {
  const ctx = useContext(AdminDataContext);
  if (ctx?.contentSource !== "database") return gestionDocuments;
  const dbIds = new Set((ctx.adminDocuments ?? []).map((d) => d.id));
  const staticFiltered = gestionDocuments.filter((d) => !dbIds.has(d.id));
  return [...staticFiltered, ...(ctx.adminDocuments ?? [])];
}
