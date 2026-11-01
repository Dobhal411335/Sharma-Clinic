import {
  assertImageFile,
  fileToBuffer,
  mapWithConcurrency,
  sanitizeProviderError,
  uploadBufferToCloudinary,
} from "./cloudinary-client";
import {
  CloudinaryError,
  IMAGE_FOLDER,
  MAX_MULTIPLE_IMAGES,
  UPLOAD_CONCURRENCY,
  type CloudinaryMultipleUploadResult,
} from "./types";

export async function uploadMultipleImages(
  files: File[],
): Promise<CloudinaryMultipleUploadResult> {
  if (!Array.isArray(files) || files.length === 0) {
    throw new CloudinaryError(
      "At least one image file is required.",
      "NO_FILES",
    );
  }

  if (files.length > MAX_MULTIPLE_IMAGES) {
    throw new CloudinaryError(
      `A maximum of ${MAX_MULTIPLE_IMAGES} images can be uploaded at once.`,
      "TOO_MANY_FILES",
    );
  }

  const outcomes = await mapWithConcurrency(
    files,
    UPLOAD_CONCURRENCY,
    async (file) => {
      try {
        const buffer = await fileToBuffer(file);
        assertImageFile(file, buffer);
        const uploaded = await uploadBufferToCloudinary({
          buffer,
          folder: IMAGE_FOLDER,
          resourceType: "image",
        });

        return {
          status: "success" as const,
          value: uploaded,
        };
      } catch (error) {
        return {
          status: "failure" as const,
          fileName: file.name || "unnamed-file",
          error: sanitizeProviderError(error),
        };
      }
    },
  );

  const successful: CloudinaryMultipleUploadResult["successful"] = [];
  const failed: CloudinaryMultipleUploadResult["failed"] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "success") {
      successful.push(outcome.value);
    } else {
      failed.push({
        fileName: outcome.fileName,
        error: outcome.error,
      });
    }
  }

  return { successful, failed };
}
