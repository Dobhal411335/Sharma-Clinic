import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findAdminNavItem } from "@/components/admin/sidebar";

type AdminPlaceholderProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: AdminPlaceholderProps): Promise<Metadata> {
  const { slug } = await params;
  const item = findAdminNavItem(`/admin/${slug.join("/")}`);
  return { title: item?.title ?? "Admin" };
}

export default async function AdminPlaceholderPage({ params }: AdminPlaceholderProps) {
  const { slug } = await params;
  const item = findAdminNavItem(`/admin/${slug.join("/")}`);
  if (!item?.href) notFound();

  return (
    <section className="rounded-xl bg-white p-6 ring-1 ring-[#e4e7eb]">
      <p className="text-sm text-[#626a73]">
        This screen is ready for a page from the other project.
      </p>
    </section>
  );
}
