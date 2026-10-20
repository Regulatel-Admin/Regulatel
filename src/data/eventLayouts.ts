export const EVENT_LAYOUT_KEY = "event_materials_layout";
export const EVENT_LAYOUTS = ["simple", "editorial", "sections"] as const;
export type EventLayout = typeof EVENT_LAYOUTS[number];
export interface EventLayoutSetting { version: 1; layout: EventLayout; }
export const DEFAULT_EVENT_LAYOUT: EventLayoutSetting = { version: 1, layout: "simple" };
export const EVENT_LAYOUT_OPTIONS: { id: EventLayout; title: string; description: string }[] = [
  { id: "simple", title: "1. Sencillo", description: "El formato actual: cabecera compacta, programas, documentos y galería al final." },
  { id: "editorial", title: "2. Fotografías destacadas", description: "La versión anterior: apertura con fotografías, títulos amplios y portadas de las agendas." },
  { id: "sections", title: "3. Por secciones", description: "Una sección a la vez: Programa, Documentos y Galería en pestañas, con menos desplazamiento." },
];
export function isEventLayout(value: unknown): value is EventLayout {
  return typeof value === "string" && (EVENT_LAYOUTS as readonly string[]).includes(value);
}
export function parseEventLayoutSetting(value: unknown): EventLayoutSetting {
  if (typeof value === "string") { try { return parseEventLayoutSetting(JSON.parse(value)); } catch { return { ...DEFAULT_EVENT_LAYOUT }; } }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (record.version === 1 && isEventLayout(record.layout)) return { version: 1, layout: record.layout };
  }
  return { ...DEFAULT_EVENT_LAYOUT };
}
export function isValidEventLayoutSetting(value: unknown): value is EventLayoutSetting {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return record.version === 1 && isEventLayout(record.layout) && Object.keys(record).every(key => key === "version" || key === "layout");
}
/** PostgreSQL drivers may return a Date while the admin sends its ISO string. */
export function sameEventLayoutRevision(current: unknown, expected: string): boolean {
  const actual = current instanceof Date ? current.getTime() : typeof current === "string" ? Date.parse(current) : NaN;
  const previous = Date.parse(expected);
  return Number.isFinite(actual) && Number.isFinite(previous) && actual === previous;
}
