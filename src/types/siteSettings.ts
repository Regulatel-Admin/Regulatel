/**
 * Types for CMS site settings (home_hero, featured_carousel, quick_links).
 * Stored in site_settings table via /api/settings.
 */

export interface HomeHeroSetting {
  coverImageUrls: string[];
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface QuickLinkSettingItem {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
}

export interface FeaturedCarouselItemSetting {
  id: string;
  type?: "eventos";
  date: string;
  title: string;
  imageUrl: string;
  href: string;
  ctaPrimaryLabel?: string;
  location?: string;
  imagePosition?: string;
  active?: boolean;
}

/** Álbum de galería (slug, título, fecha, carpeta, lista de URLs o nombres de archivo). */
export interface GalleryAlbumSetting {
  slug: string;
  title: string;
  date: string;
  folder: string;
  images: string[];
}
