import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { navigationItems, type NavigationItem } from "@/data/navigation";
import { localizeNavigation } from "@/i18n/localizeNavigation";
import { useNavigationSettings } from "@/contexts/SiteSettingsContext";

function ensureHablaElRegulador(items: NavigationItem[]): NavigationItem[] {
  const alreadyPresent = items.some((item) =>
    item.columns?.some((column) =>
      column.links.some((link) => link.href === "/habla-el-regulador"),
    ),
  );
  if (alreadyPresent) return items;

  const staticLink = navigationItems
    .find((item) => item.id === "recursos")
    ?.columns?.flatMap((column) => column.links)
    .find((link) => link.href === "/habla-el-regulador");
  if (!staticLink) return items;

  return items.map((item) => {
    if (item.id !== "recursos" || !item.columns?.length) return item;

    let inserted = false;
    const columns = item.columns.map((column) => {
      const galleryIndex = column.links.findIndex(
        (link) => link.href === "/galeria",
      );
      if (galleryIndex < 0) return column;
      inserted = true;
      return {
        ...column,
        links: [
          ...column.links.slice(0, galleryIndex),
          staticLink,
          ...column.links.slice(galleryIndex),
        ],
      };
    });

    if (!inserted && columns[1]) {
      columns[1] = {
        ...columns[1],
        links: [...columns[1].links, staticLink],
      };
    }
    return { ...item, columns };
  });
}

function ensureComiteEjecutivoActas(items: NavigationItem[]): NavigationItem[] {
  const href = "/acceso-documentos?tipo=comite-ejecutivo";
  const alreadyPresent = items.some((item) =>
    item.columns?.some((column) =>
      column.links.some((link) => link.href === href),
    ),
  );
  if (alreadyPresent) return items;

  const staticLink = navigationItems
    .find((item) => item.id === "recursos")
    ?.columns?.flatMap((column) => column.links)
    .find((link) => link.href === href);
  if (!staticLink) return items;

  return items.map((item) => {
    if (item.id !== "recursos" || !item.columns?.length) return item;
    const columns = item.columns.map((column) => {
      const asambleasIndex = column.links.findIndex(
        (link) => link.href === "/acceso-documentos" || link.label === "Asambleas",
      );
      if (asambleasIndex < 0) return column;
      return {
        ...column,
        links: [
          ...column.links.slice(0, asambleasIndex + 1),
          staticLink,
          ...column.links.slice(asambleasIndex + 1),
        ],
      };
    });
    return { ...item, columns };
  });
}

export function useLocalizedNavigation(): NavigationItem[] {
  const apiNav = useNavigationSettings();
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const base = ensureComiteEjecutivoActas(
      ensureHablaElRegulador(
        apiNav && Array.isArray(apiNav) && apiNav.length > 0
          ? (apiNav as NavigationItem[])
          : navigationItems,
      ),
    );
    if (i18n.language === "es") return base;
    return localizeNavigation(base, t);
  }, [apiNav, t, i18n.language]);
}
