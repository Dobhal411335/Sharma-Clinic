import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FALLBACK_ABOUT_US_BANNER } from "@/features/about-us-banner/about-us-banner.defaults";
import type { StorefrontAboutCard } from "@/types/about-us-banner";

type AboutSplitProps = {
  cards?: StorefrontAboutCard[];
};

function AboutCard({ card }: { card: StorefrontAboutCard }) {
  return (
    <article className="group relative min-h-[28rem] overflow-hidden rounded-[1.35rem] bg-surface shadow-[0_18px_45px_rgba(16,29,45,0.12)] sm:min-h-[31rem]">
      <Image
        src={card.image.src}
        alt={card.image.alt}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,19,25,0.02)_30%,rgba(8,19,25,0.18)_48%,rgba(8,19,25,0.94)_100%)]" />

      <div className="pointer-events-none absolute inset-3 rounded-[1rem] border border-white/35 transition-colors duration-300 group-hover:border-white/60" />

      <div className="relative flex min-h-[28rem] flex-col justify-end p-7 sm:min-h-[31rem] sm:p-8">
        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
          {card.label}
        </span>
        <h3 className="mt-3 max-w-[18rem] text-2xl leading-[1.05] font-semibold tracking-tight text-white sm:text-[1.8rem]">
          {card.title}
        </h3>
        <p className="mt-3 line-clamp-2 max-w-[20rem] text-sm leading-relaxed text-white/80 sm:text-base">
          {card.body}
        </p>
        <Link
          href={card.cta.href}
          className="group/button mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-foreground focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {card.cta.label}
          <ArrowUpRight className="size-0 overflow-hidden opacity-0 transition-all duration-200 group-hover/button:size-4 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 group-hover/button:opacity-100" />
        </Link>
      </div>
    </article>
  );
}

export function AboutSplit({
  cards = FALLBACK_ABOUT_US_BANNER.aboutCards,
}: AboutSplitProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="container-page section-space" aria-labelledby="about-heading">
      <div className="mb-10 max-w-3xl sm:mb-14">
      <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
          About us
        </p>
        <h2
          id="about-heading"
          className="mt-5 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
        >
          Science-led care translated into everyday confidence.
        </h2>
        <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />

      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <AboutCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
