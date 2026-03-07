import { getDb } from "./db.js";

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
  created_at: string;
  updated_at: string;
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
    additionalImages: Array.isArray(r.additional_images) ? r.additional_images : [],
    additionalImageNames: Array.isArray(r.additional_image_names) ? r.additional_image_names : [],
    additionalImageMeta: Array.isArray(r.additional_image_meta) ? r.additional_image_meta : [],
    content: r.body,
    author: r.author ?? undefined,
    link: r.link ?? undefined,
    videoUrl: r.video_url ?? undefined,
    published: r.published,
  };
}

export async function listNews(): Promise<ReturnType<typeof rowToItem>[]> {
  const sql = getDb();
  const rows = await sql<NewsRow[]>`
    SELECT id, slug, title, date, date_formatted, category, excerpt,
           image_url, image_file_name, image_mime_type, image_size,
           additional_images, additional_image_names, additional_image_meta,
           body, author, link, video_url, published, created_at, updated_at
    FROM news
    ORDER BY date DESC
  `;
  return rows.map(rowToItem);
}

export async function getNewsById(id: string): Promise<ReturnType<typeof rowToItem> | null> {
  const sql = getDb();
  const [row] = await sql<NewsRow[]>`
    SELECT id, slug, title, date, date_formatted, category, excerpt,
           image_url, image_file_name, image_mime_type, image_size,
           additional_images, additional_image_names, additional_image_meta,
           body, author, link, video_url, published, created_at, updated_at
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
}

export async function createNews(input: CreateNewsInput): Promise<ReturnType<typeof rowToItem>> {
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<NewsRow[]>`
    INSERT INTO news (
      id, slug, title, date, date_formatted, category, excerpt,
      image_url, image_file_name, image_mime_type, image_size,
      additional_images, additional_image_names, additional_image_meta,
      body, author, link, video_url, published, created_at, updated_at
    ) VALUES (
      ${input.id}, ${input.slug}, ${input.title}, ${input.date}, ${input.dateFormatted},
      ${input.category}, ${input.excerpt}, ${input.imageUrl}, ${input.imageFileName ?? null},
      ${input.imageMimeType ?? null}, ${input.imageSize ?? null},
      ${JSON.stringify(input.additionalImages ?? [])}, ${JSON.stringify(input.additionalImageNames ?? [])},
      ${JSON.stringify(input.additionalImageMeta ?? [])},
      ${input.body}, ${input.author ?? null}, ${input.link ?? null}, ${input.videoUrl ?? null},
      ${input.published}, ${now}::timestamptz, ${now}::timestamptz
    )
    RETURNING id, slug, title, date, date_formatted, category, excerpt,
              image_url, image_file_name, image_mime_type, image_size,
              additional_images, additional_image_names, additional_image_meta,
              body, author, link, video_url, published, created_at, updated_at
  `;
  return rowToItem(row);
}

export async function updateNews(
  id: string,
  input: Partial<Omit<CreateNewsInput, "id">>
): Promise<ReturnType<typeof rowToItem> | null> {
  const existing = await getNewsById(id);
  if (!existing) return null;
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
  };
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<NewsRow[]>`
    UPDATE news SET
      slug = ${merged.slug}, title = ${merged.title}, date = ${merged.date}::date,
      date_formatted = ${merged.dateFormatted}, category = ${merged.category}, excerpt = ${merged.excerpt},
      image_url = ${merged.imageUrl}, image_file_name = ${merged.imageFileName ?? null},
      image_mime_type = ${merged.imageMimeType ?? null}, image_size = ${merged.imageSize ?? null},
      additional_images = ${JSON.stringify(merged.additionalImages)}::jsonb,
      additional_image_names = ${JSON.stringify(merged.additionalImageNames)}::jsonb,
      additional_image_meta = ${JSON.stringify(merged.additionalImageMeta)}::jsonb,
      body = ${merged.body}, author = ${merged.author ?? null}, link = ${merged.link ?? null},
      video_url = ${merged.videoUrl ?? null}, published = ${merged.published},
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING id, slug, title, date, date_formatted, category, excerpt,
              image_url, image_file_name, image_mime_type, image_size,
              additional_images, additional_image_names, additional_image_meta,
              body, author, link, video_url, published, created_at, updated_at
  `;
  return row ? rowToItem(row) : null;
}

export async function deleteNews(id: string): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM news WHERE id = ${id}`;
  return result.count > 0;
}
