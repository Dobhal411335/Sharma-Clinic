import Link from "next/link";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SitemapGroup } from "@/features/sitemap/storefront-sitemap";

type SitemapPageViewProps = {
  groups: SitemapGroup[];
};

export function SitemapPageView({ groups }: SitemapPageViewProps) {
  return (
    <section className="bg-white" aria-labelledby="sitemap-heading">
      <div className="container-page section-space sm:py-16 lg:py-20">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Sitemap</span>
        </nav>

        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
            Explore
          </p>
          <h1
            id="sitemap-heading"
            className="mt-5 text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
          >
            Sitemap
          </h1>
          <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
          <p className="mt-5 text-base leading-relaxed text-[#34475c]">
            Public pages for the clinic, including doctors, articles, and company information.
          </p>
          <Button className="mt-6 py-5" asChild>
            <a href="/sitemap.xml" download="sitemap.xml">
              <Download aria-hidden />
              Download sitemap.xml
            </a>
          </Button>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {groups.map((group) => (
            <section key={group.title} aria-labelledby={`sitemap-${group.title}`}>
              <h2
                id={`sitemap-${group.title}`}
                className="text-lg font-semibold text-[#17283d]"
              >
                {group.title}
              </h2>
              <ul className="mt-4 columns-1 gap-x-8 sm:columns-2">
                {group.links.map((link) => (
                  <li key={link.href} className="mb-2 break-inside-avoid">
                    <Link
                      href={link.href}
                      className="text-md text-[#34475c] underline-offset-4 hover:text-primary hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
