import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Convenio } from "@/data/convenios";

type ConvenioItemTranslation = {
  title?: string;
  shortDescription?: string;
  areas?: string[];
};

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function getConvenioItems(t: TFunction, language: string): Record<string, ConvenioItemTranslation> {
  if (language === "es") return {};
  const raw = t("convenios.items", { returnObjects: true, defaultValue: {} });
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, ConvenioItemTranslation>;
  }
  return {};
}

export function localizeConvenio(convenio: Convenio, t: TFunction, language: string): Convenio {
  if (language === "es") return convenio;

  const items = getConvenioItems(t, language);
  const slug = normalizeSlug(convenio.slug);
  const item = items[slug] ?? items[convenio.slug];

  if (!item) return convenio;

  return {
    ...convenio,
    title: item.title ?? convenio.title,
    shortDescription: item.shortDescription ?? convenio.shortDescription,
    areas: Array.isArray(item.areas) && item.areas.length > 0 ? item.areas : convenio.areas,
  };
}

export function useLocalizedConvenios(convenios: Convenio[]): Convenio[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => convenios.map((c) => localizeConvenio(c, t, i18n.language)),
    [convenios, t, i18n.language]
  );
}

export function useLocalizedConvenio(convenio: Convenio | undefined): Convenio | undefined {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    if (!convenio) return convenio;
    return localizeConvenio(convenio, t, i18n.language);
  }, [convenio, t, i18n.language]);
}
