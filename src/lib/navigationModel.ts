import type { NavigationColumn, NavigationItem, NavigationItemLink } from "@/data/navigation";
import { navigationItems } from "@/data/navigation";

export const SPECIAL_NAV_IDS: Record<string, string> = {
  eventos: "Este ítem abre el calendario de eventos en el header. El desplegable no se arma con columnas.",
  convenios: "Este ítem abre el menú especial de convenios (BEREC, ICANN, etc.). Las columnas de aquí no se muestran en el sitio.",
};

function newUid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cloneNav(items: NavigationItem[]): NavigationItem[] {
  return JSON.parse(JSON.stringify(items)) as NavigationItem[];
}

export function defaultNavigation(): NavigationItem[] {
  return ensureNavigationUids(cloneNav(navigationItems));
}

function ensureLinkUids(link: NavigationItemLink): NavigationItemLink {
  return {
    ...link,
    uid: link.uid || newUid(),
    children: link.children?.map(ensureLinkUids),
  };
}

function ensureColumnUids(column: NavigationColumn): NavigationColumn {
  return {
    ...column,
    uid: column.uid || newUid(),
    links: (column.links ?? []).map(ensureLinkUids),
  };
}

export function ensureNavigationUids(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) => ({
    ...item,
    uid: item.uid || newUid(),
    columns: item.columns?.map(ensureColumnUids),
  }));
}

export function slugifyNavId(label: string, existing: string[]): string {
  const base =
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
  let id = base;
  let n = 2;
  while (existing.includes(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export function emptyNavItem(existingIds: string[]): NavigationItem {
  return {
    uid: newUid(),
    id: slugifyNavId("nuevo-item", existingIds),
    label: "Nuevo ítem",
    href: "/",
    panelLabel: "",
    columns: [],
  };
}

export function emptyNavColumn(): NavigationColumn {
  return { uid: newUid(), title: "Nueva columna", links: [] };
}

export function emptyNavLink(): NavigationItemLink {
  return { uid: newUid(), label: "Nuevo enlace", href: "/", description: "" };
}

export function parseNavigationValue(value: unknown): NavigationItem[] | null {
  const raw =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return null;
          }
        })()
      : value;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const items: NavigationItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as NavigationItem;
    if (typeof item.id !== "string" || typeof item.label !== "string") continue;
    items.push({
      uid: typeof item.uid === "string" ? item.uid : undefined,
      id: item.id,
      label: item.label,
      href: typeof item.href === "string" ? item.href : undefined,
      panelLabel: typeof item.panelLabel === "string" ? item.panelLabel : undefined,
      columns: Array.isArray(item.columns)
        ? item.columns.map((column) => ({
            uid: typeof column.uid === "string" ? column.uid : undefined,
            title: typeof column.title === "string" ? column.title : "",
            links: Array.isArray(column.links) ? column.links.map(normalizeLink) : [],
          }))
        : [],
    });
  }
  return items.length ? ensureNavigationUids(items) : null;
}

function normalizeLink(link: NavigationItemLink): NavigationItemLink {
  return {
    uid: typeof link.uid === "string" ? link.uid : undefined,
    label: typeof link.label === "string" ? link.label : "",
    href: typeof link.href === "string" ? link.href : "",
    description: typeof link.description === "string" ? link.description : undefined,
    external: Boolean(link.external),
    restricted: Boolean(link.restricted),
    subtitle: typeof link.subtitle === "string" ? link.subtitle : undefined,
    groupLabel: typeof link.groupLabel === "string" ? link.groupLabel : undefined,
    todo: typeof link.todo === "string" ? link.todo : undefined,
    children: Array.isArray(link.children) ? link.children.map(normalizeLink) : undefined,
  };
}

export function validateNavigation(items: NavigationItem[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  items.forEach((item, index) => {
    if (!item.label.trim()) errors.push(`El ítem ${index + 1} no tiene etiqueta.`);
    if (!item.id.trim()) errors.push(`El ítem «${item.label || index + 1}» no tiene id.`);
    if (ids.has(item.id)) errors.push(`Hay dos ítems con el id «${item.id}».`);
    ids.add(item.id);
    item.columns?.forEach((column, cIndex) => {
      column.links.forEach((link, lIndex) => {
        if (!link.label.trim()) {
          errors.push(`Hay un enlace sin etiqueta en «${item.label}» → columna ${cIndex + 1}.`);
        }
        if (!link.href.trim()) {
          errors.push(`El enlace «${link.label || lIndex + 1}» en «${item.label}» no tiene URL.`);
        }
      });
    });
  });
  return errors;
}

export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (next < 0 || next >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}
