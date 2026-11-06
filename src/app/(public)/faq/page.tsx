import type { Metadata } from "next";

import { FaqPageView } from "@/components/faq/faq-page-view";
import { pageSeo } from "@/data/site";
import { getFaqSections } from "@/features/faq/faq.service";

export const metadata: Metadata = {
  title: pageSeo.faq.title,
  description: pageSeo.faq.description,
};

export default async function FaqPage() {
  const sections = await getFaqSections();
  return <FaqPageView sections={sections} />;
}
