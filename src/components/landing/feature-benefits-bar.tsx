import { LifeBuoy, RefreshCcw, ShoppingBag, Truck, type LucideIcon } from "lucide-react";

const FEATURES: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Fast & Free Shipping",
    description:
      "Complimentary standard shipping on eligible India orders over ₹999. Rates and timelines show at checkout for your PIN code.",
    icon: Truck,
  },
  {
    title: "Easy to Shop",
    description:
      "Browse care details with clear information, so you can choose the right visit without guesswork.",
    icon: ShoppingBag,
  },
  {
    title: "24/7 Support",
    description:
      "Need help with an order or product question? Our care team is available around the clock to guide you.",
    icon: LifeBuoy,
  },
  {
    title: "Hassle Free Returns",
    description:
      "Changed your mind? Eligible unused items can be returned under our returns policy — simple steps, no runaround.",
    icon: RefreshCcw,
  },
];

export function FeatureBenefitsBar() {
  return (
    <section
      className="relative overflow-hidden bg-[#f8f8f6] py-14 sm:py-16"
      aria-labelledby="why-choose-us-heading"
    >

      <div className="container-page mx-auto">
        <div className="max-w-xl">
          
          <h2
            id="why-choose-us-heading"
            className="text-3xl font-semibold tracking-tight text-[#2f3438] sm:text-5xl"
          >
            Why Choose Us
          </h2>
          <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-x-16 sm:gap-y-12 lg:mt-14">
          {FEATURES.map(({ title, description, icon: Icon }) => (
            <li key={title} className="max-w-md">
              <div className="relative mb-5 inline-flex size-12 items-center justify-center">
                <span
                  className="absolute size-11 rounded-full bg-[#d8ebe0]"
                  aria-hidden
                />
                <Icon className="relative size-8 stroke-[1.5] text-[#2f3438]" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-[#2f3438]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b737a]">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
