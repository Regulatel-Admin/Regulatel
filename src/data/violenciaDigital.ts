export const VIOLENCIA_DIGITAL_PATH = "/violencia-digital";

export const violenciaDigitalMedia = {
  videoSrc: "/videos/violencia-digital/webinar-violencia-digital.mp4",
  poster: "/images/violencia-digital/webinar-poster-uhd.jpg",
  agendaPdf: "/documents/violencia-digital/Agenda_Webinar_REGULATEL_Violencia_Digital.pdf",
  newsPath: "/noticias/webinar-violencia-digital-rol-entes-reguladores",
  groupPath: "/grupos-de-trabajo",
  duration: "2 h 07 min",
  dateIso: "2026-08-20",
} as const;

export type ViolenciaDigitalSpeaker = {
  id: string;
  name: string;
  organization: string;
  organizationUrl?: string;
  countryCode?: string;
  organizationLogo?: string;
};

export const violenciaDigitalSpeakers: ViolenciaDigitalSpeaker[] = [
  {
    id: "amparo",
    name: "Amparo Arango",
    organization: "INDOTEL",
    organizationUrl: "https://www.indotel.gob.do",
    countryCode: "DO",
  },
  {
    id: "yildalina",
    name: "Yildalina Tatem Brache",
    organization: "MESECVI",
    organizationUrl: "https://www.oas.org/es/mesecvi/",
    countryCode: "DO",
  },
  {
    id: "cristiana",
    name: "Cristiana Camarate",
    organization: "ANATEL",
    organizationUrl: "https://www.anatel.gov.br",
    countryCode: "BR",
  },
  {
    id: "angel",
    name: "Ángel González Mongelós",
    organization: "CONATEL",
    organizationUrl: "https://www.conatel.gov.py",
    countryCode: "PY",
  },
  {
    id: "paulina",
    name: "Paulina Elsa Zepeda García",
    organization: "SSPC",
    organizationUrl: "https://www.gob.mx/sspc",
    countryCode: "MX",
  },
  {
    id: "solana",
    name: "Solana de Aspiazu",
    organization: "ALAI",
    organizationUrl: "https://alai.lat",
    countryCode: "AR",
    organizationLogo: "/images/violencia-digital/alai-mark.png",
  },
  {
    id: "mariangel",
    name: "Mariangel Calderón",
    organization: "INDOTEL",
    organizationUrl: "https://www.indotel.gob.do",
    countryCode: "DO",
  },
];

export type ViolenciaDigitalAgendaItem = {
  id: string;
  time: string;
  speakerIds: string[];
};

export const violenciaDigitalAgenda: ViolenciaDigitalAgendaItem[] = [
  { id: "apertura", time: "10:00 – 10:05", speakerIds: ["amparo"] },
  { id: "leyModelo", time: "10:05 – 10:30", speakerIds: ["yildalina"] },
  { id: "brasil", time: "10:30 – 10:45", speakerIds: ["cristiana"] },
  { id: "experiencias", time: "10:45 – 11:20", speakerIds: ["angel", "paulina", "solana"] },
  { id: "encuesta", time: "11:20 – 11:30", speakerIds: ["mariangel"] },
  { id: "cierre", time: "11:30", speakerIds: ["amparo"] },
];

const LOCAL_FLAG_BY_CODE: Record<string, string> = {
  AR: "argentina.png",
  BR: "brasil.png",
  MX: "mexico.png",
  PY: "paraguay.png",
  DO: "rep_dominicana.png",
};

export function violenciaDigitalFlagSrc(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  const local = LOCAL_FLAG_BY_CODE[code];
  if (local) return `/flags/${local}`;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export function violenciaDigitalSpeakerMarkSrc(speaker: ViolenciaDigitalSpeaker): string | undefined {
  if (speaker.organizationLogo) return speaker.organizationLogo;
  if (speaker.countryCode) return violenciaDigitalFlagSrc(speaker.countryCode);
  return undefined;
}
