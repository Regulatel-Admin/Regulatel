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
import { defaultEntesReguladoresMiembros, parseEntesMiembrosFromSettingValue, stampEnteIds } from "@/data/entesReguladoresMiembros";
import type { DirectorioAutoridad } from "@/data/directorioAutoridades";
import { defaultDirectorioAutoridades, parseDirectorioFromSettingValue, stampDirectorioIds } from "@/data/directorioAutoridades";
import type { BuenasPracticasRegulatoriasSetting } from "@/data/mejoresPracticas";
import { parseBuenasPracticasRegulatoriasFromSettingValue } from "@/data/mejoresPracticas";
import type { RevistaEdition } from "@/data/revistaDigital";
import { mergeRevistaDigitalWithDefaults, parseRevistaDigitalFromSettingValue } from "@/data/revistaDigital";
import type { HomeAvisoSlot } from "@/data/homeAnnouncements";
import { mergeHomeAnnouncements, parseHomeAnnouncementsFromSettingValue, parseHeroAnnounceOrder, visibleHomeAvisos } from "@/data/homeAnnouncements";
import type { GrupoTrabajoSerialized } from "@/data/gruposTrabajo";
import { defaultGruposTrabajo, parseGruposTrabajoFromSettingValue } from "@/data/gruposTrabajo";
import type { ComiteEjecutivoCmsDocument } from "@/data/comiteEjecutivo";
import {
  defaultComiteEjecutivoCmsDocument,
  parseComiteEjecutivoCmsFromSettingValue,
  stampComiteIds,
} from "@/data/comiteEjecutivo";
import type { EstudioInvestigacion } from "@/data/estudiosInvestigacion";
import {
  defaultEstudiosInvestigacion,
  parseEstudiosFromSettingValue,
} from "@/data/estudiosInvestigacion";
import type { HablaElReguladorInterview } from "@/data/hablaElRegulador";
import {
  hablaElReguladorInterviews as defaultHablaInterviews,
  parseHablaInterviewsFromSettingValue,
} from "@/data/hablaElRegulador";
import { CMS_SAVED_EVENT } from "@/lib/siteEdit";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import type { CustomPage } from "@/data/customPages";
import { parseCustomPagesFromSettingValue } from "@/data/customPages";

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
  directorioAutoridades: DirectorioAutoridad[] | null;
  /** null = clave ausente en BD (usar JSON estático / fallback). Objeto = lo guardado (entries puede estar vacío). */
  buenasPracticasRegulatorias: BuenasPracticasRegulatoriasSetting | null;
  revistaDigital: RevistaEdition[] | null;
  homeAnnouncements: HomeAvisoSlot[] | null;
  heroAnnounceOrder: string[] | null;
  gruposTrabajo: GrupoTrabajoSerialized[] | null;
  comiteEjecutivo: ComiteEjecutivoCmsDocument | null;
  estudiosInvestigacion: EstudioInvestigacion[] | null;
  hablaElRegulador: HablaElReguladorInterview[] | null;
  customPages: CustomPage[] | null;
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
  directorioAutoridades: null,
  buenasPracticasRegulatorias: null,
  revistaDigital: null,
  homeAnnouncements: null,
  heroAnnounceOrder: null,
  gruposTrabajo: null,
  comiteEjecutivo: null,
  estudiosInvestigacion: null,
  hablaElRegulador: null,
  customPages: null,
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
      buenasPracticasRegulatorias: null,
      revistaDigital: null,
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
    directorioAutoridades: (() => {
      if (!("directorio_autoridades" in d)) return null;
      const raw =
        typeof d.directorio_autoridades === "string"
          ? (() => {
              try {
                return JSON.parse(d.directorio_autoridades as string) as unknown;
              } catch {
                return d.directorio_autoridades;
              }
            })()
          : d.directorio_autoridades;
      return parseDirectorioFromSettingValue(raw);
    })(),
    buenasPracticasRegulatorias: (() => {
      if (!("buenas_practicas_regulatorias" in d)) return null;
      const raw =
        typeof d.buenas_practicas_regulatorias === "string"
          ? (() => {
              try {
                return JSON.parse(d.buenas_practicas_regulatorias as string) as unknown;
              } catch {
                return d.buenas_practicas_regulatorias;
              }
            })()
          : d.buenas_practicas_regulatorias;
      return parseBuenasPracticasRegulatoriasFromSettingValue(raw);
    })(),
    revistaDigital: (() => {
      if (!("revista_digital" in d)) return null;
      const raw =
        typeof d.revista_digital === "string"
          ? (() => {
              try {
                return JSON.parse(d.revista_digital as string) as unknown;
              } catch {
                return d.revista_digital;
              }
            })()
          : d.revista_digital;
      return parseRevistaDigitalFromSettingValue(raw);
    })(),
    homeAnnouncements: (() => {
      if (!("home_announcements" in d)) return null;
      const raw =
        typeof d.home_announcements === "string"
          ? (() => {
              try {
                return JSON.parse(d.home_announcements as string) as unknown;
              } catch {
                return d.home_announcements;
              }
            })()
          : d.home_announcements;
      return parseHomeAnnouncementsFromSettingValue(raw);
    })(),
    heroAnnounceOrder: (() => {
      if (!("hero_announce_order" in d)) return null;
      const raw =
        typeof d.hero_announce_order === "string"
          ? (() => {
              try {
                return JSON.parse(d.hero_announce_order as string) as unknown;
              } catch {
                return d.hero_announce_order;
              }
            })()
          : d.hero_announce_order;
      return parseHeroAnnounceOrder(raw);
    })(),
    gruposTrabajo: (() => {
      if (!("grupos_trabajo" in d)) return null;
      const raw =
        typeof d.grupos_trabajo === "string"
          ? (() => {
              try {
                return JSON.parse(d.grupos_trabajo as string) as unknown;
              } catch {
                return d.grupos_trabajo;
              }
            })()
          : d.grupos_trabajo;
      return parseGruposTrabajoFromSettingValue(raw);
    })(),
    comiteEjecutivo: (() => {
      if (!("comite_ejecutivo" in d)) return null;
      const raw =
        typeof d.comite_ejecutivo === "string"
          ? (() => {
              try {
                return JSON.parse(d.comite_ejecutivo as string) as unknown;
              } catch {
                return d.comite_ejecutivo;
              }
            })()
          : d.comite_ejecutivo;
      return parseComiteEjecutivoCmsFromSettingValue(raw);
    })(),
    estudiosInvestigacion: (() => {
      if (!("estudios_investigacion" in d)) return null;
      const raw =
        typeof d.estudios_investigacion === "string"
          ? (() => {
              try {
                return JSON.parse(d.estudios_investigacion as string) as unknown;
              } catch {
                return d.estudios_investigacion;
              }
            })()
          : d.estudios_investigacion;
      return parseEstudiosFromSettingValue(raw);
    })(),
    hablaElRegulador: (() => {
      if (!("habla_el_regulador" in d)) return null;
      const raw =
        typeof d.habla_el_regulador === "string"
          ? (() => {
              try {
                return JSON.parse(d.habla_el_regulador as string) as unknown;
              } catch {
                return d.habla_el_regulador;
              }
            })()
          : d.habla_el_regulador;
      return parseHablaInterviewsFromSettingValue(raw);
    })(),
    customPages: (() => {
      if (!("custom_pages" in d)) return null;
      const raw =
        typeof d.custom_pages === "string"
          ? (() => {
              try {
                return JSON.parse(d.custom_pages as string) as unknown;
              } catch {
                return d.custom_pages;
              }
            })()
          : d.custom_pages;
      return parseCustomPagesFromSettingValue(raw);
    })(),
    loading: false,
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteSettingsState>(defaultState);

  const refetch = useCallback(async () => {
    const next = await fetchSettings();
    setState((prev) => ({ ...prev, ...next, loading: false, refetch: prev.refetch }));
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
    const onSaved = () => {
      void refetch();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(CMS_SAVED_EVENT, onSaved);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(CMS_SAVED_EVENT, onSaved);
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

/** Hero to use on the public home: from API, live preview, or static default. */
export function useHomeHero(): HomeHeroSetting {
  const { homeHero } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.homeHero) return preview.homeHero;
  if (homeHero) return homeHero;
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

/** Quick links to use on the public home: from API, live preview, or static default. */
export function useHomeQuickLinks(): QuickLinkSettingItem[] {
  const { quickLinks: ql } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.quickLinks) return preview.quickLinks;
  if (ql && ql.length > 0) return ql;
  return quickLinks.map((q) => ({
    label: q.label,
    href: q.href,
    external: (q as { external?: boolean }).external,
  }));
}

/** Featured carousel items: from API, live preview, or static default. */
export function useFeaturedCarouselSettings(): FeaturedCarouselItemSetting[] {
  const { featuredCarousel } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.featuredCarousel) return preview.featuredCarousel;
  if (featuredCarousel && featuredCarousel.length > 0) return featuredCarousel;
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
    imageFit: it.imageFit,
  }));
}

/** Gallery albums: from API, live preview, or static default. */
export function useGalleryAlbums(): AlbumGaleria[] {
  const { galleryAlbums, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  const toAlbum = (a: GalleryAlbumSetting): AlbumGaleria => ({
    slug: a.slug,
    title: a.title,
    date: a.date,
    folder: a.folder,
    images: a.images,
  });
  if (enabled && preview.galleryAlbums) return preview.galleryAlbums.map(toAlbum);
  if (!loading && galleryAlbums && galleryAlbums.length > 0) {
    return galleryAlbums.map(toAlbum);
  }
  return albumesGaleria;
}

/** Navigation items: from API or static default. */
export function useNavigationSettings(): unknown | null {
  const { navigation, loading } = useSiteSettings();
  if (!loading && navigation) return navigation;
  return null;
}

/** Presidente y vicepresidentes (/autoridades): BD, vista previa o estático. */
export function useAutoridadesActuales(): Authority[] {
  const { autoridadesActuales, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.autoridades) return preview.autoridades;
  if (!loading && autoridadesActuales !== null) return autoridadesActuales;
  return authorities;
}

/** Convenios para menú, lista y detalle. */
export function useConveniosPublic(): Convenio[] {
  const { conveniosList, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.convenios) return [...preview.convenios].sort((a, b) => a.order - b.order);
  if (!loading && conveniosList !== null) {
    return [...conveniosList].sort((a, b) => a.order - b.order);
  }
  return defaultConveniosStatic;
}

/** Tarjetas "Entes reguladores miembros" en /miembros. */
export function useEntesReguladoresMiembros(): EnteReguladorMiembro[] {
  const { entesReguladoresMiembros, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.entes) return stampEnteIds(preview.entes);
  if (!loading && entesReguladoresMiembros !== null) return stampEnteIds(entesReguladoresMiembros);
  return stampEnteIds(defaultEntesReguladoresMiembros);
}

/** Directorio de autoridades en /miembros. */
export function useDirectorioAutoridades(): DirectorioAutoridad[] {
  const { directorioAutoridades, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.directorio) return stampDirectorioIds(preview.directorio);
  if (!loading && directorioAutoridades !== null) return stampDirectorioIds(directorioAutoridades);
  return stampDirectorioIds(defaultDirectorioAutoridades);
}

/** Ediciones de la Revista Digital: CMS (mezclado con defaults), vista previa o listado original. */
export function useRevistaDigitalEditions(): RevistaEdition[] {
  const { revistaDigital } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.revista) return preview.revista;
  return mergeRevistaDigitalWithDefaults(revistaDigital);
}

/** Avisos extra del hero: CMS o vista previa al editar en el sitio. */
export function useHomeAnnouncements(): HomeAvisoSlot[] {
  const { homeAnnouncements } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.homeAnnouncements) return visibleHomeAvisos(preview.homeAnnouncements);
  return mergeHomeAnnouncements(homeAnnouncements);
}

/** Orden de las tarjetas del hero (boletín, revista y avisos). */
export function useHeroAnnounceOrder(): string[] | null {
  const { heroAnnounceOrder } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.heroAnnounceOrder) return preview.heroAnnounceOrder;
  return heroAnnounceOrder;
}

/** Fichas de /grupos-de-trabajo: CMS o vista previa al editar en el sitio. */
export function useGruposTrabajo(): GrupoTrabajoSerialized[] {
  const { gruposTrabajo, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.grupos) return preview.grupos;
  if (!loading && gruposTrabajo !== null) return gruposTrabajo;
  return defaultGruposTrabajo;
}

/** Comité Ejecutivo: CMS o vista previa al editar en el sitio. */
export function useComiteEjecutivo(): ComiteEjecutivoCmsDocument {
  const { comiteEjecutivo, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.comite) return stampComiteIds(preview.comite);
  if (!loading && comiteEjecutivo !== null) return stampComiteIds(comiteEjecutivo);
  return stampComiteIds(defaultComiteEjecutivoCmsDocument());
}

/** Estudios e investigación. */
export function useEstudiosInvestigacion(): EstudioInvestigacion[] {
  const { estudiosInvestigacion, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.estudios) return preview.estudios;
  if (!loading && estudiosInvestigacion !== null) return estudiosInvestigacion;
  return defaultEstudiosInvestigacion;
}

/** Entrevistas de Habla El Regulador. */
export function useHablaElReguladorInterviews(): HablaElReguladorInterview[] {
  const { hablaElRegulador, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.entrevistas) return preview.entrevistas;
  if (!loading && hablaElRegulador !== null) return hablaElRegulador;
  return defaultHablaInterviews;
}

/** Páginas de categorías creadas desde el menú. */
export function useCustomPages(): CustomPage[] {
  const { customPages, loading } = useSiteSettings();
  const { enabled, preview } = useSiteEdit();
  if (enabled && preview.customPages) return preview.customPages;
  if (!loading && customPages !== null) return customPages;
  return [];
}
