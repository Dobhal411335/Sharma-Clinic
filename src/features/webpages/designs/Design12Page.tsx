"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HtmlBlock, isFilledText } from "@/features/webpages/webpage-shared";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";

const Mini = ({ children, light = false }: { children?: string; light?: boolean }) =>
  children ? (
    <p
      className={`inline-flex items-center gap-3 border-b pb-2 font-ui text-[10px] font-bold uppercase tracking-[.2em] ${light ? "border-[#d68b64] text-[#d68b64]" : "border-[#bd6d4b] text-[#bd6d4b]"}`}
    >
      <span className="h-px w-8 bg-current" />
      {children}
    </p>
  ) : null;
const Copy = ({
  html,
  light = false,
  className = "",
}: {
  html?: string;
  light?: boolean;
  className?: string;
}) =>
  isFilledText(html) ? (
    <HtmlBlock
      html={html!}
      className={`${light ? "!text-white [&_p]:!text-white" : "text-[#637179]"} [&_p]:leading-7 ${className}`}
    />
  ) : null;

export function Design12Page({ data }: { data: StorefrontWebpage }) {
  const helpCards = data.design12HelpCards.filter((c) => c.heading || c.description);
  const methodology = data.design12MethodologyCards.filter((c) => c.heading || c.subDescription);
  const outcomes = data.design12OutcomeCards
    .filter((c) => c.miniHeading || c.description)
    .slice(0, 4);
  const related = data.design12RelatedCards.filter((c) => c.heading || c.image?.url);
  const explore = data.design12ExploreCards.filter((c) => c.name || c.description || c.url);
  const challenge = data.design12ChallengeCard || {};

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5ee] text-[#172d35]">
      <section className="relative flex min-h-[700px] items-end overflow-hidden bg-[#102832] px-6 py-20 text-white sm:px-10 md:px-16 lg:px-[10%] lg:py-28">
        {data.design12HeroImage?.url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75 transition duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${data.design12HeroImage.url})` }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,30,39,.95),rgba(7,30,39,.67)_52%,rgba(7,30,39,.16))]" />
        <div className="relative max-w-3xl">
          <Mini light>{data.design12HeroMiniHeading}</Mini>
          <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[.93] tracking-[-.05em] sm:text-7xl lg:text-[clamp(4rem,7vw,5.3rem)]">
            {data.design12HeroMainHeading}
          </h1>
          <Copy html={data.design12HeroDescription} light className="mt-8 max-w-xl text-lg" />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <div>
            <Mini>{data.design12ChallengeMiniHeading}</Mini>
            <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-[.94] tracking-[-.05em] sm:text-7xl">
              {data.design12ChallengeMainHeading}
            </h2>
            <Copy html={data.design12ChallengeDescription} className="mt-8 max-w-md text-md" />
          </div>
          <article className="group relative min-h-[415px] overflow-hidden rounded-[26px] border border-white/90 bg-[#fcfaf8] p-10 shadow-[0_22px_45px_rgba(74,54,34,.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(74,54,34,.16)]">
            <p className="relative z-10 rounded-full bg-[#eba27e] px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white transition duration-300 group-hover:bg-[#ad5639]">
              {challenge.miniHeading}
            </p>
            <h3 className="relative z-10 mt-8 text-3xl font-semibold leading-tight tracking-[-.04em] text-[#a95032]">
              {challenge.heading}
            </h3>
            <ul className="relative z-10 mt-10 space-y-2 text-lg leading-[1.45] text-[#637179]">
              {(challenge.points || []).filter(Boolean).map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#bd6d4b]">•</span>
                  {point}
                </li>
              ))}
            </ul>
            <svg
              aria-hidden="true"
              viewBox="0 0 220 180"
              className="pointer-events-none absolute -bottom-8 -right-10 h-48 w-56 opacity-80 transition duration-500 group-hover:scale-110"
            >
              <circle cx="132" cy="128" r="92" fill="#f6f2ee" />
              <circle cx="132" cy="128" r="68" fill="none" stroke="#efd8ca" strokeWidth="1.2" />
            </svg>
          </article>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design12HelpMiniHeading}</Mini>
          <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.05em] sm:text-7xl">
            {data.design12HelpMainHeading}
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {helpCards.map((card, i) => (
              <article
                key={i}
                className="group relative min-h-[150px] overflow-hidden rounded-[18px] border border-white/90 bg-[#fcfaf8] p-6 shadow-[0_14px_28px_rgba(74,54,34,.07)] transition duration-300 hover:-translate-y-1"
              >
                <h3 className="relative z-10 text-xl font-semibold tracking-[-.035em]">
                  {card.heading}
                </h3>
                <Copy html={card.description} className="relative z-10 mt-4 text-sm line-clamp-2" />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 180"
                  className="pointer-events-none absolute -bottom-8 -right-10 h-48 w-40 opacity-80 transition duration-500 group-hover:scale-120"
                >
                  <circle cx="132" cy="128" r="92" fill="#f6f2ee" />
                  <circle cx="132" cy="128" r="68" fill="none" stroke="#efd8ca" strokeWidth="1.2" />
                </svg>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design12MethodologyMiniHeading}</Mini>
          <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.05em] sm:text-7xl">
            {data.design12MethodologyMainHeading}
          </h2>
          <Copy html={data.design12MethodologyDescription} className="mt-8 max-w-xl text-sm" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {methodology.map((card, i) => (
              <article
                key={i}
                className="group relative overflow-hidden rounded-[18px] border border-gray-300 bg-[#fcfaf8] p-6 shadow-[0_14px_28px_rgba(74,54,34,.07)] transition duration-300 hover:-translate-y-1"
              >
                <p className="text-[15px] font-bold text-[#bd6d4b] border border-[#bd6d4b] rounded-xl px-3 py-2 inline-block">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-xl font-semibold">{card.heading}</h3>
                <Copy html={card.subDescription} className="text-md" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-black sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <Mini light>{data.design12OutcomesMiniHeading}</Mini>
          <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.05em] sm:text-7xl">
            {data.design12OutcomesMainHeading}
          </h2>
          <div className="mt-14 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((card, i) => (
              <article
                key={i}
                className="border border-white/50 p-6 hover:bg-white/10 transition duration-300"
              >
                <h3 className="text-5xl font-semibold tracking-[-.05em] text-[#e5a17f]">
                  {card.miniHeading}
                </h3>
                <Copy html={card.description} light className="mt-3 text-sm" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Mini>{data.design12RelatedMiniHeading}</Mini>
              <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.05em] sm:text-7xl">
                {data.design12RelatedMainHeading}
              </h2>
            </div>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {related.map((card, i) => (
              <article
                key={i}
                className="group relative aspect-[.86] overflow-hidden rounded-[28px] border border-[#ded7ce] bg-[#172f37] text-white shadow-[0_18px_35px_rgba(20,43,52,.13)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(20,43,52,.2)]"
              >
                {card.image?.url && (
                  <Image
                    src={card.image.url}
                    alt={card.heading || "Related work"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071c24]/95 via-[#071c24]/10 to-transparent" />
                <div className="pointer-events-none absolute inset-4 rounded-[22px] border border-white/35 transition duration-500 group-hover:border-white/60" />
                <div className="absolute inset-x-9 bottom-10 z-10">
                  <p className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-white backdrop-blur-sm">
                    {card.miniBadgeHeading}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-.035em]">
                    {card.heading}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design12ExploreMiniHeading}</Mini>
          <h2 className="mt-5 max-w-2xl text-5xl font-medium leading-[.94] tracking-[-.05em] sm:text-7xl">
            {data.design12ExploreMainHeading}
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {explore.map((card, i) => (
              <Link
                href={card.url || "#"}
                key={i}
                className="group flex min-h-[125px] items-center gap-4 rounded-2xl border border-white/90 bg-[#fcfaf6] p-5 shadow-[0_12px_26px_rgba(74,54,34,.07)] transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_34px_rgba(74,54,34,.14)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f6e9dc] text-[13px] font-bold text-[#bd6d4b] transition group-hover:bg-[#cf754d] group-hover:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold">{card.name}</h3>
                  <Copy html={card.description} className="mt-1 text-sm" />
                </span>
                <ArrowUpRight className="size-6 text-[#bd6d4b] transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Design12Page;
