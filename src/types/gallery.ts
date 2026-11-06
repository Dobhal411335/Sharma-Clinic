export type GalleryMediaType = "image" | "video" | "text_card";

export type GalleryItem = {
  id: string;
  siteCode: "IN" | "COM";
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
