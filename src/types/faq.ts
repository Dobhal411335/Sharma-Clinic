export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  showOnLanding: boolean;
  active: boolean;
  order: number;
};

export type FaqSection = {
  id: string;
  title: string;
  active: boolean;
  order: number;
  items: FaqItem[];
};

export type FaqConfig = {
  siteCode: "IN" | "COM";
  sections: FaqSection[];
};

export type StorefrontFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type StorefrontFaqSection = {
  id: string;
  title: string;
  items: StorefrontFaqItem[];
};
