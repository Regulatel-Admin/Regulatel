/**
 * Configuración de documentos restringidos (actas).
 * Capa de acceso temporal hasta implementar autenticación real.
 *
 * IMPORTANTE: La contraseña aquí es solo para frontend; no es seguridad real.
 * Centralizar aquí para cambiarla fácilmente y migrar después a backend.
 */

/** Contraseña temporal para acceso a documentos restringidos. Cambiar cuando exista auth real. */
export const RESTRICTED_ACCESS_PASSWORD = "regulatel2026";

export interface RestrictedDocumentEntry {
  /** ID del documento (ej: acta-27, acta-2023) */
  id: string;
  /** Título para mostrar en la pantalla de acceso */
  title: string;
  /** URL a la que redirigir tras acceso correcto (página gestión o PDF directo) */
  redirectUrl: string;
}

/** Mapeo de docId (query param) → datos del documento restringido */
export const RESTRICTED_DOCUMENTS: Record<string, RestrictedDocumentEntry> = {
  "acta-27": {
    id: "acta-27",
    title: "Acta No. 27",
    redirectUrl: "/gestion?tipo=planes-actas&id=acta-27",
  },
  "acta-2023": {
    id: "acta-2023",
    title: "Acta No. 28 / Acta No. 26",
    redirectUrl: "/gestion?tipo=planes-actas&id=acta-2023",
  },
};

export function getRestrictedDocument(docId: string | null): RestrictedDocumentEntry | null {
  if (!docId) return null;
  return RESTRICTED_DOCUMENTS[docId] ?? null;
}

export function checkRestrictedPassword(password: string): boolean {
  return password === RESTRICTED_ACCESS_PASSWORD;
}
