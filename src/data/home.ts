import {
  BarChart3,
  BookOpen,
  Building2,
  FileText,
  Files,
  Globe,
  Handshake,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface KPIItem {
  value: string;
  label: string;
  description: string;
}

/** Cifras por año para la sección REGULATEL EN CIFRAS (selector de año + count-up) */
export interface CifrasAnuales {
  gruposTrabajo: number;
  comitesEjecutivos: number;
  revistaDigital: number;
  paises: number;
}

export const cifrasPorAno: Record<number, CifrasAnuales> = {
  2026: {
    gruposTrabajo: 9,
    comitesEjecutivos: 2,
    revistaDigital: 1,
    paises: 23,
  },
  2025: {
    paises: 23,
    gruposTrabajo: 8,
    comitesEjecutivos: 10,
    revistaDigital: 4,
  },
};

/** Configuración por año de cada tarjeta: título, subtítulo, fuente clicable. value se obtiene de cifrasPorAno/admin. */
export interface CifraCardConfig {
  key: keyof CifrasAnuales;
  title: string;
  subtitle: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const cifrasCardsConfig: Record<number, CifraCardConfig[]> = {
  2026: [
    {
      key: "gruposTrabajo",
      title: "GRUPOS DE TRABAJO",
      subtitle: "Equipos técnicos activos en agenda regional.",
      sourceLabel: "Plan de trabajo y estructura",
      sourceUrl: "/documents/Plan-Trabajo-REGULATEL-2026.pdf",
    },
    {
      key: "comitesEjecutivos",
      title: "COMITÉS EJECUTIVOS",
      subtitle: "Instancias de coordinación institucional.",
      sourceLabel: "Estructura y actas",
      sourceUrl: "/gestion?tipo=planes-actas",
    },
    {
      key: "revistaDigital",
      title: "REVISTA DIGITAL",
      subtitle: "Publicación periódica de avances.",
      sourceLabel: "Revista Digital REGULATEL",
      sourceUrl: "/gestion?tipo=revista",
    },
    {
      key: "paises",
      title: "PAÍSES MIEMBROS",
      subtitle: "Miembros de REGULATEL en la región.",
      sourceLabel: "Actas de Asamblea Plenaria",
      sourceUrl: "/documents/Acta-27-Asamblea-Plenaria-Regulatel.pdf",
    },
  ],
  2025: [
    {
      key: "paises",
      title: "PAÍSES MIEMBROS",
      subtitle: "Actualizado: 12/2025",
      sourceLabel: "Acta 27ª Asamblea Plenaria",
      sourceUrl: "/documents/Acta-27-Asamblea-Plenaria-Regulatel.pdf",
    },
    {
      key: "gruposTrabajo",
      title: "GRUPOS DE TRABAJO ACTIVOS",
      subtitle: "Actualizado: 12/2025",
      sourceLabel: "Plan de trabajo 2026",
      sourceUrl: "/documents/Plan-Trabajo-REGULATEL-2026.pdf",
    },
    {
      key: "comitesEjecutivos",
      title: "COMITÉS EJECUTIVOS 2025",
      subtitle: "Actualizado: 12/2025",
      sourceLabel: "Balance Presidencia 2025",
      /* TODO: Conectar PDF cuando esté disponible. Mientras tanto enlace a gestión. */
      sourceUrl: "/gestion?tipo=planes-actas",
    },
    {
      key: "revistaDigital",
      title: "REVISTAS DIGITALES 2025",
      subtitle: "Actualizado: 12/2025",
      sourceLabel: "Revista Digital REGULATEL",
      sourceUrl: "/gestion?tipo=revista",
    },
  ],
};

/** Años disponibles, orden descendente (más reciente primero) */
export function getCifrasAnos(): number[] {
  return Object.keys(cifrasPorAno)
    .map(Number)
    .sort((a, b) => b - a);
}

export interface FeatureItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  todo?: string;
}

/** Estilo BEREC: Documents (2 botones) / Tools (enlaces + botón) / Paragraph (solo texto) */
export type BerecCardVariant = "documents" | "tools" | "paragraph";

export interface BerecCardButton {
  label: string;
  href: string;
  external?: boolean;
}

export interface BerecCardLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface BerecFeatureCard {
  /** Título del cuadro, mismo estilo BEREC (Documentos, Tools, etc.) */
  title: string;
  variant: BerecCardVariant;
  /** Para variant "documents": 2 botones magenta */
  buttons?: BerecCardButton[];
  /** Para variant "tools": enlaces en magenta + 1 botón */
  links?: BerecCardLink[];
  /** Para variant "paragraph": párrafo descriptivo */
  description?: string;
  /** Enlace "Ver más >" */
  seeMoreHref: string;
}

export interface HeroSlideItem {
  title: string;
  subtitle: string;
  imageUrl: string;
  /** Fecha en formato BEREC: "26 FEBRUARY 2026" */
  dateFormatted?: string;
  /** Categoría: "EVENTOS", "NOTICIAS", etc. */
  category?: string;
  /** Enlace del botón READ MORE */
  href?: string;
}

export const heroContent = {
  title: "REGULATEL",
  subtitle: "Foro Latinoamericano de Entes Reguladores de Telecomunicaciones.",
  primaryCta: {
    label: "Explorar recursos",
    href: "/recursos",
  },
  secondaryCta: {
    label: "Ver próximos eventos",
    href: "/eventos",
  },
};

/** Hero limpio (solo mensaje + CTAs): texto exacto y labels en mayúsculas */
export const heroClean = {
  eyebrow: "#conectando",
  title: "REGULATEL",
  subtitle:
    "Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (creado en 1998).",
  primaryCta: { label: "EXPLORAR RECURSOS", href: "/recursos" },
  secondaryCta: { label: "VER PRÓXIMOS EVENTOS", href: "/eventos" },
};

/** Hero institucional/editorial: imagen de fondo + overlay + badge + título + descripción + 2 CTAs */
export const heroInstitucional = {
  coverImageUrl: "/images/foto-home-regulatel.png",
  badge: "Presidencia 2026",
  title: "Cooperación regulatoria para una transformación digital",
  titleHighlight: "inclusiva y segura",
  description:
    "REGULATEL articula a los entes reguladores de telecomunicaciones de 23 países para promover la cooperación, el intercambio de experiencias y la armonización de políticas públicas en América Latina y Europa.",
  primaryCta: { label: "Ver plan de trabajo 2026", href: "/gestion?tipo=planes-actas&id=plan-2026" },
  secondaryCta: { label: "Acceder a documentos oficiales", href: "/gestion" },
};

/** Bullets de valor para el hero "Qué es REGULATEL" (above the fold) */
export const heroValueBullets = [
  "Cooperación regional entre entes reguladores",
  "Buenas prácticas y estándares del sector",
  "Conocimiento e intercambio técnico",
];

/** Hero superior BEREC-like: hashtag + título (2 líneas) */
export const heroHeadingBerec = {
  hashtag: "#conectando",
  title: "REGULATEL",
};

/** Item de la sección "Accesos principales" (icono + título + descripción corta + link) */
export interface AccessMainItem {
  title: string;
  shortDescription: string;
  href: string;
  icon: LucideIcon;
}

/** 6 accesos principales para la sección debajo del hero */
export const accessMainItems: AccessMainItem[] = [
  {
    title: "Banco de información",
    shortDescription: "Acceso centralizado a información técnica y regulatoria.",
    href: "/gestion?tipo=banco",
    icon: BarChart3,
  },
  {
    title: "Micrositio Buenas prácticas Power BI",
    shortDescription: "Indicadores internacionales REGULATEL y visualización Power BI (SUTEL).",
    href: "https://app.powerbi.com/view?r=eyJrIjoiOWM5NWI3YWEtZjk0MC00NDlhLWI0YmYtMDQ4MGQ2OTM1ZTQwIiwidCI6ImVjYzY2NjY1LTFiYjktNDgxOC04YWJjLWE0MDk0Njg5NDE3OCIsImMiOjR9",
    icon: BookOpen,
  },
  {
    title: "Documentos",
    shortDescription: "Documentos, planes de trabajo y actas.",
    href: "/gestion?tipo=documentos",
    icon: FileText,
  },
  {
    title: "Revista Digital",
    shortDescription: "Ediciones con novedades y resultados de trabajo regional.",
    href: "/gestion?tipo=revista",
    icon: Newspaper,
  },
  {
    title: "Grupos de Trabajo",
    shortDescription: "Pilar clave para el plan de trabajo anual.",
    href: "/grupos-de-trabajo",
    icon: Users,
  },
  {
    title: "Miembros",
    shortDescription: "Entes reguladores miembros y puntos de contacto.",
    href: "/miembros",
    icon: Building2,
  },
];

/** Quick Links (Accesos principales estilo INDOTEL): 4 tiles pegados, primer tile en forma de flecha. */
export const quickLinks = [
  {
    label: "Observatorio de Mejores Prácticas Regulatorias",
    href: "/micrositio-buenas-practicas",
    icon: Globe,
  },
  {
    label: "Micrositio Buenas prácticas (Power BI)",
    href: "https://app.powerbi.com/view?r=eyJrIjoiOWM5NWI3YWEtZjk0MC00NDlhLWI0YmYtMDQ4MGQ2OTM1ZTQwIiwidCI6ImVjYzY2NjY1LTFiYjktNDgxOC04YWJjLWE0MDk0Njg5NDE3OCIsImMiOjR9",
    icon: Handshake,
    external: true,
  },
  {
    label: "Documentos",
    href: "/gestion",
    icon: Files,
  },
  {
    label: "Miembros",
    href: "/miembros",
    icon: Users,
  },
];

export const heroSlides: HeroSlideItem[] = [
  {
    title: "REGULATEL — Foro Latinoamericano de Entes Reguladores de Telecomunicaciones",
    subtitle: "CONECTANDO LA REGIÓN",
    imageUrl: "/images/homepage/slideshow/regulatel-1.jpg",
    dateFormatted: "",
    category: "",
    href: "/",
  },
  {
    title: "Foro Latinoamericano de Entes Reguladores de Telecomunicaciones — Desde 1998",
    subtitle: "INTERCAMBIO Y ARMONIZACIÓN REGULATORIA",
    imageUrl: "/images/homepage/slideshow/regulatel-2.jpg",
    dateFormatted: "",
    category: "",
    href: "/",
  },
  {
    title: "Cumbre REGULATEL, ASIET y COMTELCA — Conectando el futuro digital de la región",
    subtitle: "PUNTA CANA 2025",
    imageUrl:
      "https://www.regulatel.org/sites/default/files/gallery/CUMBRE-REGULATEL-ASIET-COMTELCA-2025-HOME.png",
    dateFormatted: "11 DICIEMBRE 2025",
    category: "EVENTOS",
    href: "https://www.flickr.com/photos/indotel/albums/72177720330839315",
  },
  {
    title: "Cumbre REGULATEL - BEREC, Santa Cruz 2024",
    subtitle: "SANTA CRUZ 2024",
    imageUrl:
      "https://www.regulatel.org/sites/default/files/gallery/noticia-bolivia-sede-cumbre-regulatel-berec-2024.jpg",
    dateFormatted: "20-21 JUNIO 2024",
    category: "EVENTOS",
    href: "/eventos",
  },
  {
    title: "Reunión de Grupos de Trabajo — Cooperación regional e innovación",
    subtitle: "COOPERACIÓN REGIONAL",
    imageUrl:
      "https://www.regulatel.org/sites/default/files/gallery/noticia-reunion-grupos-trabajo-regulatel-2024.jpg",
    dateFormatted: "16 ABRIL 2024",
    category: "NOTICIAS",
    href: "/noticias",
  },
];

export const statsKpis: KPIItem[] = [
  {
    value: "9",
    label: "Grupos de trabajo",
    description: "Equipos técnicos activos en agenda regional.",
  },
  {
    value: "2",
    label: "Comités Ejecutivos",
    description: "Instancias de coordinación institucional.",
  },
  {
    value: "1",
    label: "Revista Digital",
    description: "Publicación periódica de avances.",
  },
  {
    value: "23",
    label: "Países",
    description: "Miembros de REGULATEL en la región.",
  },
];

export const featureCards: FeatureItem[] = [
  {
    title: "Banco de Información",
    description: "Acceso centralizado a información técnica y regulatoria del foro.",
    href: "/pendiente/banco-informacion",
    icon: Globe,
    todo: "TODO: Definir URL oficial del Banco de Información.",
  },
  {
    title: "Micrositio Buenas prácticas Power BI",
    description: "Indicadores internacionales REGULATEL y visualización Power BI (SUTEL).",
    href: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel",
    icon: Handshake,
  },
  {
    title: "Documentos",
    description: "Planes, actas y declaraciones institucionales disponibles para consulta.",
    href: "/gestion",
    icon: Files,
  },
  {
    title: "Revista Digital",
    description: "Ediciones con novedades, actividades y resultados de trabajo regional.",
    href: "/gestion",
    icon: Newspaper,
  },
  {
    title: "Grupos de Trabajo",
    description: "Conoce los grupos temáticos y su contribución a la cooperación regional.",
    href: "/grupos-de-trabajo",
    icon: BookOpen,
  },
  {
    title: "Miembros",
    description: "Entes reguladores miembros y puntos de contacto institucional.",
    href: "/miembros",
    icon: Users,
  },
];

/** 6 cuadros idénticos a BEREC: mismo sitio, size, font, mayúsculas/minúsculas, botones. */
export const berecFeatureCards: BerecFeatureCard[] = [
  {
    title: "Banco de información",
    variant: "documents",
    buttons: [
      { label: "BANCO DE INFORMACIÓN", href: "/pendiente/banco-informacion" },
      { label: "ACCESO A DATOS", href: "/pendiente/banco-informacion" },
    ],
    seeMoreHref: "/pendiente/banco-informacion",
  },
  {
    title: "Micrositio Buenas prácticas Power BI",
    variant: "tools",
    links: [
      { label: "INDICADORES REGULATEL", href: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel", external: true },
      { label: "POWER BI", href: "https://app.powerbi.com/view?r=eyJrIjoiOWM5NWI3YWEtZjk0MC00NDlhLWI0YmYtMDQ4MGQ2OTM1ZTQwIiwidCI6ImVjYzY2NjY1LTFiYjktNDgxOC04YWJjLWE0MDk0Njg5NDE3OCIsImMiOjR9", external: true },
    ],
    buttons: [
      { label: "VER INDICADORES SUTEL", href: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel", external: true },
    ],
    seeMoreHref: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel",
  },
  {
    title: "Documentos",
    variant: "documents",
    buttons: [
      { label: "DOCUMENTOS REGULATEL", href: "/gestion?tipo=documentos" },
      { label: "PLANES Y ACTAS", href: "/gestion?tipo=planes-actas" },
    ],
    seeMoreHref: "/gestion",
  },
  {
    title: "Revista Digital",
    variant: "paragraph",
    description:
      "Ediciones con novedades, actividades y resultados de trabajo regional. Descargue las ediciones de la Revista Digital REGULATEL.",
    seeMoreHref: "/gestion?tipo=revista",
  },
  {
    title: "Grupos de Trabajo",
    variant: "paragraph",
    description:
      "Forman un pilar clave de REGULATEL. Son esenciales para implementar el plan de trabajo anual. Conozca su rol, asignaciones y resultados.",
    seeMoreHref: "/grupos-de-trabajo",
  },
  {
    title: "Miembros",
    variant: "paragraph",
    description:
      "Entes reguladores miembros y puntos de contacto institucional. Conozca a los reguladores de la región.",
    seeMoreHref: "/miembros",
  },
];

export const featuredSummit = {
  title: "Cumbre Punta Cana 2025",
  description:
    "Encuentro regional de cooperación entre reguladores y actores del ecosistema digital para impulsar una agenda común.",
  href: "https://www.flickr.com/photos/indotel/albums/72177720330839315",
  buttonLabel: "Ver Cumbre",
};

/** Items para el carrusel editorial tipo BEREC (featured hero con card overlay). */
export const featuredCarouselItems = [
  {
    id: "cumbre-cartagena-2026",
    type: "eventos" as const,
    date: "2026",
    title: "Cumbre BEREC - REGULATEL, Cartagena 2026",
    imageUrl: "/images/cumbre-berec-cartagena-2026.jpg",
    href: "/pendiente/cumbre-berec-regulatel-cartagena-2026",
    ctaPrimaryLabel: "Leer más",
    categoryLabel: "PRÓXIMA",
  },
  {
    id: "cumbre-punta-cana-2025",
    type: "eventos" as const,
    date: "11 DIC 2025",
    title: "Cumbre REGULATEL, ASIET y COMTELCA — Conectando el futuro digital de la región",
    imageUrl: "/images/cumbre-regulatel-asiet-comtelca-2025.png",
    href: "https://www.flickr.com/photos/indotel/albums/72177720330839315",
    ctaPrimaryLabel: "Ver Cumbre",
    /* Sin ctaSecondary: evento 2025 ya pasó, no debe mostrar Registrarse. */
  },
  {
    id: "cumbre-santa-cruz-2024",
    type: "eventos" as const,
    date: "21 JUN 2024",
    title: "Cumbre BEREC - REGULATEL, Santa Cruz 2024",
    imageUrl: "/images/cumbre-berec-santa-cruz-2024.jpg",
    href: "/noticias/concluye-con-exito-la-historica-cumbre-regulatel-berec-en-bolivia-2024",
    ctaPrimaryLabel: "Leer más",
  },
];
