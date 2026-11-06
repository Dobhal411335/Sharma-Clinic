import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export type UploadOperationType = "single-image" | "multiple-images" | "single-pdf" | "single-video";
export type DeleteResourceType = "image" | "pdf";

export type UploadedAsset = {
  publicId: string;
  url: string;
  secureUrl: string;
  bytes: number;
  resourceType: string;
  format: string;
};

export type BulkUploadResult = {
  successful: UploadedAsset[];
  failed: { file: string; error: string }[];
};

export type DeleteAssetResult = {
  success: boolean;
  publicId: string;
  result: string;
};

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

export class CloudinaryError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(
    message: string,
    options?: { statusCode?: number; code?: string; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = "CloudinaryError";
    this.statusCode = options?.statusCode ?? 502;
    this.code = options?.code ?? "CLOUDINARY_ERROR";
  }
}

function client() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryError("Cloudinary is not configured.", {
      statusCode: 500,
      code: "CLOUDINARY_NOT_CONFIGURED",
    });
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

async function toBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

function assertFile(
  file: File,
  allowed: (file: File) => boolean,
  maxBytes: number,
  label: string,
): void {
  if (!allowed(file)) {
    throw new CloudinaryError(`${label} file type is not allowed.`, {
      statusCode: 400,
      code: "INVALID_FILE_TYPE",
    });
  }
  if (file.size > maxBytes) {
    throw new CloudinaryError(`${label} is too large.`, {
      statusCode: 400,
      code: "FILE_TOO_LARGE",
    });
  }
}

function toAsset(result: UploadApiResponse): UploadedAsset {
  return {
    publicId: result.public_id,
    url: result.secure_url,
    secureUrl: result.secure_url,
    bytes: result.bytes,
    resourceType: result.resource_type,
    format: result.format ?? "",
  };
}

function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; resourceType: "image" | "raw" | "video"; publicId?: string },
): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        public_id: options.publicId,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new CloudinaryError("Upload failed.", {
              cause: error,
            }),
          );
          return;
        }
        resolve(toAsset(result));
      },
    );
    stream.end(buffer);
  });
}

export async function uploadSingleImage(file: File): Promise<UploadedAsset> {
  assertFile(file, (item) => IMAGE_TYPES.has(item.type), MAX_IMAGE_BYTES, "Image");
  return uploadBuffer(await toBuffer(file), {
    folder: "sharma-clinic/images",
    resourceType: "image",
  });
}

export async function uploadMultipleImages(files: File[]): Promise<BulkUploadResult> {
  const successful: UploadedAsset[] = [];
  const failed: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      successful.push(await uploadSingleImage(file));
    } catch (error) {
      failed.push({
        file: file.name,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
  return { successful, failed };
}

export async function uploadSinglePdf(file: File): Promise<UploadedAsset> {
  assertFile(
    file,
    (item) => item.type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf"),
    MAX_PDF_BYTES,
    "PDF",
  );
  const base = file.name.replace(/\.pdf$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "document";
  return uploadBuffer(await toBuffer(file), {
    folder: "sharma-clinic/documents",
    resourceType: "raw",
    publicId: `${base}-${Date.now().toString(36)}.pdf`,
  });
}

export async function uploadSingleVideo(file: File): Promise<UploadedAsset> {
  assertFile(file, (item) => item.type.startsWith("video/"), MAX_VIDEO_BYTES, "Video");
  return uploadBuffer(await toBuffer(file), {
    folder: "sharma-clinic/videos",
    resourceType: "video",
  });
}

async function destroy(
  publicId: string,
  resourceType: "image" | "raw" | "video",
): Promise<DeleteAssetResult> {
  const trimmed = publicId.trim();
  if (!trimmed) {
    throw new CloudinaryError("key (Cloudinary public_id) is required.", {
      statusCode: 400,
      code: "KEY_REQUIRED",
    });
  }

  const result = await client().uploader.destroy(trimmed, {
    resource_type: resourceType,
    invalidate: true,
  });
  const value = typeof result?.result === "string" ? result.result : "error";
  return {
    success: value === "ok" || value === "not found",
    publicId: trimmed,
    result: value,
  };
}

export function deleteSingleImage(publicId: string): Promise<DeleteAssetResult> {
  return destroy(publicId, "image");
}

export function deleteSinglePdf(publicId: string): Promise<DeleteAssetResult> {
  return destroy(publicId, "raw");
}

export async function deleteStoredCloudinaryAssetBestEffort(publicId: string): Promise<void> {
  const trimmed = publicId.trim();
  if (!trimmed) return;
  try {
    await deleteSingleImage(trimmed);
  } catch {
    // Replacing a logo should still save if the old asset is already gone.
  }
}
