"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { StorefrontAboutUsBanner, StorefrontService } from "@/types/about-us-banner";

type OurServicesProps = Pick<
  StorefrontAboutUsBanner,
  "servicesHeading" | "servicesViewAll" | "services"
>;

function ServiceImage({ service }: { service: StorefrontService }) {
  return service.image.src ? (
    <div className="relative min-h-72 overflow-hidden rounded-2xl bg-muted sm:min-h-96 lg:min-h-[28rem]">
      <Image
        src={service.image.src}
        alt={service.image.alt}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300 ease-out"
        sizes="(max-width: 1024px) 100vw, 38vw"
      />
    </div>
  ) : (
    <div className="min-h-72 rounded-2xl bg-muted sm:min-h-96 lg:min-h-[28rem]" />
  );
}

export function OurServices({ servicesHeading, servicesViewAll, services }: OurServicesProps) {
  const [selected, setSelected] = useState(0);

  if (services.length === 0) return null;
  const service = services[selected % services.length]!;

  return (
    <section
      className="bg-[#f8f5ee] py-16 sm:py-20 lg:py-24"
      aria-labelledby="our-services-heading"
    >
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:items-center lg:gap-16">
          <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
              Our Services
            </p>
            <h2
              id="our-services-heading"
              className="mt-2 max-w-xl text-4xl font-semibold tracking-tight text-[#1d2b3f] sm:text-5xl"
            >
              {servicesHeading}
            </h2>
            <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />

            <div className="mt-8 space-y-2">
              {services.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`flex w-full items-center justify-between rounded-full px-7 py-4 text-left text-base transition-colors ${index === selected ? "bg-primary text-primary-foreground" : "bg-white text-[#1d2b3f] hover:bg-white/80"}`}
                  aria-pressed={index === selected}
                >
                  <span>{item.buttonLabel}</span>
                  <ArrowUpRight className="size-5" />
                </button>
              ))}
            </div>
            <Link
              href={servicesViewAll.href}
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {servicesViewAll.label}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:items-center">
              <ServiceImage service={service} />
              <div className="flex flex-col justify-between gap-5">
                <div className="">
                  <h3 className="text-2xl font-semibold tracking-tight text-[#1d2b3f] sm:text-3xl">
                    {service.heading}
                  </h3>
                  <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-[#46617a]">
                  {service.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {service.doctor.image.src ? (
                      <Image
                        src={service.doctor.image.src}
                        alt={service.doctor.image.alt}
                        width={48}
                        height={48}
                        className="size-12 rounded-full object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1d2b3f]">{service.doctor.name}</p>
                      <p className="truncate text-xs text-primary">{service.doctor.designation}</p>
                    </div>
                  </div>
                  <Button asChild size="icon" className="size-12 shrink-0 rounded-full">
                    <Link href={service.doctor.cta.href} aria-label={service.doctor.cta.label}>
                      <ArrowUpRight className="size-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
