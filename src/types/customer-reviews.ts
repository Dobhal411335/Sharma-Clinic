export type CustomerReview = {
  id: string;
  siteCode: "IN" | "COM";
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
