import type { NavigationColumn, NavigationItem, NavigationItemLink } from "../data/navigation";

export type NavMergeNote = {
  level: "info" | "warn";
  text: string;
};

export type NavMergeResult = {
  merged: NavigationItem[];
  notes: NavMergeNote[];
};

function eq(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function idOfItem(item: NavigationItem) {
  return item.uid || `item:${item.id}`;
}

function idOfColumn(column: NavigationColumn, index: number) {
  return column.uid || `col:${index}:${column.title}`;
}

function idOfLink(link: NavigationItemLink, index: number) {
  return link.uid || `link:${index}:${link.href}:${link.label}`;
}

function sameOrder<T>(a: T[], b: T[], getId: (item: T, index: number) => string) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => getId(item, index) === getId(b[index], index));
}

function pickScalar<T>(
  base: T,
  local: T,
  remote: T,
  label: string,
  notes: NavMergeNote[]
): T {
  if (eq(local, remote)) return local;
  if (eq(local, base)) return remote;
  if (eq(remote, base)) return local;
  notes.push({
    level: "warn",
    text: `Los dos editaron «${label}». Se conservó tu versión.`,
  });
  return local;
}

function mergeList<T>(
  base: T[],
  local: T[],
  remote: T[],
  getId: (item: T, index: number) => string,
  mergeOne: (baseItem: T | undefined, localItem: T, remoteItem: T | undefined) => T,
  label: string,
  notes: NavMergeNote[]
): T[] {
  const baseMap = new Map(base.map((item, index) => [getId(item, index), item]));
  const localMap = new Map(local.map((item, index) => [getId(item, index), item]));
  const remoteMap = new Map(remote.map((item, index) => [getId(item, index), item]));

  const keep = (id: string) => {
    const inBase = baseMap.has(id);
    const inLocal = localMap.has(id);
    const inRemote = remoteMap.has(id);
    if (inLocal && inRemote) return true;
    if (inLocal && !inRemote) {
      if (!inBase) return true;
      if (!eq(localMap.get(id), baseMap.get(id))) {
        notes.push({
          level: "warn",
          text: `La otra persona eliminó un elemento de ${label}, pero tú lo habías editado. Se conservó el tuyo.`,
        });
        return true;
      }
      return false;
    }
    if (!inLocal && inRemote) {
      if (!inBase) {
        notes.push({
          level: "info",
          text: `Se incorporó un elemento que añadió la otra persona en ${label}.`,
        });
        return true;
      }
      if (!eq(remoteMap.get(id), baseMap.get(id))) {
        notes.push({
          level: "warn",
          text: `Tú eliminaste un elemento de ${label} que la otra persona había editado. Se conservó el de la otra persona.`,
        });
        return true;
      }
      return false;
    }
    return false;
  };

  const localOrderChanged = !sameOrder(base, local, getId);
  const orderSource = localOrderChanged ? local : remote;
  const other = localOrderChanged ? remote : local;
  const ids: string[] = [];
  orderSource.forEach((item, index) => {
    const id = getId(item, index);
    if (keep(id) && !ids.includes(id)) ids.push(id);
  });
  other.forEach((item, index) => {
    const id = getId(item, index);
    if (keep(id) && !ids.includes(id)) ids.push(id);
  });

  return ids.map((id) => {
    const localItem = localMap.get(id);
    const remoteItem = remoteMap.get(id);
    const baseItem = baseMap.get(id);
    if (localItem && remoteItem) return mergeOne(baseItem, localItem, remoteItem);
    return (localItem ?? remoteItem)!;
  });
}

function mergeLink(
  base: NavigationItemLink | undefined,
  local: NavigationItemLink,
  remote: NavigationItemLink | undefined,
  notes: NavMergeNote[]
): NavigationItemLink {
  if (!remote) return local;
  const b = base ?? local;
  const children = mergeList(
    b.children ?? [],
    local.children ?? [],
    remote.children ?? [],
    idOfLink,
    (cb, cl, cr) => mergeLink(cb, cl, cr, notes),
    `subenlaces de «${local.label}»`,
    notes
  );
  return {
    uid: local.uid || remote.uid,
    label: pickScalar(b.label, local.label, remote.label, `etiqueta de «${local.label}»`, notes),
    href: pickScalar(b.href, local.href, remote.href, `URL de «${local.label}»`, notes),
    description: pickScalar(b.description, local.description, remote.description, `descripción de «${local.label}»`, notes),
    external: pickScalar(b.external, local.external, remote.external, `enlace externo de «${local.label}»`, notes),
    restricted: pickScalar(b.restricted, local.restricted, remote.restricted, `acceso restringido de «${local.label}»`, notes),
    subtitle: pickScalar(b.subtitle, local.subtitle, remote.subtitle, `subtítulo de «${local.label}»`, notes),
    groupLabel: pickScalar(b.groupLabel, local.groupLabel, remote.groupLabel, `grupo de «${local.label}»`, notes),
    todo: pickScalar(b.todo, local.todo, remote.todo, `nota de «${local.label}»`, notes),
    children: children.length ? children : undefined,
  };
}

function mergeColumn(
  base: NavigationColumn | undefined,
  local: NavigationColumn,
  remote: NavigationColumn | undefined,
  notes: NavMergeNote[]
): NavigationColumn {
  if (!remote) return local;
  const b = base ?? local;
  return {
    uid: local.uid || remote.uid,
    title: pickScalar(b.title, local.title, remote.title, `columna «${local.title}»`, notes),
    links: mergeList(
      b.links ?? [],
      local.links ?? [],
      remote.links ?? [],
      idOfLink,
      (lb, ll, lr) => mergeLink(lb, ll, lr, notes),
      `enlaces de «${local.title}»`,
      notes
    ),
  };
}

function mergeItem(
  base: NavigationItem | undefined,
  local: NavigationItem,
  remote: NavigationItem | undefined,
  notes: NavMergeNote[]
): NavigationItem {
  if (!remote) return local;
  const b = base ?? local;
  return {
    uid: local.uid || remote.uid,
    id: pickScalar(b.id, local.id, remote.id, `id de «${local.label}»`, notes),
    label: pickScalar(b.label, local.label, remote.label, `menú «${local.label}»`, notes),
    href: pickScalar(b.href, local.href, remote.href, `URL de «${local.label}»`, notes),
    panelLabel: pickScalar(b.panelLabel, local.panelLabel, remote.panelLabel, `título del panel de «${local.label}»`, notes),
    columns: mergeList(
      b.columns ?? [],
      local.columns ?? [],
      remote.columns ?? [],
      idOfColumn,
      (cb, cl, cr) => mergeColumn(cb, cl, cr, notes),
      `columnas de «${local.label}»`,
      notes
    ),
  };
}

/**
 * Fusiona tres versiones del menú: lo que cargaste, lo que quieres guardar,
 * y lo que hay ahora en el servidor. Campos distintos se conservan; si los dos
 * cambiaron el mismo campo, se queda el de quien está guardando.
 */
export function mergeNavigation(
  base: NavigationItem[],
  local: NavigationItem[],
  remote: NavigationItem[]
): NavMergeResult {
  const notes: NavMergeNote[] = [];
  const merged = mergeList(
    base,
    local,
    remote,
    (item) => idOfItem(item),
    (baseItem, localItem, remoteItem) => mergeItem(baseItem, localItem, remoteItem, notes),
    "el menú principal",
    notes
  );
  const unique: NavMergeNote[] = [];
  for (const note of notes) {
    if (!unique.some((item) => item.text === note.text)) unique.push(note);
  }
  return { merged, notes: unique };
}

export function timestampsEqual(a?: string | null, b?: string | null) {
  if (!a || !b) return !a && !b;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return a === b;
  return ta === tb;
}
