// @ts-nocheck — ported Hotel helpers; keep visual parity with storefront designs.
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { companyDisplayName } from "@/data/site";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";
import {
  ChevronDown,
  Globe,
  Link as LinkIcon,
  MessageCircle,
  Phone,
  Quote,
  Share2,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/lib/toast";
import { HtmlBlock } from "@/features/webpages/utils/html-block";
import { isFilledText } from "@/features/webpages/utils/is-filled-text";

function Facebook({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Instagram({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function Youtube({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM10 15.5V8.5L16 12l-6 3.5Z" />
    </svg>
  );
}
function Linkedin({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}
function Google({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42Z" />
      <path d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.58A10 10 0 0 0 12 22Z" />
      <path d="M6.39 13.98A6.01 6.01 0 0 1 6.08 12c0-.69.12-1.35.31-1.98V7.44H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.56l3.33-2.58Z" />
      <path d="M12 5.89c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.95 2.89 14.7 2 12 2A10 10 0 0 0 3.06 7.44l3.33 2.58C7.18 7.65 9.39 5.89 12 5.89Z" />
    </svg>
  );
}

const cleanTextArray = (items: readonly unknown[] = []): string[] =>
  items.filter((item) => isFilledText(item));

const cleanObjectArray = <T extends object>(
  items: readonly T[] = [],
  keys: readonly (keyof T)[] = [],
): T[] =>
  items.filter((item) => keys.some((key) => isFilledText(item[key])));

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ImageDotsCarousel = ({
  images = [],
  alt = "",
}: {
  images?: Array<{ url?: string } | null | undefined>;
  alt?: string;
}) => {
  const [api, setApi] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.filter((img) => img?.url);

  useEffect(() => {
    if (!api) return undefined;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  if (slides.length === 0) return null;

  if (slides.length === 1) {
    return (
      <div className="overflow-hidden bg-surface rounded-md">
        <Image
          src={slides[0].url}
          alt={alt}
          width={1200}
          height={800}
          className="h-[300px] w-full object-cover md:h-[400px] hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div>
      <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
        <div className="relative overflow-hidden bg-surface rounded-md">
          <CarouselContent className="-ml-0">
            {slides.map((img, idx) => (
              <CarouselItem
                key={img.key || `${img.url}-${idx}`}
                className="pl-0"
              >
                <Image
                  src={img.url}
                  alt={`${alt} ${idx + 1}`}
                  width={1200}
                  height={800}
                  className="h-[300px] w-full object-cover md:h-[400px] hover:scale-105 transition-transform duration-300"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3 z-10 size-9 border-0 bg-card/90 text-heading shadow-sm hover:bg-card disabled:hidden" />
          <CarouselNext className="right-3 z-10 size-9 border-0 bg-card/90 text-heading shadow-sm hover:bg-card disabled:hidden" />
        </div>
      </Carousel>
      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Show image ${idx + 1}`}
            onClick={() => api?.scrollTo(idx)}
            className={cn(
              "size-2 rounded-full transition-colors",
              idx === activeIndex ? "bg-black" : "bg-gray-400",
            )}
          />
        ))}
      </div>
    </div>
  );
};

const StaticSidebarCard = ({ data }) => {
  const firstAd = Array.isArray(data.advertisements)
    ? data.advertisements.find((ad) => ad?.image?.url)
    : null;
  const adImage = firstAd?.image?.url || data.advertisementImage?.url;
  const adUrl = firstAd?.url || data.advertisementUrl;

  if (!adImage) return null;

  const card = (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <Image
        src={adImage}
        alt={data.title || "Advertisement"}
        width={800}
        height={1000}
        className="h-full w-full object-contain transition-all duration-300 hover:scale-105"
      />
    </div>
  );

  if (adUrl) {
    return (
      <a
        href={adUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition hover:opacity-95"
      >
        {card}
      </a>
    );
  }

  return card;
};

const GetInTouchCard = ({ pageTitle = "" }) => {
  const companyInfo = useCompanyBasicInfo();
  const whatsappNumber = (
    companyInfo?.whatsappNumber ||
    companyInfo?.contactNumbers?.[0] ||
    ""
  ).replace(/\D/g, "");
  const phoneNumber = (
    companyInfo?.contactNumbers?.[0] ||
    companyInfo?.whatsappNumber ||
    ""
  ).replace(/\D/g, "");

  const whatsappMessage = [
    "Dear Team,",
    "",
    `I would like to enquire about${pageTitle ? `: ${pageTitle}` : " your services"}.`,
    "",
    "Please share more details at your earliest convenience.",
  ].join("\n");

  return (
    <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-xl font-semibold text-heading">
        Get in Touch Instantly
      </h3>
      <p className="mt-3 font-body text-sm leading-6 text-heading">
        Connect with us right away for quick support, inquiries, or assistance.
        Whether you prefer a direct call, a quick message, or a live chat, our
        team is always ready to help you get the answers you need without any
        delay. Reach out now and experience fast, seamless communication.
      </p>

      <Link
        href="/contact"
        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 font-ui text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Make an enquiry
      </Link>

      <div className="mt-3 flex gap-2">
        {phoneNumber ? (
          <Link
            href={`tel:+${phoneNumber}`}
            className="flex items-center justify-center rounded-full border border-border bg-white p-3 text-heading transition-colors hover:bg-surface"
            aria-label="Call us"
          >
            <Phone className="size-4" />
          </Link>
        ) : null}
        {whatsappNumber ? (
          <Link
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-success py-2.5 font-ui text-xs font-semibold text-white transition-colors hover:bg-success/90"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const AuthorCard = ({ data }) => {
  const authorName = data.sideThumbName || "";
  const authorRole = data.sideThumbDesignation || "";
  const authorDescription = data.sideThumbDescription || "";
  const authorImage =
    data.sideThumbImage?.url ||
    data.mainProfileImage?.url ||
    data.bannerImage?.url;
  const socials = [
    data.facebookUrl
      ? { href: data.facebookUrl, label: "Facebook", icon: Facebook }
      : null,
    data.instaUrl
      ? { href: data.instaUrl, label: "Instagram", icon: Instagram }
      : null,
    data.youtubeUrl
      ? { href: data.youtubeUrl, label: "Website", icon: Globe }
      : null,
    data.googleUrl
      ? { href: data.googleUrl, label: "Google", icon: Google }
      : null,
  ].filter(Boolean);

  return (
    <div className="rounded-md border border-gray-400 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-800">
        About
      </p>
      <div className="mt-4 flex items-start gap-3">
        {authorImage ? (
          <Image
            src={authorImage}
            alt={authorName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe7ff] text-base font-bold text-[#4f46e5]">
            {authorName.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{authorName}</h3>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mt-2 text-gray-800">
            {authorRole}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600 text-justify">
        {authorDescription}
      </p>
      <div className="mt-5 flex items-center gap-3">
        {socials.length > 0 ? (
          socials.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#4f46e5] hover:text-[#4f46e5]"
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))
        ) : (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600">
              <Globe className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600">
              <Instagram className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600">
              <Google className="h-4 w-4" />
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const ShareCard = ({ slug }) => {
  const company = useCompanyBasicInfo();
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${slug}` : "";

  const sharePage = async () => {
    if (!shareUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: companyDisplayName(company.companyName),
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Link copied for sharing");
    } catch (error) {
      if (error?.name !== "AbortError") {
        showError("Unable to share this page");
      }
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Link copied");
    } catch {
      showError("Failed to copy link");
    }
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Share this page</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          onClick={sharePage}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-2 py-3 text-sm font-medium text-gray-700"
        >
          <LinkIcon className="h-4 w-4" />
          Copy Link
        </button>
      </div>
    </div>
  );
};



export {
  isFilledText,
  cleanTextArray,
  cleanObjectArray,
  formatDate,
  HtmlBlock,
  ImageDotsCarousel,
  StaticSidebarCard,
  GetInTouchCard,
  AuthorCard,
  ShareCard,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Google,
};
