import type { Metadata } from "next";

import { ClinicalConfidencePage } from "@/components/admin/cms/clinical-confidence/clinical-confidence-page";

export const metadata: Metadata = { title: "ClinicalConfidencePage" };

export default function Page() {
  return <ClinicalConfidencePage />;
}
