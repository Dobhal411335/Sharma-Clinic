import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CustomerReview } from "@/types/customer-reviews";

type TestimonialsPageViewProps = {
  reviews: CustomerReview[];
};

function QuoteMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 48"
      className="h-9 w-9 text-[#1b2744] transition-transform duration-300 group-hover:scale-110"
    >
      <path
        fill="currentColor"
        d="M0 48V29.6C0 12.8 8.5 3.2 25.6 0l3.2 6.4C19.2 8.8 14.4 15.2 13.6 24H27.2V48H0Zm33.6 0V29.6C33.6 12.8 42.1 3.2 59.2 0L62.4 6.4C52.8 8.8 48 15.2 47.2 24H60.8V48H33.6Z"
      />
    </svg>
  );
}

function TestimonialCard({ review }: { review: CustomerReview }) {
  const initials = review.customerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <figure className="group flex h-full flex-col rounded-[1.75rem] bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 sm:p-8">
      <QuoteMark />
      <blockquote className="mt-6 flex-1 text-base leading-relaxed text-[#1b2744] sm:text-[1.05rem]">
        “{review.description}”
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-3">
        <Avatar size="lg" className="ring-2 ring-white">
          <AvatarImage src={review.imageUrl} alt={review.customerName} />
          <AvatarFallback className="bg-white text-xs font-semibold text-[#1b2744]">
            {initials || "CU"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-[0.08em] text-[#1b2744] uppercase">
            {review.customerName}
          </p>
          {review.designation ? (
            <p className="truncate text-sm text-[#6d7585]">{review.designation}</p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsPageView({ reviews }: TestimonialsPageViewProps) {
  return (
    <section className="bg-[#f8f5ee]" aria-labelledby="all-testimonials-heading">
      <div className="container-page section-space py-12 sm:py-16 lg:py-20">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Testimonials</span>
        </nav>

        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
            Community voices
          </p>
          <h1
            id="all-testimonials-heading"
            className="mt-5 text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
          >
            What our customers say
          </h1>
          <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
        </div>

        {reviews.length === 0 ? (
          <p className="mt-12 text-base text-[#657487]">No testimonials to show yet.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <TestimonialCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
