import Image from "next/image";
import Link from "next/link";

import { placeholderImage } from "@/data/site";
import { formatBlogDate } from "@/features/blog/blog.service";
import type { StorefrontBlogCard } from "@/types/blog";

type BlogRelatedSectionProps = {
  items: StorefrontBlogCard[];
};

export function BlogRelatedSection({ items }: BlogRelatedSectionProps) {
  const cards = items.slice(0, 3);
  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full border-t border-[#eadfce] bg-[#f4ebe1]"
      aria-labelledby="blog-related-heading"
    >
      <div className="container-page section-space py-12 sm:py-16 lg:py-20">
        <h2
          id="blog-related-heading"
          className="text-2xl font-semibold tracking-tight text-[#1d262b] sm:text-3xl"
        >
          You might also like
        </h2>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {cards.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/blog/${entry.slug}`}
                className="group block overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgba(40,30,20,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c97852]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f3ebe1]">
                  <Image
                    src={
                      entry.imageUrl ||
                      placeholderImage.blogCard
                    }
                    alt={entry.title || entry.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#c97852] uppercase">
                    {entry.category || "Blog"}
                  </p>
                  <p className="mt-2 text-base font-semibold leading-snug text-[#1d262b] transition-colors group-hover:text-[#c97852] sm:text-lg">
                    {entry.title || entry.name}
                  </p>
                  <p className="mt-2 text-xs tracking-wide text-[#6d787e] uppercase">
                    {formatBlogDate(entry.publishedAt)}
                    {entry.createdBy ? ` · ${entry.createdBy}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
