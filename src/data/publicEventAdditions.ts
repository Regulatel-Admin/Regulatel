import type { Event } from "@/types/event";

/** Source-published calendar entries; a CMS record with the same ID takes precedence. */
export const PUBLIC_EVENT_ADDITIONS: Event[] = [
  {
    id: "conecta-latam-caribe-centroamerica-panama-2026",
    title: "Conecta LATAM Caribe y Centroamérica 2026",
    organizer: "Conecta Latam",
    location: "Hilton Panamá, Ciudad de Panamá",
    startDate: "2026-11-17",
    endDate: "2026-11-18",
    year: 2026,
    status: "upcoming",
    registrationUrl: "https://www.conecta-latam.com/latam",
    detailsUrl: "https://www.conecta-latam.com/latam",
    isFeatured: false,
    published: true,
    description: "Encuentro de operadores, reguladores y proveedores de tecnología de América Latina y el Caribe, con paneles sobre conectividad, inteligencia artificial, confianza digital y regulación.",
    imageUrl: "/images/noticias/conecta-latam-2026-es.png",
    imageFileName: "conecta-latam-2026-es.png",
    imageMimeType: "image/png",
    imageSize: 1250022,
    tags: ["Conecta LATAM", "Panamá", "Telecomunicaciones"],
    attachments: [],
    createdAt: "2026-11-11T07:24:17.000Z",
    updatedAt: "2026-11-11T07:24:17.000Z",
  },
];
