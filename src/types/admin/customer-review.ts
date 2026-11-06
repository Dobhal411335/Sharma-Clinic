import type { SiteCode } from "@/types/admin/auth";

export type CustomerReviewDto = {
  id: string;
  siteCode: SiteCode;
  customerName: string;
  designation: string;
  description: string;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerReviewFormValues = {
  customerName: string;
  designation: string;
  description: string;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  active: boolean;
  order: string;
};

export type CustomerReviewPayload = {
  customerName: string;
  designation: string;
  description: string;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  active: boolean;
  order?: number;
};
