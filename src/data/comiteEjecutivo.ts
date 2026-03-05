export interface ComiteMemberLogo {
  name: string;
  logoUrl: string;
  linkUrl?: string;
}

export interface ComiteEjecutivoData {
  presidente: ComiteMemberLogo;
  vicepresidentes: ComiteMemberLogo[];
  secretarioEjecutivo: ComiteMemberLogo;
  miembros: ComiteMemberLogo[];
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
    { name: "ANATEL", logoUrl: `${LOGOS}/anatel.png`, linkUrl: "https://www.anatel.gov.br" },
    { name: "CRT - Comisión Reguladora de Telecomunicaciones", logoUrl: `${LOGOS}/crt.png`, linkUrl: "https://www.crt.go.cr" },
    { name: "SUTEL", logoUrl: `${LOGOS}/sutel.png`, linkUrl: "https://www.sutel.go.cr" },
    { name: "CNMC", logoUrl: `${LOGOS}/cnmc.png`, linkUrl: "https://www.cnmc.es" },
    { name: "OSIPTEL", logoUrl: `${LOGOS}/osiptel.png`, linkUrl: "https://www.osiptel.gob.pe" },
    { name: "ATT", logoUrl: `${LOGOS}/att.png`, linkUrl: "https://www.att.gob.bo" },
  ],
  funciones: [
    "Dirigir y coordinar las actividades del Foro y establecer las prioridades estratégicas.",
    "Supervisar la implementación de los programas y el plan de trabajo.",
    "Coordinar los grupos de trabajo y la representación del Foro en eventos internacionales.",
    "Promover la cooperación entre los países miembros y el intercambio de mejores prácticas.",
  ],
};
