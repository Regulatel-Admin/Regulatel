import { SEMANA_RESOURCE_EVENTS } from "@/data/semanaRegulatelResources";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { KPIItem, CifrasAnuales } from "@/data/home";
import { statsKpis, cifrasPorAno } from "@/data/home";
import { EVENTS_SEED } from "@/data/eventsSeed";
import { homeNews } from "@/data/news";
import { noticiasData } from "@/pages/noticiasData";
import type { Event, EventAttachment } from "@/types/event";
import type { ContentBlock } from "@/types/contentBlocks";
import { getEventStatus, getEventYear, normalizeEvent, slugifyEventId } from "@/types/event";
import type { GestionDocument } from "@/data/gestion";
import { gestionDocuments } from "@/data/gestion";
import { api } from "@/lib/api";
import type { UploadedFileMeta } from "@/types/uploads";
import { useRevistaDigitalEditions } from "@/contexts/SiteSettingsContext";
import { getPublishedRevistaEditions, revistaEditionToGestionDocument } from "@/data/revistaDigital";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { CMS_SAVED_EVENT } from "@/lib/siteEdit";

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
  /** PDF/Word al final de la noticia. `undefined` = aún no gestionados por el admin. */
  attachments?: EventAttachment[];
  /** Ordered article content. Undefined retains the legacy rendering. */
  contentBlocks?: ContentBlock[];
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
  /** Solo true después de recibir una lista completa y válida de noticias. */
  newsLoaded: boolean;
  setAdminNews: (v: AdminNewsItem[] | ((prev: AdminNewsItem[]) => AdminNewsItem[])) => void;
  addNews: (item: Omit<AdminNewsItem, "id"> & { id?: string }) => Promise<AdminNewsItem>;
  updateNews: (id: string, item: Partial<AdminNewsItem>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;

  /** Lista completa de eventos (source of truth). Gestionar en /admin/eventos. */
  events: Event[];
  /** Evita restaurar eventos estáticos antes de conocer sus marcas de publicación. */
  eventsLoaded: boolean;
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
  documentsLoaded: boolean;
  addDocument: (item: Omit<GestionDocument, "id"> & { id?: string }) => Promise<GestionDocument>;
  updateDocument: (id: string, item: Partial<Omit<GestionDocument, "id">>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [contentSource, setContentSource] = useState<"database" | "legacy" | "loading">("loading");
  const [contentError, setContentError] = useState<string | null>(null);
  const [adminNews, setAdminNewsState] = useState<AdminNewsItem[]>([]);
  const [newsLoaded, setNewsLoaded] = useState(false);
  const [events, setEventsState] = useState<Event[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const contentRequest = useRef(0);
  const databaseSeen = useRef(false);
  const [adminCifras, setAdminCifrasState] = useState<KPIItem[] | null>(() =>
    loadJson<KPIItem[] | null>(KEY_CIFRAS, null)
  );
  const [adminCifrasPorAno, setAdminCifrasPorAnoState] = useState<Record<number, CifrasAnuales>>(() =>
    loadJson<Record<number, CifrasAnuales>>(KEY_CIFRAS_POR_ANO, {})
  );
  const [adminDocuments, setAdminDocumentsState] = useState<GestionDocument[]>([]);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);

  /** Un fallo de red conserva la última lista confirmada, incluidas las fichas despublicadas. */
  const checkContentSource = useCallback(async () => {
    const request = ++contentRequest.current;
    const [newsRes, eventsRes, docsRes, cifrasRes, settingsRes] = await Promise.all([
      api.news.list(),
      api.events.list(),
      api.documents.list(),
      api.cifras.list(),
      api.settings.getAll(),
    ]);
    if (request !== contentRequest.current) return;
    const newsValid = newsRes.ok && Array.isArray(newsRes.data);
    const eventsValid = eventsRes.ok && Array.isArray(eventsRes.data);
    const docsValid = docsRes.ok && Array.isArray(docsRes.data);
    if (newsRes.ok && Array.isArray(newsRes.data)) {
      setAdminNewsState((newsRes.data as AdminNewsItem[]).map((item) => ({ ...item, published: item.published !== false })));
      setNewsLoaded(true);
    }
    if (eventsRes.ok && Array.isArray(eventsRes.data)) {
      setEventsState((eventsRes.data as Event[]).map(normalizeEvent));
      setEventsLoaded(true);
    }
    if (docsRes.ok && Array.isArray(docsRes.data)) {
      setAdminDocumentsState(docsRes.data as GestionDocument[]);
      setDocumentsLoaded(true);
    }
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
    databaseSeen.current ||= newsValid || eventsValid || docsValid || settingsRes.ok;
    setContentSource(databaseSeen.current ? "database" : "legacy");
    const missing = [!newsValid && "noticias", !eventsValid && "eventos", !docsValid && "documentos"].filter(Boolean);
    setContentError(missing.length ? `No se pudieron actualizar ${missing.join(", ")}. Se conservan los últimos datos confirmados.` : null);
  }, []);

  useEffect(() => {
    void checkContentSource();
  }, [checkContentSource]);

  useEffect(() => {
    const onSaved = () => {
      void checkContentSource();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void checkContentSource();
    };
    window.addEventListener(CMS_SAVED_EVENT, onSaved);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(CMS_SAVED_EVENT, onSaved);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
    async (item: Omit<AdminNewsItem, "id"> & { id?: string }): Promise<AdminNewsItem> => {
      const id = item.id || "admin-" + Date.now();
      const payload = { ...item, id, published: item.published !== false };
      const res = await api.news.create(payload);
      if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo crear la noticia." : res.error);
      const created = res.data as AdminNewsItem;
      setAdminNewsState((prev) => [...prev, created]);
      return created;
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

  const addDocument = useCallback(async (item: Omit<GestionDocument, "id"> & { id?: string }) => {
    const id = item.id ?? "admin-doc-" + Date.now();
    const payload = { ...item, id };
    const res = await api.documents.create(payload);
    if (!res.ok || !res.data) throw new Error(res.ok ? "No se pudo crear el documento." : res.error);
    const created = res.data as GestionDocument;
    setAdminDocumentsState((prev) => [...prev, created]);
    return created;
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
    setContentSource((current) => current === "database" ? current : "loading");
    await checkContentSource();
  }, [checkContentSource]);

  return (
    <AdminDataContext.Provider
      value={{
        contentSource,
        contentError,
        recheckContentSource,
        adminNews,
        newsLoaded,
        setAdminNews,
        addNews,
        updateNews,
        deleteNews,
        events,
        eventsLoaded,
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
        documentsLoaded,
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
  const { enabled, preview } = useSiteEdit();
  const staticWithImages = homeNews.map((item) => {
    const full = noticiasData.find((n) => n.slug === item.slug);
    return { ...item, imageUrl: full?.imageUrl };
  });
  const list =
    !ctx
      ? [...staticWithImages].sort((a, b) => (a.date > b.date ? -1 : 1))
      : !ctx.newsLoaded ? []
      : (() => {
          const dbSlugs = new Set(
            (ctx.adminNews ?? []).map((n) => (n.slug || n.id).toLowerCase())
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
        })();

  if (!enabled || !preview.news) return list;
  const patch = preview.news;
  const nextItem: HomeNewsItemLike = {
    slug: patch.slug,
    title: patch.title.trim() || "Nueva noticia",
    date: patch.date,
    dateFormatted: patch.dateFormatted ?? patch.date,
    excerpt: patch.excerpt,
    imageUrl: patch.imageUrl || undefined,
  };
  const idx = list.findIndex((item) => item.slug.toLowerCase() === patch.slug.toLowerCase());
  if (idx >= 0) {
    const next = list.slice();
    next[idx] = { ...list[idx], ...nextItem, imageUrl: patch.imageUrl || list[idx].imageUrl };
    return next;
  }
  if (!patch.title.trim() && !patch.excerpt.trim() && !patch.imageUrl) return list;
  return [nextItem, ...list].sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Lista de eventos para el sitio público y búsqueda.
 * Espera una lectura completa antes de completar los materiales estáticos:
 * un fallo de red no debe volver a mostrar un evento despublicado.
 */
export function useEvents(): Event[] {
  const ctx = useContext(AdminDataContext);
  if (ctx && !ctx.eventsLoaded) return [];
  const seedNormalized = EVENTS_SEED.map(normalizeEvent);
  const source = !ctx ? seedNormalized : (ctx.events ?? []).map(normalizeEvent);
  // Fill events documented by AECID without replacing any CMS record.
  const ids = new Set(source.map((event) => event.id));
  return [...source, ...SEMANA_RESOURCE_EVENTS.filter((event) => !ids.has(event.id)).map(normalizeEvent)]
    .filter((event) => event.published !== false);
}

export function useMergedCifras(): KPIItem[] {
  const ctx = useContext(AdminDataContext);
  return ctx?.adminCifras ?? statsKpis;
}

/** Documentos estáticos + los añadidos por el admin. Las revistas salen del CMS de Revista Digital. */
export function useMergedGestionDocuments(): GestionDocument[] {
  const ctx = useContext(AdminDataContext);
  const revistaEditions = useRevistaDigitalEditions();
  const revistas = getPublishedRevistaEditions(revistaEditions).map(revistaEditionToGestionDocument);
  const base =
    !ctx
      ? gestionDocuments
      : !ctx.documentsLoaded ? []
      : (() => {
          const staticById = new Map(gestionDocuments.map((d) => [d.id, d]));
          const dbIds = new Set((ctx.adminDocuments ?? []).map((d) => d.id));
          const staticFiltered = gestionDocuments.filter((d) => !dbIds.has(d.id));
          const fromDb = (ctx.adminDocuments ?? []).map((d) => {
            const fallbackCover = staticById.get(d.id)?.coverImage;
            if (!d.coverImage && fallbackCover) return { ...d, coverImage: fallbackCover };
            return d;
          });
          return [...staticFiltered, ...fromDb];
        })();
  const withoutRevista = base.filter((d) => d.category !== "revista");
  const list = [...withoutRevista, ...revistas];
  const { enabled, preview } = useSiteEdit();
  if (!enabled || !preview.document || preview.document.category === "revista") return list;
  const patch = preview.document;
  const idx = list.findIndex((d) => d.id === patch.id);
  if (idx >= 0) {
    const next = list.slice();
    next[idx] = patch;
    return next;
  }
  return [patch, ...list];
}
