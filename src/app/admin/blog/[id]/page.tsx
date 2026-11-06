import type { Metadata } from "next";

import { EditBlogPage } from "@/components/admin/cms/blog/edit-blog-page";

export const metadata: Metadata = { title: "Edit blog" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditBlogPage blogId={id} />;
}
