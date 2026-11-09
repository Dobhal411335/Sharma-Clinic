import Image from "next/image";
import { Check } from "lucide-react";

import { formatDoctorDisplayName, type DoctorProfile } from "@/types/doctors";

type CredentialRow = {
  label: string;
  value: string;
};

function buildCredentialRows(doctor: DoctorProfile): CredentialRow[] {
  const specialty = doctor.specializations.filter(Boolean).join(", ");
  const degrees = [doctor.degree, doctor.education]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");
  const experienceParts = [
    doctor.experienceYears > 0 ? `${doctor.experienceYears}+ years` : "",
    doctor.workHistory.trim(),
    [doctor.city, doctor.state].filter(Boolean).join(", "),
  ].filter(Boolean);
  const experience = experienceParts.join(", ");

  return [
    specialty ? { label: "Specialty", value: specialty } : null,
    degrees ? { label: "Degrees", value: degrees } : null,
    experience ? { label: "Experience", value: experience } : null,
  ].filter((row): row is CredentialRow => row != null);
}

type DoctorDetailsHeroProps = {
  doctor: DoctorProfile;
};

export function DoctorDetailsHero({ doctor }: DoctorDetailsHeroProps) {
  const displayName = formatDoctorDisplayName(doctor.name);
  const badge = doctor.specializations[0]?.trim() ?? "";
  const credentials = buildCredentialRows(doctor);
  const skills = doctor.specializations.map((item) => item.trim()).filter(Boolean);

  return (
    <section className="bg-[#f8f5ee]" aria-labelledby="doctor-details-heading">
      <div className="container-page py-10 sm:py-14 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
          <div className="min-w-0">
            {badge ? (
              <span className="inline-flex rounded-full bg-[#d9ecee] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#168b91]">
                {badge}
              </span>
            ) : null}

            <h1
              id="doctor-details-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-[#1a2330] sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
            >
              {displayName}
            </h1>

            {doctor.about.trim() ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
                {doctor.about.trim()}
              </p>
            ) : null}

            {credentials.length > 0 ? (
              <dl className="mt-8 space-y-1">
                {credentials.map((row, index) => {
                  const highlighted = index % 2 === 0;
                  return (
                    <div
                      key={row.label}
                      className={
                        highlighted
                          ? "rounded-2xl bg-white px-4 py-3.5 sm:px-5"
                          : "rounded-2xl px-4 py-3.5 sm:px-5"
                      }
                    >
                      <div className="grid gap-1 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
                        <dt className="text-sm font-semibold text-[#1a2330]">
                          {row.label}
                        </dt>
                        <dd className="text-sm leading-relaxed text-[#4b5563]">
                          {row.value}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            ) : null}

            {skills.length > 0 ? (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-[#168b91]">About Skills</h2>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <li key={skill} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#168b91] text-white">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] bg-[#eef1f4] lg:mx-0 lg:max-w-none">
            <Image
              src={doctor.photoUrl}
              alt={displayName}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 90vw, 42vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
