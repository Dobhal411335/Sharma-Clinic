"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
import { Design13ContactSection } from "@/features/webpages/designs/Design13ContactSection";
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
export function Design13Page({ data }: { data: StorefrontWebpage }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const timeline = data.design13ProcessTimeline.filter((item) => item.heading || item.description);
  const faqs = data.design13FaqItems.filter((item) => item.question || item.answer);
  const explore = data.design13ExploreCards.filter(
    (item) => item.heading || item.description || item.url,
  );
  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#172d35]">
      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-[#102832] px-6 py-20 text-white sm:px-10 md:px-16 lg:px-[10%] lg:py-28">
        <div className="absolute inset-0 overflow-hidden">
          {data.design13HeroImage?.url && (
            <Image
              src={data.design13HeroImage.url}
              alt={data.design13HeroMainHeading || "Contact"}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-85 transition duration-700 hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,30,39,.96),rgba(7,30,39,.66)_54%,rgba(7,30,39,.14))]" />
        </div>
        <div className="relative max-w-4xl">
          <Mini light>{data.design13HeroMiniHeading}</Mini>
          <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[.93] tracking-[-.055em] sm:text-7xl lg:text-[clamp(4rem,7vw,5.6rem)]">
            {data.design13HeroMainHeading}
          </h1>
          <Copy html={data.design13HeroDescription} light className="mt-8 max-w-xl text-xl" />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto max-w-7xl">
          <div>
            <Mini>{data.design13ProcessMiniHeading}</Mini>
            <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-[.94] tracking-[-.05em] sm:text-7xl">
              {data.design13ProcessMainHeading}
            </h2>
            <div className="mt-14 grid gap-10 md:grid-cols-4 md:gap-0">
              {timeline.map((item, i) => (
                <article key={i} className="relative md:pr-8">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-7 right-0 top-3 hidden h-px bg-[#d3bfae] md:block" />
                  )}
                  <span className="relative z-10 flex size-7 items-center justify-center rounded-full border-4 border-[#f1e0cc] bg-[#cf7b52] shadow-[0_0_0_1px_#cf7b52]">
                    <span className="size-2 rounded-full bg-white" />
                  </span>
                  <div className="mt-5">
                    <p className="text-[15px] font-bold text-[#bd6d4b]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-tight">{item.heading}</h3>
                    <Copy html={item.description} className="mt-3 text-sm" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Design13ContactSection />

      <section className="bg-[#fcfaf6] px-6 py-28 sm:px-10 md:px-16 lg:px-[9%] lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[.9fr_1.1fr] md:items-start lg:gap-24">
          <div>
            <Mini>{data.design13FaqMiniHeading}</Mini>
            <h2 className="mt-7 max-w-2xl text-5xl font-semibold leading-[.9] tracking-[-.06em] sm:text-7xl lg:text-[clamp(4rem,6vw,5.4rem)]">
              {data.design13FaqMainHeading}
            </h2>
          </div>
          <div className="border-t border-[#ded8cf]">
            {faqs.map((item, i) => (
              <div key={i} className="border-b border-[#ded8cf]">
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-5 py-7 text-left text-lg font-medium transition-colors hover:text-[#bd6d4b] sm:text-xl"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.question}</span>
                  <Plus
                    className={`size-5 shrink-0 text-[#bd6d4b] transition-transform duration-300 ${openFaq === i ? "rotate-45" : "group-hover:rotate-90"}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <Copy html={item.answer} className="pb-7 text-base" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[10%]">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design13ExploreMiniHeading}</Mini>
          <h2 className="mt-5 max-w-2xl text-5xl font-semibold leading-[.94] tracking-[-.05em] sm:text-7xl">
            {data.design13ExploreMainHeading}
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

export default Design13Page;
