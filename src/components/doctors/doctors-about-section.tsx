"use client";
import Link from "next/link";

import type { DoctorPageConfig } from "@/types/doctors";
import Image from "next/image";
type DoctorsAboutSectionProps = {
  config: DoctorPageConfig;
};

export function DoctorsAboutSection({ config }: DoctorsAboutSectionProps) {
  const hasContent =
    config.aboutHeading ||
    config.aboutDescription ||
    config.aboutHighlights.length > 0 ||
    config.aboutImageUrl;

  if (!hasContent) {
    return null;
  }

  const highlights = config.aboutHighlights.filter(Boolean);
  const buttonHref = config.aboutButtonUrl?.trim() || "#";

  return (
    <section
      className="bg-[#f8f5ee] py-14"
      aria-labelledby="doctors-about-heading"
    >
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-[#565CEB]" aria-hidden />
            About Us
          </p>
          {config.aboutHeading ? (
            <h1
              id="doctors-about-heading"
              className="max-w-xl text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.6rem] lg:leading-[1.2]"
            >
              {config.aboutHeading}
            </h1>
          ) : null}
          {config.aboutDescription ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {config.aboutDescription}
            </p>
          ) : null}

          {highlights.length > 0 ? (
            <ul className="mt-6 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-semibold text-foreground"
                >
                  <span
                    className="inline-block size-2 shrink-0 rounded-full bg-foreground"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {config.aboutButtonLabel ? (
            <div className="mt-8">
              <Link
                href={buttonHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#565CEB] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#565CEB]/25 transition-all hover:bg-[#484FD9] hover:shadow-xl active:scale-[0.98] sm:text-sm"
              >
                <span>{config.aboutButtonLabel}</span>
                <span className="text-base font-bold leading-none" aria-hidden>
                  +
                </span>
              </Link>
            </div>
          ) : null}
        </div>

        {(config.aboutImageUrl || config.aboutSecondaryImageUrl) && (
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative flex items-end gap-3 sm:gap-5">
              {/* Left: Secondary image */}
              {config.aboutSecondaryImageUrl && (
                <div className="relative w-[34%] shrink-0 sm:w-[36%]">
                  <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px]">
                    <Image
                      width={150}
                      height={200}
                      fetchPriority="high"
                      src={config.aboutSecondaryImageUrl}
                      alt=""
                      className="aspect-[9/17] w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Right: Main doctor image */}
              {config.aboutImageUrl && (
                <div className="relative min-w-0 flex-1 overflow-hidden rounded-[24px] sm:rounded-[30px]">
                  <Image
                    width={250}
                    height={400}
                    fetchPriority="high"
                    src={config.aboutImageUrl}
                    alt=""
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
              )}

              {/* Experience badge: overlaps both images */}
              {config.experienceYears != null && config.experienceYears > 0 && (
                <div className="absolute top-[1%] left-[4%] z-20 flex items-center gap-3 whitespace-nowrap rounded-xl bg-[#565CEB] px-4 py-3 text-white shadow-lg sm:top-1 sm:left-[1%] sm:gap-3.5 sm:rounded-2xl sm:px-6 sm:py-4">
                  <span className="text-3xl font-extrabold leading-none sm:text-4xl">
                    {config.experienceYears}
                  </span>

                  <span className="text-xs font-semibold leading-tight text-white/95 sm:text-base">
                    Years Experience
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
