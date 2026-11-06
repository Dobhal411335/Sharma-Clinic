import type { Metadata } from "next";

import { ManageBlogPage } from "@/components/admin/cms/blog/manage-blog-page";

export const metadata: Metadata = { title: "ManageBlogPage" };

export default function Page() {
  return <ManageBlogPage />;
}
