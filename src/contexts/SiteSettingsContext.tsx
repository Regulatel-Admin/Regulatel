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

export interface SiteSettingsState {
  homeHero: HomeHeroSetting | null;
  quickLinks: QuickLinkSettingItem[] | null;
  featuredCarousel: FeaturedCarouselItemSetting[] | null;
  galleryAlbums: GalleryAlbumSetting[] | null;
  navigation: unknown | null;
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
  loading: true,
  refetch: async () => {},
};

const SiteSettingsContext = createContext<SiteSettingsState>(defaultState);

async function fetchSettings(): Promise<Omit<SiteSettingsState, "refetch">> {
  const res = await api.settings.getAll();
  if (!res.ok || !res.data) {
    return { ...defaultState, loading: false };
  }
  const d = res.data;
  return {
    homeHero:
      d.home_hero && typeof d.home_hero === "object"
        ? (d.home_hero as HomeHeroSetting)
        : null,
    quickLinks: Array.isArray(d.quick_links) ? (d.quick_links as QuickLinkSettingItem[]) : null,
    featuredCarousel:
      Array.isArray(d.featured_carousel) ? (d.featured_carousel as FeaturedCarouselItemSetting[]) : null,
    galleryAlbums: Array.isArray(d.gallery_albums) ? (d.gallery_albums as GalleryAlbumSetting[]) : null,
    navigation: d.navigation != null ? d.navigation : null,
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
