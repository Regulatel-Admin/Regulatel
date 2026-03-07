import { api } from "@/lib/api";
import type { BlobUploadResult } from "@/types/uploads";

type UploadKind = "image" | "document";
type UploadFolder = "news" | "events" | "documents" | "attachments";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function validateClientFile(file: File, kind: UploadKind) {
  const isImage = kind === "image";
  const allowedTypes = isImage
    ? ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    : [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
  const maxBytes = isImage ? 8 * 1024 * 1024 : 20 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      isImage
        ? "Solo se permiten imágenes JPG, PNG o WEBP."
        : "Solo se permiten PDF, DOC o DOCX."
    );
  }

  if (file.size > maxBytes) {
    throw new Error(
      isImage
        ? "La imagen supera el tamaño máximo de 8 MB."
        : "El documento supera el tamaño máximo de 20 MB."
    );
  }
}

export async function uploadAdminFile(input: {
  file: File;
  kind: UploadKind;
  folder: UploadFolder;
}): Promise<BlobUploadResult> {
  validateClientFile(input.file, input.kind);
  const dataUrl = await fileToDataUrl(input.file);
  const result = await api.uploads.upload({
    kind: input.kind,
    folder: input.folder,
    fileName: input.file.name,
    dataUrl,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.data as BlobUploadResult;
}

export async function deleteAdminFile(url: string): Promise<void> {
  const result = await api.uploads.delete({ url });
  if (!result.ok) {
    throw new Error(result.error);
  }
}

export function isBlobUrl(url: string) {
  return /blob\.vercel-storage\.com/i.test(url);
}
