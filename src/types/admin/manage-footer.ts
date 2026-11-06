export type FooterLinkFormValues = {
  label: string;
  url: string;
  order: string;
  active: boolean;
};

export type FooterColumnFormValues = {
  title: string;
  order: string;
  active: boolean;
  links: FooterLinkFormValues[];
};

export type ManageFooterFormValues = {
  thankYou: string;
  description: string;
  columns: FooterColumnFormValues[];
};

export type FooterLinkDto = {
  id: string;
  label: string;
  url: string;
  active: boolean;
  order: number;
};

export type FooterColumnDto = {
  id: string;
  title: string;
  active: boolean;
  order: number;
  links: FooterLinkDto[];
};

export type FooterConfigDto = {
  id: string | null;
  siteCode: "IN" | "COM";
  thankYou: string;
  description: string;
  columns: FooterColumnDto[];
  updatedAt: string | null;
};

export type FooterConfigPayload = {
  thankYou: string;
  description: string;
  columns: Array<{
    title: string;
    active: boolean;
    order: number;
    links: Array<{
      label: string;
      url: string;
      active: boolean;
      order: number;
    }>;
  }>;
};
