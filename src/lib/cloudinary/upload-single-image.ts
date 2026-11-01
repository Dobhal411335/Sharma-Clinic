import {
  assertImageFile,
  fileToBuffer,
  uploadBufferToCloudinary,
} from "./cloudinary-client";
import { IMAGE_FOLDER, type CloudinaryUploadResult } from "./types";

export async function uploadSingleImage(
  file: File,
): Promise<CloudinaryUploadResult> {
  const buffer = await fileToBuffer(file);
  assertImageFile(file, buffer);

  return uploadBufferToCloudinary({
    buffer,
    folder: IMAGE_FOLDER,
    resourceType: "image",
  });
}
