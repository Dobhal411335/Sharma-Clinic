export type ClinicalConfidenceCard = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: number;
  active: boolean;
};

export type ClinicalConfidenceConfig = {
  id: string | null;
  siteCode: "IN" | "COM";
  badgeText: string;
  heading: string;
  description: string;
  button1Label: string;
  button1Url: string;
  button2Label: string;
  button2Url: string;
  backgroundImageUrl: string;
  backgroundImagePublicId: string;
  cards: ClinicalConfidenceCard[];
  updatedAt: string | null;
};

export type StorefrontClinicalConfidence = Omit<ClinicalConfidenceConfig, "cards"> & {
  cards: ClinicalConfidenceCard[];
};
