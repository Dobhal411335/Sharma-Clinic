import type { Metadata } from "next";

import { TestimonialsPageView } from "@/components/landing/testimonials-page-view";
import { pageSeo } from "@/data/site";
import { getCustomerReviews } from "@/features/customer-reviews/customer-reviews.service";

export const metadata: Metadata = {
  title: pageSeo.testimonials.title,
  description: pageSeo.testimonials.description,
};

export default async function TestimonialsPage() {
  const reviews = await getCustomerReviews();
  return <TestimonialsPageView reviews={reviews} />;
}
