export interface UploadedFileMeta {
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface BlobUploadResult extends UploadedFileMeta {
  url: string;
  pathname: string;
}
