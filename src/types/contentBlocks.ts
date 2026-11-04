export type ContentBlockType = "text" | "heading" | "image" | "document" | "video";
export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  text?: string;
  url?: string;
  title?: string;
  caption?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  /** Imagen de portada de un bloque de video. */
  poster?: string;
}

export function safeContentUrl(value: string | undefined): string {
  const url = value?.trim() ?? "";
  return /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : "";
}

/** undefined conserva el formato antiguo; [] representa contenido retirado intencionalmente. */
export function parseContentBlocks(value: unknown): ContentBlock[] | undefined {
  let raw = value;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { return undefined; }
  }
  if (!Array.isArray(raw)) return undefined;
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const block = item as Record<string, unknown>;
    if (!["text", "heading", "image", "document", "video"].includes(String(block.type))) return [];
    return [{
      id: typeof block.id === "string" && block.id ? block.id : `block-${index}`,
      type: block.type as ContentBlockType,
      text: typeof block.text === "string" ? block.text : undefined,
      url: typeof block.url === "string" ? safeContentUrl(block.url) : undefined,
      title: typeof block.title === "string" ? block.title : undefined,
      caption: typeof block.caption === "string" ? block.caption : undefined,
      fileName: typeof block.fileName === "string" ? block.fileName : undefined,
      fileType: typeof block.fileType === "string" ? block.fileType : undefined,
      fileSize: typeof block.fileSize === "number" ? block.fileSize : undefined,
      poster: typeof block.poster === "string" && safeContentUrl(block.poster) ? safeContentUrl(block.poster) : undefined,
    }];
  });
}

/** ID de YouTube a partir de un enlace watch, youtu.be, shorts o embed. */
export function youtubeVideoId(url: string | undefined): string | null {
  const match = (url ?? "").match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function newContentBlock(type: ContentBlockType, patch: Partial<ContentBlock> = {}): ContentBlock {
  return { id: `block-${crypto.randomUUID()}`, type, ...patch };
}

export function moveContentBlock<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
