import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import {
  logExternalServiceError,
  logPerformance,
  logger,
} from "@/lib/logger";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  CloudinaryError,
  IMAGE_FOLDER,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  PDF_FOLDER,
  type CloudinaryUploadResult,
  type ImageMimeType,
} from "./types";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

let cloudinaryConfigured = false;

function readCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryError(
      "Cloudinary is not configured.",
      "CLOUDINARY_CONFIG_MISSING",
      500,
    );
  }

  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryClient() {
  if (!cloudinaryConfigured) {
    const config = readCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    cloudinaryConfigured = true;
  }

  return cloudinary;
}

export function toUploadResult(
  result: UploadApiResponse,
): CloudinaryUploadResult {
  const url = result.secure_url;
  const key = result.public_id;

  if (!url || !key) {
    throw new CloudinaryError(
      "Cloudinary returned an incomplete upload response.",
      "CLOUDINARY_INCOMPLETE_RESPONSE",
      502,
    );
  }

  return { url, key };
}

export function sanitizeProviderError(error: unknown): string {
  if (error instanceof CloudinaryError) {
    return error.message;
  }

  return "Media operation failed.";
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function matchesSignature(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) {
    return false;
  }

  return signature.every((byte, index) => buffer[index] === byte);
}

export function detectImageMimeType(buffer: Buffer): ImageMimeType | null {
  if (matchesSignature(buffer, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (
    matchesSignature(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-";
}

export function assertImageFile(file: File, buffer: Buffer): ImageMimeType {
  if (file.size <= 0 || buffer.length <= 0) {
    throw new CloudinaryError("Image file is empty.", "EMPTY_FILE");
  }

  if (file.size > MAX_IMAGE_BYTES || buffer.length > MAX_IMAGE_BYTES) {
    throw new CloudinaryError(
      "Image exceeds the 5 MB size limit.",
      "FILE_TOO_LARGE",
      413,
    );
  }

  const detectedMime = detectImageMimeType(buffer);
  if (!detectedMime) {
    throw new CloudinaryError(
      "Only JPEG, PNG, and WEBP images are allowed.",
      "INVALID_IMAGE_TYPE",
    );
  }

  const declaredMime = file.type.toLowerCase();
  const normalizedDeclared =
    declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;

  if (
    normalizedDeclared &&
    !ALLOWED_IMAGE_MIME_TYPES.includes(normalizedDeclared as ImageMimeType)
  ) {
    throw new CloudinaryError(
      "Only JPEG, PNG, and WEBP images are allowed.",
      "INVALID_IMAGE_TYPE",
    );
  }

  if (normalizedDeclared && normalizedDeclared !== detectedMime) {
    throw new CloudinaryError(
      "Image content does not match the declared file type.",
      "MIME_MISMATCH",
    );
  }

  return detectedMime;
}

export function assertPdfFile(file: File, buffer: Buffer): void {
  if (file.size <= 0 || buffer.length <= 0) {
    throw new CloudinaryError("PDF file is empty.", "EMPTY_FILE");
  }

  if (file.size > MAX_PDF_BYTES || buffer.length > MAX_PDF_BYTES) {
    throw new CloudinaryError(
      "PDF exceeds the 10 MB size limit.",
      "FILE_TOO_LARGE",
      413,
    );
  }

  const declaredMime = file.type.toLowerCase();
  if (declaredMime && declaredMime !== "application/pdf") {
    throw new CloudinaryError(
      "Only PDF files are allowed.",
      "INVALID_PDF_TYPE",
    );
  }

  if (!isPdfBuffer(buffer)) {
    throw new CloudinaryError(
      "File content is not a valid PDF.",
      "INVALID_PDF_SIGNATURE",
    );
  }
}

function isSafePublicIdSegment(segment: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(segment);
}

export function assertOwnedPublicId(
  key: string,
  folder: typeof IMAGE_FOLDER | typeof PDF_FOLDER,
): string {
  const trimmed = key.trim();

  if (!trimmed) {
    throw new CloudinaryError("Public ID is required.", "INVALID_PUBLIC_ID");
  }

  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.startsWith("/") ||
    trimmed.endsWith("/")
  ) {
    throw new CloudinaryError("Invalid public ID.", "INVALID_PUBLIC_ID");
  }

  if (!trimmed.startsWith(`${folder}/`)) {
    throw new CloudinaryError(
      "Public ID is outside the allowed Cloudinary folder.",
      "PUBLIC_ID_OUT_OF_SCOPE",
      403,
    );
  }

  const remainder = trimmed.slice(folder.length + 1);
  if (!remainder) {
    throw new CloudinaryError("Invalid public ID.", "INVALID_PUBLIC_ID");
  }

  const segments = remainder.split("/");
  if (segments.some((segment) => !segment || !isSafePublicIdSegment(segment))) {
    throw new CloudinaryError("Invalid public ID.", "INVALID_PUBLIC_ID");
  }

  return trimmed;
}

export async function uploadBufferToCloudinary(options: {
  buffer: Buffer;
  folder: typeof IMAGE_FOLDER | typeof PDF_FOLDER;
  resourceType: "image" | "raw";
  originalFileName?: string;
}): Promise<CloudinaryUploadResult> {
  const client = getCloudinaryClient();
  const started = Date.now();

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = client.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType,
          overwrite: false,
          unique_filename: true,
          use_filename: false,
          type: "upload",
          ...(options.originalFileName
            ? { filename_override: options.originalFileName }
            : {}),
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(
              new CloudinaryError(
                "Upload to Cloudinary failed.",
                "CLOUDINARY_UPLOAD_FAILED",
                502,
              ),
            );
            return;
          }

          resolve(uploadResult);
        },
      );

      stream.end(options.buffer);
    });

    const uploaded = toUploadResult(result);
    logPerformance({
      kind: "external",
      operation: "cloudinary.upload",
      durationMs: Date.now() - started,
      module: "cloudinary",
      meta: { folder: options.folder, resourceType: options.resourceType },
    });
    logger.info("Cloudinary upload completed", {
      module: "cloudinary",
      function: "uploadBufferToCloudinary",
      meta: { key: uploaded.key, resourceType: options.resourceType },
    });
    return uploaded;
  } catch (error) {
    logExternalServiceError("cloudinary", error, {
      module: "cloudinary",
      function: "uploadBufferToCloudinary",
      durationMs: Date.now() - started,
    });
    throw error;
  }
}

export async function destroyCloudinaryAsset(options: {
  key: string;
  resourceType: "image" | "raw";
}): Promise<{ result: string }> {
  const client = getCloudinaryClient();
  const started = Date.now();

  try {
    const response = await client.uploader.destroy(options.key, {
      resource_type: options.resourceType,
      invalidate: true,
      type: "upload",
    });

    const result =
      typeof response === "object" &&
      response !== null &&
      "result" in response &&
      typeof response.result === "string"
        ? response.result
        : "error";

    logPerformance({
      kind: "external",
      operation: "cloudinary.destroy",
      durationMs: Date.now() - started,
      module: "cloudinary",
      meta: { resourceType: options.resourceType },
    });

    return { result };
  } catch (error) {
    logExternalServiceError("cloudinary", error, {
      module: "cloudinary",
      function: "destroyCloudinaryAsset",
      durationMs: Date.now() - started,
    });
    throw new CloudinaryError(
      "Delete from Cloudinary failed.",
      "CLOUDINARY_DELETE_FAILED",
      502,
    );
  }
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const limit = Math.max(1, concurrency);
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}
