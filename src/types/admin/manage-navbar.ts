import type { SiteCode } from "@/types/admin/auth";

export type NavbarSubSectionDto = {
  id: string;
  title: string;
  url: string;
  description: string;
  active: boolean;
  order: number;
};

export type NavbarSectionDto = {
  id: string;
  siteCode: SiteCode;
  title: string;
  description: string;
  url: string;
  menuHeading: string;
  menuDescription: string;
  active: boolean;
  order: number;
  subSections: NavbarSubSectionDto[];
  createdAt: string;
  updatedAt: string;
};

export type NavbarSubSectionFormValues = {
  title: string;
  url: string;
  description: string;
  order: string;
  active: boolean;
};

export type NavbarSectionFormValues = {
  title: string;
  description: string;
  url: string;
  menuHeading: string;
  menuDescription: string;
  order: string;
  active: boolean;
  subSections: NavbarSubSectionFormValues[];
};

export type NavbarSectionPayload = {
  title: string;
  description: string;
  url: string;
  menuHeading: string;
  menuDescription: string;
  active: boolean;
  order?: number;
  subSections: Array<{
    title: string;
    url: string;
    description: string;
    active: boolean;
    order: number;
  }>;
};
