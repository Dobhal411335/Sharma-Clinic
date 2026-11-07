"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  companyAddresses,
  companyDisplayName,
  companyEmails,
  companyPhones,
} from "@/data/site";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";
import { useNavbarSections } from "@/providers/navbar-sections-provider";
const navTriggerClassName =
  "relative gap-2 rounded-md px-3 py-2 text-xs font-semibold tracking-wide uppercase text-white/80 transition-[color,background-color,transform] duration-200 ease-out [&>svg]:ml-0 hover:!bg-transparent hover:text-white focus:!bg-transparent active:scale-[0.98] after:pointer-events-none after:absolute after:bottom-1 after:left-3 after:right-8 after:h-px after:origin-left after:scale-x-0 after:bg-[#f28b5b] after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100 data-open:!bg-transparent data-open:text-white data-open:after:scale-x-100 data-open:hover:!bg-transparent data-popup-open:!bg-transparent data-popup-open:text-white data-popup-open:after:scale-x-100 data-popup-open:hover:!bg-transparent";

const navLinkClassName =
  "relative rounded-md px-3 py-2 text-xs font-semibold tracking-wide uppercase text-white/80 transition-[color,background-color,transform] duration-200 ease-out hover:bg-transparent hover:text-white focus:bg-transparent active:scale-[0.98] after:pointer-events-none after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[#f28b5b] after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function SiteHeader() {
  const company = useCompanyBasicInfo();
  const navLinks = useNavbarSections();

  const brandName = companyDisplayName(company.companyName);
  const logoUrl = company.mainLogo?.url?.trim() || company.mobileUiLogo?.url?.trim() || "";
  const email = companyEmails(company.emails)[0];
  const address = companyAddresses(company.officeAddresses)[0];
  const mapHref =
    company.googleMapLink?.trim() ||
    company.googleLink?.trim() ||
    company.googleUrl?.trim() ||
    "";
  const phone = companyPhones(company.contactNumbers)[0];
  const whatsapp = company.whatsappNumber?.trim() || phone;
  const phoneDigits = phone.replace(/\D/g, "");
  const whatsappDigits = whatsapp.replace(/\D/g, "");

  const utilityContacts = [
    email
      ? {
          href: `mailto:${email}`,
          icon: Mail,
          label: "Email us",
          text: email,
        }
      : null,
    phone
      ? {
          href: `tel:${phoneDigits || phone}`,
          icon: Phone,
          label: "Call us",
          text: phone,
        }
      : null,
    whatsapp
      ? {
          href: `https://wa.me/${whatsappDigits || whatsapp}`,
          icon: MessageCircle,
          label: "Chat with us on WhatsApp",
          text: whatsapp,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    icon: LucideIcon;
    label: string;
    text: string;
  }>;

  const showUtilityBar = Boolean(address) || utilityContacts.length > 0;

  return (
    <>
      {showUtilityBar && (
        <div className="border-b border-white/50 bg-[#14272E]">
          <div className="md:px-10 px-5 flex w-full items-center justify-between gap-4 py-2 text-xs text-white">
            {address ? (
              mapHref ? (
                <Link
                  href={mapHref}
                  aria-label={`Address: ${address}`}
                  className="inline-flex min-w-0 items-center gap-1.5 transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{address}</span>
                </Link>
              ) : (
                <span
                  className="inline-flex min-w-0 items-center gap-1.5"
                  aria-label={`Address: ${address}`}
                >
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{address}</span>
                </span>
              )
            ) : (
              <span />
            )}

            {utilityContacts.length > 0 && (
              <div className="flex shrink-0 items-center gap-3 md:gap-5">
                {utilityContacts.map(({ href, icon: Icon, label, text }) => (
                  <Link
                    key={`${label}-${text}`}
                    href={href}
                    aria-label={`${label}: ${text}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-80"
                    {...(href.startsWith("https://")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="truncate font-serif">{text}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#14272E] backdrop-blur supports-backdrop-filter:bg-[#14272E] border-b border-white/50">
        <div className="mx-10 flex items-center gap-3 py-3 lg:py-4">
          <MobileNav />

          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-white transition-opacity duration-200 hover:opacity-90 sm:text-3xl"
            aria-label={brandName}
          >
            {logoUrl ? (
              <span className="relative block h-10 w-[140px] sm:h-11 sm:w-[160px]">
                <Image
                  src={logoUrl}
                  alt={brandName}
                  fill
                  className="object-contain object-left"
                  sizes="160px"
                  priority
                />
              </span>
            ) : (
              brandName
            )}
          </Link>

          <NavigationMenu
            className="hidden max-w-none flex-1 justify-center lg:flex"
            viewport={false}
          >
            <NavigationMenuList className="flex-wrap gap-1 px-2 py-1">
              {navLinks.map((link, index) => {
                const hasChildren = link.children.length > 0;

                if (!hasChildren) {
                  return (
                    <NavigationMenuItem key={link.id}>
                      <NavigationMenuLink asChild>
                        <Link href={link.href} className={navLinkClassName}>
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                }

                return (
                  <NavigationMenuItem key={link.id}>
                    <NavigationMenuTrigger className={navTriggerClassName}>
                      {link.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="relative z-50 origin-top overflow-visible! rounded-none! bg-transparent! p-0 shadow-none! ring-0! before:pointer-events-none before:absolute before:-top-2 before:left-12 before:z-0 before:size-4 before:rotate-45 before:border-l before:border-t before:border-[#e5ded4] before:bg-white data-open:slide-in-from-top-2 data-closed:slide-out-to-top-1">
                      {index === 0 ? (
                        <div className="relative z-10 grid w-[min(700px,calc(100vw-2rem))] grid-cols-[210px_minmax(0,1fr)] gap-4 overflow-hidden rounded-[24px] border border-[#e5ded4] bg-[#fcfaf7] p-4 shadow-[0_18px_45px_rgba(31,43,55,0.18)]">
                          <div className="flex min-h-[285px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#203640] p-5 text-white">
                            <div className="flex flex-col gap-2">
                              <p className="text-md font-bold uppercase text-[#f28b5b]">
                                {link.menuHeading || link.label}
                              </p>
                              <h3 className="mt-2 text-md line-clamp-2 font-semibold leading-tight tracking-tight">
                                {link.description ||
                                  link.menuDescription ||
                                  "Explore our collection."}
                              </h3>
                            <p className="text-sm line-clamp-2 leading-6 text-white/65">
                              {link.menuDescription ||
                                "Choose the direction that best fits your needs."}
                            </p>
                            </div>
                          </div>
                          <ul className="grid content-center gap-2 py-1">
                            {link.children.map((child, childIndex) => (
                              <li key={child.id}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={child.href}
                                    className="group flex w-full items-center gap-4 rounded-2xl px-3 py-3 hover:ml-2 hover:bg-[#f28b5b] hover:border hover:border-border focus:bg-[#f28b5b]"
                                  >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#edd9c9] bg-[#fbf1e9] text-xs font-semibold text-[#b85f35]">
                                      {String(childIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-base font-semibold text-[#20303a] transition-colors group-hover:text-[#dd632a]">
                                        {child.label}
                                      </span>
                                      {child.description ? (
                                        <span className="mt-0.5 line-clamp-2 text-sm text-[#71808a]">
                                          {child.description}
                                        </span>
                                      ) : null}
                                    </span>
                                    <ArrowUpRight className="size-4 shrink-0 text-[#d9784c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="relative z-10 w-[min(430px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[#e5ded4] bg-white p-3 shadow-[0_18px_45px_rgba(31,43,55,0.18)]">
                          <div className="rounded-3xl bg-[#203640] px-5 py-5 text-white">
                            <h3 className="text-xl font-semibold tracking-tight text-[#f28b5b]">
                              {link.menuHeading || link.label}
                            </h3>
                            {link.menuDescription ? (
                              <p className="mt-1 line-clamp-2 text-sm text-white/70">
                                {link.menuDescription}
                              </p>
                            ) : null}
                          </div>
                          <ul className="mt-2 grid gap-1">
                            {link.children.map((child, childIndex) => (
                              <li key={child.id}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={child.href}
                                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-[#dd632a] focus:bg-[#dd632a]"
                                  >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#edd9c9] bg-[#fbf1e9] text-xs font-semibold text-[#b85f35]">
                                      {String(childIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-sm font-semibold text-[#20303a]">
                                        {child.label}
                                      </span>
                                      {child.description ? (
                                        <span className="mt-0.5 line-clamp-2 block text-xs text-[#71808a]">
                                          {child.description}
                                        </span>
                                      ) : null}
                                    </span>
                                    <ArrowUpRight className="size-4 shrink-0 text-[#d9784c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          <Link
            href="/doctors"
            className="hidden shrink-0 rounded-full bg-white px-5 py-3 text-xs font-semibold tracking-wide text-[#132128] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:inline-flex"
          >
            Appointment your doctor
          </Link>

        </div>
      </header>
    </>
  );
}
