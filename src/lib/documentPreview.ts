export type DocumentPreviewTarget = {
  url: string;
  title: string;
  fileType?: string;
  fileName?: string;
};

function documentPath(url: string): string {
  const path = url.split("?")[0].split("#")[0];
  try {
    return decodeURIComponent(path).toLowerCase();
  } catch {
    return path.toLowerCase();
  }
}

export function isPdfDocument(url: string, fileType?: string, fileName?: string): boolean {
  const type = (fileType ?? "").toLowerCase();
  const path = documentPath(fileName || url);
  return type.includes("pdf") || path.endsWith(".pdf");
}

export function isDocxDocument(url: string, fileType?: string, fileName?: string): boolean {
  const type = (fileType ?? "").toLowerCase();
  const path = documentPath(fileName || url);
  return (
    type.includes("wordprocessingml") ||
    type.includes("officedocument.word") ||
    path.endsWith(".docx")
  );
}

export function canPreviewDocument(url: string, fileType?: string, fileName?: string): boolean {
  return isPdfDocument(url, fileType, fileName) || isDocxDocument(url, fileType, fileName);
}
