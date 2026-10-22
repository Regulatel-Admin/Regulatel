import type { AdminNewsItem } from "@/contexts/AdminDataContext";
import type { ContentBlock } from "@/types/contentBlocks";

/** Build an editable view without changing a legacy article in storage. */
export function legacyNewsBlocks(row: AdminNewsItem, imageOrder = [row.imageUrl, ...(row.additionalImages ?? [])]): ContentBlock[] {
  const imageMetadata = [row.imageUrl, ...(row.additionalImages ?? [])].map((url, index) => ({
    url,
    fileName: index === 0 ? row.imageFileName : row.additionalImageNames?.[index - 1] ?? row.additionalImageMeta?.[index - 1]?.fileName,
    fileType: index === 0 ? row.imageMimeType : row.additionalImageMeta?.[index - 1]?.mimeType,
    fileSize: index === 0 ? row.imageSize : row.additionalImageMeta?.[index - 1]?.size,
  }));
  return [
    ...imageOrder.filter(Boolean).map((url, index) => {
      const metadata = imageMetadata.find(image => image.url === url);
      return { id: `news-image-${index}`, type: "image" as const, url, fileName: metadata?.fileName, fileType: metadata?.fileType, fileSize: metadata?.fileSize };
    }),
    ...row.content.split(/\n\n+/).filter(Boolean).map((text, index) => ({
      id: `news-text-${index}`, type: "text" as const, text,
    })),
    ...(row.attachments ?? []).map((document, index) => ({
      id: document.id || `news-document-${index}`, type: "document" as const, url: document.url, title: document.title,
      fileName: document.fileName, fileType: document.fileType, fileSize: document.fileSize,
    })),
  ];
}

/** Keep legacy fields usable by listings and retain metadata for every existing asset. */
export function newsVisualPayload(row: AdminNewsItem, legacyImageOrder?: string[]): AdminNewsItem {
  if (row.contentBlocks === undefined) return { ...row };
  const previousImages = [row.imageUrl, ...(row.additionalImages ?? [])].map((url, index) => ({
    url,
    fileName: index === 0 ? row.imageFileName : row.additionalImageNames?.[index - 1] ?? row.additionalImageMeta?.[index - 1]?.fileName,
    mimeType: index === 0 ? row.imageMimeType : row.additionalImageMeta?.[index - 1]?.mimeType,
    size: index === 0 ? row.imageSize : row.additionalImageMeta?.[index - 1]?.size,
  }));
  const imageBlocks = row.contentBlocks.filter(block => block.type === "image" && block.url?.trim());
  const images = imageBlocks.map(block => {
    const previous = previousImages.find(image => image.url === block.url);
    return { url: block.url!, fileName: block.fileName ?? previous?.fileName, mimeType: block.fileType ?? previous?.mimeType, size: block.fileSize ?? previous?.size };
  });
  const imageOrder = JSON.stringify(images.map(image => image.url));
  const changedImageMetadata = imageBlocks.some(block => {
    const previous = previousImages.find(image => image.url === block.url);
    return previous && ((block.fileName !== undefined && block.fileName !== previous.fileName)
      || (block.fileType !== undefined && block.fileType !== previous.mimeType)
      || (block.fileSize !== undefined && block.fileSize !== previous.size));
  });
  const sameImages = !changedImageMetadata && (imageOrder === JSON.stringify(previousImages.filter(image => image.url).map(image => image.url))
    || (legacyImageOrder !== undefined && imageOrder === JSON.stringify(legacyImageOrder)));
  const documentIds = new Map<string, string>();
  const attachments = row.contentBlocks.filter(block => block.type === "document" && block.url?.trim()).map(block => {
    const legacyIndex = /^news-document-(\d+)$/.exec(block.id);
    const previous = row.attachments?.find(document => document.id === block.id)
      ?? row.attachments?.find(document => document.url === block.url)
      ?? (legacyIndex ? row.attachments?.[Number(legacyIndex[1])] : undefined);
    const id = previous?.id ?? block.id;
    documentIds.set(block.id, id);
    return { ...previous, id, title: block.title?.trim() || previous?.title || "Documento", url: block.url!,
      fileName: block.fileName ?? previous?.fileName, fileType: block.fileType ?? previous?.fileType, fileSize: block.fileSize ?? previous?.fileSize };
  });
  return {
    ...row,
    contentBlocks: row.contentBlocks.map(block => block.type === "document" && documentIds.has(block.id) ? { ...block, id: documentIds.get(block.id)! } : block),
    content: row.contentBlocks.filter(block => block.type === "text" || block.type === "heading")
      .map(block => block.type === "heading" ? `**${block.text ?? ""}**` : block.text ?? "").join("\n\n"),
    ...(sameImages ? {} : {
      imageUrl: images[0]?.url ?? "",
      imageFileName: images[0]?.fileName,
      imageMimeType: images[0]?.mimeType,
      imageSize: images[0]?.size,
      additionalImages: images.slice(1).map(image => image.url),
      additionalImageNames: images.slice(1).map(image => image.fileName),
      additionalImageMeta: images.slice(1).map(({ fileName, mimeType, size }) => ({ fileName, mimeType, size })),
    }),
    attachments,
  };
}
