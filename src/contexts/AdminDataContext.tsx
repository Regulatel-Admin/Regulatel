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

const KEY_NEWS = "regulatel_admin_news";
const KEY_DOCUMENTS = "regulatel_admin_documents";
/** Eventos: modelo Event[] (único source of truth). v3 = seed actualizado con 7 eventos 2025. */
const KEY_EVENTS = "regulatel_admin_events_v3";
const KEY_CIFRAS = "regulatel_admin_cifras";
const KEY_CIFRAS_POR_ANO = "regulatel_admin_cifras_por_ano";

function loadEvents(): Event[] {
  const raw = loadJson<unknown>(KEY_EVENTS, []);
  const seed = EVENTS_SEED.map(normalizeEvent);
  if (!Array.isArray(raw) || raw.length === 0) return seed;
  const isNewFormat = raw.every(
    (e: unknown) => e && typeof e === "object" && "startDate" in e && "id" in e
  );
  if (!isNewFormat) return seed;
  const stored = raw.map((e) => normalizeEvent(e as Event));
  const count2025 = stored.filter((e) => e.year === 2025).length;
  if (count2025 < 7) return seed;
  return stored;
}

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
  /** Nombre del archivo cuando imageUrl es data URL (subida). */
  imageFileName?: string;
  /** Imágenes adicionales (enlaces o data URLs). Todas se muestran en la noticia individual. */
  additionalImages?: string[];
  /** Nombres de archivo para additionalImages cuando son subidas (mismo índice; undefined si es URL). */
  additionalImageNames?: (string | undefined)[];
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
  adminNews: AdminNewsItem[];
  setAdminNews: (v: AdminNewsItem[] | ((prev: AdminNewsItem[]) => AdminNewsItem[])) => void;
  addNews: (item: Omit<AdminNewsItem, "id" | "published">) => void;
  updateNews: (id: string, item: Partial<AdminNewsItem>) => void;
  deleteNews: (id: string) => void;

  /** Lista completa de eventos (source of truth). Gestionar en /admin/eventos. */
  events: Event[];
  setEvents: (v: Event[] | ((prev: Event[]) => Event[])) => void;
  /** status y year se derivan en el contexto si no se pasan. */
  addEvent: (item: Omit<Event, "createdAt" | "updatedAt" | "status" | "year"> & { status?: Event["status"]; year?: number }) => void;
  updateEvent: (id: string, item: Partial<Omit<Event, "id" | "createdAt">>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;

  adminCifras: KPIItem[] | null;
  setAdminCifras: (v: KPIItem[] | null | ((prev: KPIItem[] | null) => KPIItem[] | null)) => void;

  /** Cifras editadas por año (2025, 2026, …). Si no hay override para un año, se usa cifrasPorAno. */
  adminCifrasPorAno: Record<number, CifrasAnuales>;
  getCifrasForYear: (year: number) => CifrasAnuales;
  setCifrasForYear: (year: number, data: CifrasAnuales) => void;
  clearCifrasForYear: (year: number) => void;

  /** Documentos añadidos por el admin. Se muestran en Gestión junto a los estáticos. */
  adminDocuments: GestionDocument[];
  addDocument: (item: Omit<GestionDocument, "id">) => void;
  updateDocument: (id: string, item: Partial<Omit<GestionDocument, "id">>) => void;
  deleteDocument: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [adminNews, setAdminNewsState] = useState<AdminNewsItem[]>(() =>
    loadJson<AdminNewsItem[]>(KEY_NEWS, [])
  );
  const [events, setEventsState] = useState<Event[]>(() => loadEvents());
  const [adminCifras, setAdminCifrasState] = useState<KPIItem[] | null>(() =>
    loadJson<KPIItem[] | null>(KEY_CIFRAS, null)
  );
  const [adminCifrasPorAno, setAdminCifrasPorAnoState] = useState<Record<number, CifrasAnuales>>(() =>
    loadJson<Record<number, CifrasAnuales>>(KEY_CIFRAS_POR_ANO, {})
  );
  const [adminDocuments, setAdminDocumentsState] = useState<GestionDocument[]>(() =>
    loadJson<GestionDocument[]>(KEY_DOCUMENTS, [])
  );

  useEffect(() => {
    saveJson(KEY_NEWS, adminNews);
  }, [adminNews]);

  useEffect(() => {
    saveJson(KEY_DOCUMENTS, adminDocuments);
  }, [adminDocuments]);

  useEffect(() => {
    saveJson(KEY_EVENTS, events);
  }, [events]);

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
    (item: Omit<AdminNewsItem, "id" | "published">) => {
      const id = "admin-" + Date.now();
      setAdminNewsState((prev) => [
        ...prev,
        { ...item, id, published: true },
      ]);
    },
    []
  );

  const updateNews = useCallback((id: string, item: Partial<AdminNewsItem>) => {
    setAdminNewsState((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...item } : n))
    );
  }, []);

  const deleteNews = useCallback((id: string) => {
    setAdminNewsState((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const setEvents = useCallback((v: Event[] | ((prev: Event[]) => Event[])) => {
    setEventsState(v);
  }, []);

  const addEvent = useCallback(
    (item: Omit<Event, "createdAt" | "updatedAt" | "status" | "year"> & { status?: Event["status"]; year?: number }) => {
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
      setEventsState((prev) => [...prev, normalizeEvent(newEvent)]);
    },
    []
  );

  const updateEvent = useCallback((id: string, item: Partial<Omit<Event, "id" | "createdAt">>) => {
    setEventsState((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...item, updatedAt: new Date().toISOString() };
        return normalizeEvent(updated);
      })
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEventsState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const duplicateEvent = useCallback((id: string) => {
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
    setEventsState((prev) => [...prev, dup]);
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

  const setCifrasForYear = useCallback((year: number, data: CifrasAnuales) => {
    setAdminCifrasPorAnoState((prev) => ({ ...prev, [year]: data }));
  }, []);

  const clearCifrasForYear = useCallback((year: number) => {
    setAdminCifrasPorAnoState((prev) => {
      const next = { ...prev };
      delete next[year];
      return next;
    });
  }, []);

  const addDocument = useCallback((item: Omit<GestionDocument, "id">) => {
    const id = "admin-doc-" + Date.now();
    setAdminDocumentsState((prev) => [...prev, { ...item, id }]);
  }, []);

  const updateDocument = useCallback((id: string, item: Partial<Omit<GestionDocument, "id">>) => {
    setAdminDocumentsState((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...item } : d))
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setAdminDocumentsState((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
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

/** Para que la home y noticias muestren estáticos + publicados por admin */
export function useMergedNews(): HomeNewsItemLike[] {
  const ctx = useContext(AdminDataContext);
  const staticWithImages = homeNews.map((item) => {
    const full = noticiasData.find((n) => n.slug === item.slug);
    return { ...item, imageUrl: full?.imageUrl };
  });
  const adminPart =
    ctx?.adminNews
      .filter((n) => n.published)
      .map((n) => ({
        slug: n.slug || n.id,
        title: n.title,
        date: n.date,
        dateFormatted: n.dateFormatted,
        excerpt: n.excerpt,
        imageUrl: n.imageUrl || undefined,
        additionalImages: n.additionalImages || undefined,
      })) ?? [];
  const merged = [...staticWithImages, ...adminPart];
  merged.sort((a, b) => (a.date > b.date ? -1 : 1));
  return merged;
}

/** Lista de eventos (source of truth desde Admin o seed). */
export function useEvents(): Event[] {
  const ctx = useContext(AdminDataContext);
  return ctx?.events ?? EVENTS_SEED.map(normalizeEvent);
}

export function useMergedCifras(): KPIItem[] {
  const ctx = useContext(AdminDataContext);
  return ctx?.adminCifras ?? statsKpis;
}

/** Documentos estáticos + los añadidos por el admin. Usar en Gestión y BuscarDocumentos. */
export function useMergedGestionDocuments(): GestionDocument[] {
  const ctx = useContext(AdminDataContext);
  const admin = ctx?.adminDocuments ?? [];
  return [...gestionDocuments, ...admin];
}
