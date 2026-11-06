export type FaqTopic = "all" | "orders" | "shipping" | "products" | "account";

export type FaqItem = {
  id: string;
  topic: Exclude<FaqTopic, "all">;
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  topic: Exclude<FaqTopic, "all">;
  items: FaqItem[];
};

export const faqTopics: { value: FaqTopic; label: string }[] = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "shipping", label: "Shipping & returns" },
  { value: "products", label: "Products" },
  { value: "account", label: "Account" },
];

export const faqIntro = {
  title: "FAQs",
  body: "Find clear answers about visits, services, and support. For anything not covered here, write to us — we do not provide medical advice through support channels.",
};

export const faqCategories: FaqCategory[] = [
  {
    id: "orders",
    title: "Orders & payments",
    topic: "orders",
    items: [
      {
        id: "o1",
        topic: "orders",
        question: "How do I place an order?",
        answer:
          "Browse the shop, choose a product and pack size, add it to your cart, then continue to checkout. Final totals and payment confirmation are handled securely once Razorpay is connected.",
      },
      {
        id: "o2",
        topic: "orders",
        question: "Which payment methods will be supported?",
        answer:
          "The India storefront is prepared for Razorpay. Cards, UPI, and other Razorpay-supported methods will appear when payments go live. Payment status is always verified server-side.",
      },
      {
        id: "o3",
        topic: "orders",
        question: "Can I change or cancel an order after checkout?",
        answer:
          "If an order has not been fulfilled, contact support with your order ID. Changes depend on fulfilment status and will be confirmed by our team.",
      },
      {
        id: "o4",
        topic: "orders",
        question: "Do you offer refunds or exchanges?",
        answer:
          "Refund and exchange eligibility depends on product type and condition. Full terms will be published on the Returns policy page before launch.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & returns",
    topic: "shipping",
    items: [
      {
        id: "s1",
        topic: "shipping",
        question: "Where do you ship?",
        answer:
          "This storefront is prepared for domestic India shipping. Serviceable PIN codes and rates will appear at checkout once fulfilment is connected.",
      },
      {
        id: "s2",
        topic: "shipping",
        question: "Is there free shipping?",
        answer:
          "Complimentary standard shipping is planned for eligible orders over ₹999. Exact thresholds and exclusions will be confirmed at checkout.",
      },
      {
        id: "s3",
        topic: "shipping",
        question: "How do returns work?",
        answer:
          "Start a return request from your order history or contact support. Some product categories may be non-returnable for safety reasons — always check the policy before sending items back.",
      },
    ],
  },
  {
    id: "products",
    title: "Products & information",
    topic: "products",
    items: [
      {
        id: "p1",
        topic: "products",
        question: "Are product claims medically verified on this site?",
        answer:
          "We only publish information and claims the clinic has approved. This website does not diagnose, treat, or prescribe.",
      },
      {
        id: "p2",
        topic: "products",
        question: "Where can I find ingredients and pack size?",
        answer:
          "Pack size, variants, and available ingredient details appear on each product page. Always follow the guidance printed on your physical pack.",
      },
      {
        id: "p3",
        topic: "products",
        question: "How should I store products?",
        answer:
          "Keep products away from excessive heat and direct sunlight unless the pack says otherwise. Refer to the insert for product-specific storage notes.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & privacy",
    topic: "account",
    items: [
      {
        id: "a1",
        topic: "account",
        question: "How do I create an account?",
        answer:
          "Use Sign in or Create an account from the header. Email/password and Google sign-in UI are available; live authentication will connect to the shared backend.",
      },
      {
        id: "a2",
        topic: "account",
        question: "Is my data secure?",
        answer:
          "Passwords and tokens are never stored in plaintext in the browser for production auth. Secrets stay server-side. See the Privacy policy for data-use details.",
      },
      {
        id: "a3",
        topic: "account",
        question: "How do I reset my password?",
        answer:
          "Use the Lost your password link on the sign-in page. Reset emails will be sent through Brevo once transactional email is configured.",
      },
    ],
  },
];
