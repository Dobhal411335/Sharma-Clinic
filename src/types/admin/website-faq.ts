export type FaqItemDto = {
  id: string;
  question: string;
  answer: string;
  showOnLanding: boolean;
  active: boolean;
  order: number;
};

export type FaqSectionDto = {
  id: string;
  title: string;
  active: boolean;
  order: number;
  items: FaqItemDto[];
};

export type FaqConfigDto = {
  siteCode: "IN" | "COM";
  sections: FaqSectionDto[];
};

export type FaqItemFormValues = {
  question: string;
  answer: string;
  showOnLanding: boolean;
  active: boolean;
  order: string;
};

export type FaqSectionFormValues = {
  title: string;
  active: boolean;
  order: string;
  items: FaqItemFormValues[];
};

export type WebsiteFaqFormValues = {
  sections: FaqSectionFormValues[];
};

export type FaqConfigPayload = {
  sections: Array<{
    title: string;
    active: boolean;
    order: number;
    items: Array<{
      question: string;
      answer: string;
      showOnLanding: boolean;
      active: boolean;
      order: number;
    }>;
  }>;
};
