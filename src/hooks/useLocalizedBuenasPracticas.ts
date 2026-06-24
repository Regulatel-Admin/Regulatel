import type { TFunction } from "i18next";
import { localizeCountryName } from "@/hooks/useLocalizedMiembros";

function languageBase(language: string): string {
  return language.split("-")[0] || language;
}

function normalizeCategoryToken(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveCategoryKey(name: string): string | null {
  const n = normalizeCategoryToken(name);
  if (!n) return null;
  if (n.includes("espectro")) return "espectro_radioelectrico";
  if (n.includes("competencia")) return "competencia_economica";
  if (n.includes("ciberseguridad")) return "ciberseguridad";
  if (n.includes("proteccion") && n.includes("usuario")) return "proteccion_usuario";
  if (n.includes("tecnologias emergentes")) return "tecnologias_emergentes";
  if (n.includes("comparticion") && n.includes("infraestructura")) return "comparticion_infraestructura";
  if (n.includes("telecomunicaciones de emergencia")) return "telecomunicaciones_emergencia";
  if (n.includes("homologacion")) return "homologacion_productos";
  if (n.includes("informacion y comunicacion") || n.includes("informacion y la comunicacion") || n === "tic") {
    return "tic";
  }
  if (n.includes("conectividad")) return "conectividad";
  if (n.includes("plataformas digitales")) return "plataformas_digitales";
  if (n.includes("radiodifusion")) return "radiodifusion";
  if (n.includes("accesibilidad")) return "accesibilidad";
  if (n.includes("asuntos") && n.includes("internet")) return "asuntos_internet";
  if (n.includes("bases de datos") || n.includes("estadisticas y datos")) return "bases_datos_estadisticas";
  if (n.includes("colaboracion") && n.includes("justicia")) return "colaboracion_justicia";
  if (n.includes("participacion ciudadana") || n.includes("transparencia")) return "participacion_ciudadana";
  if (n.includes("mejores practicas regulatorias")) return "mejores_practicas_regulatorias";
  return null;
}

export function localizeBuenasPracticasCategory(
  name: string,
  t: TFunction,
  language: string
): string {
  if (languageBase(language) === "es" || !name) return name;
  const key = resolveCategoryKey(name);
  if (!key) return name;
  return t(`buenasPracticasCategories.${key}`, { defaultValue: name });
}

export function localizeBuenasPracticasCountryName(
  name: string,
  t: TFunction,
  language: string
): string {
  return localizeCountryName(name, t, language);
}
