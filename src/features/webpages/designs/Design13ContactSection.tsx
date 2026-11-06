"use client";

import Image from "next/image";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useMemo, useState, type ComponentType, type SVGProps } from "react";

import { createContactEnquiry } from "@/features/enquiries/create-enquiry";
import { showError } from "@/lib/toast";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";
import { toApiError } from "@/lib/api/client";

const COUNTRY_CODES = [
  { code: "+91", label: "IN +91" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+971", label: "AE +971" },
  { code: "+61", label: "AU +61" },
  { code: "+65", label: "SG +65" },
] as const;

type SocialIconProps = SVGProps<SVGSVGElement> & { className?: string };

function FacebookIcon({ className, ...props }: SocialIconProps) {
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
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className, ...props }: SocialIconProps) {
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
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className, ...props }: SocialIconProps) {
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
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function telHref(value: string): string {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits}` : "#";
}

function waHref(value: string): string {
  const digits = digitsOnly(value);
  return digits ? `https://wa.me/${digits}` : "#";
}

function resolveMapEmbedSrc(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iframeSrc = trimmed.match(/src=["']([^"']+)["']/i)?.[1];
  if (iframeSrc) return iframeSrc;

  if (/^https?:\/\/(www\.)?google\.[^/]+\/maps/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function GoogleMapEmbed({ html }: { html: string }) {
  const embedSrc = resolveMapEmbedSrc(html);
  if (!embedSrc) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e6ddd1] bg-white shadow-[0_10px_24px_rgba(74,54,34,.06)]">
      <iframe
        title="Company location map"
        src={embedSrc}
        className="aspect-video min-h-[220px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

export function Design13ContactSection() {
  const company = useCompanyBasicInfo();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const logoUrl = company.mainLogo.url || company.footerLogo.url;
  const phones = useMemo(
    () =>
      [
        ...company.contactNumbers,
        company.whatsappNumber ? company.whatsappNumber : null,
      ].filter((value, index, arr): value is string =>
        Boolean(value && arr.indexOf(value) === index),
      ),
    [company.contactNumbers, company.whatsappNumber],
  );

  const socialLinks = useMemo(
    () =>
      [
        company.facebookLink
          ? {
              label: "Facebook",
              href: company.facebookLink,
              Icon: FacebookIcon,
            }
          : null,
        company.instagramLink
          ? {
              label: "Instagram",
              href: company.instagramLink,
              Icon: InstagramIcon,
            }
          : null,
        company.youtubeLink
          ? {
              label: "YouTube",
              href: company.youtubeLink,
              Icon: YoutubeIcon,
            }
          : null,
        company.googleLink
          ? { label: "Google", href: company.googleLink, Icon: MapPin }
          : null,
      ].filter(Boolean) as Array<{
        label: string;
        href: string;
        Icon: ComponentType<{ className?: string }>;
      }>,
    [
      company.facebookLink,
      company.googleLink,
      company.instagramLink,
      company.youtubeLink,
    ],
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email";
    }
    const phoneDigits = digitsOnly(phone);
    if (!phoneDigits) next.phone = "Phone number is required";
    else if (!/^[0-9]{7,15}$/.test(phoneDigits)) {
      next.phone = "Enter a valid phone number";
    }
    if (!message.trim()) next.message = "Please add a short description";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const fullPhone = `${countryCode} ${digitsOnly(phone)}`;
      await createContactEnquiry({
        name: fullName,
        email: email.trim(),
        phone: fullPhone,
        message: message.trim(),
        subject: "Contact Us",
        website: website || undefined,
      });
      setSubmitted(true);
    } catch (error) {
      const apiErr = toApiError(error);
      showError(apiErr.message || "Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#f8f5ee] px-6 py-24 border-t border-[#f7debb] sm:px-10 md:px-16 lg:px-[9%] lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-start md:gap-12 lg:gap-16">
        <aside className="order-2 space-y-8 md:order-1">
          <div>
            <p className="inline-flex items-center gap-3 border-b border-[#bd6d4b] pb-2 font-ui text-[10px] font-bold uppercase tracking-[.2em] text-[#bd6d4b]">
              <span className="h-px w-8 bg-current" />
              Reach out
            </p>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[.94] tracking-[-.05em] text-[#172d35] sm:text-5xl">
              Begin with a{" "}
              <em className="font-medium text-[#8f6a4d]">quiet hello</em>
              .
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#637179]">
              Send us a note or call us if it&apos;s easier. We answer ourselves —
              no bots, no rush.
            </p>
          </div>
          {phones.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#8f6a4d]">
                WhatsApp / Call
              </p>
              <ul className="space-y-3">
                {phones.map((number) => (
                  <li key={number} className="space-y-1">
                    <p className="text-lg font-medium text-[#172d35]">{number}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-[#637179]">
                      <a
                        href={waHref(number)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-[#bd6d4b] hover:underline"
                      >
                        <Phone className="size-3.5" />
                        WhatsApp
                      </a>
                      <a
                        href={telHref(number)}
                        className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-[#bd6d4b] hover:underline"
                      >
                        <Phone className="size-3.5" />
                        Call
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {company.emails.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#8f6a4d]">
                Write to us
              </p>
              <ul className="space-y-2">
                {company.emails.map((address) => (
                  <li key={address}>
                    <a
                      href={`mailto:${address}`}
                      className="inline-flex items-center gap-2 text-[#172d35] underline-offset-2 hover:text-[#bd6d4b] hover:underline"
                    >
                      <Mail className="size-4 shrink-0 text-[#bd6d4b]" />
                      {address}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {company.officeAddresses.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#8f6a4d]">
                Find us
              </p>
              <ul className="space-y-3">
                {company.officeAddresses.map((address) => (
                  <li
                    key={address}
                    className="flex items-start gap-2 text-[#172d35]"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#bd6d4b]" />
                    <span className="leading-relaxed">{address}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {company.googleAddress ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#8f6a4d]">
                Location
              </p>
              <GoogleMapEmbed html={company.googleAddress} />
              {company.googleMapLink ? (
                <a
                  href={company.googleMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm text-[#bd6d4b] underline-offset-2 hover:underline"
                >
                  Open in Google Maps
                </a>
              ) : null}
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#8f6a4d]">
                Social media
              </p>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#172d35] underline-offset-2 hover:text-[#bd6d4b] hover:underline"
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="order-1 rounded-[28px] border border-[#efe7dc] bg-white p-6 shadow-[0_18px_40px_rgba(74,54,34,.08)] md:order-2 md:sticky md:top-24 sm:p-8">
          {submitted ? (
            <div className="flex min-h-[360px] flex-col items-start justify-center gap-4 py-8">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#8f6a4d]">
                Thank you
              </p>
              <h3 className="max-w-md text-3xl font-semibold tracking-[-.04em] text-[#172d35]">
                We&apos;ve received your message.
              </h3>
              <p className="max-w-md text-base leading-7 text-[#637179]">
                Thanks for reaching out
                {firstName.trim() ? `, ${firstName.trim()}` : ""}. Our team
                will get back to you shortly.
              </p>
              <button
                type="button"
                className="mt-2 rounded-full border border-[#d8cfc3] px-5 py-2.5 text-sm font-medium text-[#172d35] transition hover:border-[#bd6d4b] hover:text-[#bd6d4b]"
                onClick={() => {
                  setSubmitted(false);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setMessage("");
                  setWebsite("");
                  setErrors({});
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="relative space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <h3 className="text-3xl font-semibold tracking-[-.04em] text-[#172d35]">
                  Enquire with us
                </h3>
                <p className="mt-2 text-sm text-[#637179]">
                  A few details and we&apos;ll take it from here.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="design13-contact-first-name"
                    className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8f6a4d]"
                  >
                    First name
                  </label>
                  <input
                    id="design13-contact-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    className="h-12 w-full rounded-xl border border-[#e6ddd1] bg-[#fcfaf6] px-4 text-[#172d35] outline-none transition focus:border-[#bd6d4b]"
                    autoComplete="given-name"
                  />
                  {errors.firstName ? (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="design13-contact-last-name"
                    className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8f6a4d]"
                  >
                    Last name
                  </label>
                  <input
                    id="design13-contact-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                    className="h-12 w-full rounded-xl border border-[#e6ddd1] bg-[#fcfaf6] px-4 text-[#172d35] outline-none transition focus:border-[#bd6d4b]"
                    autoComplete="family-name"
                  />
                  {errors.lastName ? (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="design13-contact-email"
                  className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8f6a4d]"
                >
                  Email
                </label>
                <input
                  id="design13-contact-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-[#e6ddd1] bg-[#fcfaf6] px-4 text-[#172d35] outline-none transition focus:border-[#bd6d4b]"
                  autoComplete="email"
                />
                {errors.email ? (
                  <p className="text-sm text-red-600">{errors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="design13-contact-phone"
                  className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8f6a4d]"
                >
                  Phone
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value)}
                    className="h-12 shrink-0 rounded-xl border border-[#e6ddd1] bg-[#fcfaf6] px-3 text-sm text-[#172d35] outline-none transition focus:border-[#bd6d4b]"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="design13-contact-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="98XXXXXXXX"
                    className="h-12 w-full rounded-xl border border-[#e6ddd1] bg-[#fcfaf6] px-4 text-[#172d35] outline-none transition focus:border-[#bd6d4b]"
                    autoComplete="tel-national"
                    inputMode="tel"
                  />
                </div>
                {errors.phone ? (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="design13-contact-message"
                  className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8f6a4d]"
                >
                  What are you hoping for?
                </label>
                <textarea
                  id="design13-contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Share a short note about your enquiry…"
                  className="w-full resize-y rounded-xl border border-[#e6ddd1] bg-[#fcfaf6] px-4 py-3 text-[#172d35] outline-none transition focus:border-[#bd6d4b]"
                />
                {errors.message ? (
                  <p className="text-sm text-red-600">{errors.message}</p>
                ) : null}
              </div>

              {/* Honeypot — keep visually hidden from people, not bots. */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden>
                <label htmlFor="design13-contact-website">Website</label>
                <input
                  id="design13-contact-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#8f6a4d] px-6 text-sm font-semibold text-white transition hover:bg-[#7a593f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send className="size-4" />
                {submitting ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
