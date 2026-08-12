/**
 * Configuración de documentos restringidos (actas).
 * El acceso se controla por email + contraseña (usuarios creados en el panel admin).
 */

export interface RestrictedDocumentEntry {
  /** ID del documento (ej: acta-27, acta-ce-1) */
  id: string;
  /** Título para mostrar en la pantalla de acceso */
  title: string;
  /** URL a la que redirigir tras acceso correcto (página gestión o PDF directo) */
  redirectUrl: string;
}

export interface RestrictedCollectionEntry {
  id: string;
  title: string;
  redirectUrl: string;
}

/** Colecciones restringidas (ítems del menú Recursos). */
export const RESTRICTED_COLLECTIONS: Record<string, RestrictedCollectionEntry> = {
  "planes-actas": {
    id: "planes-actas",
    title: "Asambleas",
    redirectUrl: "/gestion?tipo=planes-actas",
  },
  "comite-ejecutivo": {
    id: "comite-ejecutivo",
    title: "Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo",
  },
};

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
  "acta-ce-1": {
    id: "acta-ce-1",
    title: "Acta No. 1 del Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo&id=acta-ce-1",
  },
  "acta-ce-2": {
    id: "acta-ce-2",
    title: "Acta No. 2 del Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo&id=acta-ce-2",
  },
  "acta-ce-3": {
    id: "acta-ce-3",
    title: "Acta No. 3 del Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo&id=acta-ce-3",
  },
  "acta-ce-4": {
    id: "acta-ce-4",
    title: "Acta No. 4 del Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo&id=acta-ce-4",
  },
  "acta-ce-5": {
    id: "acta-ce-5",
    title: "Acta No. 5 del Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo&id=acta-ce-5",
  },
  "acta-ce-6": {
    id: "acta-ce-6",
    title: "Acta No. 6 del Comité Ejecutivo",
    redirectUrl: "/gestion?tipo=comite-ejecutivo&id=acta-ce-6",
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

/** Desbloquea todos los documentos restringidos en esta sesión (login de usuario autorizado). */
export function markAllRestrictedUnlocked(): void {
  sessionStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(Object.keys(RESTRICTED_DOCUMENTS)));
}

/** Indica si el usuario desbloqueó este documento en la sesión actual. */
export function isRestrictedUnlocked(docId: string): boolean {
  return getUnlockedIds().includes(docId);
}

export function getRestrictedDocument(docId: string | null): RestrictedDocumentEntry | null {
  if (!docId) return null;
  return RESTRICTED_DOCUMENTS[docId] ?? null;
}

export function getRestrictedCollection(tipo: string | null): RestrictedCollectionEntry | null {
  if (!tipo) return null;
  return RESTRICTED_COLLECTIONS[tipo] ?? null;
}
