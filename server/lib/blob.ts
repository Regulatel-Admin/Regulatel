import { del, list, put } from "@vercel/blob";

type UploadKind = "image" | "document";
type UploadFolder = "news" | "events" | "documents" | "attachments" | "gallery";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateUpload(
  kind: UploadKind,
  contentType: string,
  size: number
): { mimeType: string; maxBytes: number } {
  if (kind === "image") {
    if (!IMAGE_MIME_TYPES.has(contentType)) {
      throw new Error("Tipo de imagen no permitido.");
    }
    if (size > MAX_IMAGE_BYTES) {
      throw new Error("La imagen excede el tamaño máximo de 20 MB.");
    }
    return { mimeType: contentType, maxBytes: MAX_IMAGE_BYTES };
  }

  if (!DOCUMENT_MIME_TYPES.has(contentType)) {
    throw new Error("Tipo de documento no permitido.");
  }
  if (size > MAX_DOCUMENT_BYTES) {
    throw new Error("El documento excede el tamaño máximo de 20 MB.");
  }
  return { mimeType: contentType, maxBytes: MAX_DOCUMENT_BYTES };
}

function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Archivo inválido.");
  }
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function uploadToBlob(input: {
  kind: UploadKind;
  folder: UploadFolder;
  fileName: string;
  dataUrl: string;
}) {
  const { buffer, contentType } = parseDataUrl(input.dataUrl);
  validateUpload(input.kind, contentType, buffer.byteLength);

  const safeName = sanitizeFileName(input.fileName || "archivo");
  const pathname = `${input.folder}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    fileName: input.fileName,
    mimeType: contentType,
    size: buffer.byteLength,
  };
}

export async function deleteFromBlob(url: string) {
  await del(url);
}

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export type BlobListFolder = "news" | "events" | "gallery" | "all";

export interface BlobListItem {
  url: string;
  pathname: string;
  size?: number;
  uploadedAt?: Date;
}

export async function listBlobs(prefix?: BlobListFolder, limit = 100): Promise<BlobListItem[]> {
  const prefixPath = prefix && prefix !== "all" ? `${prefix}/` : undefined;
  const result = await list({
    prefix: prefixPath,
    limit,
  });
  return (result.blobs ?? []).map((b) => ({
    url: b.url,
    pathname: b.pathname ?? b.url,
    size: b.size,
    uploadedAt: b.uploadedAt,
  }));
}
