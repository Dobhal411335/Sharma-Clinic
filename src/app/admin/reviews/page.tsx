import type { Metadata } from "next";

import { CustomerReviewPage } from "@/components/admin/cms/customer-review/customer-review-page";

export const metadata: Metadata = { title: "CustomerReviewPage" };

export default function Page() {
  return <CustomerReviewPage />;
}
