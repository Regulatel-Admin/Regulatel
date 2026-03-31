/**
 * Site-wide CMS settings for the public site (hero, quick links, carousel).
 * Fetches from /api/settings when DB is configured; falls back to static data when not.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type {
  HomeHeroSetting,
  QuickLinkSettingItem,
  FeaturedCarouselItemSetting,
  GalleryAlbumSetting,
} from "@/types/siteSettings";
import { heroInstitucional, quickLinks, featuredCarouselItems } from "@/data/home";
import type { AlbumGaleria } from "@/data/galeria";
import { albumesGaleria } from "@/data/galeria";
import type { Authority } from "@/data/authorities";
import { authorities, parseAuthoritiesFromSettingValue } from "@/data/authorities";
import type { Convenio } from "@/data/convenios";
import { convenios as defaultConveniosStatic, parseConveniosFromSettingValue } from "@/data/convenios";
import type { EnteReguladorMiembro } from "@/data/entesReguladoresMiembros";
import { defaultEntesReguladoresMiembros, parseEntesMiembrosFromSettingValue } from "@/data/entesReguladoresMiembros";

export interface SiteSettingsState {
  homeHero: HomeHeroSetting | null;
  quickLinks: QuickLinkSettingItem[] | null;
  featuredCarousel: FeaturedCarouselItemSetting[] | null;
  galleryAlbums: GalleryAlbumSetting[] | null;
  navigation: unknown | null;
  /** null = usar datos estáticos; array (vacío o no) = lo guardado en BD. */
  autoridadesActuales: Authority[] | null;
  conveniosList: Convenio[] | null;
  entesReguladoresMiembros: EnteReguladorMiembro[] | null;
  loading: boolean;
  /** Vuelve a pedir los settings al API (útil al volver al Home tras guardar en admin). */
  refetch: () => Promise<void>;
}

const defaultState: SiteSettingsState = {
  homeHero: null,
  quickLinks: null,
  featuredCarousel: null,
  galleryAlbums: null,
  navigation: null,
  autoridadesActuales: null,
  conveniosList: null,
  entesReguladoresMiembros: null,
  loading: true,
  refetch: async () => {},
};

const SiteSettingsContext = createContext<SiteSettingsState>(defaultState);

async function fetchSettings(retry = false): Promise<Omit<SiteSettingsState, "refetch">> {
  if (!retry) {
    console.warn("[REGULATEL] Cargando settings desde API (GET /api/route?path=settings)...");
  } else {
    console.warn("[REGULATEL] Reintento de carga de settings...");
  }
  const res = await api.settings.getAll();
  if (!res.ok || !res.data) {
    if (!retry) {
      console.error("[REGULATEL] Settings falló en primer intento:", res.ok ? "sin data" : res.error, "→ reintento en 1.5s");
      await new Promise((r) => setTimeout(r, 1500));
      return fetchSettings(true);
    }
    const errMsg = !res.ok ? res.error : "sin datos";
    console.error("[REGULATEL] El home usará datos ESTÁTICOS. La API no devolvió settings (motivo:", errMsg, "). Revisa la consola [REGULATEL API] arriba.");
    return {
      ...defaultState,
      autoridadesActuales: null,
      conveniosList: null,
      entesReguladoresMiembros: null,
      loading: false,
    };
  }
  const d = res.data;
  const rawHero = d.home_hero;
  const homeHeroParsed =
    typeof rawHero === "string"
      ? (() => {
          try {
            return JSON.parse(rawHero) as unknown;
          } catch {
            return null;
          }
        })()
      : rawHero;
  const hasHero = homeHeroParsed && typeof homeHeroParsed === "object";
  return {
    homeHero:
      hasHero && homeHeroParsed && typeof homeHeroParsed === "object" && !Array.isArray(homeHeroParsed)
        ? (homeHeroParsed as HomeHeroSetting)
        : null,
    quickLinks: (() => {
      const raw = d.quick_links;
      const parsed = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : raw;
      return Array.isArray(parsed) ? (parsed as QuickLinkSettingItem[]) : null;
    })(),
    featuredCarousel: (() => {
      const raw = d.featured_carousel;
      const parsed = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : raw;
      return Array.isArray(parsed) ? (parsed as FeaturedCarouselItemSetting[]) : null;
    })(),
    galleryAlbums: (() => {
      const raw = d.gallery_albums;
      const parsed = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : raw;
      return Array.isArray(parsed) ? (parsed as GalleryAlbumSetting[]) : null;
    })(),
    navigation: d.navigation != null ? d.navigation : null,
    autoridadesActuales: (() => {
      if (!("autoridades_actuales" in d)) return null;
      const raw =
        typeof d.autoridades_actuales === "string"
          ? (() => {
              try {
                return JSON.parse(d.autoridades_actuales as string) as unknown;
              } catch {
                return d.autoridades_actuales;
              }
            })()
          : d.autoridades_actuales;
      const parsed = parseAuthoritiesFromSettingValue(raw);
      return parsed !== null ? parsed : null;
    })(),
    conveniosList: (() => {
      if (!("convenios" in d)) return null;
      const raw =
        typeof d.convenios === "string"
          ? (() => {
              try {
                return JSON.parse(d.convenios as string) as unknown;
              } catch {
                return d.convenios;
              }
            })()
          : d.convenios;
      const parsed = parseConveniosFromSettingValue(raw);
      return parsed !== null ? parsed : null;
    })(),
    entesReguladoresMiembros: (() => {
      if (!("entes_reguladores_miembros" in d)) return null;
      const raw =
        typeof d.entes_reguladores_miembros === "string"
          ? (() => {
              try {
                return JSON.parse(d.entes_reguladores_miembros as string) as unknown;
              } catch {
                return d.entes_reguladores_miembros;
              }
            })()
          : d.entes_reguladores_miembros;
      const parsed = parseEntesMiembrosFromSettingValue(raw);
      return parsed !== null ? parsed : null;
    })(),
    loading: false,
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteSettingsState>(defaultState);

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const next = await fetchSettings();
    setState((prev) => ({ ...prev, ...next, refetch: prev.refetch }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await fetchSettings();
      if (cancelled) return;
      setState((prev) => ({ ...prev, ...next, refetch }));
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  // Al volver a esta pestaña (p. ej. desde el admin), refrescar settings para ver lo guardado
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refetch]);

  return (
    <SiteSettingsContext.Provider value={{ ...state, refetch }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

/** Hero to use on the public home: from API or static default. */
export function useHomeHero(): HomeHeroSetting {
  const { homeHero, loading } = useSiteSettings();
  if (!loading && homeHero) return homeHero;
  return {
    coverImageUrls: heroInstitucional.coverImageUrls,
    badge: heroInstitucional.badge,
    title: heroInstitucional.title,
    titleHighlight: heroInstitucional.titleHighlight,
    description: heroInstitucional.description,
    primaryCta: heroInstitucional.primaryCta,
    secondaryCta: heroInstitucional.secondaryCta,
  };
}

/** Quick links to use on the public home: from API or static default. */
export function useHomeQuickLinks(): QuickLinkSettingItem[] {
  const { quickLinks: ql, loading } = useSiteSettings();
  if (!loading && ql && ql.length > 0) return ql;
  return quickLinks.map((q) => ({
    label: q.label,
    href: q.href,
    external: (q as { external?: boolean }).external,
  }));
}

/** Featured carousel items: from API or static default. */
export function useFeaturedCarouselSettings(): FeaturedCarouselItemSetting[] {
  const { featuredCarousel, loading } = useSiteSettings();
  if (!loading && featuredCarousel && featuredCarousel.length > 0) return featuredCarousel;
  return featuredCarouselItems.map((it) => ({
    id: it.id,
    type: it.type,
    date: it.date,
    title: it.title,
    imageUrl: it.imageUrl,
    href: it.href,
    ctaPrimaryLabel: it.ctaPrimaryLabel,
    location: it.location,
    imagePosition: it.imagePosition,
  }));
}

/** Gallery albums: from API or static default. Returns AlbumGaleria[] for use in Galeria/GaleriaAlbum. */
export function useGalleryAlbums(): AlbumGaleria[] {
  const { galleryAlbums, loading } = useSiteSettings();
  if (!loading && galleryAlbums && galleryAlbums.length > 0) {
    return galleryAlbums.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: a.date,
      folder: a.folder,
      images: a.images,
    }));
  }
  return albumesGaleria;
}

/** Navigation items: from API or static default. */
export function useNavigationSettings(): unknown | null {
  const { navigation, loading } = useSiteSettings();
  if (!loading && navigation) return navigation;
  return null;
}

/** Presidente y vicepresidentes (/autoridades): BD o estático. */
export function useAutoridadesActuales(): Authority[] {
  const { autoridadesActuales, loading } = useSiteSettings();
  if (!loading && autoridadesActuales !== null) return autoridadesActuales;
  return authorities;
}

/** Convenios para menú, lista y detalle. */
export function useConveniosPublic(): Convenio[] {
  const { conveniosList, loading } = useSiteSettings();
  if (!loading && conveniosList !== null) {
    return [...conveniosList].sort((a, b) => a.order - b.order);
  }
  return defaultConveniosStatic;
}

/** Tarjetas "Entes reguladores miembros" en /miembros. */
export function useEntesReguladoresMiembros(): EnteReguladorMiembro[] {
  const { entesReguladoresMiembros, loading } = useSiteSettings();
  if (!loading && entesReguladoresMiembros !== null) return entesReguladoresMiembros;
  return defaultEntesReguladoresMiembros;
}
