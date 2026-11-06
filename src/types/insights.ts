export type InsightCard = {
  id: string;
  category: string;
  name: string;
  publishedAt: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  order: number;
  active: boolean;
};

export type InsightQaItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
};

export type InsightsConfig = {
  siteCode: "IN" | "COM";
  cards: InsightCard[];
  qaItems: InsightQaItem[];
};

export type StorefrontInsightCard = {
  id: string;
  category: string;
  name: string;
  publishedAt: string;
  imageUrl: string;
  descriptionHtml: string;
  excerpt: string;
};

export type StorefrontInsightQa = {
  id: string;
  question: string;
  answerHtml: string;
};

export type StorefrontInsights = {
  cards: StorefrontInsightCard[];
  qaItems: StorefrontInsightQa[];
};
