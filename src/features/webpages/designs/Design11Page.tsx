"use client";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
import { HtmlBlock, isFilledText } from "@/features/webpages/webpage-shared";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";

const Mini = ({ children, light = false }: { children?: string; light?: boolean }) =>
  children ? (
    <p
      className={`inline-flex items-center gap-3 border-b pb-2 font-ui text-[11px] font-bold uppercase tracking-[.2em] ${light ? "border-[#d68b64] text-[#d68b64]" : "border-[#bd6d4b] text-[#bd6d4b]"}`}
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

export function Design11Page({ data }: { data: StorefrontWebpage }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const capabilities = data.design11CapabilitiesCards.filter(
    (c) => c.heading || c.description || c.miniBadgeHeading,
  );
  const process = data.design11ProcessCards.filter((c) => c.subHeading || c.subDescription);
  const engagements = data.design11EngagementCards.filter(
    (c) => c.heading || c.description || c.miniBadgeHeading,
  );
  const faqs = data.design11FaqItems.filter((c) => c.question || c.answer);
  const explore = data.design11ExploreCards.filter((c) => c.heading || c.subHeading);
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5ee] text-[#172d35]">
      <section className="relative flex min-h-[610px] items-end overflow-hidden bg-[#102832] px-6 py-20 text-white sm:px-10 md:px-16 lg:px-[10%] lg:py-28">
        {data.design11HeroImage?.url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{ backgroundImage: `url(${data.design11HeroImage.url})` }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,40,.95),rgba(8,31,40,.65)_50%,rgba(8,31,40,.18))]" />
        <div className="relative max-w-3xl">
          <Mini light>{data.design11HeroMiniHeading}</Mini>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold font-sans leading-[0.95] tracking-[-.025em] sm:text-7xl lg:text-[clamp(4rem,7vw,5.2rem)]">
            {data.design11HeroMainHeading}
          </h1>
          <Copy html={data.design11HeroDescription} light className="mt-8 max-w-xl text-xl" />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-[1.1fr_.4fr] md:items-end">
            <div>
              <Mini>{data.design11CapabilitiesMiniHeading}</Mini>
              <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.05em] sm:text-7xl">
                {data.design11CapabilitiesMainHeading}
              </h2>
            </div>
            <Copy html={data.design11CapabilitiesDescription} className="max-w-xs text-xl" />
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((card, i) => (
              <article
                key={i}
                className="group relative min-h-[250px] overflow-hidden rounded-[18px] border border-white/80 bg-[#fcfaf8] p-6 shadow-[0_15px_35px_rgba(74,54,34,.08)] transition duration-300 hover:-translate-y-1 hover:bg-[#cf7b52] hover:text-white"
              >
                <span className="relative z-10 flex size-10 items-center justify-center rounded-[11px] bg-[#f6e9dc] text-sm text-[#bd6d4b] group-hover:bg-white/15 group-hover:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="relative z-10 mt-7 rounded-full bg-[#f7eae0] px-3 py-3 text-[9px] font-bold uppercase tracking-[.13em] text-[#bd6d4b] group-hover:bg-white/15 group-hover:text-white">
                  {card.miniBadgeHeading}
                </p>
                <h3 className="relative z-10 mt-2 text-2xl font-semibold leading-tight tracking-[-.04em]">
                  {card.heading}
                </h3>
                <Copy
                  html={card.description}
                  className="relative z-10 mt-4 text-sm tracking-wide group-hover:[&_p]:!text-white"
                />
                {card.buttonUrl && (
                  <Link
                    href={card.buttonUrl}
                    className="relative z-10 mt-5 inline-flex text-[13px] font-bold text-[#bd6d4b] group-hover:text-white"
                  >
                    View service <ArrowUpRight className="ml-1 size-5" />
                  </Link>
                )}
                <span className="pointer-events-none absolute -bottom-20 -right-16 size-48 rounded-full border-10 border-[#eee7df] group-hover:border-white/20" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[1.1fr_.4fr] md:items-end">
            <div>
              <Mini>{data.design11ProcessMiniHeading}</Mini>
              <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.98] tracking-[-.04em] sm:text-7xl">
                {data.design11ProcessMainHeading}
              </h2>
            </div>
            <Copy html={data.design11ProcessDescription} className="max-w-md text-xl" />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((card, i) => (
              <article
                key={i}
                className="border-t border-[#e5ded4] pt-5 transition duration-300 hover:translate-x-1 hover:border-[#bd6d4b]"
              >
                <p className="text-[13px] font-bold text-[#bd6d4b]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-2xl line-clamp-2 font-semibold">{card.subHeading}</h3>
                <Copy html={card.subDescription} className="mt-4 text-[15px] line-clamp-3" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-white sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <Mini light>{data.design11EngagementMiniHeading}</Mini>
          <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[.94] tracking-[-.04em] sm:text-7xl">
            {data.design11EngagementMainHeading}
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {engagements.map((card, i) => (
              <article
                key={i}
                className="group relative min-h-[300px] overflow-hidden rounded-[24px] border border-white/15 bg-[#203b45] p-9 transition duration-300 hover:border-[#cf7b52] hover:bg-[#274651]"
              >
                <p className="relative z-10 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#d68b64] transition duration-300 group-hover:border-[#cf7b52] group-hover:bg-[#cf7b52] group-hover:text-white">
                  {card.miniBadgeHeading}
                </p>
                <h3 className="relative z-10 mt-8 text-2xl font-semibold leading-tight tracking-[-.03em]">
                  {card.heading}
                </h3>
                <Copy html={card.description} light className="relative z-10 mt-8 text-base" />
                <span className="pointer-events-none absolute -bottom-24 -right-16 size-64 rounded-full border-10 border-white/10 transition duration-300 group-hover:border-[#cf7b52]/30" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 sm:px-10 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.9fr_0.8fr] md:items-start">
          <div>
            <Mini>{data.design11FaqMiniHeading}</Mini>
            <h2 className="mt-7 max-w-2xl text-5xl font-medium leading-[.9] tracking-[-.05em] sm:text-7xl lg:text-[clamp(4rem,6vw,5rem)]">
              {data.design11FaqMainHeading}
            </h2>
            <Copy html={data.design11FaqDescription} className="mt-12 max-w-lg text-lg" />
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
                  <span className="max-w-xl text-md"> {item.question}</span>
                  <Plus
                    className={`size-5 shrink-0 text-[#bd6d4b] transition-transform duration-300 ${openFaq === i ? "rotate-45" : "group-hover:rotate-90"}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <Copy html={item.answer} className="pb-7 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <Mini>{data.design11ExploreMiniHeading}</Mini>
          <h2 className="mt-5 max-w-2xl text-5xl font-medium leading-[.94] tracking-[-.04em] sm:text-7xl">
            {data.design11ExploreMainHeading}
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {explore.map((card, i) => (
           <Link
           href={"#"}
           key={i}
           className="group flex min-h-[125px] items-center gap-4 rounded-2xl border border-white/90 bg-[#fcfaf6] p-5 shadow-[0_12px_26px_rgba(74,54,34,.07)] transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_34px_rgba(74,54,34,.14)]"
         >
           <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f6e9dc] text-[13px] font-bold text-[#bd6d4b] transition group-hover:bg-[#cf754d] group-hover:text-white">
             {String(i + 1).padStart(2, "0")}
           </span>
           <span className="min-w-0 flex-1"> 
             <h3 className="text-xl font-semibold">{card.heading}</h3>
             <Copy html={card.subHeading} className="mt-1 text-sm" />
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
export default Design11Page;
