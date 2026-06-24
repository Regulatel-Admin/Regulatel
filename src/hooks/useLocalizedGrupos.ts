import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { GrupoTrabajoSerialized } from "@/data/gruposTrabajo";

export function useLocalizedGrupos(grupos: GrupoTrabajoSerialized[]): GrupoTrabajoSerialized[] {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    if (i18n.language === "es") return grupos;
    return grupos.map((g) => {
      const title = t(`grupos.items.${g.id}.title`, { defaultValue: g.title });
      const description = t(`grupos.items.${g.id}.description`, { defaultValue: g.description });
      return { ...g, title, description };
    });
  }, [grupos, t, i18n.language]);
}
