/**
 * Configuración de documentos restringidos (actas).
 * El acceso se controla por email + contraseña (usuarios creados en el panel admin).
 */

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
  "acta-28": {
    id: "acta-28",
    title: "Acta No. 28",
    redirectUrl: "/gestion?tipo=planes-actas&id=acta-28",
  },
  "acta-2023": {
    id: "acta-2023",
    title: "Acta No. 28 / Acta No. 26",
    redirectUrl: "/gestion?tipo=planes-actas&id=acta-2023",
  },
};

const STORAGE_KEY_UNLOCKED = "regulatel-restricted-unlocked";

function getUnlockedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_UNLOCKED);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Marca un documento restringido como desbloqueado en esta sesión (tras contraseña correcta). */
export function markRestrictedUnlocked(docId: string): void {
  const ids = getUnlockedIds();
  if (ids.includes(docId)) return;
  ids.push(docId);
  sessionStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(ids));
}

/** Indica si el usuario desbloqueó este documento en la sesión actual. */
export function isRestrictedUnlocked(docId: string): boolean {
  return getUnlockedIds().includes(docId);
}

export function getRestrictedDocument(docId: string | null): RestrictedDocumentEntry | null {
  if (!docId) return null;
  return RESTRICTED_DOCUMENTS[docId] ?? null;
}
