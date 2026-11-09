import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  doctorProfileSlug,
  formatDoctorDisplayName,
  type DoctorProfile,
} from "@/types/doctors";

type DoctorShowcaseCardProps = {
  doctor: DoctorProfile;
};

function doctorTitle(doctor: DoctorProfile): string {
  if (doctor.degree.trim()) return doctor.degree.trim();
  return doctor.specializations[0] ?? "";
}

function doctorCategory(doctor: DoctorProfile): string {
  return (doctor.specializations[0] ?? "").trim();
}

export function DoctorShowcaseCard({ doctor }: DoctorShowcaseCardProps) {
  const title = doctorTitle(doctor);
  const category = doctorCategory(doctor);
  const displayName = formatDoctorDisplayName(doctor.name);
  const href = `/doctors/${doctorProfileSlug(doctor.name)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e7e5e0] bg-white transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#d7e0ea] focus-within:border-[#d7e0ea] focus-within:shadow-[0_14px_34px_rgba(18,61,103,0.1)]">
      <div className="relative overflow-hidden bg-[#eef1f4]">
        <Link
          href={href}
          className="relative block aspect-[4/4] w-full overflow-hidden"
          aria-label={`View profile for ${displayName}`}
        >
          <Image
            src={doctor.photoUrl}
            alt=""
            fill
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 25vw"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-4 py-5">
        {category ? (
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            {category}
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-2 text-left text-2xl font-semibold tracking-tight text-[#0f172a] transition-colors hover:text-primary"
        >
          {displayName}
        </Link>
        {title ? (
          <>
            <div className="mt-2 h-px w-full bg-[#e8e5df]" aria-hidden />
            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{title}</p>
          </>
        ) : null}
        <div className="mt-auto pt-5">
          <Link
            href={href}
            className="inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-[#d7e0ea] bg-[#f4f6f8] px-5 py-2.5 text-sm font-semibold text-[#17232d] transition-colors hover:border-[#c5d2e0] hover:bg-white"
          >
            View Profile
            <ArrowUpRight className="size-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DoctorShowcaseCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#e7e5e0] bg-white shadow-[0_10px_28px_rgba(18,61,103,0.06)]">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
      <div className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-7 w-44 animate-pulse rounded bg-muted" />
        <div className="h-px w-full bg-muted" />
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="pt-2">
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </article>
  );
}
