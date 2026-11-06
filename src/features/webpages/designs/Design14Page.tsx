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

export function Design14Page({ data }: { data: StorefrontWebpage }) {
  const sectors = data.design14SectorCards.filter(
    (c) => c.heading || c.description || c.image?.url,
  );
  const perspective = data.design14PerspectiveCards.filter(
    (c) => c.miniHeading || c.miniDescription,
  );
  const questions = data.design14QuestionCards.filter((c) => c.miniHeading || c.miniDescription);
  const explore = data.design14ExploreCards.filter((c) => c.heading || c.description || c.url);
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5ee] text-[#172d35]">
      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-[#102832] px-6 py-20 text-white sm:px-10 md:px-16 lg:px-[9.5%] lg:py-28">
        <div className="absolute inset-0 overflow-hidden">
          {data.design14HeroImage?.url && (
            <Image
              src={data.design14HeroImage.url}
              alt={data.design14HeroMainHeading || "Industries"}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-75 transition duration-700 hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,30,39,.95),rgba(7,30,39,.63)_56%,rgba(7,30,39,.18))]" />
        </div>
        <div className="relative max-w-4xl">
          <Mini light>{data.design14HeroMiniHeading}</Mini>
          <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[.92] tracking-[-.06em] sm:text-7xl lg:text-[clamp(4rem,7vw,5.4rem)]">
            {data.design14HeroMainHeading}
          </h1>
          <Copy html={data.design14HeroDescription} light className="mt-8 max-w-xl text-base" />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[9.5%]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[1fr_.4fr] md:items-end">
            <div>
              <Mini>{data.design14SectorsMiniHeading}</Mini>
              <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-7xl">
                {data.design14SectorsMainHeading}
              </h2>
            </div>
            <Copy html={data.design14SectorsDescription} className="max-w-sm text-md" />
          </div>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((card, i) => (
              <article
                key={i}
                className="group relative aspect-[.86] overflow-hidden rounded-[22px] border border-white/90 bg-[#102832] text-white shadow-[0_16px_30px_rgba(30,45,48,.14)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_42px_rgba(30,45,48,.2)]"
              >
                {card.image?.url && (
                  <Image
                    src={card.image.url}
                    alt={card.heading || "Sector"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071d25]/95 via-[#071d25]/25 to-transparent transition duration-500 group-hover:from-[#071d25]" />
                <div className="pointer-events-none absolute inset-3 rounded-[16px] border border-white/45 transition duration-500 group-hover:border-white/75" />
                <div className="absolute inset-x-6 bottom-7 z-10">
                  <span className="mb-3 inline-flex size-8 items-center justify-center rounded-full border border-white/45 bg-black/10 text-[9px] font-bold backdrop-blur-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl font-semibold leading-tight tracking-[-.035em]">
                    {card.heading}
                  </h3>
                  <Copy html={card.description} light className="mt-4 text-sm" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-24 text-black sm:px-10 md:px-16 lg:px-[9.5%]">
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <div>
            <Mini light>{data.design14PerspectiveMiniHeading}</Mini>
            <h2 className="mt-5 max-w-xl text-5xl font-medium leading-[.94] tracking-[-.025em] sm:text-7xl">
              {data.design14PerspectiveMainHeading}
            </h2>
            <Copy
              html={data.design14PerspectiveDescription}
              light
              className="mt-8 max-w-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 border border-white/10">
            {perspective.map((card, i) => (
              <div
                key={i}
                className="min-h-[135px] border-b border-r border-white/10 p-6 last:border-b-0"
              >
                <p className="text-5xl font-semibold text-[#e6ad8b]">{card.miniHeading}</p>
                <Copy html={card.miniDescription} light className="mt-3 text-md" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[9.5%]">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design14QuestionsMiniHeading}</Mini>
          <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.055em] sm:text-7xl">
            {data.design14QuestionsMainHeading}
          </h2>
          <Copy html={data.design14QuestionsDescription} className="mt-6 max-w-xl text-sm" />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {questions.map((card, i) => (
              <article
                key={i}
                className="group relative min-h-[155px] overflow-hidden rounded-2xl border border-white bg-[#fcfaf6] p-5 shadow-[0_10px_25px_rgba(74,54,34,.06)] transition hover:-translate-y-1"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 180"
                  className="pointer-events-none absolute -bottom-8 -right-10 h-32 w-40 opacity-90 transition duration-500 group-hover:scale-110"
                >
                  <circle cx="132" cy="128" r="92" fill="#f6f2ee" />
                  <circle cx="132" cy="128" r="68" fill="none" stroke="#efd8ca" strokeWidth="1.2" />
                </svg>
                <h3 className="relative max-w-[15rem] text-md font-semibold">
                  {card.miniHeading}
                </h3>
                <Copy html={card.miniDescription} className="relative mt-5 text-xs" />
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[9.5%]">
        <div className="mx-auto max-w-6xl rounded-[20px] bg-[#a85131] px-7 py-12 text-white shadow-[0_18px_35px_rgba(101,46,26,.18)] sm:px-12">
          <div className="text-5xl text-white">“</div>
          <Copy html={data.design14Quote} light className="max-w-4xl text-xl sm:text-2xl" />
          <p className="mt-6 text-[10px] uppercase tracking-[.16em] text-white">
            {data.design14QuoteDesignation}
          </p>
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[9.5%]">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design14ExploreMiniHeading}</Mini>
          <h2 className="mt-5 max-w-2xl text-5xl font-medium leading-[.94] tracking-[-.055em] sm:text-7xl">
            {data.design14ExploreMainHeading}
          </h2>
          <div className="mt-14 grid gap-3 md:grid-cols-3">
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
               <h3 className="text-xl font-semibold">{card.heading}</h3>
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

export default Design14Page;
