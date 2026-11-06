export type ClinicalConfidenceImage = { url: string; publicId: string };

export type ClinicalConfidenceCardFormValues = {
  clientKey: string;
  image: ClinicalConfidenceImage;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type ClinicalConfidenceFormValues = {
  badgeText: string;
  heading: string;
  description: string;
  button1Label: string;
  button1Url: string;
  button2Label: string;
  button2Url: string;
  backgroundImage: ClinicalConfidenceImage;
  cards: ClinicalConfidenceCardFormValues[];
};

export type ClinicalConfidenceCardDto = Omit<ClinicalConfidenceCardFormValues, "clientKey" | "image"> & { id: string; imageUrl: string; imagePublicId: string; sortOrder: number };
export type ClinicalConfidenceConfigDto = Omit<ClinicalConfidenceFormValues, "backgroundImage" | "cards"> & { id: string | null; siteCode: "IN" | "COM"; backgroundImageUrl: string; backgroundImagePublicId: string; cards: ClinicalConfidenceCardDto[]; updatedAt: string | null };
export type ClinicalConfidenceConfigPayload = Omit<ClinicalConfidenceConfigDto, "id" | "siteCode" | "backgroundImageUrl" | "backgroundImagePublicId" | "cards" | "updatedAt"> & { backgroundImageUrl: string; backgroundImagePublicId: string; cards: Array<Omit<ClinicalConfidenceCardDto, "id" | "sortOrder"> & { sortOrder: number }> };
