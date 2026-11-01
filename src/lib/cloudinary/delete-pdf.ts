import {
  assertOwnedPublicId,
  destroyCloudinaryAsset,
} from "./cloudinary-client";
import { PDF_FOLDER, type CloudinaryDeleteResult } from "./types";

export async function deleteSinglePdf(
  key: string,
): Promise<CloudinaryDeleteResult> {
  const publicId = assertOwnedPublicId(key, PDF_FOLDER);
  const { result } = await destroyCloudinaryAsset({
    key: publicId,
    resourceType: "raw",
  });

  if (result === "ok" || result === "not found") {
    return {
      success: result === "ok",
      key: publicId,
    };
  }

  return {
    success: false,
    key: publicId,
  };
}
