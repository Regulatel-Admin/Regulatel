import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { navigationItems, type NavigationItem } from "@/data/navigation";
import { localizeNavigation } from "@/i18n/localizeNavigation";
import { useNavigationSettings } from "@/contexts/SiteSettingsContext";

export function useLocalizedNavigation(): NavigationItem[] {
  const apiNav = useNavigationSettings();
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const base =
      apiNav && Array.isArray(apiNav) && apiNav.length > 0
        ? (apiNav as NavigationItem[])
        : navigationItems;
    if (i18n.language === "es") return base;
    return localizeNavigation(base, t);
  }, [apiNav, t, i18n.language]);
}
