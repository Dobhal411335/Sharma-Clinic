"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AtSign,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { footer } from "@/data/landing";
import { companyDisplayName } from "@/data/site";
import { subscribeNewsletter } from "@/features/newsletter/newsletter.service";
import { showError, showSuccess } from "@/lib/toast";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";
import { useFooter } from "@/providers/footer-provider";

function formatPhone(number: string): string {
  const digits = String(number || "").replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return number;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM10 15.5V8.5L16 12l-6 3.5Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42Z" />
      <path d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.58A10 10 0 0 0 12 22Z" />
      <path d="M6.39 13.98A6.01 6.01 0 0 1 6.08 12c0-.69.12-1.35.31-1.98V7.44H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.56l3.33-2.58Z" />
      <path d="M12 5.89c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.95 2.89 14.7 2 12 2A10 10 0 0 0 3.06 7.44l3.33 2.58C7.18 7.65 9.39 5.89 12 5.89Z" />
    </svg>
  );
}

const PAYMENT_CARDS = [
  { name: "UPI", src: "/card/upi.jpg" },
  { name: "Visa", src: "/card/visa.png" },
  { name: "Mastercard", src: "/card/mastercard.webp" },
  { name: "RuPay", src: "/card/rupay.webp" },
] as const;

export function SiteFooter() {
  const company = useCompanyBasicInfo();
  const managedFooter = useFooter();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail) {
      showError("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showError("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    try {
      await subscribeNewsletter(cleanEmail);
      showSuccess("Thank you for subscribing!");
      setNewsletterEmail("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to subscribe. Please try again.";
      showError(msg);
    } finally {
      setIsSubscribing(false);
    }
  };

  const brandName = companyDisplayName(company.companyName || footer.brand);
  const footerLogoSrc =
    company.footerLogo?.url?.trim() ||
    company.mainLogo?.url?.trim() ||
    "";

  const addresses =
    company.officeAddresses?.length > 0
      ? company.officeAddresses
      : footer.contact
        .filter((item) => item.icon === "map")
        .map((item) => item.label);

  const phones =
    company.contactNumbers?.length > 0
      ? company.contactNumbers
      : footer.contact
        .filter((item) => item.icon === "phone")
        .map((item) => item.label);

  const emails =
    company.emails?.length > 0
      ? company.emails
      : footer.contact
        .filter((item) => item.icon === "mail")
        .map((item) => item.label);

  const googleHref =
    company.googleLink?.trim() ||
    company.googleUrl?.trim() ||
    company.googleMapLink?.trim() ||
    "https://www.google.com";

  const socialLinks = [
    { href: company.facebookLink, label: "Facebook", Icon: FacebookIcon },
    { href: company.instagramLink, label: "Instagram", Icon: InstagramIcon },
    { href: company.youtubeLink, label: "YouTube", Icon: YoutubeIcon },
    { href: googleHref, label: "Google", Icon: GoogleIcon },
  ].filter((item) => Boolean(item.href?.trim()));

  const columns = managedFooter.columns;
  const thankYou = managedFooter.thankYou || footer.thankYou;
  const description = managedFooter.description || footer.description;
  const primaryPhone = phones[0] ?? "";
  const primaryPhoneHref = primaryPhone
    ? `tel:+91${String(primaryPhone).replace(/\D/g, "")}`
    : "/contact";
  const primaryEmail = emails[0] ?? "";
  const messageHref = primaryEmail ? `mailto:${primaryEmail}` : "/contact";

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <div>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Contact Us
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {addresses.map((text) => (
                <li key={text} className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
              {phones.map((number) => (
                <li key={number} className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`tel:+91${String(number).replace(/\D/g, "")}`}
                    className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {formatPhone(number)}
                  </a>
                </li>
              ))}
              {emails.map((email) => (
                <li key={email} className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-4 text-base font-semibold text-foreground">
                {column.title}
              </h2>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <aside className="rounded bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-start sm:gap-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
              Start a conversation with our team.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We are here to provide the support and guidance you need, ensuring
              every question is answered with care to help you feel confident
              throughout your treatment.
            </p>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            <li>
              <a
                href={messageHref}
                className="flex h-full flex-col rounded border border-[#e6e2db] bg-white p-5 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-[#f5f0e8] text-foreground">
                  <AtSign className="size-5" aria-hidden />
                </span>
                <span className="mt-4 block text-base font-semibold text-foreground">
                  Message us
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  Send our dedicated team a secure message, and we will get back
                  to you very promptly.
                </span>
              </a>
            </li>
            <li>
              <Link
                href="/contact"
                className="flex h-full flex-col rounded border border-[#e6e2db] bg-white p-5 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-[#f5f0e8] text-foreground">
                  <MessageCircle className="size-5" aria-hidden />
                </span>
                <span className="mt-4 block text-base font-semibold text-foreground">
                  Chat
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  Connect with a friendly team member right now for instant
                  answers to all your important questions.
                </span>
              </Link>
            </li>
            <li>
              <a
                href={primaryPhoneHref}
                className="flex h-full flex-col rounded border border-[#e6e2db] bg-white p-5 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-[#f5f0e8] text-foreground">
                  <PhoneCall className="size-5" aria-hidden />
                </span>
                <span className="mt-4 block text-base font-semibold text-foreground">
                  Book a call
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  Schedule a convenient time for a private, professional
                  discussion with one of our experienced medical experts.
                </span>
              </a>
            </li>
          </ul>
        </aside>
      </div>

      <Separator />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.1fr_1.4fr_1fr] lg:items-start lg:gap-12">
        <div>
          {footerLogoSrc ? (
            <div className="relative mb-4 h-12 w-[180px]">
              <Image
                src={footerLogoSrc}
                alt={brandName}
                fill
                className="object-contain object-left"
                sizes="180px"
              />
            </div>
          ) : (
            <p className="font-display text-3xl font-semibold text-foreground">
              {brandName}
            </p>
          )}
          <p className="mt-1 text-base font-semibold text-foreground">
            {thankYou}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mx-auto w-full max-w-md text-center lg:max-w-none">
          <h2 className="text-base font-semibold text-foreground">
            Subscribe Our Newsletter
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Product updates and store news. Consent required before any live
            signup.
          </p>
          <form
            className="mt-5"
            onSubmit={handleSubscribe}
          >
            <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1.5 shadow-sm">
              <Input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                aria-label="Email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={isSubscribing}
                className="h-10 flex-1 border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubscribing}
                className="h-10 shrink-0 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90 transition-all flex items-center gap-2"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-6 lg:items-end lg:text-right">
          {socialLinks.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-foreground">Follow Us</p>
              <div className="mt-3 flex items-center gap-3 lg:justify-end">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              We Accept Payments
            </p>
            <div className="flex flex-nowrap items-center gap-2.5 lg:justify-end">
              {PAYMENT_CARDS.map((card) => (
                <div
                  key={card.name}
                  className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-white p-1 shadow-xs transition-transform hover:scale-105"
                  title={card.name}
                >
                  <Image
                    src={card.src}
                    alt={card.name}
                    width={48}
                    height={32}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-500">
        <p className="py-4 text-center text-sm text-white bg-[#14272E]">
          &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
