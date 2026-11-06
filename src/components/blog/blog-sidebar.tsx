"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { ShareButton } from "@/components/shared/share-button";
import { placeholderImage } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ShareContentInput } from "@/lib/share-text";
import type { StorefrontBlogCard, StorefrontBlogCategory } from "@/types/blog";

type BlogSidebarProps = {
  categories: StorefrontBlogCategory[];
  recent: StorefrontBlogCard[];
  activeCategory?: string;
  searchQuery?: string;
  /** When set, enables Web Share / copy with title + SEO text. */
  share?: ShareContentInput;
};

function padCount(count: number): string {
  return String(count).padStart(2, "0");
}

export function BlogSidebar({
  categories,
  recent,
  activeCategory,
  searchQuery = "",
  share,
}: BlogSidebarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    router.push(qs ? `/blog?${qs}` : "/blog");
  }

  return (
    <aside className="space-y-5">
      <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(40,30,20,0.04)] sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight text-[#1d262b]">Search insights</h2>
        <form onSubmit={onSearch} className="mt-5 flex items-stretch gap-2">
          <Input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            aria-label="Search articles"
            className="h-12 rounded-xl border-[#e6ddd2] bg-[#faf7f2] text-[#1d262b] placeholder:text-[#9aa3a8] focus-visible:border-[#c97852] focus-visible:ring-[#c97852]/25"
          />
          <Button
            type="submit"
            size="icon"
            className="size-12 shrink-0 rounded-xl bg-[#c97852] text-white hover:bg-[#b56742]"
            aria-label="Search"
          >
            <Search className="size-4" aria-hidden />
          </Button>
        </form>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(40,30,20,0.04)] sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight text-[#1d262b]">Categories</h2>
        <ul className="mt-5 divide-y divide-[#eee6db]">
          <li>
            <Link
              href={searchQuery ? `/blog?q=${encodeURIComponent(searchQuery)}` : "/blog"}
              className={cn(
                "flex items-center justify-between gap-3 py-3.5 text-sm transition-colors hover:text-[#c97852]",
                !activeCategory ? "font-semibold text-[#1d262b]" : "text-[#6d787e]",
              )}
            >
              <span>All</span>
            </Link>
          </li>
          {categories.length === 0 ? (
            <li className="py-3.5 text-sm text-[#6d787e]">No categories yet.</li>
          ) : (
            categories.map((category) => {
              const isActive =
                activeCategory?.toLowerCase() === category.name.toLowerCase();
              const href = `/blog?category=${encodeURIComponent(category.name)}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }`;
              return (
                <li key={category.name}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center justify-between gap-3 py-3.5 text-sm transition-colors hover:text-[#c97852]",
                      isActive ? "font-semibold text-[#1d262b]" : "text-[#6d787e]",
                    )}
                  >
                    <span>{category.name}</span>
                    <span className="font-semibold text-[#c97852]">{padCount(category.count)}</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(40,30,20,0.04)] sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight text-[#1d262b]">
          Recent perspectives
        </h2>
        {recent.length === 0 ? (
          <p className="mt-5 text-sm text-[#6d787e]">No recent articles.</p>
        ) : (
          <ul className="mt-5 space-y-5">
            {recent.map((post) => {
              const imageSrc =
                post.imageUrl || placeholderImage.blogThumb;
              return (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c97852]"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[#f3ebe1]">
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="64px"
                      />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[11px] font-semibold tracking-[0.14em] text-[#c97852] uppercase">
                        {post.category || "Blog"}
                      </span>
                      <span className="mt-1.5 block line-clamp-2 text-sm font-semibold leading-snug text-[#1d262b] transition-colors group-hover:text-[#c97852]">
                        {post.title}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {share ? (
        <div className="rounded-[28px] bg-white px-6 py-4 shadow-[0_8px_30px_rgba(40,30,20,0.04)]">
          <ShareButton
            share={share}
            label={`Share ${share.title}`}
            variant="labeled"
            className="text-[#1d262b] hover:text-[#c97852]"
          />
        </div>
      ) : null}
    </aside>
  );
}
