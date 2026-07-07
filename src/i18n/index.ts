import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import esBase from "./locales/es";
import enBase from "./locales/en";
import ptBase from "./locales/pt";
import esPagesExtra from "./locales/pagesExtra/es";
import enPagesExtra from "./locales/pagesExtra/en";
import ptPagesExtra from "./locales/pagesExtra/pt";
import enNews from "./locales/news/en";
import ptNews from "./locales/news/pt";
import enEvents from "./locales/events/en";
import ptEvents from "./locales/events/pt";
import enMiembros from "./locales/miembros/en";
import ptMiembros from "./locales/miembros/pt";
import enBoletines from "./locales/boletines/en";
import ptBoletines from "./locales/boletines/pt";
import enAutoridades from "./locales/autoridades/en";
import ptAutoridades from "./locales/autoridades/pt";
import enBuenasPracticas from "./locales/buenasPracticas/en";
import ptBuenasPracticas from "./locales/buenasPracticas/pt";
import itBase from "./locales/it";
import itPagesExtra from "./locales/pagesExtra/it";
import itNews from "./locales/news/it";
import itEvents from "./locales/events/it";
import itMiembros from "./locales/miembros/it";
import itBoletines from "./locales/boletines/it";
import itAutoridades from "./locales/autoridades/it";
import itBuenasPracticas from "./locales/buenasPracticas/it";

export const LANGUAGE_STORAGE_KEY = "regulatel-lang";
export const SUPPORTED_LANGUAGES = ["es", "en", "pt", "it"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function mergeDeep<T extends Record<string, unknown>>(base: T, extra: Record<string, unknown>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(extra)) {
    const baseVal = base[key];
    const extraVal = extra[key];
    if (
      baseVal &&
      extraVal &&
      typeof baseVal === "object" &&
      typeof extraVal === "object" &&
      !Array.isArray(baseVal) &&
      !Array.isArray(extraVal)
    ) {
      result[key] = mergeDeep(baseVal as Record<string, unknown>, extraVal as Record<string, unknown>);
    } else {
      result[key] = extraVal;
    }
  }
  return result as T;
}

const es = mergeDeep(esBase as Record<string, unknown>, esPagesExtra as Record<string, unknown>);
const en = mergeDeep(
  mergeDeep(enBase as Record<string, unknown>, enPagesExtra as Record<string, unknown>),
  mergeDeep(
    mergeDeep(enNews as Record<string, unknown>, enEvents as Record<string, unknown>),
    mergeDeep(
      mergeDeep(enMiembros as Record<string, unknown>, enBoletines as Record<string, unknown>),
      mergeDeep(enAutoridades as Record<string, unknown>, enBuenasPracticas as Record<string, unknown>)
    )
  )
);
const pt = mergeDeep(
  mergeDeep(ptBase as Record<string, unknown>, ptPagesExtra as Record<string, unknown>),
  mergeDeep(
    mergeDeep(ptNews as Record<string, unknown>, ptEvents as Record<string, unknown>),
    mergeDeep(
      mergeDeep(ptMiembros as Record<string, unknown>, ptBoletines as Record<string, unknown>),
      mergeDeep(ptAutoridades as Record<string, unknown>, ptBuenasPracticas as Record<string, unknown>)
    )
  )
);
const it = mergeDeep(
  mergeDeep(itBase as Record<string, unknown>, itPagesExtra as Record<string, unknown>),
  mergeDeep(
    mergeDeep(itNews as Record<string, unknown>, itEvents as Record<string, unknown>),
    mergeDeep(
      mergeDeep(itMiembros as Record<string, unknown>, itBoletines as Record<string, unknown>),
      mergeDeep(itAutoridades as Record<string, unknown>, itBuenasPracticas as Record<string, unknown>)
    )
  )
);

function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "en" || stored === "pt" || stored === "it" || stored === "es") return stored;
  return "es";
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
    it: { translation: it },
  },
  lng: getStoredLanguage(),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
