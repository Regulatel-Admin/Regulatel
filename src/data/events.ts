export type EventStatus = "proxima" | "pasada";

export type EventTipo = "presencial" | "virtual";

export interface HomeEventItem {
  title: string;
  city: string;
  year: number;
  status: EventStatus;
  href: string;
  description: string;
  todo?: string;
  mediaLabel?: string;
  /** Fecha legible para mostrar en cards (ej. "25 de Febrero", "2-5 de marzo"). */
  dateLabel?: string;
  /** Para filtro por mes (minúscula): febrero, marzo, abril, etc. */
  mes?: string;
  /** Presencial o virtual para filtro en página Eventos. */
  tipo?: EventTipo;
  /** Imagen de fondo para carrusel destacado; si no existe se usa fallback. */
  imageUrl?: string;
  /** Solo para eventos próximos: URL de registro (ej. INDOTEL). Si existe, se muestra botón REGISTRARSE. */
  registrationUrl?: string;
  /** Fecha de inicio en ISO (YYYY-MM-DD). Si ya pasó, no se muestra Registrarse. */
  startDate?: string;
}

/** True si el evento tiene startDate y esa fecha ya pasó (hoy > startDate). */
export function hasEventPassed(event: HomeEventItem): boolean {
  if (!event.startDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(event.startDate + "T12:00:00");
  d.setHours(0, 0, 0, 0);
  return d < today;
}

/**
 * Eventos: calendario 2026 (próximos) + eventos pasados.
 * Origen: Calendario de Eventos 2026 (REGULATEL / INDOTEL).
 */
export const homeEvents: HomeEventItem[] = [
  // —— 2026 (próximos) — fechas del Calendario de Eventos 2026 ——
  {
    title: "Cumbre Ministerial",
    city: "Madrid",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Cumbre Ministerial. Organizador: CERTAL.",
    dateLabel: "25 de Febrero",
    mes: "febrero",
    tipo: "presencial",
    startDate: "2026-02-25",
  },
  {
    title: "Digital Summit Latam",
    city: "Madrid",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Digital Summit Latam. Organizador: DPL GROUP.",
    dateLabel: "26 y 27 de Febrero",
    mes: "febrero",
    tipo: "presencial",
    startDate: "2026-02-26",
  },
  {
    title: "Saludo Institucional BEREC - REGULATEL, Madrid 2026",
    city: "Madrid",
    year: 2026,
    status: "proxima",
    href: "/pendiente/saludo-institucional-madrid-2026",
    description: "Encuentro institucional de apertura entre BEREC y REGULATEL para fortalecer la agenda de cooperación 2026.",
    mediaLabel: "FOTOS",
    dateLabel: "Febrero 2026",
    mes: "febrero",
    tipo: "presencial",
    startDate: "2026-02-01",
  },
  {
    title: "MWC Barcelona 2026",
    city: "Barcelona",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "MWC Barcelona 2026. Organizador: GSMA.",
    dateLabel: "2-5 de marzo",
    mes: "marzo",
    tipo: "presencial",
    startDate: "2026-03-02",
  },
  {
    title: "Foro de Altas Autoridades (previo a la IX Asamblea Ordinaria de la CITEL)",
    city: "San José, Costa Rica",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Foro de Altas Autoridades previo a la IX Asamblea Ordinaria de la CITEL. Organizador: CITEL.",
    dateLabel: "16 de marzo",
    mes: "marzo",
    tipo: "presencial",
    startDate: "2026-03-16",
  },
  {
    title: "IX Asamblea Ordinaria de la CITEL",
    city: "San José, Costa Rica",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "IX Asamblea Ordinaria de la CITEL. Organizador: CITEL.",
    dateLabel: "17-19 de marzo",
    mes: "marzo",
    tipo: "presencial",
    startDate: "2026-03-17",
  },
  {
    title: "48 Reunión del CCP.I",
    city: "Ciudad de Panamá",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "48 Reunión del CCP.I. Organizador: CITEL.",
    dateLabel: "20-24 de abril",
    mes: "abril",
    tipo: "presencial",
    startDate: "2026-04-20",
  },
  {
    title: "49 Reunión del CCP.I",
    city: "Asunción, Paraguay",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "49 Reunión del CCP.I. Organizador: CITEL.",
    dateLabel: "7-11 de septiembre",
    mes: "septiembre",
    tipo: "presencial",
    startDate: "2026-09-07",
  },
  {
    title: "47 Reunión CCP.II",
    city: "Dominica",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "47 Reunión CCP.II. Organizador: CITEL.",
    dateLabel: "6-10 de abril",
    mes: "abril",
    tipo: "presencial",
    startDate: "2026-04-06",
  },
  {
    title: "48 Reunión CCP.II",
    city: "Colombia",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "48 Reunión CCP.II. Organizador: CITEL.",
    dateLabel: "30 nov - 4 diciembre",
    mes: "diciembre",
    tipo: "presencial",
    startDate: "2026-11-30",
  },
  {
    title: "Congreso Latinoamericano de Transformación Digital 2026 y GSMA Mobile 360",
    city: "México",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Congreso Latinoamericano de Transformación Digital 2026 y GSMA Mobile 360. Organizadores: ASIET - GSMA.",
    dateLabel: "13-15 de mayo",
    mes: "mayo",
    tipo: "presencial",
    startDate: "2026-05-13",
  },
  {
    title: "Simposio Mundial para Organismos Reguladores",
    city: "Turquía",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Simposio Mundial para Organismos Reguladores. Organizador: UIT.",
    dateLabel: "18-21 mayo",
    mes: "mayo",
    tipo: "presencial",
    startDate: "2026-05-18",
  },
  {
    title: "Cumbre BEREC - REGULATEL",
    city: "Por definir",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Cumbre BEREC - REGULATEL. Organizador: BEREC.",
    dateLabel: "Junio",
    mes: "junio",
    tipo: "presencial",
    startDate: "2026-06-01",
  },
  {
    title: "Cumbre REGULATEL - PRAI",
    city: "Virtual",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Cumbre REGULATEL - PRAI. Organizador: REGULATEL.",
    dateLabel: "Por definir",
    tipo: "virtual",
  },
  {
    title: "Conferencia de Plenipotenciarios de 2026 (PP-26)",
    city: "Doha, Qatar",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "Conferencia de Plenipotenciarios de 2026 (PP-26). Organizador: UIT.",
    dateLabel: "9 al 27 de noviembre",
    mes: "noviembre",
    tipo: "presencial",
    startDate: "2026-11-09",
  },
  {
    title: "29 Asamblea Plenaria Regulatel",
    city: "Portugal",
    year: 2026,
    status: "proxima",
    href: "/eventos",
    description: "29 Asamblea Plenaria Regulatel. Organizador: REGULATEL.",
    dateLabel: "Diciembre",
    mes: "diciembre",
    tipo: "presencial",
    startDate: "2026-12-01",
  },
  // —— Pasados (se muestran después en "Todos los eventos") ——
  {
    title: "Cumbre REGULATEL, ASIET, COMTELCA, Punta Cana 2025",
    city: "Punta Cana",
    year: 2025,
    status: "pasada",
    href: "https://www.flickr.com/photos/indotel/albums/72177720330839315",
    description: "Evento regional sobre conectividad, cooperación y ecosistema digital con participación multisectorial.",
  },
  {
    title: "CUMBRE Four-lateral BEREC, EaPeReg, REGULATEL and EMERG Summit. Barcelona 2025",
    city: "Barcelona",
    year: 2025,
    status: "pasada",
    href: "https://www.berec.europa.eu/en",
    description: "Espacio de intercambio entre foros regulatorios para fortalecer cooperación internacional en telecomunicaciones.",
  },
  {
    title: "Cumbre Regulatel - ASIET, Cartagena 2024",
    city: "Cartagena",
    year: 2024,
    status: "pasada",
    href: "/pendiente/cumbre-regulatel-asiet-cartagena-2024",
    description: "Sesión de articulación público-privada para avanzar en agendas de transformación digital regional.",
  },
  {
    title: "Cumbre BEREC - REGULATEL, Santa Cruz, 2024",
    city: "Santa Cruz",
    year: 2024,
    status: "pasada",
    href: "/pendiente/cumbre-berec-regulatel-santa-cruz-2024",
    description: "Cumbre enfocada en intercambio de experiencias regulatorias y desafíos de conectividad regional.",
  },
];
