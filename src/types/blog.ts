export type StorefrontBlogAccordionItem = {
  question: string;
  description: string;
};

export type StorefrontBlog = {
  id: string;
  slug: string;
  name: string;
  category: string;
  badgeText?: string;
  stat1Number?: string;
  stat1Name?: string;
  stat1Text?: string;
  stat2Number?: string;
  stat2Name?: string;
  stat2Text?: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
  description: string;
  blockquote: string;
  accordionItems: StorefrontBlogAccordionItem[];
  createdAt: string;
};

export type StorefrontBlogCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  badgeText?: string;
  stat1Number?: string;
  stat1Name?: string;
  stat1Text?: string;
  stat2Number?: string;
  stat2Name?: string;
  stat2Text?: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
};

export type StorefrontBlogDetail = StorefrontBlog & {
  related: StorefrontBlogCard[];
};

export type StorefrontBlogCategory = {
  name: string;
  count: number;
};

export type StorefrontBlogListResult = {
  blogs: StorefrontBlog[];
  /** Distinct categories with active post counts for the sidebar. */
  categories: StorefrontBlogCategory[];
};
