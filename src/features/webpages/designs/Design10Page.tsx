"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { HtmlBlock, isFilledText } from "@/features/webpages/webpage-shared";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";

const Mini = ({ children, light = false }: { children?: string; light?: boolean }) =>
  children ? (
    <p
      className={`inline-flex items-center gap-3 border-b pb-2 font-ui text-[15px] font-bold uppercase tracking-[.2em] ${light ? "border-[#e6a276] text-[#e6a276]" : "border-[#c96e42] text-[#c96e42]"}`}
    >
      <span className="h-px w-9 bg-current" aria-hidden="true" />
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

export function Design10Page({ data }: { data: StorefrontWebpage }) {
  const leaders = data.design10LeadershipCards.filter((card) => card.name || card.image?.url);
  const journeyTimeline = data.design10JourneyTimeline.filter(
    (item) => item.year || item.heading || item.description,
  );
  const [leaderIndex, setLeaderIndex] = useState(0);
  const maxLeaderIndex = Math.max(0, leaders.length - 4);

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#172d35]">
      <section className="relative flex min-h-screen items-end overflow-hidden bg-[#102a33] px-6 py-20 text-white sm:px-10 md:px-16 lg:px-[10%] lg:py-28">
        {data.design10HeroImage?.url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${data.design10HeroImage.url})` }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,44,.96)_0%,rgba(10,35,44,.72)_45%,rgba(10,35,44,.2)_100%)]" />
        <div className="relative max-w-4xl pb-2 lg:pb-8">
          <Mini light>{data.design10HeroMiniHeading}</Mini>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[.94] tracking-[-.045em] lg:text-[clamp(4.5rem,7vw,6rem)]">
            {data.design10HeroMainHeading}
          </h1>
          <Copy
            html={data.design10HeroDescription}
            light
            className="mt-8 max-w-xl text-lg text-white"
          />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto grid max-w-8xl gap-10 md:grid-cols-[.9fr_1.1fr]">
          <div>
            <Mini>Our Story</Mini>
            <h2 className="mt-5 max-w-5xl text-3xl font-semibold leading-[.96] tracking-[-.04em] sm:text-6xl">
              {data.design10StoryMiniHeading}
            </h2>
            <Copy html={data.design10StorySmallParagraph} className="mt-9 max-w-md text-md " />
          </div>
          <div className="pt-2 lg:pt-10">
            <Copy
              html={data.design10StoryDescription}
              className="max-w-2xl text-xl [&_p]:leading-[1.55] sm:text-3xl font-light"
            />
            <Copy html={data.design10StoryParagraph} className="mt-9 max-w-xl text-md" />
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-24 sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto max-w-8xl">
          <Mini>What defines us</Mini>
          <h2 className="mt-5 max-w-5xl text-5xl font-medium leading-[.94] tracking-[-.045em] sm:text-6xl">
            {data.design10DefineMiniHeading}
          </h2>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {data.design10DefineCards
              .filter((c) => isFilledText(c.heading) || isFilledText(c.description))
              .map((card, i) => (
                <article
                  key={i}
                  className="group relative min-h-[300px] overflow-hidden rounded-[28px] border border-white/80 bg-[#fcfaf8] px-5 py-9 text-[#071c2b] shadow-[0_15px_35px_rgba(74,54,34,.07)] transition duration-300 hover:-translate-y-2 hover:border-[#cf7b52] hover:bg-[#cf7b52] hover:text-white "
                >
                  <span className="relative z-10 flex h-9 w-full items-center rounded-full border border-[#f1d8c8] bg-[#f8ede7] px-3 text-md font-bold text-[#a84f31] transition-colors duration-300 group-hover:border-white/30 group-hover:bg-white/15 group-hover:text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative z-10 mt-9 max-w-[250px] text-[25px] font-semibold leading-[1.05] tracking-[-.04em] transition-colors duration-300 group-hover:text-white">
                    {card.heading}
                  </h3>
                  <Copy
                    html={card.description}
                    className="relative z-10 mt-5 max-w-[290px] text-md text-[#567185] transition-colors duration-300 [&_p]:leading-8 group-hover:[&_p]:!text-white"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 220 180"
                    className="pointer-events-none absolute -bottom-8 -right-10 h-48 w-40 opacity-80 transition duration-500 group-hover:scale-120"
                  >
                    <circle cx="132" cy="128" r="92" fill="#f8ede7" />
                    <circle
                      cx="132"
                      cy="128"
                      r="68"
                      fill="none"
                      stroke="#efd8ca"
                      strokeWidth="1.2"
                    />
                  </svg>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-start md:gap-20">
          <div className="w-full md:sticky md:top-28 md:w-[50%] md:shrink-0 md:self-start">
            <div className="relative aspect-[4/5] w-full max-h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl border-2 border-white">
              <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-xl">
                {data.design10JourneyImage?.url && (
                  <Image
                    src={data.design10JourneyImage.url}
                    alt="Our journey"
                    fill
                    sizes="(max-width: 768px) 100vw, 57vw"
                    className="rounded-xl object-cover transition-transform duration-500 hover:scale-105"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 z-10 rounded-[18px] border border-white/55"
                />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <Mini>{data.design10JourneyMiniHeading}</Mini>
            <h2 className="mt-5 max-w-xl text-6xl font-semibold leading-[.93] tracking-[-.045em]">
              {data.design10JourneyMainHeading}
            </h2>
            <div className="relative mt-14 pb-6 pl-12">
              <div className="relative space-y-12">
                {journeyTimeline.map((item, i) => (
                  <div
                    key={i}
                    className={`relative ${
                      i < journeyTimeline.length - 1
                        ? "after:absolute after:-bottom-16 after:left-[-33px] after:top-4 after:w-px after:bg-[#ddd7cf]"
                        : ""
                    }`}
                  >
                    <span className="absolute -left-12 top-0 flex size-8 items-center justify-center rounded-full border-4 border-[#fbf8f2] bg-[#d9794b] shadow-[0_0_0_1px_#d9794b]">
                      <span className="size-2.5 rounded-full bg-[#fbf8f2]" />
                    </span>
                    <p className="text-[12px] font-bold text-[#c96e42]">{item.year}</p>
                    <h3 className="mt-1 text-xl font-semibold">{item.heading}</h3>
                    <Copy html={item.description} className="mt-4 max-w-md text-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-white sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Mini light>{data.design10LeadershipMiniHeading}</Mini>
              <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-[.94] tracking-[-.045em] text-black sm:text-6xl">
                {data.design10LeadershipMainHeading}
              </h2>
            </div>
            {leaders.length > 4 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous leaders"
                  onClick={() => setLeaderIndex((i) => Math.max(0, i - 1))}
                  disabled={leaderIndex === 0}
                  className="flex size-11 items-center justify-center rounded-full border border-white/25 transition hover:bg-white hover:text-[#142d35] disabled:opacity-30"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next leaders"
                  onClick={() => setLeaderIndex((i) => Math.min(maxLeaderIndex, i + 1))}
                  disabled={leaderIndex === maxLeaderIndex}
                  className="flex size-11 items-center justify-center rounded-full border border-white/25 transition hover:bg-white hover:text-[#142d35] disabled:opacity-30"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-14 overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-500"
              style={{ transform: `translateX(-${leaderIndex * (100 / 4 + 1.25)}%)` }}
            >
              {leaders.map((leader, i) => (
                <article
                  key={i}
                  className="group w-[calc(50%-10px)] shrink-0 sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
                >
                  <div className="rounded-[24px] border border-white/35 p-1.5">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[19px] bg-[#28424a]">
                      {leader.image?.url && (
                        <Image
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          src={leader.image.url}
                          alt={leader.name || "Leader"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-3 z-10 rounded-[14px] border border-white/55"
                      />
                      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-3 bg-gradient-to-t from-[#0d252d]/95 via-[#0d252d]/55 to-transparent px-6 pb-6 pt-16 opacity-100 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <h3 className="text-xl font-semibold text-white">{leader.name}</h3>
                        <p className="mt-1 text-sm text-white/70">{leader.designation}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[1.05fr_.95fr] md:items-start">
          <div>
            <Mini>{data.design10GlobalMiniHeading}</Mini>
            <h2 className="mt-5 max-w-2xl text-5xl font-medium leading-[.94] tracking-[-.045em] sm:text-6xl">
              {data.design10GlobalMainHeading}
            </h2>
            <Copy html={data.design10GlobalDescription} className="mt-8 max-w-xl text-sm" />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {data.design10GlobalCards
                .filter((c) => c.miniHeading || c.heading || c.description)
                .map((card, i) => (
                  <article
                    key={i}
                    className="group relative min-h-[250px] overflow-hidden rounded-[26px] border border-[#e8e4df] bg-[#fdfcfa] p-8 shadow-[0_15px_30px_rgba(67,53,37,.05)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_40px_rgba(67,53,37,.14)]"
                  >
                    <span className="relative z-10 text-xl font-medium text-[#b45d3e]">
                      {card.miniHeading}
                    </span>
                    <h3 className="relative z-10 mt-1 text-3xl font-semibold leading-tight tracking-[-.035em]">
                      {card.heading}
                    </h3>
                    <Copy
                      html={card.description}
                      className="relative z-10 mt-7 max-w-[280px] text-lg [&_p]:leading-8"
                    />
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 220 180"
                      className="pointer-events-none absolute -bottom-8 -right-10 h-48 w-40 opacity-80 transition duration-500 group-hover:scale-120"
                    >
                      <circle cx="132" cy="128" r="92" fill="#f6f2ee" />
                      <circle
                        cx="132"
                        cy="128"
                        r="68"
                        fill="none"
                        stroke="#efd8ca"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </article>
                ))}
            </div>
          </div>
          <div className="md:sticky md:top-8">
            <div className="group relative min-h-[440px] overflow-hidden rounded-[26px]">
              <div className="relative h-full min-h-[440px] overflow-hidden rounded-[19px]">
                {data.design10GlobalImage?.url && (
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    src={data.design10GlobalImage.url}
                    alt="Global presence"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 z-10 rounded-[14px] border border-white/55"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design10ExploreMiniHeading}</Mini>
          <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.045em] sm:text-6xl">
            {data.design10ExploreMainHeading || ""}
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.design10ExploreCards
              .filter((c) => c.heading || c.description)
              .map((card, i) => (
                <Link
                href={card.link || "#"}
                key={i}
                className="group flex min-h-[125px] items-center gap-4 rounded-2xl border border-white/90 bg-[#fcfaf6] p-5 shadow-[0_12px_26px_rgba(74,54,34,.07)] transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_34px_rgba(74,54,34,.14)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f6e9dc] text-[13px] font-bold text-[#bd6d4b] transition group-hover:bg-[#cf754d] group-hover:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1"> 
                  <h3 className="text-xl font-semibold">{card.heading}</h3>
                  <Copy html={card.description} className="mt-1 text-sm" />
                </span>
                <ArrowUpRight className="size-6 text-[#bd6d4b] transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
