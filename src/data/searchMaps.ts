/**
 * Mapas de búsqueda: palabras clave → ruta o resultado.
 * Usados por "Buscar en el sitio" y "Buscar documentos" en la top bar.
 */

export interface SiteSearchEntry {
  keywords: string[];
  path: string;
  label: string;
}

/** Búsqueda en el sitio: si el término coincide con alguna palabra clave, se redirige a la ruta. */
export const siteSearchEntries: SiteSearchEntry[] = [
  { keywords: ["miembros", "miembro", "entes", "reguladores"], path: "/miembros", label: "Miembros" },
  { keywords: ["presidente", "autoridades", "autoridad", "vicepresidente", "comité ejecutivo"], path: "/autoridades", label: "Autoridades" },
  { keywords: ["comite", "comité", "ejecutivo"], path: "/comite-ejecutivo", label: "Comité Ejecutivo" },
  { keywords: ["noticias", "noticia"], path: "/noticias", label: "Noticias" },
  { keywords: ["eventos", "evento", "cumbre"], path: "/eventos", label: "Eventos" },
  { keywords: ["contacto", "contactar"], path: "/contacto", label: "Contacto" },
  { keywords: ["recursos", "documentos", "gestión", "gestion"], path: "/gestion", label: "Recursos y Documentos" },
  { keywords: ["grupos de trabajo", "grupos"], path: "/grupos-de-trabajo", label: "Grupos de Trabajo" },
  { keywords: ["qué somos", "que somos"], path: "/que-somos", label: "Qué somos" },
  { keywords: ["vision", "visión", "mision", "misión"], path: "/vision-mision", label: "Visión y misión" },
  { keywords: ["objetivos", "funciones", "foro regulatel"], path: "/objetivos-y-funciones", label: "Objetivos y Funciones" },
  { keywords: ["estatutos", "reglamento", "protocolos", "procedimientos"], path: "/protocolos-y-procedimientos", label: "Protocolos y procedimientos" },
  { keywords: ["convenios"], path: "/convenios", label: "Convenios" },
  { keywords: ["revista", "revistas"], path: "/gestion?tipo=revista", label: "Revista Digital (Recursos)" },
  { keywords: ["buenas prácticas", "micrositio", "power bi", "indicadores"], path: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel", label: "Micrositio Buenas prácticas Power BI" },
];

export interface DocumentSearchEntry {
  keywords: string[];
  path: string;
  label: string;
  description?: string;
}

/** Búsqueda de documentos: revistas, planes, actas, etc. Deep link a /gestion?tipo=... */
export const documentSearchEntries: DocumentSearchEntry[] = [
  {
    keywords: ["revista", "revistas", "revista digital", "revistas digitales", "digital"],
    path: "/gestion?tipo=revista",
    label: "Revista Digital REGULATEL",
    description: "Ediciones de la Revista Digital.",
  },
  {
    keywords: ["plan", "planes", "trabajo", "plan de trabajo"],
    path: "/gestion?tipo=planes-actas",
    label: "Planes de trabajo",
    description: "Planes de trabajo anuales.",
  },
  {
    keywords: ["acta", "actas", "asamblea"],
    path: "/gestion?tipo=planes-actas",
    label: "Actas de asambleas",
    description: "Actas de las asambleas plenarias.",
  },
  {
    keywords: ["documento", "documentos", "publicación", "publicaciones"],
    path: "/gestion?tipo=documentos",
    label: "Documentos y publicaciones",
    description: "Documentos, estudios y publicaciones.",
  },
];

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

/**
 * Resuelve la búsqueda del sitio: devuelve la ruta si hay coincidencia, si no null.
 */
export function resolveSiteSearch(query: string): { path: string; label: string } | null {
  const normalized = normalizeQuery(query);
  if (!normalized) return null;
  const words = normalized.split(/\s+/);
  for (const entry of siteSearchEntries) {
    const matches = entry.keywords.some(
      (kw) => normalized.includes(kw) || words.some((w) => kw.includes(w) || w.includes(kw))
    );
    if (matches) return { path: entry.path, label: entry.label };
  }
  return null;
}

/**
 * Resuelve la búsqueda de documentos: devuelve la primera coincidencia o todas las que coincidan.
 */
export function resolveDocumentSearch(query: string): DocumentSearchEntry[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  return documentSearchEntries.filter((entry) =>
    entry.keywords.some(
      (kw) => normalized.includes(kw) || normalized.split(/\s+/).some((w) => kw.includes(w) || w.includes(normalized))
    )
  );
}

/**
 * Para la página de búsqueda del sitio: devuelve entradas que coincidan con el término.
 */
export function getSiteSearchSuggestions(query: string): SiteSearchEntry[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  return siteSearchEntries.filter((entry) =>
    entry.keywords.some(
      (kw) => normalized.includes(kw) || normalized.split(/\s+/).some((w) => kw.includes(w) || w.includes(normalized))
    )
  );
}
