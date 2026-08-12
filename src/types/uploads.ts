export interface UploadedFileMeta {
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface BlobStorageUsage {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  fileCount: number;
  percent: number;
}

export interface BlobUploadResult extends UploadedFileMeta {
  url: string;
  pathname: string;
  storage?: BlobStorageUsage | null;
}
