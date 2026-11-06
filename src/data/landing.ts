import { exampleCompany } from "@/data/site";

export type LandingProduct = {
  id: string;
  name: string;
  category: string;
  pricePaise: number;
  compareAtPaise?: number;
  image: string;
  alt: string;
  href: string;
};

export type LandingPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  badgeText?: string;
  stats?: Array<{ number: string; name: string; text?: string }>;
  date: string;
  author: string;
  image: string;
  alt: string;
  href: string;
};

export type LandingTestimonial = {
  id: string;
  quote: string;
  name: string;
  location: string;
  avatar: string;
};

export type LandingFaq = {
  id: string;
  question: string;
  answer: string;
};

export type LandingPromo = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "warm" | "secondary" | "surface";
  image: string;
  alt: string;
};

export type GalleryItem = {
  id: string;
  image: string;
  alt: string;
  featured?: boolean;
};

export const announcement = "Complimentary shipping on orders over ₹999";

export const navLinks = [
  { label: "About", href: "/about" },
  { label: "Doctors", href: "/doctors" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const trustItems = [
  {
    title: "Free shipping over ₹999",
    description: "Standard delivery on eligible domestic orders.",
  },
  {
    title: "Clear product information",
    description: "Pack size, usage notes, and ingredients where supplied.",
  },
] as const;

export const trustIcons = [
  { title: "Secure checkout", icon: "shield" as const },
  { title: "Easy returns", icon: "package" as const },
  { title: "Supportive care pack", icon: "gift" as const },
  { title: "Verified payments", icon: "badge" as const },
];

export type HeroBanner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  alt: string;
  href: string;
  ctaLabel?: string;
};

/** Backend/CMS hero banners. Empty until the API is wired. */
export const heroBanners: HeroBanner[] = [];

export const hero = {
  eyebrow: "Clinical calm for everyday skin",
  title: "Clinical care, clearly presented",
  body: "Thoughtfully formulated skincare and biomedical essentials for the Indian storefront — clear information, calm design, and products you can evaluate with confidence.",
  primaryCta: { label: "Meet our doctors", href: "/doctors" },
  secondaryCta: { label: "About the clinic", href: "/about" },
  leftImage: {
    src: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80",
    alt: "Skincare bottle on a clean vanity surface",
  },
  rightImage: {
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
    alt: "Person applying a skincare product",
  },
};

/** Shown only when `heroBanners` (or API banners) is empty. */
export const heroAssociateFallback = {
  title: "our associate brand",
  body: "We bridge quality and creativity to bring modern solutions directly to our community.",
  cta: { label: "Explore More", href: "/about" },
  partners: [
    { id: "a1", name: "Care Lab", mark: "CL" },
    { id: "a2", name: "Pure Form", mark: "PF" },
    { id: "a3", name: "Derm Craft", mark: "DC" },
    { id: "a4", name: "Bio Nest", mark: "BN" },
  ],
};

export const specials = {
  label: "Featured offers",
  title: "Curated selections worth a closer look",
  subtitle: "Explore seasonal highlights while stocks last. Offers update as inventory changes.",
  cta: { label: "View doctors", href: "/doctors" },
};

export const about = {
  label: "About us",
  title: "Science-led care with a calm, premium finish",
  body: "We focus on clear presentation and carefully reviewed information. We share only details that have been checked for accuracy — never invented medical claims.",
  cta: { label: "Read more about us", href: "/about" },
  image: {
    src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1000&q=80",
    alt: "Close-up of skincare application on hands",
  },
};

export const products: LandingProduct[] = [
  {
    id: "p1",
    name: "Daily Barrier Serum",
    category: "Serums",
    pricePaise: 149900,
    compareAtPaise: 179900,
    image:
      "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=800&q=80",
    alt: "Dropper bottle of facial serum",
    href: "/doctors",
  },
  {
    id: "p2",
    name: "Hydra Soft Cream",
    category: "Moisturisers",
    pricePaise: 99900,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
    alt: "Jar of moisturising cream",
    href: "/doctors",
  },
  {
    id: "p3",
    name: "Gentle Cleansing Gel",
    category: "Cleansers",
    pricePaise: 69900,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    alt: "Clear bottle of cleansing gel",
    href: "/doctors",
  },
  {
    id: "p4",
    name: "Calming Night Balm",
    category: "Treatments",
    pricePaise: 129900,
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
    alt: "Night balm tin with soft lighting",
    href: "/doctors",
  },
  {
    id: "p5",
    name: "Vitamin C Emulsion",
    category: "Serums",
    pricePaise: 159900,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    alt: "Amber bottle of vitamin C emulsion",
    href: "/doctors",
  },
  {
    id: "p6",
    name: "SPF Daily Fluid",
    category: "Sun care",
    pricePaise: 89900,
    image:
      "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80",
    alt: "Sunscreen fluid bottle",
    href: "/doctors",
  },
  {
    id: "p7",
    name: "Recovery Essence",
    category: "Essences",
    pricePaise: 119900,
    image:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
    alt: "Laboratory glassware representing formulation care",
    href: "/doctors",
  },
  {
    id: "p8",
    name: "Lip Comfort Balm",
    category: "Lip care",
    pricePaise: 39900,
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
    alt: "Small lip balm product",
    href: "/doctors",
  },
];

export const featuredProduct = products[0];

export const recentProducts = products.slice(1, 5);
export const bestsellerProducts = products.slice(4, 8);

export const posts: LandingPost[] = [
  {
    id: "b1",
    title: "How to read an ingredients list with clarity",
    excerpt:
      "A practical guide to scanning labels without jargon overload — focused on transparency, not medical advice.",
    category: "Education",
    date: "15 May 2026",
    author: "Editorial team",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
    alt: "Skincare products arranged for reading labels",
    href: "/blog/reading-ingredients",
  },
  {
    id: "b2",
    title: "Building a simple morning routine",
    excerpt:
      "Cleanse, treat, moisturise, protect — a calm sequence you can adapt to your own skin needs.",
    category: "Wellness tips",
    date: "02 May 2026",
    author: "Editorial team",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80",
    alt: "Morning skincare products on a counter",
    href: "/blog/morning-routine",
  },
  {
    id: "b3",
    title: "What “clinical calm” means for our packaging",
    excerpt:
      "Why we prioritise legible typography, clear pack sizes, and honest product photography.",
    category: "Brand",
    date: "20 Apr 2026",
    author: "Editorial team",
    image:
      "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=800&q=80",
    alt: "Minimal product packaging photography",
    href: "/blog/clinical-calm-packaging",
  },
  {
    id: "b4",
    title: "Storage tips for active formulas",
    excerpt:
      "Keep products away from heat and direct sunlight. Always follow the guidance printed on your pack.",
    category: "Healthy living",
    date: "08 Apr 2026",
    author: "Editorial team",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
    alt: "Skincare texture close-up",
    href: "/blog/storage-tips",
  },
];

export const promos: LandingPromo[] = [
  {
    id: "pr1",
    title: "Barrier essentials",
    description: "Serums and creams selected for everyday comfort.",
    href: "/doctors",
    tone: "warm",
    image:
      "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=600&q=80",
    alt: "Serum bottle for barrier essentials",
  },
  {
    id: "pr2",
    title: "Precision cleansers",
    description: "Gentle gels designed for a clear, unfussy start.",
    href: "/about",
    tone: "secondary",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    alt: "Cleanser bottles",
  },
  {
    id: "pr3",
    title: "Night recovery picks",
    description: "Balms and emulsions for your evening shelf.",
    href: "/contact",
    tone: "surface",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80",
    alt: "Night care product bottle",
  },
];

export const testimonials: LandingTestimonial[] = [
  {
    id: "t1",
    quote:
      "Checkout felt clear and the product pages listed pack size up front — exactly what I wanted.",
    name: "Ananya R.",
    location: "Bengaluru",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "t2",
    quote:
      "The storefront looks calm and trustworthy. Placeholder review for layout demonstration only.",
    name: "Vikram S.",
    location: "Pune",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "t3",
    quote:
      "I appreciated the straightforward shipping note and policy links in the footer.",
    name: "Meera K.",
    location: "Chennai",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "t4",
    quote:
      "Sample UI quote — not a clinical outcome. Useful for testing the testimonials grid.",
    name: "Rahul D.",
    location: "Delhi NCR",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

export const featureBenefits = [
  { title: "Free shipping" },
  { title: "Secure payments" },
  { title: "Clear policies" },
  { title: "Account ready" },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
    alt: "Skincare lifestyle still life",
  },
  {
    id: "g2",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80",
    alt: "Product bottle on vanity",
  },
  {
    id: "g3",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    alt: "Skincare application moment",
    featured: true,
  },
  {
    id: "g4",
    image:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80",
    alt: "Hands with cream texture",
  },
  {
    id: "g5",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80",
    alt: "Cream texture detail",
  },
];

export const galleryFeaturedProduct = {
  name: "Hydra Soft Cream & Serum Set",
  priceLabel: "From ₹1,999",
  href: "/doctors",
  image:
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=200&q=80",
  alt: "Hydra Soft Cream jar",
};

export const faqs: LandingFaq[] = [
  {
    id: "f1",
    question: "What are your business hours?",
    answer:
      "Customer support is available Monday to Saturday, 10:00–18:00 IST. Order processing times are listed on product and checkout pages when live.",
  },
  {
    id: "f2",
    question: "Where do you ship?",
    answer:
      "This storefront is prepared for domestic India shipping. Exact serviceable pin codes and rates will appear at checkout once fulfilment is connected.",
  },
  {
    id: "f3",
    question: "How do returns work?",
    answer:
      "Return eligibility depends on product type and condition. Full return terms will be published on the Returns policy page before launch.",
  },
  {
    id: "f4",
    question: "Are product claims medically verified?",
    answer:
      "We only publish product information and claims that the business has approved. This site does not diagnose, treat, or prescribe.",
  },
];

export const marqueeItems = [
  "Free shipping available",
  "Join our community",
  "Explore new arrivals",
  "Visit the clinic today",
  "Secure payments",
];

export const footer = {
  brand: exampleCompany.name,
  thankYou: "Thank you for visiting",
  description:
    "A calm clinic website for appointments, doctors, and patient information.",
  contact: [
    { label: exampleCompany.address, icon: "map" as const },
    { label: exampleCompany.phone, icon: "phone" as const },
    { label: exampleCompany.email, icon: "mail" as const },
    { label: exampleCompany.hours, icon: "clock" as const },
  ],
  columns: [
    {
      title: "Clinic",
      links: [
        { label: "Doctors", href: "/doctors" },
        { label: "Careers", href: "/careers" },
        { label: "Testimonials", href: "/testimonials" },
        { label: "Sitemap", href: "/sitemap" },
      ],
    },
    {
      title: "Our policies",
      links: [
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
      ],
    },
    {
      title: "Visit",
      links: [
        { label: "FAQs", href: "/faq" },
        { label: "Blog", href: "/blog" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
};

export const blogIntro = {
  title: "Crafting clarity in every formula, every day",
  body: "Educational notes and brand updates — written to inform, not to diagnose or promise outcomes.",
};

export const insightsIntro = {
  title: "Health insights & wellness notes",
  subtitle: "Short reads on routines, labels, and store updates.",
};

export const insightsQaIntro = {
  title: "Questions & clarity",
  subtitle:
    "Straightforward answers about visits, services, and clinic information.",
};
