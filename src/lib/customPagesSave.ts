import { api } from "@/lib/api";
import { notifyCmsSaved } from "@/lib/siteEdit";
import type { NavigationItem } from "@/data/navigation";
import {
  CUSTOM_PAGES_SETTINGS_KEY,
  buildCustomPage,
  cloneCanvas,
  parseCustomPagesFromSettingValue,
  upsertCustomPage,
  type CustomPage,
} from "@/data/customPages";
import {
  defaultNavigation,
  emptyNavColumn,
  emptyNavLink,
  parseNavigationValue,
} from "@/lib/navigationModel";
import { addColumnToItem, addLinkToColumn, editableNavigation, removeCustomPageFromNav, syncCustomPageNavLabel } from "@/lib/customPagesNav";

export async function loadNavigation(): Promise<{ items: NavigationItem[]; updatedAt?: string }> {
  const res = await api.settings.get("navigation");
  if (!res.ok) return { items: defaultNavigation() };
  return {
    items: parseNavigationValue(res.data.value) ?? defaultNavigation(),
    updatedAt: res.data.updated_at,
  };
}

export async function saveNavigation(items: NavigationItem[], base?: { items: NavigationItem[]; updatedAt?: string }) {
  const loaded = base ?? (await loadNavigation());
  return api.settings.set("navigation", items, {
    baseUpdatedAt: loaded.updatedAt,
    baseValue: loaded.items,
  });
}

export async function loadCustomPages(): Promise<CustomPage[]> {
  const res = await api.settings.get(CUSTOM_PAGES_SETTINGS_KEY);
  if (!res.ok) return [];
  return parseCustomPagesFromSettingValue(res.data.value) ?? [];
}

export async function saveCustomPages(pages: CustomPage[]) {
  return api.settings.set(CUSTOM_PAGES_SETTINGS_KEY, pages);
}

export async function createCustomCategory(input: {
  navItemId: string;
  columnIndex: number;
  title: string;
  description: string;
}): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const nav = await loadNavigation();
  const items = editableNavigation(nav.items);
  const target = items.find((item) => item.id === input.navItemId);
  const column = target?.columns?.[input.columnIndex];
  if (!target || !column) {
    return { ok: false, error: "No se encontró esa columna del menú." };
  }

  const pages = await loadCustomPages();
  const link = emptyNavLink();
  const page = buildCustomPage({
    title: input.title,
    description: input.description,
    navItemId: input.navItemId,
    columnIndex: input.columnIndex,
    columnUid: column.uid || "",
    linkUid: link.uid || "",
    existingSlugs: pages.map((item) => item.slug),
  });
  link.label = page.title;
  link.href = `/pagina/${page.slug}`;
  link.description = page.description;
  link.uid = page.linkUid || link.uid;

  const nextNav = addLinkToColumn(items, input.navItemId, input.columnIndex, link);
  const navRes = await saveNavigation(nextNav, nav);
  if (!navRes.ok) return { ok: false, error: navRes.error ?? "No se pudo guardar el menú." };

  const pagesRes = await saveCustomPages(upsertCustomPage(pages, { ...page, linkUid: link.uid || page.linkUid }));
  if (!pagesRes.ok) return { ok: false, error: pagesRes.error ?? "No se pudo crear la página." };

  notifyCmsSaved(CUSTOM_PAGES_SETTINGS_KEY);
  notifyCmsSaved("navigation");
  return { ok: true, slug: page.slug };
}

export async function createNavGroup(input: {
  navItemId: string;
  title: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const nav = await loadNavigation();
  const items = editableNavigation(nav.items);
  const target = items.find((item) => item.id === input.navItemId);
  if (!target) return { ok: false, error: "No se encontró ese menú." };
  const column = emptyNavColumn();
  column.title = input.title.trim() || "Nuevo grupo";
  const nextNav = addColumnToItem(items, input.navItemId, column);
  const navRes = await saveNavigation(nextNav, nav);
  if (!navRes.ok) return { ok: false, error: navRes.error ?? "No se pudo guardar el menú." };
  notifyCmsSaved("navigation");
  return { ok: true };
}

export async function patchCustomPage(page: CustomPage): Promise<{ ok: true } | { ok: false; error: string }> {
  const pages = await loadCustomPages();
  const next = upsertCustomPage(pages, { ...page, updatedAt: new Date().toISOString() });
  const res = await saveCustomPages(next);
  if (!res.ok) return { ok: false, error: res.error ?? "No se pudo guardar la página." };
  notifyCmsSaved(CUSTOM_PAGES_SETTINGS_KEY);
  return { ok: true };
}

export async function publishCustomPage(
  page: CustomPage,
  allPages: CustomPage[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const published: CustomPage = {
    ...page,
    published: true,
    publishedCanvas: cloneCanvas(page.canvas),
    updatedAt: new Date().toISOString(),
  };
  const nextPages = upsertCustomPage(allPages, published).map((item) =>
    item.id === published.id ? published : item
  );
  const pagesRes = await saveCustomPages(nextPages);
  if (!pagesRes.ok) return { ok: false, error: pagesRes.error ?? "No se pudo publicar la página." };

  const nav = await loadNavigation();
  const synced = syncCustomPageNavLabel(editableNavigation(nav.items), published);
  const navRes = await saveNavigation(synced, nav);
  if (!navRes.ok) return { ok: false, error: navRes.error ?? "La página se guardó, pero no se pudo actualizar el menú." };

  notifyCmsSaved(CUSTOM_PAGES_SETTINGS_KEY);
  notifyCmsSaved("navigation");
  return { ok: true };
}

export async function deleteCustomCategory(page: CustomPage): Promise<{ ok: true } | { ok: false; error: string }> {
  const pages = await loadCustomPages();
  const pagesRes = await saveCustomPages(pages.filter((item) => item.id !== page.id && item.slug !== page.slug));
  if (!pagesRes.ok) return { ok: false, error: pagesRes.error ?? "No se pudo quitar la página." };

  const nav = await loadNavigation();
  const nextNav = removeCustomPageFromNav(editableNavigation(nav.items), page);
  const navRes = await saveNavigation(nextNav, nav);
  if (!navRes.ok) return { ok: false, error: navRes.error ?? "Se quitó la página, pero no el enlace del menú." };

  notifyCmsSaved(CUSTOM_PAGES_SETTINGS_KEY);
  notifyCmsSaved("navigation");
  return { ok: true };
}
