/**
 * Placeholder site content until clinic details are saved in company info.
 * Pages should read name, email, and address from company basic info.
 * Descriptions and other copy stay here.
 */

export const exampleCompany = {
  name: "Example Clinic",
  email: "hello@example.com",
  phone: "+91 00000 00000",
  address: "123 Example Street, Example City",
  hours: "Mon–Sat · 10:00–18:00 IST",
  domain: "example.com",
  titleTag: "Example Clinic",
} as const;

export const exampleOrigin = `https://${exampleCompany.domain}`;

export const exampleAuthor = "Editorial team";

export const placeholderImage = {
  blogWide: "https://placehold.co/1200x675/png?text=Blog",
  blogCard: "https://placehold.co/800x600/png?text=Blog",
  blogThumb: "https://placehold.co/160x160/png?text=Blog",
} as const;

export const pageSeo = {
  login: {
    title: "Staff login",
    description: "Secure staff sign-in for administrators and doctors.",
  },
  sitemap: {
    title: "Sitemap",
    description:
      "Browse the public pages, including doctors, articles, and company information.",
  },
  blog: {
    title: "Blog",
    description: "Educational notes and updates from the clinic.",
    shareText: "Blog articles and updates.",
  },
  careers: {
    title: "Careers",
    description: "Explore career opportunities and submit an application.",
    keywords: ["Careers", "Job vacancies", "Clinic jobs"],
  },
  testimonials: {
    title: "Testimonials",
    description: "Read what people say about their visits.",
  },
  doctors: {
    title: "Doctors",
    description: "Meet our clinicians and explore specialist services.",
  },
  faq: {
    title: "FAQs",
    description: "Frequently asked questions about visits, services, and support.",
  },
  notFound: {
    title: "Page not found",
  },
  articleNotFound: {
    title: "Article not found",
  },
} as const;

export function companyDisplayName(name: string | null | undefined): string {
  const value = name?.trim();
  return value || exampleCompany.name;
}

export function companyEmails(emails: string[] | null | undefined): string[] {
  const values = (emails ?? []).map((item) => item.trim()).filter(Boolean);
  return values.length > 0 ? values : [exampleCompany.email];
}

export function companyPhones(numbers: string[] | null | undefined): string[] {
  const values = (numbers ?? []).map((item) => item.trim()).filter(Boolean);
  return values.length > 0 ? values : [exampleCompany.phone];
}

export function companyAddresses(addresses: string[] | null | undefined): string[] {
  const values = (addresses ?? []).map((item) => item.trim()).filter(Boolean);
  return values.length > 0 ? values : [exampleCompany.address];
}
