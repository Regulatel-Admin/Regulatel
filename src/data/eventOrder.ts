export const EVENT_ORDER_SETTINGS_KEY = "event_order";

export function parseEventOrder(value: unknown): string[] | null {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(raw)) return null;
  return [...new Set(raw.filter((id): id is string => typeof id === "string" && Boolean(id.trim())).map((id) => id.trim()))];
}

/** Los eventos nuevos conservan entre sí el orden por fecha recibido. */
export function applyEventOrder<T extends { id: string }>(events: T[], order: string[] | null | undefined): T[] {
  if (!order?.length) return events;
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...events].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
}

/** Incluye también los IDs guardados que no aparecen en el filtro actual. */
export function completeEventOrder(availableIds: string[], saved: string[] | null | undefined): string[] {
  return [...new Set([...(saved ?? []), ...availableIds])];
}

/** Solo se sustituyen los huecos visibles; los demás conservan su posición. */
export function moveVisibleEvent(
  fullOrder: string[],
  visibleIds: string[],
  sourceId: string,
  targetId: string,
): string[] {
  const from = visibleIds.indexOf(sourceId);
  const to = visibleIds.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return fullOrder;
  const nextVisible = [...visibleIds];
  nextVisible.splice(from, 1);
  nextVisible.splice(to, 0, sourceId);
  const visible = new Set(visibleIds);
  let index = 0;
  return completeEventOrder(visibleIds, fullOrder).map((id) => (visible.has(id) ? nextVisible[index++] : id));
}
