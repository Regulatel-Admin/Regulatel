import { getDb } from "./db.js";
import { parseContentBlocks, type ContentBlock } from "../../src/types/contentBlocks.js";

export interface NewsAttachment {
  id: string;
  title: string;
  url: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface NewsRow {
  id: string;
  slug: string;
  title: string;
  date: string;
  date_formatted: string | null;
  category: string;
  excerpt: string;
  image_url: string | null;
  image_file_name: string | null;
  image_mime_type: string | null;
  image_size: number | null;
  additional_images: string[];
  additional_image_names: (string | undefined)[];
  additional_image_meta: Array<{
    fileName?: string;
    mimeType?: string;
    size?: number;
  }>;
  body: string;
  author: string | null;
  link: string | null;
  video_url: string | null;
  published: boolean;
  attachments: unknown;
  content_blocks: unknown;
  created_at: string;
  updated_at: string;
}

let attachmentsColumnReady: Promise<void> | null = null;

async function ensureNewsAttachmentsColumn() {
  if (!attachmentsColumnReady) {
    attachmentsColumnReady = (async () => {
      const sql = getDb();
      await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS attachments JSONB`;
      await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS content_blocks JSONB`;
    })().catch((err) => {
      attachmentsColumnReady = null;
      throw err;
    });
  }
  await attachmentsColumnReady;
}

function parseAttachments(value: unknown): NewsAttachment[] | undefined {
  if (value == null) return undefined;
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const o = item as Record<string, unknown>;
    const url = typeof o.url === "string" ? o.url.trim() : "";
    if (!url) return [];
    const title = typeof o.title === "string" ? o.title.trim() : "";
    return [
      {
        id: typeof o.id === "string" && o.id.trim() ? o.id.trim() : `att-${index + 1}`,
        title: title || "Documento",
        url,
        fileName: typeof o.fileName === "string" ? o.fileName : undefined,
        fileType: typeof o.fileType === "string" ? o.fileType : undefined,
        fileSize: typeof o.fileSize === "number" ? o.fileSize : undefined,
      },
    ];
  });
}

// Older writes encoded JSON twice. Read those rows without discarding the gallery.
function parseJsonArray<T>(value: unknown): T[] {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

function rowToItem(r: NewsRow) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: r.date,
    dateFormatted: r.date_formatted ?? r.date,
    category: r.category,
    excerpt: r.excerpt,
    imageUrl: r.image_url ?? "",
    imageFileName: r.image_file_name ?? undefined,
    imageMimeType: r.image_mime_type ?? undefined,
    imageSize: r.image_size ?? undefined,
    additionalImages: parseJsonArray<string>(r.additional_images),
    additionalImageNames: parseJsonArray<string | undefined>(r.additional_image_names),
    additionalImageMeta: parseJsonArray<{ fileName?: string; mimeType?: string; size?: number }>(r.additional_image_meta),
    content: r.body,
    author: r.author ?? undefined,
    link: r.link ?? undefined,
    videoUrl: r.video_url ?? undefined,
    published: r.published,
    attachments: parseAttachments(r.attachments),
    contentBlocks: parseContentBlocks(r.content_blocks),
  };
}

export async function listNews(): Promise<ReturnType<typeof rowToItem>[]> {
  await ensureNewsAttachmentsColumn();
  const sql = getDb();
  const rows = await sql<NewsRow[]>`
    SELECT id, slug, title, date, date_formatted, category, excerpt,
           image_url, image_file_name, image_mime_type, image_size,
           additional_images, additional_image_names, additional_image_meta,
           body, author, link, video_url, published, attachments, content_blocks, created_at, updated_at
    FROM news
    ORDER BY date DESC
  `;
  return rows.map(rowToItem);
}

export async function getNewsById(id: string): Promise<ReturnType<typeof rowToItem> | null> {
  await ensureNewsAttachmentsColumn();
  const sql = getDb();
  const [row] = await sql<NewsRow[]>`
    SELECT id, slug, title, date, date_formatted, category, excerpt,
           image_url, image_file_name, image_mime_type, image_size,
           additional_images, additional_image_names, additional_image_meta,
           body, author, link, video_url, published, attachments, content_blocks, created_at, updated_at
    FROM news WHERE id = ${id}
  `;
  return row ? rowToItem(row) : null;
}

export interface CreateNewsInput {
  id: string;
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  imageFileName?: string;
  imageMimeType?: string;
  imageSize?: number;
  additionalImages?: string[];
  additionalImageNames?: (string | undefined)[];
  additionalImageMeta?: Array<{
    fileName?: string;
    mimeType?: string;
    size?: number;
  }>;
  body: string;
  author?: string;
  link?: string;
  videoUrl?: string;
  published: boolean;
  attachments?: NewsAttachment[];
  contentBlocks?: ContentBlock[];
}

function attachmentsJson(value: NewsAttachment[] | undefined): string | null {
  if (value === undefined) return null;
  return JSON.stringify(value);
}

export async function createNews(input: CreateNewsInput): Promise<ReturnType<typeof rowToItem>> {
  await ensureNewsAttachmentsColumn();
  const sql = getDb();
  const now = new Date().toISOString();
  const attachments = input.attachments !== undefined ? parseAttachments(input.attachments) ?? [] : undefined;
  const [row] = await sql<NewsRow[]>`
    INSERT INTO news (
      id, slug, title, date, date_formatted, category, excerpt,
      image_url, image_file_name, image_mime_type, image_size,
      additional_images, additional_image_names, additional_image_meta,
      body, author, link, video_url, published, attachments, content_blocks, created_at, updated_at
    ) VALUES (
      ${input.id}, ${input.slug}, ${input.title}, ${input.date}, ${input.dateFormatted},
      ${input.category}, ${input.excerpt}, ${input.imageUrl}, ${input.imageFileName ?? null},
      ${input.imageMimeType ?? null}, ${input.imageSize ?? null},
      ${sql.json(input.additionalImages ?? [])}, ${sql.json((input.additionalImageNames ?? []).map((name) => name ?? null))},
      ${sql.json(input.additionalImageMeta ?? [])},
      ${input.body}, ${input.author ?? null}, ${input.link ?? null}, ${input.videoUrl ?? null},
      ${input.published}, ${attachmentsJson(attachments)}::jsonb,
      ${input.contentBlocks === undefined ? null : JSON.stringify(input.contentBlocks)}::jsonb,
      ${now}::timestamptz, ${now}::timestamptz
    )
    RETURNING id, slug, title, date, date_formatted, category, excerpt,
              image_url, image_file_name, image_mime_type, image_size,
              additional_images, additional_image_names, additional_image_meta,
              body, author, link, video_url, published, attachments, content_blocks, created_at, updated_at
  `;
  return rowToItem(row);
}

export async function updateNews(
  id: string,
  input: Partial<Omit<CreateNewsInput, "id">>
): Promise<ReturnType<typeof rowToItem> | null> {
  const existing = await getNewsById(id);
  if (!existing) return null;
  const mergedAttachments =
    input.attachments !== undefined ? parseAttachments(input.attachments) ?? [] : existing.attachments;
  const merged = {
    slug: input.slug ?? existing.slug,
    title: input.title ?? existing.title,
    date: input.date ?? existing.date,
    dateFormatted: input.dateFormatted ?? existing.dateFormatted,
    category: input.category ?? existing.category,
    excerpt: input.excerpt ?? existing.excerpt,
    imageUrl: input.imageUrl ?? existing.imageUrl,
    imageFileName: input.imageFileName !== undefined ? input.imageFileName : existing.imageFileName,
    imageMimeType: input.imageMimeType !== undefined ? input.imageMimeType : existing.imageMimeType,
    imageSize: input.imageSize !== undefined ? input.imageSize : existing.imageSize,
    additionalImages: input.additionalImages ?? existing.additionalImages,
    additionalImageNames: input.additionalImageNames ?? existing.additionalImageNames,
    additionalImageMeta: input.additionalImageMeta ?? existing.additionalImageMeta,
    body: input.body ?? existing.content,
    author: input.author !== undefined ? input.author : existing.author,
    link: input.link !== undefined ? input.link : existing.link,
    videoUrl: input.videoUrl !== undefined ? input.videoUrl : existing.videoUrl,
    published: input.published ?? existing.published,
    contentBlocks: input.contentBlocks ?? existing.contentBlocks,
  };
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<NewsRow[]>`
    UPDATE news SET
      slug = ${merged.slug}, title = ${merged.title}, date = ${merged.date}::date,
      date_formatted = ${merged.dateFormatted}, category = ${merged.category}, excerpt = ${merged.excerpt},
      image_url = ${merged.imageUrl}, image_file_name = ${merged.imageFileName ?? null},
      image_mime_type = ${merged.imageMimeType ?? null}, image_size = ${merged.imageSize ?? null},
      additional_images = ${sql.json(merged.additionalImages)},
      additional_image_names = ${sql.json(merged.additionalImageNames.map((name) => name ?? null))},
      additional_image_meta = ${sql.json(merged.additionalImageMeta)},
      body = ${merged.body}, author = ${merged.author ?? null}, link = ${merged.link ?? null},
      video_url = ${merged.videoUrl ?? null}, published = ${merged.published},
      attachments = ${attachmentsJson(mergedAttachments)}::jsonb,
      content_blocks = ${merged.contentBlocks === undefined ? null : JSON.stringify(merged.contentBlocks)}::jsonb,
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING id, slug, title, date, date_formatted, category, excerpt,
              image_url, image_file_name, image_mime_type, image_size,
              additional_images, additional_image_names, additional_image_meta,
              body, author, link, video_url, published, attachments, content_blocks, created_at, updated_at
  `;
  return row ? rowToItem(row) : null;
}

export async function deleteNews(id: string): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM news WHERE id = ${id}`;
  return result.count > 0;
}
