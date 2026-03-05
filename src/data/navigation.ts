export interface NavigationItemLink {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
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
          { label: "Funciones", href: "/funciones" },
          { label: "Reglamento", href: "/reglamento" },
          { label: "Miembros", href: "/miembros" },
        ],
      },
      {
        title: "ORGANIZACIÓN",
        links: [
          { label: "Cómo nos organizamos", href: "/pendiente/organizacion", todo: "TODO: Definir URL oficial de 'Cómo nos organizamos'." },
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
          { label: "Documentos", href: "/gestion" },
          {
            label: "Planes de trabajo",
            href: "/gestion?tipo=planes-actas",
            children: [
              { label: "Plan de Trabajo 2026", href: "/gestion?tipo=planes-actas&id=plan-2026" },
              { label: "Plan de Trabajo 2025", href: "/gestion?tipo=planes-actas&id=plan-2025" },
              { label: "Plan de Trabajo 2024", href: "/gestion?tipo=planes-actas&id=plan-2024" },
              { label: "Plan de Trabajo 2023", href: "/gestion?tipo=planes-actas&id=acta-2023" },
            ],
          },
          {
            label: "ASAMBLEAS",
            href: "/gestion?tipo=planes-actas",
            children: [
              { label: "Acta No. 28", href: "/gestion?tipo=planes-actas&id=acta-2023" },
              { label: "Acta No. 27", href: "/gestion?tipo=planes-actas&id=acta-27" },
              { label: "Acta No. 26", href: "/gestion?tipo=planes-actas&id=acta-2023" },
            ],
          },
          {
            label: "Declaraciones",
            href: "/gestion?tipo=documentos",
            children: [{ label: "Declaración de la Paz 2023", href: "/gestion?tipo=documentos&id=declaracion-paz-2023" }],
          },
        ],
      },
      {
        title: "GESTIÓN DE CONOCIMIENTO",
        links: [
          { label: "Estudios", href: "/pendiente/estudios", todo: "TODO: Definir URL oficial de 'Estudios'." },
          {
            label: "Revista Digital REGULATEL",
            href: "/gestion?tipo=revista",
            children: [
              { label: "1. Edición 2026", href: "/gestion?tipo=revista" },
              { label: "4. Edición 2025", href: "/gestion?tipo=revista&id=revista-q4-2025" },
              { label: "3. Edición 2025", href: "/gestion?tipo=revista&id=revista-q3-2025" },
              { label: "2. Edición 2025", href: "/gestion?tipo=revista&id=revista-q2-2025" },
              { label: "1. Edición 2025", href: "/gestion?tipo=revista&id=revista-q1-2025" },
            ],
          },
        ],
      },
      {
        title: "HERRAMIENTAS",
        links: [
          { label: "Mejores prácticas regulatorias", href: "/micrositio-buenas-practicas" },
          { label: "Banco de informaciones de telecomunicaciones", href: "/pendiente/banco-informaciones", todo: "TODO: Definir URL oficial del banco de informaciones." },
          { label: "Micrositio Buenas prácticas Power BI", href: "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel", external: true },
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
