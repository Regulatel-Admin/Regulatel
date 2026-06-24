import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ComiteEjecutivoUiResolved, ComiteEjecutivoData } from "@/data/comiteEjecutivo";

export function useLocalizedComiteUi(ui: ComiteEjecutivoUiResolved): ComiteEjecutivoUiResolved {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    if (i18n.language === "es") return ui;
    return {
      heroTitle: t("comite.heroTitle"),
      heroSubtitle: t("comite.heroSubtitle"),
      heroDescription: t("comite.heroDescription"),
      presidenciaTitle: t("comite.presidenciaTitle"),
      presidenciaSubtitle: t("comite.presidenciaSubtitle"),
      miembrosTitle: t("comite.miembrosTitle"),
      miembrosSubtitle: t("comite.miembrosSubtitle"),
      funcionesSectionTitle: t("comite.funcionesSectionTitle"),
    };
  }, [ui, t, i18n.language]);
}

export function useLocalizedComiteFunciones(doc: Pick<ComiteEjecutivoData, "funcionesIntro" | "funciones">) {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    if (i18n.language === "es") return doc;
    return {
      funcionesIntro: t("comite.funcionesIntro"),
      funciones: t("comite.funciones", { returnObjects: true }) as string[],
    };
  }, [doc, t, i18n.language]);
}
