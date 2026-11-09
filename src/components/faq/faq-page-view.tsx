"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";

import { OffersBanner } from "@/components/shared/offers-banner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { faqIntro } from "@/data/faq";
import { FALLBACK_FAQ_SECTIONS } from "@/features/faq/faq.defaults";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";
import type { StorefrontFaqSection } from "@/types/faq";

type FaqPageViewProps = {
  sections?: StorefrontFaqSection[];
};

const cardClassName = "rounded-xl border border-[#e8e4dc] bg-white shadow-none";

function formatPhone(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return number;
}

function phoneHref(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.startsWith("91") && digits.length > 10) return `tel:+${digits}`;
  return `tel:${digits || number}`;
}

export function FaqPageView({ sections }: FaqPageViewProps) {
  const company = useCompanyBasicInfo();
  const categories = sections && sections.length > 0 ? sections : FALLBACK_FAQ_SECTIONS;
  const [topic, setTopic] = useState("all");
  const emails = company.emails.map((email) => email.trim()).filter(Boolean);
  const phones = company.contactNumbers.map((phone) => phone.trim()).filter(Boolean);
  const addresses = company.officeAddresses.map((address) => address.trim()).filter(Boolean);

  const visibleCategories = useMemo(() => {
    if (topic === "all") return categories;
    return categories.filter((category) => category.id === topic);
  }, [categories, topic]);

  return (
    <>
      <section className="bg-[#f8f5ee]">
        <div className="container-page section-space">
          <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">FAQs</span>
          </nav>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <h1 className="text-3xl font-semibold tracking-wide uppercase sm:text-4xl">
              {faqIntro.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {faqIntro.body}
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)]">
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className={`${cardClassName} p-5`}>
                <label htmlFor="faq-topic" className="mb-2 block text-sm font-medium">
                  Filter by topic:
                </label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger id="faq-topic" className="w-full max-w-xs shadow-none">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {emails.length > 0 ? (
                <div className={`${cardClassName} p-5`}>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-primary" aria-hidden />
                    <h2 className="text-lg font-semibold">Email</h2>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {emails.map((email) => (
                      <li key={email}>
                        <a
                          href={`mailto:${email}`}
                          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {phones.length > 0 ? (
                <div className={`${cardClassName} p-5`}>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-primary" aria-hidden />
                    <h2 className="text-lg font-semibold">Phone</h2>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {phones.map((phone) => (
                      <li key={phone}>
                        <a
                          href={phoneHref(phone)}
                          className="text-sm font-medium text-foreground hover:text-primary"
                        >
                          {formatPhone(phone)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {addresses.length > 0 ? (
                <div className={`${cardClassName} p-5`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" aria-hidden />
                    <h2 className="text-lg font-semibold">Address</h2>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {addresses.map((address) => (
                      <li key={address} className="text-sm leading-relaxed text-muted-foreground">
                        {address}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={`${cardClassName} p-5`}>
                <h2 className="text-lg font-semibold">Need help?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Still stuck after reading the FAQs? Send a message from the contact page.
                </p>
                <Button asChild variant="outline" className="mt-4 h-auto w-full gap-2 py-3 shadow-none">
                  <Link href="/contact-with-us">
                    <MessageSquare className="size-4" aria-hidden />
                    Message us
                  </Link>
                </Button>
              </div>
            </aside>

            <div className="space-y-8">
              {visibleCategories.map((category) => (
                <section key={category.id} aria-labelledby={`faq-${category.id}`}>
                  <h2
                    id={`faq-${category.id}`}
                    className="border-b border-[#e8e4dc] pb-2 text-xl font-semibold"
                  >
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="mt-4 gap-3">
                    {category.items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className={`${cardClassName} px-4`}
                      >
                        <AccordionTrigger className="py-4 text-base shadow-none hover:no-underline">
                          <span>
                            <span className="mr-1 font-semibold text-foreground">Q:</span>
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-4 text-foreground">
                          <p className="leading-relaxed">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}

              {visibleCategories.length === 0 ? (
                <p className={`${cardClassName} p-5 text-sm text-muted-foreground`}>
                  No questions in this topic yet.
                </p>
              ) : null}

              <div className={`${cardClassName} px-6 py-10 text-center`}>
                <p className="text-sm text-muted-foreground">
                  Unable to find satisfactory answers?
                </p>
                <Button asChild size="lg" className="mt-4 rounded-md shadow-none">
                  <Link href="/contact-with-us">Contact support</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <OffersBanner />
    </>
  );
}
