import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Authority, AuthoritySection } from "@/data/authorities";
import { localizeCountryName } from "@/hooks/useLocalizedMiembros";

type AuthoritySectionTranslation = {
  title?: string;
  content?: string;
};

type AuthorityTranslation = {
  role?: string;
  country?: string;
  bio?: string;
  fullBio?: string;
  sections?: Record<string, AuthoritySectionTranslation>;
};

const ROLE_KEYS: Record<string, string> = {
  Presidente: "autoridadesShared.roles.presidente",
  Vicepresidente: "autoridadesShared.roles.vicepresidente",
  Vicepresidenta: "autoridadesShared.roles.vicepresidenta",
};

const SECTION_KEYS: Record<string, string> = {
  Perfil: "perfil",
  "Experiencia profesional": "experiencia_profesional",
  "Rol en REGULATEL": "rol_en_regulatel",
  "Formación académica": "formacion_academica",
  "Áreas de especialidad": "areas_de_especialidad",
  "Participación internacional": "participacion_internacional",
};

function languageBase(language: string): string {
  return language.split("-")[0] || language;
}

function getAuthorityArticles(t: TFunction, language: string): Record<string, AuthorityTranslation> {
  if (languageBase(language) === "es") return {};
  const raw = t("autoridadesArticles", { returnObjects: true, defaultValue: {} });
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, AuthorityTranslation>;
  }
  return {};
}

function localizeSection(
  section: AuthoritySection,
  article: AuthorityTranslation | undefined,
  t: TFunction,
  language: string
): AuthoritySection {
  if (languageBase(language) === "es") return section;

  const sectionKey = SECTION_KEYS[section.title.trim()];
  const translated = sectionKey ? article?.sections?.[sectionKey] : undefined;
  const fallbackTitle = sectionKey
    ? t(`autoridadesShared.sections.${sectionKey}`, { defaultValue: section.title })
    : section.title;

  return {
    title: translated?.title ?? fallbackTitle,
    content: translated?.content ?? section.content,
  };
}

export function localizeAuthority(authority: Authority, t: TFunction, language: string): Authority {
  if (languageBase(language) === "es") return authority;

  const articles = getAuthorityArticles(t, language);
  const slug = authority.slug.trim().toLowerCase();
  const article = articles[slug] ?? articles[authority.slug];

  const roleKey = ROLE_KEYS[authority.role.trim()];
  const role = article?.role ?? (roleKey ? t(roleKey, { defaultValue: authority.role }) : authority.role);

  const sections =
    authority.sections && authority.sections.length > 0
      ? authority.sections.map((section) => localizeSection(section, article, t, language))
      : authority.sections;

  return {
    ...authority,
    role,
    country: article?.country ?? localizeCountryName(authority.country, t, language),
    bio: article?.bio ?? authority.bio,
    fullBio: article?.fullBio ?? authority.fullBio,
    sections,
  };
}

export function useLocalizedAuthorities(authorities: Authority[]): Authority[] {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  return useMemo(
    () => authorities.map((authority) => localizeAuthority(authority, t, language)),
    [authorities, t, language]
  );
}

export function useLocalizedAuthority(authority: Authority | undefined): Authority | undefined {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  return useMemo(() => {
    if (!authority) return authority;
    return localizeAuthority(authority, t, language);
  }, [authority, t, language]);
}
