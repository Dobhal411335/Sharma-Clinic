export type SocialPostType = "instagram" | "facebook";

export type SocialPost = {
  id: string;
  siteCode: "IN" | "COM";
  postType: SocialPostType;
  imageUrl: string;
  imagePublicId: string;
  postUrl: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};
