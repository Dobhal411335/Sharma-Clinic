import type { StorefrontPromoHeader } from "@/types/about-us-banner";
import { FALLBACK_ABOUT_US_BANNER } from "@/features/about-us-banner/about-us-banner.defaults";

type SpecialsHeaderProps = {
  promo?: StorefrontPromoHeader;
};

export function SpecialsHeader({ promo = FALLBACK_ABOUT_US_BANNER.promo }: SpecialsHeaderProps) {
  return (
    <section className="border-y border-[#e7dfd7] bg-[#fbf8f3]" aria-labelledby="specials-heading">
      <div className="container-page section-space grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
            <span>{promo.label}</span>
          </div>
          <h2
            id="specials-heading"
            className="mt-8 max-w-md text-6xl leading-[0.96] font-semibold tracking-[-0.05em] text-[#17252b]"
          >
            {promo.title}
          </h2>
          <div className="mt-8 h-1 w-20 rounded-full bg-gradient-to-r from-[#c56f4d] to-[#f0d8c9]" />
        </div>

        <div className="min-w-0 lg:pr-3">
          <p className="max-w-3xl text-2xl leading-[1.42] tracking-[-0.025em] text-[#17252b] sm:text-3xl">
            {promo.description}
          </p>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#617181] sm:text-lg">
            {promo.subtitle}
          </p>

          {promo.cards.length > 0 ? (
            <div className="mt-12 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {promo.cards.map((card, index) => (
                <article
                  key={card.id}
                  className="grid grid-cols-[3.4rem_minmax(0,1fr)] gap-4 border-t border-[#ded8d1] py-7"
                >
                  <p className="pt-1 text-3xl font-semibold tracking-[-0.06em] text-[#c56f4d]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="border-l border-[#e0a98f] pl-4">
                    <h3 className="text-base font-semibold text-[#17252b] sm:text-lg">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#71808d] sm:text-base">
                      {card.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
