export interface NavigationItemLink {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  /** Si true, el enlace lleva a la pantalla de acceso restringido y muestra icono de candado */
  restricted?: boolean;
  /** Microtexto opcional bajo el label (ej: "Solo usuarios autorizados") */
  subtitle?: string;
  /** Agrupa este ítem bajo un subtítulo en la lista de hijos (ej: "2026", "2025") */
  groupLabel?: string;
  todo?: string;
  children?: NavigationItemLink[];
}

export interface NavigationColumn {
  title: string;
  links: NavigationItemLink[];
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  panelLabel?: string;
  columns?: NavigationColumn[];
}

export const navigationItems: NavigationItem[] = [
  {
    id: "quienes-somos",
    label: "Quiénes somos",
    panelLabel: "Quiénes somos",
    columns: [
      {
        title: "INSTITUCIONAL",
        links: [
          { label: "Qué somos", href: "/que-somos" },
          { label: "Visión y misión", href: "/vision-mision" },
          { label: "Objetivos y Funciones", href: "/objetivos-y-funciones" },
          { label: "Estatutos, reglamentos y procedimientos", href: "/protocolos-y-procedimientos" },
          { label: "Miembros", href: "/miembros" },
        ],
      },
      {
        title: "ORGANIZACIÓN",
        links: [
          { label: "Autoridades actuales", href: "/autoridades" },
          { label: "Comité Ejecutivo", href: "/comite-ejecutivo" },
          { label: "Grupos de Trabajo", href: "/grupos-de-trabajo" },
          { label: "Contacto", href: "/contacto" },
        ],
      },
    ],
  },
  {
    id: "noticias",
    label: "Noticias",
    href: "/noticias",
  },
  {
    id: "eventos",
    label: "Eventos",
    href: "/eventos",
  },
  {
    id: "recursos",
    label: "Recursos",
    href: "/recursos",
    panelLabel: "Recursos",
    columns: [
      {
        title: "PUBLICACIONES",
        links: [
          {
            label: "Documentos",
            href: "/gestion",
            description: "Documentos institucionales y técnicos",
          },
          {
            label: "Planes de trabajo",
            href: "/gestion?tipo=planes-actas",
            description: "Planificación estratégica anual por período",
          },
          {
            label: "Asambleas",
            href: "/acceso-documentos",
            description: "Actas oficiales de sesiones",
            restricted: true,
          },
          {
            label: "Declaraciones",
            href: "/gestion?tipo=documentos",
            description: "Declaraciones y pronunciamientos oficiales",
          },
        ],
      },
      {
        title: "CONOCIMIENTO",
        links: [
          {
            label: "Estudios e investigación",
            href: "/pendiente/estudios",
            description: "Análisis y estudios regulatorios comparados",
            todo: "TODO: Definir URL oficial de 'Estudios'.",
          },
          {
            label: "Revista Digital REGULATEL",
            href: "/gestion?tipo=revista",
            description: "Publicación periódica oficial de REGULATEL",
          },
          {
            label: "Galería fotográfica",
            href: "https://www.flickr.com/photos/indotel/albums/72177720330864280/",
            external: true,
            description: "Imágenes de eventos y actividades",
          },
        ],
      },
      {
        title: "HERRAMIENTAS",
        links: [
          {
            label: "Mejores prácticas regulatorias",
            href: "/micrositio-buenas-practicas",
            description: "Observatorio de regulación comparada regional",
          },
          {
            label: "Banco de información",
            href: "/pendiente/banco-informaciones",
            description: "Base de datos de telecomunicaciones",
            todo: "TODO: Definir URL oficial del banco de informaciones.",
          },
          {
            label: "Indicadores Power BI",
            href: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel",
            external: true,
            description: "Indicadores internacionales interactivos",
          },
        ],
      },
    ],
  },
  {
    id: "convenios",
    label: "Convenios",
    href: "/convenios",
    panelLabel: "Convenios",
    columns: [], // Dropdown renderizado por ConveniosMenu (BEREC, ICANN, FCC, COMTELCA + Ver todos)
  },
  {
    id: "contacto",
    label: "Contacto",
    href: "/contacto",
  },
];
