export type TopAdvertisementItem = {
  id: string;
  section: "ANNOUNCEMENT" | "UTILITY" | "BENEFIT";
  text: string;
  url: string;
  active: boolean;
};

export type TopAdvertisementConfig = {
  id: string | null;
  siteCode: "IN" | "COM";
  announcements: TopAdvertisementItem[];
  utilityItems: TopAdvertisementItem[];
  benefits: TopAdvertisementItem[];
  updatedAt: string | null;
};

export type StorefrontAnnouncementItem = {
  text: string;
  href?: string;
};

export type StorefrontUtilityItem = {
  text: string;
  href?: string;
};

export type StorefrontBenefitItem = {
  title: string;
  href?: string;
};

export type StorefrontTopAdvertisement = {
  announcements: StorefrontAnnouncementItem[];
  utilityItems: StorefrontUtilityItem[];
  benefits: StorefrontBenefitItem[];
};
