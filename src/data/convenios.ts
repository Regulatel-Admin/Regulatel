/**
 * Datos centralizados de convenios. Usado por: dropdown header, lista /convenios, detalle /convenios/:slug.
 */

export type ConvenioSlug = "berec" | "icann" | "fcc" | "comtelca";

export interface Convenio {
  slug: ConvenioSlug;
  title: string;
  acronym: string;
  shortDescription: string;
  logoSrc: string;
  downloadUrl?: string;
  areas: string[];
  order: number;
}

const LOGOS = "/images/convenios";

export const convenios: Convenio[] = [
  {
    slug: "berec" as ConvenioSlug,
    title: "European Regulators for Electronic Communications",
    acronym: "BEREC",
    shortDescription:
      "Fomentar esfuerzos para abordar los desafíos regulatorios conjuntos actuales y futuros en Latinoamérica y Europa, y el desarrollo de relaciones laborales y colegiales entre expertos de ambas partes.",
    logoSrc: `${LOGOS}/berec.png`,
    downloadUrl: "/documents/convenios/mou-regulatel-berec.pdf",
    areas: [
      "Intercambio de información y mejores prácticas regulatorias",
      "Cooperación en temas de mercados electrónicos y redes",
      "Diálogo sobre políticas de competencia y usuarios",
      "Actividades de formación y coordinación técnica",
    ],
    order: 1,
  },
  {
    slug: "icann" as ConvenioSlug,
    title: "Internet Corporation for Assigned Names and Numbers",
    acronym: "ICANN",
    shortDescription:
      "Fortalecer los vínculos entre las partes, compartir experiencias y promover acciones de cooperación de conformidad con sus respectivas misiones y ordenanzas.",
    logoSrc: `${LOGOS}/icann.png`,
    areas: [
      "Gobernanza de internet y sistemas de nombres y números",
      "Intercambio de experiencias en políticas de DNS",
      "Capacitación y participación en foros globales",
      "Cooperación técnica en estándares y buenas prácticas",
    ],
    order: 2,
  },
  {
    slug: "fcc" as ConvenioSlug,
    title: "Federal Communications Commission",
    acronym: "FCC",
    shortDescription:
      "Fortalecer los vínculos entre la FCC y REGULATEL, compartir experiencias y promover acciones de cooperación en regulación de telecomunicaciones y TIC.",
    logoSrc: `${LOGOS}/fcc.png`,
    areas: [
      "Regulación de telecomunicaciones y espectro",
      "Intercambio de experiencias en políticas TIC",
      "Seguimiento de tendencias regulatorias",
      "Cooperación en temas de competencia y usuarios",
    ],
    order: 3,
  },
  {
    slug: "comtelca" as ConvenioSlug,
    title: "Comisión Técnica Regional de Telecomunicaciones",
    acronym: "COMTELCA",
    shortDescription:
      "Fortalecer los vínculos entre COMTELCA y REGULATEL, compartir experiencias y promover acciones de cooperación en regulación de telecomunicaciones y TIC en la región.",
    logoSrc: `${LOGOS}/comtelca.png`,
    areas: [
      "Armonización regulatoria en Centroamérica",
      "Intercambio de información técnica y normativa",
      "Proyectos conjuntos de capacitación",
      "Coordinación en foros regionales",
    ],
    order: 4,
  },
].sort((a, b) => a.order - b.order);

export function getConvenioBySlug(slug: string): Convenio | undefined {
  return convenios.find((c) => c.slug === slug);
}

export function getConvenioSlugs(): ConvenioSlug[] {
  return convenios.map((c) => c.slug);
}
