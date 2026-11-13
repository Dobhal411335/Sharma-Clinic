import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HtmlBlock } from "@/features/webpages/utils/html-block";
import { isFilledText } from "@/features/webpages/utils/is-filled-text";
import {
  doctorProfileSlug,
  formatDoctorDisplayName,
  type DoctorProfile,
} from "@/types/doctors";

function doctorGivenName(rawName: string): string {
  const display = formatDoctorDisplayName(rawName);
  const withoutTitle = display
    .replace(
      /^(Prof\.\s*Dr\.|Assoc\.\s*Prof\.\s*Dr\.|Assoc\.\s*Prof\.|Prof\.|Surgeon\.|MD\.|Dr\.)\s+/i,
      "",
    )
    .trim();
  return withoutTitle.split(/\s+/).join(" ") || display;
}

type DoctorDetailsHeroProps = {
  doctor: DoctorProfile;
};

export function DoctorDetailsHero({ doctor }: DoctorDetailsHeroProps) {
  const displayName = formatDoctorDisplayName(doctor.name);
  const givenName = doctorGivenName(doctor.name);
  const specialty = doctor.specializations.map((item) => item.trim()).filter(Boolean);
  const phone = doctor.phone.trim();
  const email = doctor.email.trim();
  const location =
    doctor.location.trim() ||
    [doctor.city, doctor.state].filter(Boolean).join(", ");
  const about = doctor.about.trim();
  const qualificationTitle =
    doctor.qualificationTitle.trim() || "Qualification";
  const qualificationCards = (doctor.qualificationCards ?? []).filter(
    (card) =>
      card.heading.trim() ||
      card.descriptions.some((description) => isFilledText(description)),
  );
  const canBook = Boolean(doctor.staffDoctorId);
  const bookingHref = `/book-appointment/${doctorProfileSlug(doctor.name)}`;

  return (
    <section className="bg-background" aria-labelledby="doctor-details-heading">
      <div className="container-page pb-14 pt-5 sm:pb-16 lg:pb-20">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)] lg:gap-8 xl:gap-10">
          <div className="relative aspect-5/5 overflow-hidden rounded-[28px] bg-muted lg:sticky lg:top-20 lg:self-start">
            <Image
              src={doctor.photoUrl}
              alt={displayName}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 92vw, 38vw"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-5 lg:gap-6 lg:py-1">
            <div className="rounded-[24px] bg-[#eef2f6] px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1
                    id="doctor-details-heading"
                    className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl"
                  >
                    {displayName}
                  </h1>
                  {specialty.length > 0 ? (
                    <p className="mt-2 text-base font-medium text-primary sm:text-lg">
                      {specialty.join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>

              <ul className="mt-7 space-y-3.5">
                {phone ? (
                  <li className="flex items-center gap-3 text-sm text-[#4b5563] sm:text-[15px]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Phone className="size-4" aria-hidden />
                    </span>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-primary"
                    >
                      {phone}
                    </a>
                  </li>
                ) : null}
                {email ? (
                  <li className="flex items-center gap-3 text-sm text-[#4b5563] sm:text-[15px]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Mail className="size-4" aria-hidden />
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="truncate transition-colors hover:text-primary"
                    >
                      {email}
                    </a>
                  </li>
                ) : null}
                {location ? (
                  <li className="flex items-start gap-3 text-sm text-[#4b5563] sm:text-[15px]">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <span className="leading-relaxed">{location}</span>
                  </li>
                ) : null}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {canBook ? (
                  <Button
                    asChild
                    size="lg"
                    variant="default"
                    className="group h-12 rounded-full bg-red-500 px-6 pr-2 text-md font-semibold shadow-none transition-colors duration-300 ease-out hover:bg-red-600"
                  >
                    <Link href={bookingHref}>
                      Book An Appointment
                      <span className="ml-2 flex size-8 items-center justify-center rounded-full bg-white text-destructive">
                        <ArrowRight
                          className="size-6 transition-transform duration-300 ease-out group-hover:-rotate-45"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    variant="destructive"
                    disabled
                    className="h-12 rounded-full px-6 pr-2 text-sm font-semibold shadow-none"
                  >
                    Book An Appointment
                    <span className="ml-2 flex size-8 items-center justify-center rounded-full bg-white text-destructive">
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {isFilledText(about) || qualificationCards.length > 0 ? (
              <div
                className={
                  isFilledText(about) && qualificationCards.length > 0
                    ? "grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.9fr)] lg:gap-6"
                    : "grid gap-5"
                }
              >
                {isFilledText(about) ? (
                  <article className="rounded-[24px] bg-[#f6ebe7] px-6 py-7 sm:px-7 sm:py-8">
                    <h2 className="text-xl font-bold tracking-tight text-secondary sm:text-2xl">
                      About {givenName}
                    </h2>
                    <HtmlBlock
                      html={about}
                      className="mt-4 text-sm leading-7 text-[#5b6470] sm:text-[15px]"
                    />
                  </article>
                ) : null}

                {qualificationCards.length > 0 ? (
                  <article className="rounded-[24px] bg-[#e7f2ed] px-6 py-7 sm:px-7 sm:py-8">
                    <h2 className="text-xl font-bold tracking-tight text-secondary sm:text-2xl">
                      {qualificationTitle}
                    </h2>
                    <div className="mt-5">
                      {qualificationCards.map((card, index) => (
                        <div
                          key={card.id}
                          className={
                            index > 0
                              ? "border-t border-[#cfe0d8] py-4 first:pt-0 last:pb-0"
                              : "py-4 first:pt-0 last:pb-0"
                          }
                        >
                          {card.heading.trim() ? (
                            <h3 className="text-sm font-semibold text-secondary">
                              {card.heading.trim()}
                            </h3>
                          ) : null}
                          <div
                            className={
                              card.heading.trim()
                                ? "mt-1.5 space-y-3"
                                : "space-y-3"
                            }
                          >
                            {card.descriptions
                              .filter((description) => isFilledText(description))
                              .map((description, descriptionIndex) => (
                                <HtmlBlock
                                  key={`${card.id}-${descriptionIndex}`}
                                  html={description}
                                  className="text-sm font-medium leading-relaxed text-[#5b6470]"
                                />
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
