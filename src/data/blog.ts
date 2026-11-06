export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  date: string;
  author: string;
  commentsLabel: string;
  image: string;
  alt: string;
};

export const blogCategories = [
  "Education",
  "Wellness tips",
  "Brand",
  "Healthy living",
  "Routines",
] as const;

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "reading-ingredients",
    title: "How to read an ingredients list with clarity",
    excerpt:
      "A practical guide to scanning labels without jargon overload — focused on transparency, not medical advice.",
    content: [
      "Ingredient lists can look dense at first glance. Start with the pack size, usage notes, and any caution statements printed by the manufacturer.",
      "Scan for familiar base ingredients near the top of the list, then note actives or fragrance disclosures further down. This is product literacy — not a diagnosis tool.",
      "If you have a known sensitivity, compare the pack insert with advice from a qualified clinician. This clinic does not invent medical claims or promise outcomes.",
    ],
    category: "Education",
    date: "15 May 2026",
    author: "Editorial team",
    commentsLabel: "0 comments",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80",
    alt: "Skincare products arranged for reading labels",
  },
  {
    id: "b2",
    slug: "morning-routine",
    title: "Building a simple morning routine",
    excerpt:
      "Cleanse, treat, moisturise, protect — a calm sequence you can adapt to your own skin needs.",
    content: [
      "A calm morning shelf does not need dozens of steps. Begin with a gentle cleanse, then any leave-on product you already use, followed by moisturiser and daytime protection as directed on pack.",
      "Keep textures comfortable for your climate. Hot or humid days may call for lighter layers; cooler weather may need a richer cream — always within labelled guidance.",
      "This article is educational storefront content. It is not personalised medical advice.",
    ],
    category: "Wellness tips",
    date: "02 May 2026",
    author: "Editorial team",
    commentsLabel: "0 comments",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=80",
    alt: "Morning skincare products on a counter",
  },
  {
    id: "b3",
    slug: "clinical-calm-packaging",
    title: "What “clinical calm” means for our packaging",
    excerpt:
      "Why we prioritise legible typography, clear pack sizes, and honest product photography.",
    content: [
      "Clinical calm is a design posture: readable type, honest photography, and space for legally reviewed information.",
      "We avoid decorative clutter that hides pack size, warnings, or usage notes. Premium should still feel clear.",
      "Brand storytelling stays separate from unverified medical claims.",
    ],
    category: "Brand",
    date: "20 Apr 2026",
    author: "Editorial team",
    commentsLabel: "2 comments",
    image:
      "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=1200&q=80",
    alt: "Minimal product packaging photography",
  },
  {
    id: "b4",
    slug: "storage-tips",
    title: "Storage tips for active formulas",
    excerpt:
      "Keep products away from heat and direct sunlight. Always follow the guidance printed on your pack.",
    content: [
      "Heat and light can affect product stability. A cool, dry shelf away from windows is usually a sensible default.",
      "Close lids firmly after use and check expiry or period-after-opening marks on the pack.",
      "When in doubt, follow the manufacturer insert rather than social media shortcuts.",
    ],
    category: "Healthy living",
    date: "08 Apr 2026",
    author: "Editorial team",
    commentsLabel: "1 comment",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=80",
    alt: "Skincare texture close-up",
  },
  {
    id: "b5",
    slug: "evening-shelf-edit",
    title: "Editing your evening shelf without the clutter",
    excerpt:
      "A short note on keeping night-time products organised, labelled, and easy to reach.",
    content: [
      "Group cleansers, treatments, and creams so you can find them without rushing.",
      "Discard empty packaging responsibly and keep only products you still use.",
      "Organisation helps adherence to your own routine — it is not a clinical protocol.",
    ],
    category: "Routines",
    date: "28 Mar 2026",
    author: "Editorial team",
    commentsLabel: "0 comments",
    image:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80",
    alt: "Hands with cream texture",
  },
  {
    id: "b6",
    slug: "travel-sized-care",
    title: "Travel-sized care for short trips",
    excerpt:
      "Pack light with sealed minis, keep liquids within airline rules, and protect bottles from heat in transit.",
    content: [
      "Use sealed travel sizes where available and place them upright in a zip bag.",
      "Avoid leaving products in a hot car. Temperature swings are harder on emulsions and creams.",
      "Confirm airline liquid limits before you fly — this is travel logistics, not product efficacy advice.",
    ],
    category: "Routines",
    date: "12 Mar 2026",
    author: "Editorial team",
    commentsLabel: "3 comments",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    alt: "Travel-sized bottles lined up",
  },
];

export function getAllBlogSlugs() {
  return blogPosts.map((post) => post.slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function getRecentBlogPosts(limit = 3) {
  return blogPosts.slice(0, limit);
}
