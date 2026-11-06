export type TopAdvertisementItemFormValues = {
  text: string;
  url: string;
  active: boolean;
};

export type TopAdvertisementFormValues = {
  announcements: TopAdvertisementItemFormValues[];
  utilityItems: TopAdvertisementItemFormValues[];
  benefits: TopAdvertisementItemFormValues[];
};

export type TopAdvertisementItemDto = {
  id: string;
  section: "ANNOUNCEMENT" | "UTILITY" | "BENEFIT";
  text: string;
  url: string;
  active: boolean;
};

export type TopAdvertisementConfigDto = {
  id: string | null;
  siteCode: "IN" | "COM";
  announcements: TopAdvertisementItemDto[];
  utilityItems: TopAdvertisementItemDto[];
  benefits: TopAdvertisementItemDto[];
  updatedAt: string | null;
};

export type TopAdvertisementConfigPayload = {
  announcements: Array<{
    text: string;
    url: string;
    active: boolean;
  }>;
  utilityItems: Array<{
    text: string;
    url: string;
    active: boolean;
  }>;
  benefits: Array<{
    text: string;
    url: string;
    active: boolean;
  }>;
};
