import type { SiteCode } from "@/types/admin/auth";

export type SocialPostType = "instagram" | "facebook";

export type SocialPostDto = {
  id: string;
  siteCode: SiteCode;
  postType: SocialPostType;
  imageUrl: string;
  imagePublicId: string;
  postUrl: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type SocialPostFormValues = {
  postType: SocialPostType;
  imageUrl: string;
  imagePublicId: string;
  postUrl: string;
  active: boolean;
  order: string;
};

export type SocialPostPayload = {
  postType: SocialPostType;
  imageUrl: string;
  imagePublicId: string;
  postUrl: string;
  active: boolean;
  order?: number;
};
