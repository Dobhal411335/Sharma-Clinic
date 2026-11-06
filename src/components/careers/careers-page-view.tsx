import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { CareerApplicationForm } from "@/components/careers/career-application-form";
import { careersPage } from "@/data/careers";

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function CareersPageView({
  name,
  emails,
  phones,
  addresses,
}: {
  name: string;
  emails: string[];
  phones: string[];
  addresses: string[];
}) {
  return (
    <>
      <section
        className="bg-secondary text-secondary-foreground"
        aria-label="Careers banner"
      >
        <div className="container-page flex min-h-[16rem] flex-col justify-end py-12 sm:min-h-[20rem] sm:py-16">
          <nav className="text-sm text-secondary-foreground/75" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-secondary-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary-foreground">Careers</span>
          </nav>
          <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
            Careers
          </p>
          <p className="mt-4 max-w-3xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {careersPage.bannerLine}
          </p>
          <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
        </div>
      </section>

      <section className="bg-white" aria-labelledby="careers-heading">
        <div className="container-page section-space py-12 sm:py-16 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
            <div>
              <h1
                id="careers-heading"
                className="text-3xl leading-tight font-semibold tracking-[-0.03em] text-foreground sm:text-4xl"
              >
                {careersPage.titleLead} {name}.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-[#34475c] sm:text-[1.05rem]">
                {careersPage.body}
              </p>

              <div className="mt-8 space-y-4">
            <article className="rounded-[1.5rem] border border-[#e8e5df] bg-[#f7f5f1] p-7 transition-shadow duration-300">
              <div className="flex size-11 items-center justify-center rounded-full bg-white text-primary">
                <Mail className="size-5" aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#17283d]">
                Send Your CV / Resume
              </h2>
              <ul className="mt-4 space-y-2">
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
            </article>

            <article className="rounded-[1.5rem] border border-[#e8e5df] bg-[#f7f5f1] p-7 transition-shadow duration-300">
              <div className="flex size-11 items-center justify-center rounded-full bg-white text-primary">
                <Phone className="size-5" aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#17283d]">Inquiries</h2>
              <ul className="mt-4 space-y-2">
                {phones.map((phone) => (
                  <li key={phone}>
                    <a
                      href={phoneHref(phone)}
                      className="text-sm font-medium text-[#17283d] hover:text-primary"
                    >
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.5rem] border border-[#e8e5df] bg-[#f7f5f1] p-7 transition-shadow duration-300">
              <div className="flex size-11 items-center justify-center rounded-full bg-white text-primary">
                <MapPin className="size-5" aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#17283d]">Work Locations</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <li key={address}>
                    <p className="text-sm leading-relaxed text-[#657487]">{address}</p>
                  </li>
                ))}
              </ul>
            </article>
              </div>
            </div>

            <CareerApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
