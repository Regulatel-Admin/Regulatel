export interface ComiteMemberLogo {
  name: string;
  logoUrl: string;
  linkUrl?: string;
  /** País para ordenar Miembros del Comité alfabéticamente */
  country?: string;
}

export interface ComiteEjecutivoData {
  presidente: ComiteMemberLogo;
  vicepresidentes: ComiteMemberLogo[];
  secretarioEjecutivo: ComiteMemberLogo;
  miembros: ComiteMemberLogo[];
  /** Párrafo introductorio del bloque Funciones principales */
  funcionesIntro: string;
  funciones: string[];
}

const LOGOS = "/images/comite-ejecutivo";

export const comiteEjecutivoData: ComiteEjecutivoData = {
  presidente: {
    name: "INDOTEL",
    logoUrl: `${LOGOS}/indotel.png`,
    linkUrl: "https://www.indotel.gob.do",
  },
  vicepresidentes: [
    {
      name: "Comisión de Regulación de Comunicaciones (CRC)",
      logoUrl: `${LOGOS}/crc.png`,
      linkUrl: "https://www.crcom.gov.co",
    },
    {
      name: "ANACOM",
      logoUrl: `${LOGOS}/anacom.png`,
      linkUrl: "https://www.anacom.pt",
    },
  ],
  secretarioEjecutivo: {
    name: "INDOTEL",
    logoUrl: `${LOGOS}/indotel.png`,
    linkUrl: "https://www.indotel.gob.do",
  },
  miembros: [
    { name: "ATT", logoUrl: `${LOGOS}/att.png`, linkUrl: "https://www.att.gob.bo", country: "Bolivia" },
    { name: "ANATEL", logoUrl: `${LOGOS}/anatel.png`, linkUrl: "https://www.anatel.gov.br", country: "Brasil" },
    { name: "CRT - Comisión Reguladora de Telecomunicaciones", logoUrl: `${LOGOS}/crt.png`, linkUrl: "https://www.crt.go.cr", country: "Costa Rica" },
    { name: "SUTEL", logoUrl: `${LOGOS}/sutel.png`, linkUrl: "https://www.sutel.go.cr", country: "Costa Rica" },
    { name: "CNMC", logoUrl: `${LOGOS}/cnmc.png`, linkUrl: "https://www.cnmc.es", country: "España" },
    { name: "OSIPTEL", logoUrl: `${LOGOS}/osiptel.png`, linkUrl: "https://www.osiptel.gob.pe", country: "Perú" },
  ],
  funcionesIntro:
    "El Comité Ejecutivo está constituído por un grupo de organismos reguladores que lideran la dirección estratégica del Foro y coordinan la ejecución del plan de trabajo. Sus miembros son elegidos anualmente por la Asamblea y tienen como funciones principales:",
  funciones: [
    "Dirigir y coordinar las actividades del Foro y establecer las prioridades estratégicas.",
    "Supervisar la implementación de los programas y el plan de trabajo.",
    "Coordinar los grupos de trabajo y la representación del Foro en eventos internacionales.",
    "Promover la cooperación entre los países miembros y el intercambio de mejores prácticas.",
  ],
};
