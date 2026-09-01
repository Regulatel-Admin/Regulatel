import type { TFunction } from "i18next";
import type { NavigationColumn, NavigationItem, NavigationItemLink } from "@/data/navigation";

const ITEM_LABEL: Record<string, string> = {
  "quienes-somos": "nav.whoWeAre",
  noticias: "nav.news",
  eventos: "nav.events",
  recursos: "nav.resources",
  convenios: "nav.agreements",
  contacto: "nav.contact",
};

const COLUMN_TITLE: Record<string, string> = {
  INSTITUCIONAL: "nav.columns.institutional",
  ORGANIZACIÓN: "nav.columns.organization",
  PUBLICACIONES: "nav.columns.publications",
  CONOCIMIENTO: "nav.columns.knowledge",
  HERRAMIENTAS: "nav.columns.tools",
};

const LINK_LABEL_MAP: Record<string, string> = {
  "/que-somos": "nav.links.whatWeAre",
  "/vision-mision": "nav.links.visionMission",
  "/objetivos-y-funciones": "nav.links.objectivesFunctions",
  "/protocolos-y-procedimientos": "nav.links.statutesProcedures",
  "/miembros": "nav.links.members",
  "/autoridades": "nav.links.currentAuthorities",
  "/comite-ejecutivo": "nav.links.executiveCommittee",
  "/grupos-de-trabajo": "nav.links.workingGroups",
  "/contacto": "nav.contact",
  "/gestion": "nav.links.documents",
  "/gestion?tipo=planes-actas": "nav.links.workPlans",
  "/acceso-documentos": "nav.links.assemblies",
  "/acceso-documentos?tipo=comite-ejecutivo": "nav.links.executiveCommitteeActas",
  "/gestion?tipo=documentos": "nav.links.declarations",
  "/estudios-e-investigacion": "nav.links.studiesResearch",
  "/gestion?tipo=revista": "nav.links.digitalMagazine",
  "/boletines-gtai": "nav.links.gtaiBulletins",
  "/habla-el-regulador": "nav.links.hablaRegulador",
  "/violencia-digital": "nav.links.violenciaDigital",
  "/galeria": "nav.links.photoGallery",
  "/micrositio-buenas-practicas": "nav.links.bestPractices",
  "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel": "nav.links.informationBank",
};

const LINK_DESC: Record<string, string> = {
  "/gestion": "nav.descriptions.documents",
  "/gestion?tipo=planes-actas": "nav.descriptions.workPlans",
  "/acceso-documentos": "nav.descriptions.assemblies",
  "/acceso-documentos?tipo=comite-ejecutivo": "nav.descriptions.executiveCommitteeActas",
  "/gestion?tipo=documentos": "nav.descriptions.declarations",
  "/estudios-e-investigacion": "nav.descriptions.studiesResearch",
  "/gestion?tipo=revista": "nav.descriptions.digitalMagazine",
  "/boletines-gtai": "nav.descriptions.gtaiBulletins",
  "/habla-el-regulador": "nav.descriptions.hablaRegulador",
  "/violencia-digital": "nav.descriptions.violenciaDigital",
  "/galeria": "nav.descriptions.photoGallery",
  "/micrositio-buenas-practicas": "nav.descriptions.bestPractices",
  "https://sutel.go.cr/pagina/indicadores-internacionales-regulatel": "nav.descriptions.informationBank",
};

function localizeLink(link: NavigationItemLink, t: TFunction): NavigationItemLink {
  const labelKey = LINK_LABEL_MAP[link.href];
  const descKey = LINK_DESC[link.href];
  return {
    ...link,
    label: labelKey ? t(labelKey) : link.label,
    description: descKey ? t(descKey) : link.description,
    subtitle: link.restricted ? t("nav.restrictedSubtitle") : link.subtitle,
    children: link.children?.map((c) => localizeLink(c, t)),
  };
}

function localizeColumn(column: NavigationColumn, t: TFunction): NavigationColumn {
  const titleKey = COLUMN_TITLE[column.title];
  return {
    ...column,
    title: titleKey ? t(titleKey) : column.title,
    links: column.links.map((l) => localizeLink(l, t)),
  };
}

export function localizeNavigation(items: NavigationItem[], t: TFunction): NavigationItem[] {
  return items.map((item) => {
    const labelKey = ITEM_LABEL[item.id];
    const label = labelKey ? t(labelKey) : item.label;
    return {
      ...item,
      label,
      panelLabel: labelKey ? t(labelKey) : item.panelLabel,
      columns: item.columns?.map((c) => localizeColumn(c, t)),
    };
  });
}
