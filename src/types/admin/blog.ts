import type { SiteCode } from "@/types/admin/auth";

export type BlogAccordionItem = {
  question: string;
  description: string;
};

export type BlogDto = {
  id: string;
  siteCode: SiteCode;
  name: string;
  slug: string;
  category: string;
  badgeText: string;
  stat1Number: string;
  stat1Name: string;
  stat1Text: string;
  stat2Number: string;
  stat2Name: string;
  stat2Text: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  blockquote: string;
  accordionItems: BlogAccordionItem[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogCreatePayload = {
  name: string;
  category: string;
  badgeText: string;
  stat1Number: string;
  stat1Name: string;
  stat1Text: string;
  stat2Number: string;
  stat2Name: string;
  stat2Text: string;
  slug?: string;
  active?: boolean;
};

export type BlogUpdatePayload = {
  name: string;
  slug: string;
  category: string;
  badgeText: string;
  stat1Number: string;
  stat1Name: string;
  stat1Text: string;
  stat2Number: string;
  stat2Name: string;
  stat2Text: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  blockquote: string;
  accordionItems: BlogAccordionItem[];
  active: boolean;
};

export type BlogCreateFormValues = {
  name: string;
  category: string;
  slug: string;
  badgeText: string;
  stat1Number: string;
  stat1Name: string;
  stat1Text: string;
  stat2Number: string;
  stat2Name: string;
  stat2Text: string;
};

export type BlogEditFormValues = {
  badgeText: string;
  stat1Number: string;
  stat1Name: string;
  stat1Text: string;
  stat2Number: string;
  stat2Name: string;
  stat2Text: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  blockquote: string;
  accordionItems: BlogAccordionItem[];
  active: boolean;
};
