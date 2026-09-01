export const CUSTOM_PAGES_SETTINGS_KEY = "custom_pages" as const;
export const CUSTOM_PAGE_PREFIX = "/pagina/";

export type CustomPageMode = "unset" | "template" | "free";

export type CustomPageTemplateId = "articulo" | "hub" | "multimedia" | "documentos" | "landing";

export type CanvasBlockType =
  | "heading"
  | "text"
  | "image"
  | "video"
  | "cover"
  | "box"
  | "button"
  | "spacer"
  | "gallery"
  | "cards"
  | "list"
  | "quote"
  | "divider"
  | "document";

export interface CustomPageCard {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  href?: string;
  color?: string;
}

export interface CustomPageDocument {
  id: string;
  title: string;
  description?: string;
  url: string;
}

export interface CustomPageContent {
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  coverImageUrl?: string;
  videoUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  backgroundColor?: string;
  accentColor?: string;
  cards: CustomPageCard[];
  documents: CustomPageDocument[];
  images: string[];
}

export interface CanvasBlockContent {
  text?: string;
  url?: string;
  href?: string;
  label?: string;
  alt?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: "heading" | "body";
  italic?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  borderRadius?: number;
  padding?: number;
  overlay?: string;
  overlayOpacity?: number;
  opacity?: number;
  shadow?: boolean;
  borderWidth?: number;
  borderColor?: string;
  objectFit?: "cover" | "contain";
  locked?: boolean;
  columns?: 2 | 3;
  items?: string[];
  images?: string[];
  cards?: CustomPageCard[];
  documents?: CustomPageDocument[];
  cite?: string;
}

export interface CanvasBlock {
  id: string;
  type: CanvasBlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  content: CanvasBlockContent;
}

export interface CustomPageCanvas {
  backgroundColor: string;
  height: number;
  blocks: CanvasBlock[];
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  navItemId: string;
  columnIndex: number;
  columnUid: string;
  linkUid: string;
  mode: CustomPageMode;
  templateId?: CustomPageTemplateId;
  content: CustomPageContent;
  canvas: CustomPageCanvas;
  /** Snapshot shown on the public site. The editor writes `canvas` without taking the page down. */
  publishedCanvas?: CustomPageCanvas;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CUSTOM_PAGE_TEMPLATES: Array<{
  id: CustomPageTemplateId;
  name: string;
  blurb: string;
}> = [
  {
    id: "articulo",
    name: "Artículo institucional",
    blurb: "Portada, título y texto. Para una nota, una sección o una página de contenido.",
  },
  {
    id: "hub",
    name: "Hub de tarjetas",
    blurb: "Introducción y cuadrícula de cajas con foto, texto y enlace.",
  },
  {
    id: "multimedia",
    name: "Multimedia",
    blurb: "Video, galería de fotos y un texto de contexto.",
  },
  {
    id: "documentos",
    name: "Documentos",
    blurb: "Lista de PDFs para ver o descargar, como Estudios e investigación.",
  },
  {
    id: "landing",
    name: "Portada completa",
    blurb: "Cubierta grande, cajas de color y texto. Para una sección nueva con peso.",
  },
];

export const CANVAS_W = 1200;

export const CANVAS_STACK_BP = 720;

export const CANVAS_BLOCK_META: Array<{
  type: CanvasBlockType;
  label: string;
  hint: string;
}> = [
  { type: "heading", label: "Título", hint: "Encabezado" },
  { type: "text", label: "Texto", hint: "Párrafo" },
  { type: "image", label: "Foto", hint: "Imagen" },
  { type: "video", label: "Video", hint: "YouTube o MP4" },
  { type: "cover", label: "Portada", hint: "Foto a lo ancho" },
  { type: "box", label: "Cajita", hint: "Cuadro de color" },
  { type: "button", label: "Botón", hint: "Enlace" },
  { type: "gallery", label: "Galería", hint: "Varias fotos" },
  { type: "cards", label: "Tarjetas", hint: "Cajas con enlace" },
  { type: "list", label: "Lista", hint: "Viñetas" },
  { type: "document", label: "PDF", hint: "Ver o descargar" },
  { type: "quote", label: "Cita", hint: "Frase destacada" },
  { type: "divider", label: "Línea", hint: "Separador" },
  { type: "spacer", label: "Espacio", hint: "Separador vacío" },
];

export function sortBlocksForFlow(blocks: CanvasBlock[]): CanvasBlock[] {
  return [...blocks]
    .filter((block) => block.content.opacity !== 0)
    .sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);
}

export function cloneCanvas(canvas: CustomPageCanvas): CustomPageCanvas {
  return JSON.parse(JSON.stringify(canvas)) as CustomPageCanvas;
}

export function publicCanvasOf(page: CustomPage): CustomPageCanvas {
  return page.publishedCanvas ?? page.canvas;
}

export function hasUnpublishedCanvasChanges(page: CustomPage): boolean {
  if (!page.published || !page.publishedCanvas) return false;
  return JSON.stringify(page.canvas) !== JSON.stringify(page.publishedCanvas);
}

export function newCustomId(prefix = "u"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function customPageHref(slug: string): string {
  return `${CUSTOM_PAGE_PREFIX}${slug}`;
}

export function isCustomPageHref(href: string): boolean {
  return href.startsWith(CUSTOM_PAGE_PREFIX);
}

export function slugFromCustomHref(href: string): string | null {
  if (!isCustomPageHref(href)) return null;
  const slug = href.slice(CUSTOM_PAGE_PREFIX.length).split("?")[0].split("#")[0];
  return slug || null;
}

export function emptyCustomContent(title: string, subtitle = ""): CustomPageContent {
  return {
    kicker: "",
    title,
    subtitle,
    body: "",
    coverImageUrl: "",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
    backgroundColor: "#FAFBFC",
    accentColor: "#4489C6",
    cards: [
      emptyCustomCard(),
      emptyCustomCard(),
      emptyCustomCard(),
    ],
    documents: [emptyCustomDocument()],
    images: [],
  };
}

export function emptyCustomCard(): CustomPageCard {
  return {
    id: newCustomId("card"),
    title: "",
    text: "",
    imageUrl: "",
    href: "",
    color: "#163D59",
  };
}

export function emptyCustomDocument(): CustomPageDocument {
  return {
    id: newCustomId("doc"),
    title: "",
    description: "",
    url: "",
  };
}

export function defaultCanvasForTitle(title: string, subtitle?: string): CustomPageCanvas {
  const heading: CanvasBlock = {
    id: newCustomId("b"),
    type: "heading",
    x: 48,
    y: 360,
    w: 1104,
    h: 88,
    z: 2,
    content: {
      text: title,
      fontSize: 42,
      fontWeight: 700,
      fontFamily: "heading",
      textColor: "#ffffff",
      align: "left",
      lineHeight: 1.1,
    },
  };
  const cover: CanvasBlock = {
    id: newCustomId("b"),
    type: "cover",
    x: 0,
    y: 0,
    w: 1200,
    h: 420,
    z: 1,
    content: {
      text: title,
      overlay: "rgba(11, 38, 57, 0.55)",
      overlayOpacity: 0.55,
      backgroundColor: "#163D59",
      textColor: "#ffffff",
      fontSize: 18,
      fontFamily: "heading",
      verticalAlign: "bottom",
    },
  };
  const body: CanvasBlock = {
    id: newCustomId("b"),
    type: "text",
    x: 48,
    y: 480,
    w: 760,
    h: 160,
    z: 2,
    content: {
      text: subtitle?.trim() || "Escribe aquí el contenido de esta sección. Arrastra los bloques y cambia colores, fotos y textos.",
      fontSize: 18,
      fontFamily: "body",
      textColor: "#4A5568",
      align: "left",
      lineHeight: 1.5,
    },
  };
  return {
    backgroundColor: "#FAFBFC",
    height: 900,
    blocks: [cover, heading, body],
  };
}

export function defaultBlockForType(type: CanvasBlockType, x: number, y: number, z: number): CanvasBlock {
  const base = { id: newCustomId("b"), type, x, y, z, content: {} as CanvasBlockContent };
  switch (type) {
    case "heading":
      return { ...base, w: 640, h: 72, content: { text: "Título", fontSize: 36, fontWeight: 700, fontFamily: "heading", textColor: "#163D59", align: "left", lineHeight: 1.15 } };
    case "text":
      return { ...base, w: 560, h: 140, content: { text: "Escribe el texto de esta sección.", fontSize: 16, fontFamily: "body", textColor: "#4A5568", align: "left", lineHeight: 1.5 } };
    case "image":
      return { ...base, w: 480, h: 280, content: { url: "", borderRadius: 16, backgroundColor: "#E6E7DF" } };
    case "video":
      return { ...base, w: 640, h: 360, content: { url: "", borderRadius: 16, backgroundColor: "#051329" } };
    case "cover":
      return { ...base, w: 1104, h: 280, content: { text: "Portada", url: "", overlay: "rgba(11, 38, 57, 0.45)", overlayOpacity: 0.45, backgroundColor: "#163D59", textColor: "#ffffff", fontSize: 28, fontFamily: "heading", align: "left", verticalAlign: "bottom" } };
    case "box":
      return {
        ...base,
        w: 340,
        h: 200,
        content: {
          text: "Título de la caja\nTexto corto de apoyo.",
          backgroundColor: "#163D59",
          textColor: "#ffffff",
          borderRadius: 16,
          padding: 24,
          fontSize: 18,
        },
      };
    case "button":
      return { ...base, w: 220, h: 52, content: { label: "Ver más", href: "/", backgroundColor: "#4489C6", textColor: "#ffffff", borderRadius: 10, fontSize: 15, fontWeight: 700, align: "center" } };
    case "gallery":
      return { ...base, w: 1104, h: 260, content: { images: ["", "", ""], columns: 3, borderRadius: 16 } };
    case "cards":
      return {
        ...base,
        w: 1104,
        h: 280,
        content: {
          columns: 3,
          cards: [
            { ...emptyCustomCard(), title: "Tarjeta", text: "Texto corto de apoyo.", color: "#163D59" },
            { ...emptyCustomCard(), title: "Tarjeta", text: "Texto corto de apoyo.", color: "#4489C6" },
            { ...emptyCustomCard(), title: "Tarjeta", text: "Texto corto de apoyo.", color: "#33A4B4" },
          ],
        },
      };
    case "list":
      return {
        ...base,
        w: 560,
        h: 180,
        content: {
          items: ["Primer punto", "Segundo punto", "Tercer punto"],
          fontSize: 16,
          fontFamily: "body",
          textColor: "#4A5568",
          lineHeight: 1.5,
        },
      };
    case "document":
      return {
        ...base,
        w: 1104,
        h: 132,
        content: { documents: [emptyCustomDocument()], borderRadius: 16, backgroundColor: "#ffffff" },
      };
    case "quote":
      return {
        ...base,
        w: 720,
        h: 160,
        content: {
          text: "Una frase que quieras destacar en esta página.",
          cite: "",
          fontSize: 22,
          fontFamily: "heading",
          italic: true,
          textColor: "#163D59",
          backgroundColor: "#EAF2F8",
          borderRadius: 16,
          padding: 24,
        },
      };
    case "divider":
      return { ...base, w: 1104, h: 24, content: { backgroundColor: "rgba(22,61,89,0.18)" } };
    case "spacer":
      return { ...base, w: 1104, h: 40, content: { backgroundColor: "transparent" } };
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBool(value: unknown): boolean {
  return value === true;
}

function unwrapSettingJson(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

function parseCard(row: unknown): CustomPageCard | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return {
    id: asString(r.id) || newCustomId("card"),
    title: asString(r.title),
    text: asString(r.text),
    imageUrl: asString(r.imageUrl) || undefined,
    href: asString(r.href) || undefined,
    color: asString(r.color) || undefined,
  };
}

function parseDocument(row: unknown): CustomPageDocument | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return {
    id: asString(r.id) || newCustomId("doc"),
    title: asString(r.title),
    description: asString(r.description) || undefined,
    url: asString(r.url),
  };
}

function parseBlock(row: unknown): CanvasBlock | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const type = r.type as CanvasBlockType;
  if (!CANVAS_BLOCK_META.some((item) => item.type === type)) return null;
  const content = r.content && typeof r.content === "object" ? (r.content as Record<string, unknown>) : {};
  const align = content.align === "center" || content.align === "right" || content.align === "left" ? content.align : undefined;
  const verticalAlign =
    content.verticalAlign === "top" || content.verticalAlign === "center" || content.verticalAlign === "bottom"
      ? content.verticalAlign
      : undefined;
  const fontFamily = content.fontFamily === "heading" || content.fontFamily === "body" ? content.fontFamily : undefined;
  const objectFit = content.objectFit === "contain" || content.objectFit === "cover" ? content.objectFit : undefined;
  const columns = content.columns === 2 || content.columns === 3 ? content.columns : undefined;
  const items = Array.isArray(content.items)
    ? content.items.filter((item): item is string => typeof item === "string")
    : undefined;
  const images = Array.isArray(content.images)
    ? content.images.filter((item): item is string => typeof item === "string")
    : undefined;
  const cards = Array.isArray(content.cards)
    ? content.cards.map(parseCard).filter((card): card is CustomPageCard => Boolean(card))
    : undefined;
  const documents = Array.isArray(content.documents)
    ? content.documents.map(parseDocument).filter((doc): doc is CustomPageDocument => Boolean(doc))
    : undefined;
  return {
    id: asString(r.id) || newCustomId("b"),
    type,
    x: asNumber(r.x, 40),
    y: asNumber(r.y, 40),
    w: asNumber(r.w, 320),
    h: asNumber(r.h, 80),
    z: asNumber(r.z, 1),
    content: {
      text: asString(content.text) || undefined,
      url: asString(content.url) || undefined,
      href: asString(content.href) || undefined,
      label: asString(content.label) || undefined,
      alt: asString(content.alt) || undefined,
      backgroundColor: asString(content.backgroundColor) || undefined,
      textColor: asString(content.textColor) || undefined,
      fontSize: typeof content.fontSize === "number" ? content.fontSize : undefined,
      fontWeight: typeof content.fontWeight === "number" ? content.fontWeight : undefined,
      fontFamily,
      italic: content.italic === true ? true : undefined,
      lineHeight: typeof content.lineHeight === "number" ? content.lineHeight : undefined,
      letterSpacing: typeof content.letterSpacing === "number" ? content.letterSpacing : undefined,
      align,
      verticalAlign,
      borderRadius: typeof content.borderRadius === "number" ? content.borderRadius : undefined,
      padding: typeof content.padding === "number" ? content.padding : undefined,
      overlay: asString(content.overlay) || undefined,
      overlayOpacity: typeof content.overlayOpacity === "number" ? content.overlayOpacity : undefined,
      opacity: typeof content.opacity === "number" ? content.opacity : undefined,
      shadow: content.shadow === true ? true : undefined,
      borderWidth: typeof content.borderWidth === "number" ? content.borderWidth : undefined,
      borderColor: asString(content.borderColor) || undefined,
      objectFit,
      locked: content.locked === true ? true : undefined,
      columns,
      items,
      images,
      cards,
      documents,
      cite: asString(content.cite) || undefined,
    },
  };
}

function parseContent(raw: unknown, fallbackTitle: string): CustomPageContent {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const cards = Array.isArray(r.cards) ? r.cards.map(parseCard).filter((c): c is CustomPageCard => Boolean(c)) : [];
  const documents = Array.isArray(r.documents)
    ? r.documents.map(parseDocument).filter((d): d is CustomPageDocument => Boolean(d))
    : [];
  const images = Array.isArray(r.images) ? r.images.filter((u): u is string => typeof u === "string") : [];
  return {
    kicker: asString(r.kicker),
    title: asString(r.title, fallbackTitle),
    subtitle: asString(r.subtitle),
    body: asString(r.body),
    coverImageUrl: asString(r.coverImageUrl),
    videoUrl: asString(r.videoUrl),
    ctaLabel: asString(r.ctaLabel),
    ctaHref: asString(r.ctaHref),
    backgroundColor: asString(r.backgroundColor, "#FAFBFC"),
    accentColor: asString(r.accentColor, "#4489C6"),
    cards,
    documents,
    images,
  };
}

function parseCanvas(raw: unknown, title: string): CustomPageCanvas {
  if (!raw || typeof raw !== "object") return defaultCanvasForTitle(title);
  const r = raw as Record<string, unknown>;
  const blocks = Array.isArray(r.blocks) ? r.blocks.map(parseBlock).filter((b): b is CanvasBlock => Boolean(b)) : [];
  return {
    backgroundColor: asString(r.backgroundColor, "#FAFBFC"),
    height: Math.max(600, asNumber(r.height, 900)),
    blocks,
  };
}

function parsePage(row: unknown): CustomPage | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const slug = asString(r.slug).trim();
  const title = asString(r.title).trim();
  if (!slug && !title) return null;
  const mode: CustomPageMode =
    r.mode === "template" || r.mode === "free" || r.mode === "unset" ? r.mode : "unset";
  const templateId = CUSTOM_PAGE_TEMPLATES.some((t) => t.id === r.templateId)
    ? (r.templateId as CustomPageTemplateId)
    : undefined;
  const safeTitle = title || slug || "Nueva categoría";
  return {
    id: asString(r.id) || newCustomId("page"),
    slug: slug || "categoria",
    title: safeTitle,
    description: asString(r.description),
    navItemId: asString(r.navItemId),
    columnIndex: asNumber(r.columnIndex, 0),
    columnUid: asString(r.columnUid),
    linkUid: asString(r.linkUid),
    mode,
    templateId,
    content: parseContent(r.content, safeTitle),
    canvas: parseCanvas(r.canvas, safeTitle),
    publishedCanvas:
      r.publishedCanvas != null && typeof r.publishedCanvas === "object"
        ? parseCanvas(r.publishedCanvas, safeTitle)
        : undefined,
    published: asBool(r.published),
    createdAt: asString(r.createdAt, new Date().toISOString()),
    updatedAt: asString(r.updatedAt, new Date().toISOString()),
  };
}

export function parseCustomPagesFromSettingValue(value: unknown): CustomPage[] | null {
  const root = unwrapSettingJson(value);
  if (root == null) return null;
  const items = Array.isArray(root)
    ? root
    : root && typeof root === "object"
      ? (root as { pages?: unknown }).pages
      : null;
  if (!Array.isArray(items)) return null;
  return items.map(parsePage).filter((p): p is CustomPage => Boolean(p));
}

export function uniqueCustomSlug(label: string, existing: string[]): string {
  const base =
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "categoria";
  let slug = base;
  let n = 2;
  while (existing.includes(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function buildCustomPage(input: {
  title: string;
  description?: string;
  navItemId: string;
  columnIndex: number;
  columnUid: string;
  linkUid: string;
  existingSlugs: string[];
}): CustomPage {
  const now = new Date().toISOString();
  const title = input.title.trim() || "Nueva categoría";
  const slug = uniqueCustomSlug(title, input.existingSlugs);
  return {
    id: newCustomId("page"),
    slug,
    title,
    description: (input.description ?? "").trim(),
    navItemId: input.navItemId,
    columnIndex: input.columnIndex,
    columnUid: input.columnUid,
    linkUid: input.linkUid,
    mode: "unset",
    content: emptyCustomContent(title, input.description),
    canvas: defaultCanvasForTitle(title, input.description),
    published: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertCustomPage(list: CustomPage[], page: CustomPage): CustomPage[] {
  const idx = list.findIndex((item) => item.id === page.id || item.slug === page.slug);
  if (idx < 0) return [...list, page];
  const next = list.slice();
  next[idx] = page;
  return next;
}
