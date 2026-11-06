import type { SiteCode } from "@/types/admin/auth";

export type GalleryMediaType = "image" | "video" | "text_card";

export type GalleryItemDto = {
  id: string;
  siteCode: SiteCode;
  mediaType: GalleryMediaType;
  mediaUrl: string;
  mediaPublicId: string;
  clickUrl: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GalleryItemFormValues = {
  mediaType: GalleryMediaType;
  mediaUrl: string;
  mediaPublicId: string;
  clickUrl: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type GalleryItemPayload = {
  mediaType: GalleryMediaType;
  mediaUrl: string;
  mediaPublicId: string;
  clickUrl: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

/** Local object-URL preview shown in the grid while Cloudinary upload is in flight. */
export type GalleryPendingUpload = {
  id: string;
  fileName: string;
  mediaType: Exclude<GalleryMediaType, "text_card">;
  previewUrl: string;
};
