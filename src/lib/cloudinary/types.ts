export interface CloudinaryUploadResult {
  url: string;
  key: string;
}

export interface CloudinaryMultipleUploadResult {
  successful: CloudinaryUploadResult[];
  failed: {
    fileName: string;
    error: string;
  }[];
}

export interface CloudinaryDeleteResult {
  success: boolean;
  key: string;
}

export type UploadOperationType =
  | "single-image"
  | "multiple-images"
  | "single-pdf";

export type DeleteResourceType = "image" | "pdf";

export type ImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type PdfMimeType = "application/pdf";

export const IMAGE_FOLDER = "sharma-clinic/images" as const;
export const PDF_FOLDER = "sharma-clinic/documents" as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_MULTIPLE_IMAGES = 10;
export const UPLOAD_CONCURRENCY = 3;

export const ALLOWED_IMAGE_MIME_TYPES: readonly ImageMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export class CloudinaryError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = "CloudinaryError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
