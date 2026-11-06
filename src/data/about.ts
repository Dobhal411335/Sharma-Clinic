import { exampleCompany } from "@/data/site";

export const aboutPage = {
  hero: {
    brand: exampleCompany.name,
    title: "Introducing a calmer era of science-led care",
    body: "We are building a clear, trustworthy clinic website — connecting careful care with straightforward information. We focus on transparent details, quality-minded presentation, and a calm experience.",
    signature: exampleCompany.name,
    image: {
      src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1400&q=80",
      alt: "Close-up of skincare application with a calm, premium finish",
    },
  },
  story: {
    title: "Our Story",
    body: "The clinic began with a simple idea: care information should feel clear, calm, and carefully presented. We share accurate details where they are supplied, and we never invent medical claims or promise outcomes.",
    images: [
      {
        id: "story-1",
        src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
        alt: "Hands applying a skincare product",
      },
      {
        id: "story-2",
        src: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
        alt: "Premium moisturiser jar on a soft neutral surface",
      },
    ],
  },
  banner: {
    label: "Featured care",
    title: "Discover your everyday ritual with our curated essentials",
    href: "/doctors",
    image: {
      src: "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=1600&q=80",
      alt: "Serum bottle and skincare textures in soft light",
    },
  },
  pillars: {
    title: "The finishing touch",
    subtitle:
      "Our collections bring together diverse care essentials united by clarity, quality presentation, and a calm shopping experience.",
    items: [
      {
        id: "pillar-1",
        title: "Daily essentials",
        description:
          "Cleansers and moisturisers chosen for clear labelling and everyday use.",
        href: "/doctors",
        cta: "See more products",
        image: {
          src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
          alt: "Bottle of cleansing gel",
        },
      },
      {
        id: "pillar-2",
        title: "Barrier-focused care",
        description:
          "Serums and treatments presented with pack size and usage notes where available.",
        href: "/doctors",
        cta: "See more products",
        image: {
          src: "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=900&q=80",
          alt: "Dropper bottle of facial serum",
        },
      },
      {
        id: "pillar-3",
        title: "Night routines",
        description:
          "Calming balms and overnight favourites for a quieter evening ritual.",
        href: "/doctors",
        cta: "See more products",
        image: {
          src: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80",
          alt: "Night balm tin with soft lighting",
        },
      },
      {
        id: "pillar-4",
        title: "Gift-ready sets",
        description:
          "Curated selections for sharing thoughtful care — without invented claims.",
        href: "/doctors",
        cta: "See more products",
        image: {
          src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
          alt: "Skincare products arranged as a gift set",
        },
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions.",
    items: [
      {
        id: "af1",
        question: "Do you accept major debit and credit cards?",
        answer:
          "Yes. Once payments are live, checkout will support common Indian cards and UPI through our payment partner. Exact methods appear at checkout.",
      },
      {
        id: "af2",
        question: "How does my package ship?",
        answer:
          "Orders are prepared for domestic India shipping. Carrier options, serviceable pin codes, and delivery estimates will show at checkout when fulfilment is connected.",
      },
      {
        id: "af3",
        question: "Returns, exchanges and complaints",
        answer:
          "Eligibility depends on product type and condition. Full return terms will be published on the Returns policy page before launch. Contact support for order-specific help.",
      },
      {
        id: "af4",
        question: "When will I receive the invoice for my order?",
        answer:
          "A tax invoice will be shared by email after payment confirmation once billing is fully connected. You can also reach support with your order reference.",
      },
      {
        id: "af5",
        question: "How long will my order take to be delivered?",
        answer:
          "Delivery timelines vary by destination and stock. Estimated dates will appear at checkout and on the order confirmation page when logistics are live.",
      },
      {
        id: "af6",
        question: "Can I cancel an order if delivery times change?",
        answer:
          "If part of an order shows a longer lead time, contact support promptly with your order details. Cancellation rules will follow the published Terms and order status.",
      },
      {
        id: "af7",
        question: "Are there delivery charges for online orders?",
        answer:
          "Complimentary shipping may apply on eligible orders over ₹999. Other rates, if any, will be calculated at checkout based on destination and order value.",
      },
      {
        id: "af8",
        question: "What happens after I place an order?",
        answer:
          "You receive an order confirmation, then updates as the order is packed and handed to the courier. Tracking details appear in your account once shipping is active.",
      },
      {
        id: "af9",
        question: "Do I receive an invoice for my order?",
        answer:
          "Yes — invoices are intended for every paid order and will be emailed or available from your account once billing is enabled.",
      },
      {
        id: "af10",
        question: "Are product claims medically verified?",
        answer:
          "We only publish product information and claims the business has approved. This site does not diagnose, treat, or prescribe.",
      },
      {
        id: "af11",
        question: "Where can I get product usage help?",
        answer:
          "Check the product page for pack instructions and ingredients where supplied. For order support, email us — we do not provide medical advice through support channels.",
      },
      {
        id: "af12",
        question: "How do I contact customer care?",
        answer:
          "Write to the email listed on this website or use the Contact page. Support hours are Monday to Saturday, 10:00–18:00 IST.",
      },
    ],
  },
} as const;
