/** Nombres visibles del panel. Nunca mostrar rutas crudas como content/home. */
export const ADMIN_PATH_LABELS: Record<string, string> = {
  "/admin": "Inicio",
  "/admin/content/home": "Portada",
  "/admin/content/cumbres": "Cumbres",
  "/admin/content/galeria": "Galería",
  "/admin/content/accesos": "Accesos de la portada",
  "/admin/content/navigation": "Menú del sitio",
  "/admin/content/paginas": "Páginas de categorías",
  "/admin/media": "Archivos",
  "/admin/noticias": "Noticias",
  "/admin/eventos": "Eventos",
  "/admin/cifras": "Cifras",
  "/admin/directorio-autoridades": "Directorio de autoridades",
  "/admin/autoridades-actuales": "Autoridades actuales",
  "/admin/entes-miembros": "Entes miembros",
  "/admin/convenios": "Convenios",
  "/admin/grupos-trabajo": "Grupos de trabajo",
  "/admin/comite-ejecutivo": "Comité Ejecutivo",
  "/admin/boletines-gtai": "Boletines GTAI",
  "/admin/documentos": "Documentos",
  "/admin/buenas-practicas": "Buenas prácticas",
  "/admin/revista": "Revista digital",
  "/admin/suscriptores": "Suscriptores",
  "/admin/visitas": "Visitas",
  "/admin/usuarios": "Usuarios",
  "/admin/acceso-actas": "Acceso a actas",
};

export function adminPathLabel(pathname: string): string {
  if (ADMIN_PATH_LABELS[pathname]) return ADMIN_PATH_LABELS[pathname];
  const match = Object.keys(ADMIN_PATH_LABELS)
    .filter((path) => path !== "/admin" && pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (match) return ADMIN_PATH_LABELS[match];
  return "Inicio";
}
