import type { Metadata } from "next";

import { EditWebpagePage } from "@/components/admin/cms/webpages/edit-webpage-page";

export const metadata: Metadata = { title: "Edit webpage" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditWebpagePage webpageId={id} />;
}
