import {
  assertOwnedPublicId,
  destroyCloudinaryAsset,
} from "./cloudinary-client";
import { IMAGE_FOLDER, type CloudinaryDeleteResult } from "./types";

export async function deleteSingleImage(
  key: string,
): Promise<CloudinaryDeleteResult> {
  const publicId = assertOwnedPublicId(key, IMAGE_FOLDER);
  const { result } = await destroyCloudinaryAsset({
    key: publicId,
    resourceType: "image",
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
