import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { DirectorioAutoridad } from "@/data/directorioAutoridades";
import type { EnteReguladorMiembro } from "@/data/entesReguladoresMiembros";

const ROLE_KEYS: Record<string, string> = {
  Presidente: "miembrosShared.roles.presidente",
  "Director Ejecutivo": "miembrosShared.roles.director_ejecutivo",
  Subsecretario: "miembrosShared.roles.subsecretario",
  "Presidente del Consejo Directivo": "miembrosShared.roles.presidente_consejo_directivo",
  "Primer Viceministro": "miembrosShared.roles.primer_viceministro",
  "Superintendente General": "miembrosShared.roles.superintendente_general",
  Vicepresidenta: "miembrosShared.roles.vicepresidenta",
  "Comisionado Presidente": "miembrosShared.roles.comisionado_presidente",
  "Directora General": "miembrosShared.roles.directora_general",
  "Administradora General": "miembrosShared.roles.administradora_general",
  "Presidente del Consejo de Administración": "miembrosShared.roles.presidente_consejo_administracion",
  "Director General": "miembrosShared.roles.director_general",
};

export function normalizeCountryKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

export function localizeCountryName(
  country: string,
  t: TFunction,
  language: string,
  uppercase = false
): string {
  if (language === "es") return country;
  const key = `miembrosShared.countries.${normalizeCountryKey(country)}`;
  const translated = t(key, { defaultValue: country });
  return uppercase ? translated.toUpperCase() : translated;
}

export function localizeRole(cargo: string, t: TFunction, language: string): string {
  if (language === "es" || !cargo) return cargo;
  const roleKey = ROLE_KEYS[cargo.trim()];
  return roleKey ? t(roleKey, { defaultValue: cargo }) : cargo;
}

function enteRouteKey(route: string): string {
  return route.replace(/^\//, "").split("/")[0] ?? "";
}

export function localizeEnteRegulador(
  ente: EnteReguladorMiembro,
  t: TFunction,
  language: string
): EnteReguladorMiembro {
  if (language === "es") return ente;

  const routeKey = enteRouteKey(ente.route);
  const fullName = ente.fullName
    ? t(`entesReguladores.${routeKey}.fullName`, { defaultValue: ente.fullName })
    : ente.fullName;

  return {
    ...ente,
    country: localizeCountryName(ente.country, t, language),
    fullName,
  };
}

export function localizeDirectorioEntry(
  entry: DirectorioAutoridad,
  t: TFunction,
  language: string
): DirectorioAutoridad {
  if (language === "es") return entry;

  return {
    ...entry,
    pais: localizeCountryName(entry.pais, t, language, true),
    cargo: localizeRole(entry.cargo, t, language),
  };
}

export function useLocalizedEntesReguladores(entes: EnteReguladorMiembro[]): EnteReguladorMiembro[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => entes.map((ente) => localizeEnteRegulador(ente, t, i18n.language)),
    [entes, t, i18n.language]
  );
}

export function useLocalizedDirectorio(entries: DirectorioAutoridad[]): DirectorioAutoridad[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => entries.map((entry) => localizeDirectorioEntry(entry, t, i18n.language)),
    [entries, t, i18n.language]
  );
}
