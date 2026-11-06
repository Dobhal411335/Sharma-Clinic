"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Hospital, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { companyDisplayName } from "@/data/site";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";
import { useNavbarSections } from "@/providers/navbar-sections-provider";

export function MobileNav() {
  const company = useCompanyBasicInfo();
  const navLinks = useNavbarSections();
  const brandName = companyDisplayName(company.companyName);
  const logoUrl = company.mobileUiLogo?.url?.trim() || company.mainLogo?.url?.trim() || "";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)] bg-white">
        <SheetHeader>
          <SheetTitle className="font-display text-left text-xl">
            {logoUrl ? (
              <span className="relative block h-9 w-[140px]">
                <Image
                  src={logoUrl}
                  alt={brandName}
                  fill
                  className="object-contain object-left"
                  sizes="140px"
                />
              </span>
            ) : (
              brandName
            )}
          </SheetTitle>
        </SheetHeader>
        <nav
          className="mt-6 flex animate-in fade-in slide-in-from-left-2 flex-col gap-1 px-4 duration-300"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <div key={link.id} className="flex flex-col">
              <Link
                href={link.href}
                className="rounded-md px-2 py-3 text-lg font-medium text-foreground transition-colors duration-200 hover:bg-muted active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
              {link.children.length > 0 ? (
                <div className="mb-1 ml-3 flex animate-in fade-in slide-in-from-left-1 flex-col border-l border-border pl-3 duration-300">
                  {link.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className="rounded-md px-2 py-2 text-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link
            href="/doctors"
            className="mt-5 flex items-center justify-center gap-4 rounded-full border border-primary bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white hover:text-primary focus:bg-white focus:text-primary focus-visible:bg-white focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-white active:text-primary"
          >
            <Hospital/>
            Appointment your doctor
            <ArrowUpRight/>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
