import { getDb } from "./db.js";

export interface DocumentRow {
  id: string;
  title: string;
  url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  year: string | null;
  quarter: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

function rowToDoc(r: DocumentRow) {
  return {
    id: r.id,
    title: r.title,
    url: r.url,
    fileName: r.file_name ?? undefined,
    fileType: r.file_type ?? undefined,
    fileSize: r.file_size ?? undefined,
    year: r.year ?? undefined,
    quarter: r.quarter ?? undefined,
    category: r.category,
  };
}

export async function listDocuments(): Promise<ReturnType<typeof rowToDoc>[]> {
  const sql = getDb();
  const rows = await sql<DocumentRow[]>`
    SELECT id, title, url, file_name, file_type, file_size, year, quarter, category, created_at, updated_at
    FROM documents
    ORDER BY year DESC NULLS LAST, title
  `;
  return rows.map(rowToDoc);
}

export async function getDocumentById(id: string): Promise<ReturnType<typeof rowToDoc> | null> {
  const sql = getDb();
  const [row] = await sql<DocumentRow[]>`
    SELECT id, title, url, file_name, file_type, file_size, year, quarter, category, created_at, updated_at
    FROM documents WHERE id = ${id}
  `;
  return row ? rowToDoc(row) : null;
}

export interface CreateDocumentInput {
  id: string;
  title: string;
  url: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  year?: string;
  quarter?: string;
  category: string;
}

export async function createDocument(input: CreateDocumentInput): Promise<ReturnType<typeof rowToDoc>> {
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<DocumentRow[]>`
    INSERT INTO documents (
      id, title, url, file_name, file_type, file_size, year, quarter, category, created_at, updated_at
    )
    VALUES (
      ${input.id}, ${input.title}, ${input.url},
      ${input.fileName ?? null}, ${input.fileType ?? null}, ${input.fileSize ?? null},
      ${input.year ?? null}, ${input.quarter ?? null}, ${input.category},
      ${now}::timestamptz, ${now}::timestamptz
    )
    RETURNING id, title, url, file_name, file_type, file_size, year, quarter, category, created_at, updated_at
  `;
  return rowToDoc(row);
}

export async function updateDocument(
  id: string,
  input: Partial<Omit<CreateDocumentInput, "id">>
): Promise<ReturnType<typeof rowToDoc> | null> {
  const existing = await getDocumentById(id);
  if (!existing) return null;
  const merged = {
    title: input.title ?? existing.title,
    url: input.url ?? existing.url,
    fileName: input.fileName !== undefined ? input.fileName : existing.fileName,
    fileType: input.fileType !== undefined ? input.fileType : existing.fileType,
    fileSize: input.fileSize !== undefined ? input.fileSize : existing.fileSize,
    year: input.year !== undefined ? input.year : existing.year,
    quarter: input.quarter !== undefined ? input.quarter : existing.quarter,
    category: input.category ?? existing.category,
  };
  const sql = getDb();
  const now = new Date().toISOString();
  const [row] = await sql<DocumentRow[]>`
    UPDATE documents SET
      title = ${merged.title}, url = ${merged.url},
      file_name = ${merged.fileName ?? null}, file_type = ${merged.fileType ?? null},
      file_size = ${merged.fileSize ?? null}, year = ${merged.year ?? null},
      quarter = ${merged.quarter ?? null}, category = ${merged.category},
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING id, title, url, file_name, file_type, file_size, year, quarter, category, created_at, updated_at
  `;
  return row ? rowToDoc(row) : null;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const sql = getDb();
  const result = await sql`DELETE FROM documents WHERE id = ${id}`;
  return result.count > 0;
}
