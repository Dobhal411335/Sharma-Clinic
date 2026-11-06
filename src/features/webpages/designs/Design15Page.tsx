"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
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

export function Design15Page({ data }: { data: StorefrontWebpage }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = data.design15FaqItems.filter((item) => item.question || item.answer);
  const cards = data.design15ExploreCards.filter(
    (item) => item.heading || item.description || item.url,
  );
  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#172d35]">
      <section className="relative overflow-hidden bg-[#0c252e] px-6 py-28 text-white sm:px-10 md:px-16 lg:px-[9.5%] lg:py-36">
        <div className="pointer-events-none absolute -right-24 -top-28 size-[430px] rounded-full border border-white/[.06] shadow-[0_0_0_58px_rgba(255,255,255,.025),0_0_0_116px_rgba(255,255,255,.018)]" />
        <div className="relative mx-auto max-w-7xl">
          <Mini light>{data.design15HeroMiniHeading}</Mini>
          <h1 className="mt-7 max-w-3xl text-5xl font-medium leading-[.92] tracking-[-.06em] sm:text-7xl lg:text-[clamp(4rem,7vw,5.4rem)]">
            {data.design15HeroMainHeading}
          </h1>
          <Copy html={data.design15HeroDescription} light className="mt-10 max-w-2xl text-base" />
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[9.5%] lg:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-14 md:flex-row md:items-start md:gap-20">
          <div className="w-full md:sticky md:top-28 md:w-[42%] md:shrink-0 md:self-start">
            <Mini>{data.design15NoticeMiniHeading}</Mini>
            <h2 className="mt-6 max-w-xl text-5xl font-medium leading-[.94] tracking-[-.055em] sm:text-7xl">
              {data.design15NoticeMainHeading}
            </h2>
            <Copy html={data.design15NoticeDescription} className="mt-8 max-w-md text-sm" />
          </div>
          <div className="min-w-0 flex-1 divide-y divide-[#e4ddd4] border-t border-[#e4ddd4]">
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="transition-colors">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span className="text-lg font-medium transition-all duration-300 hover:ml-2 hover:text-[#cf754d]">
                      {item.question}
                    </span>
                    <Plus
                      className={`size-4 shrink-0 text-[#cf754d] transition duration-300 ${open ? "rotate-45" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <Copy html={item.answer} className="pb-5 text-sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-[9.5%] lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card, i) => (
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
    </div>
  );
}

export default Design15Page;
