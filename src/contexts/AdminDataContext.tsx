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
import { homeEvents as staticEvents, type HomeEventItem } from "@/data/events";
import { homeNews } from "@/data/news";
import { noticiasData } from "@/pages/noticiasData";

const KEY_NEWS = "regulatel_admin_news";
const KEY_EVENTS = "regulatel_admin_events";
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

  adminEvents: HomeEventItem[];
  setAdminEvents: (v: HomeEventItem[] | ((prev: HomeEventItem[]) => HomeEventItem[])) => void;
  addEvent: (item: HomeEventItem) => void;
  updateEvent: (index: number, item: Partial<HomeEventItem>) => void;
  deleteEvent: (index: number) => void;

  adminCifras: KPIItem[] | null;
  setAdminCifras: (v: KPIItem[] | null | ((prev: KPIItem[] | null) => KPIItem[] | null)) => void;

  /** Cifras editadas por año (2025, 2026, …). Si no hay override para un año, se usa cifrasPorAno. */
  adminCifrasPorAno: Record<number, CifrasAnuales>;
  getCifrasForYear: (year: number) => CifrasAnuales;
  setCifrasForYear: (year: number, data: CifrasAnuales) => void;
  clearCifrasForYear: (year: number) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [adminNews, setAdminNewsState] = useState<AdminNewsItem[]>(() =>
    loadJson<AdminNewsItem[]>(KEY_NEWS, [])
  );
  const [adminEvents, setAdminEventsState] = useState<HomeEventItem[]>(() =>
    loadJson<HomeEventItem[]>(KEY_EVENTS, [])
  );
  const [adminCifras, setAdminCifrasState] = useState<KPIItem[] | null>(() =>
    loadJson<KPIItem[] | null>(KEY_CIFRAS, null)
  );
  const [adminCifrasPorAno, setAdminCifrasPorAnoState] = useState<Record<number, CifrasAnuales>>(() =>
    loadJson<Record<number, CifrasAnuales>>(KEY_CIFRAS_POR_ANO, {})
  );

  useEffect(() => {
    saveJson(KEY_NEWS, adminNews);
  }, [adminNews]);

  useEffect(() => {
    saveJson(KEY_EVENTS, adminEvents);
  }, [adminEvents]);

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

  const setAdminEvents = useCallback(
    (v: HomeEventItem[] | ((prev: HomeEventItem[]) => HomeEventItem[])) => {
      setAdminEventsState(v);
    },
    []
  );

  const addEvent = useCallback((item: HomeEventItem) => {
    setAdminEventsState((prev) => [...prev, item]);
  }, []);

  const updateEvent = useCallback((index: number, item: Partial<HomeEventItem>) => {
    setAdminEventsState((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...item } : e))
    );
  }, []);

  const deleteEvent = useCallback((index: number) => {
    setAdminEventsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

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

  return (
    <AdminDataContext.Provider
      value={{
        adminNews,
        setAdminNews,
        addNews,
        updateNews,
        deleteNews,
        adminEvents,
        setAdminEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        adminCifras,
        setAdminCifras,
        adminCifrasPorAno,
        getCifrasForYear,
        setCifrasForYear,
        clearCifrasForYear,
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
      })) ?? [];
  const merged = [...staticWithImages, ...adminPart];
  merged.sort((a, b) => (a.date > b.date ? -1 : 1));
  return merged;
}

export function useMergedEvents(): HomeEventItem[] {
  const ctx = useContext(AdminDataContext);
  const adminPart = ctx?.adminEvents ?? [];
  const merged = [...staticEvents, ...adminPart];
  merged.sort((a, b) => {
    if (a.status !== b.status) return a.status === "proxima" ? -1 : 1;
    return (b.year ?? 0) - (a.year ?? 0);
  });
  return merged;
}

export function useMergedCifras(): KPIItem[] {
  const ctx = useContext(AdminDataContext);
  return ctx?.adminCifras ?? statsKpis;
}
