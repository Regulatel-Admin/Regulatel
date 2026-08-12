import { api } from "@/lib/api";
import type { BlobUploadResult } from "@/types/uploads";
import { emitBlobOptimistic, emitBlobStorage, emitBlobStorageRefresh } from "@/lib/blobStorage";

type UploadKind = "image" | "document";
export type UploadFolder = "news" | "events" | "documents" | "attachments" | "gallery";

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
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
  // Las funciones serverless de Vercel limitan el cuerpo de la petición a ~4,5 MB.
  // El archivo viaja codificado en base64 (~33% más grande), así que el tamaño
  // real máximo del archivo es ~3 MB. Por encima de eso, Vercel responde con un
  // error de plataforma en texto plano y la app muestra "respuesta no es JSON válido".
  const maxBytes = 3 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      isImage
        ? "Solo se permiten imágenes JPG, PNG o WEBP."
        : "Solo se permiten PDF, Word (DOC/DOCX) o Excel (XLS/XLSX)."
    );
  }

  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `El archivo pesa ${sizeMb} MB y supera el límite de 3 MB para subidas desde el panel. ` +
        "Comprime el PDF (o reduce la imagen) y vuelve a intentarlo. " +
        "Si el archivo es más grande, usa «Ya tengo un enlace» y pega el enlace público."
    );
  }
}

export async function uploadAdminFile(input: {
  file: File;
  kind: UploadKind;
  folder: UploadFolder;
}): Promise<BlobUploadResult> {
  validateClientFile(input.file, input.kind);
  emitBlobOptimistic(input.file.size);
  const dataUrl = await fileToDataUrl(input.file);
  const result = await api.uploads.upload({
    kind: input.kind,
    folder: input.folder,
    fileName: input.file.name,
    dataUrl,
  });

  if (!result.ok) {
    emitBlobStorageRefresh();
    throw new Error(result.error);
  }

  const uploaded = result.data as BlobUploadResult;
  if (uploaded.storage) {
    emitBlobStorage(uploaded.storage, input.file.size);
  } else {
    emitBlobStorageRefresh();
  }
  return uploaded;
}

export async function deleteAdminFile(url: string): Promise<void> {
  const result = await api.uploads.delete({ url });
  emitBlobStorageRefresh();
  if (!result.ok) {
    throw new Error(result.error);
  }
}

export function isBlobUrl(url: string) {
  return /blob\.vercel-storage\.com/i.test(url);
}
