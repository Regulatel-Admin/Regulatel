import type { NavigationColumn, NavigationItem, NavigationItemLink } from "@/data/navigation";
import {
  customPageHref,
  isCustomPageHref,
  type CustomPage,
} from "@/data/customPages";
import { cloneNav, ensureNavigationUids } from "@/lib/navigationModel";

export function editableNavigation(items: NavigationItem[]): NavigationItem[] {
  return ensureNavigationUids(cloneNav(items));
}

export function addLinkToColumn(
  items: NavigationItem[],
  navItemId: string,
  columnIndex: number,
  link: NavigationItemLink
): NavigationItem[] {
  return items.map((item) => {
    if (item.id !== navItemId) return item;
    const columns = item.columns ?? [];
    return {
      ...item,
      columns: columns.map((column, index) =>
        index === columnIndex ? { ...column, links: [...column.links, link] } : column
      ),
    };
  });
}

export function addColumnToItem(
  items: NavigationItem[],
  navItemId: string,
  column: NavigationColumn
): NavigationItem[] {
  return items.map((item) => {
    if (item.id !== navItemId) return item;
    return { ...item, columns: [...(item.columns ?? []), column] };
  });
}

export function removeCustomPageFromNav(items: NavigationItem[], page: CustomPage): NavigationItem[] {
  const href = customPageHref(page.slug);
  return items.map((item) => ({
    ...item,
    columns: item.columns?.map((column) => ({
      ...column,
      links: column.links.filter(
        (link) => link.uid !== page.linkUid && link.href !== href
      ),
    })),
  }));
}

export function syncCustomPageNavLabel(items: NavigationItem[], page: CustomPage): NavigationItem[] {
  const href = customPageHref(page.slug);
  return items.map((item) => ({
    ...item,
    columns: item.columns?.map((column) => ({
      ...column,
      links: column.links.map((link) => {
        if (link.uid !== page.linkUid && link.href !== href) return link;
        return { ...link, label: page.title, description: page.description || link.description };
      }),
    })),
  }));
}

export function publishedCustomHrefs(pages: CustomPage[], includeDrafts: boolean): Set<string> {
  const hrefs = new Set<string>();
  for (const page of pages) {
    if (includeDrafts || page.published) hrefs.add(customPageHref(page.slug));
  }
  return hrefs;
}

export function filterNavCustomPages(
  items: NavigationItem[],
  pages: CustomPage[],
  includeDrafts: boolean
): NavigationItem[] {
  const allowed = publishedCustomHrefs(pages, includeDrafts);
  return items.map((item) => {
    if (!item.columns?.length) return item;
    const columns = item.columns
      .map((column) => ({
        ...column,
        links: column.links.filter((link) => {
          if (!isCustomPageHref(link.href)) return true;
          return allowed.has(link.href.split("?")[0]);
        }),
      }))
      .filter((column) => includeDrafts || column.links.length > 0);
    return { ...item, columns };
  });
}

export function draftCustomHrefs(pages: CustomPage[]): Set<string> {
  return new Set(pages.filter((page) => !page.published).map((page) => customPageHref(page.slug)));
}
