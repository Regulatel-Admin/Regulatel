export const SITE_EDIT_STORAGE_KEY = "regulatel_site_edit";
export const CMS_SAVED_EVENT = "regulatel:cms-saved";

export type SiteEditTarget =
  | { kind: "boletin"; slug?: string }
  | { kind: "hero" }
  | { kind: "quick-link"; index: number }
  | { kind: "cumbre"; id: string }
  | { kind: "noticia"; slug?: string }
  | { kind: "revista"; id?: string }
  | { kind: "documento"; id?: string; category?: "documentos" | "planes-actas" | "comite-ejecutivo" | "otros" }
  | { kind: "home-aviso"; id?: string }
  | { kind: "ente"; id?: string }
  | { kind: "directorio"; id?: string }
  | { kind: "grupo"; id?: string }
  | { kind: "autoridad"; id?: string }
  | { kind: "comite-logo"; slot: "presidente" | "vice" | "miembro"; id?: string }
  | { kind: "comite-funciones" }
  | { kind: "convenio"; slug?: string }
  | { kind: "album"; slug?: string }
  | { kind: "estudio"; id?: string }
  | { kind: "entrevista"; slug?: string }
  | { kind: "panel"; path: string; label: string };

export function notifyCmsSaved(key?: string) {
  window.dispatchEvent(new CustomEvent(CMS_SAVED_EVENT, { detail: { key } }));
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function adminPathForPublic(pathname: string, search = ""): string | null {
  if (pathname === "/") return "/admin/content/home";
  if (pathname.startsWith("/boletines-gtai")) return "/admin/boletines-gtai";
  if (pathname.startsWith("/noticias")) return "/admin/noticias";
  if (pathname.startsWith("/eventos")) return "/admin/eventos";
  if (pathname.startsWith("/galeria")) return "/admin/content/galeria";
  if (pathname.startsWith("/autoridades")) return "/admin/autoridades-actuales";
  if (pathname.startsWith("/miembros")) return "/admin/entes-miembros";
  if (pathname.startsWith("/convenios")) return "/admin/convenios";
  if (pathname.startsWith("/grupos-de-trabajo")) return "/admin/grupos-trabajo";
  if (pathname.startsWith("/comite-ejecutivo")) return "/admin/comite-ejecutivo";
  if (pathname.startsWith("/micrositio-buenas-practicas")) return "/admin/buenas-practicas";
  if (pathname.startsWith("/estudios-e-investigacion")) return "/admin/documentos";
  if (pathname.startsWith("/habla-el-regulador")) return "/admin";
  if (pathname === "/gestion" || pathname === "/recursos") {
    if (search.includes("tipo=revista")) return "/admin/revista";
    return "/admin/documentos";
  }
  return null;
}

export function publicPathForAdmin(adminPath: string): string {
  if (adminPath.startsWith("/admin/boletines-gtai")) return "/boletines-gtai";
  if (adminPath.startsWith("/admin/noticias")) return "/noticias";
  if (adminPath.startsWith("/admin/eventos")) return "/eventos";
  if (adminPath.startsWith("/admin/content/home")) return "/";
  if (adminPath.startsWith("/admin/content/cumbres")) return "/";
  if (adminPath.startsWith("/admin/content/accesos")) return "/";
  if (adminPath.startsWith("/admin/content/galeria")) return "/galeria";
  if (adminPath.startsWith("/admin/revista")) return "/gestion?tipo=revista";
  if (adminPath.startsWith("/admin/documentos")) return "/gestion";
  if (adminPath.startsWith("/admin/autoridades")) return "/autoridades";
  if (adminPath.startsWith("/admin/entes-miembros") || adminPath.startsWith("/admin/directorio")) return "/miembros";
  if (adminPath.startsWith("/admin/convenios")) return "/convenios";
  if (adminPath.startsWith("/admin/grupos-trabajo")) return "/grupos-de-trabajo";
  if (adminPath.startsWith("/admin/comite-ejecutivo")) return "/comite-ejecutivo";
  if (adminPath.startsWith("/admin/buenas-practicas")) return "/micrositio-buenas-practicas";
  if (adminPath.startsWith("/admin/cifras")) return "/";
  return "/";
}
