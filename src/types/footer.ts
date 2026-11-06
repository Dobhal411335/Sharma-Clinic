export type FooterLink = {
  id: string;
  label: string;
  url: string;
  active: boolean;
  order: number;
};

export type FooterColumn = {
  id: string;
  title: string;
  active: boolean;
  order: number;
  links: FooterLink[];
};

export type FooterConfig = {
  id: string | null;
  siteCode: "IN" | "COM";
  thankYou: string;
  description: string;
  columns: FooterColumn[];
  updatedAt: string | null;
};

export type StorefrontFooterColumn = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export type StorefrontFooter = {
  thankYou: string;
  description: string;
  columns: StorefrontFooterColumn[];
};
