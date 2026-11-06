import { z } from "zod";

import type { JsonRecord } from "@/features/cms/store";

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Invalid URL",
  });

const imageRefSchema = z.object({
  url: z.string().trim().max(2000).default(""),
  publicId: z.string().trim().max(500).default(""),
});

export const companyBodySchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  companyDomainName: z.string().trim().min(1, "Company domain name is required").max(255),
  contactNumbers: z
    .array(z.string().trim().regex(/^\d{10}$/, "Each contact number must be exactly 10 digits"))
    .max(20)
    .default([]),
  whatsappNumber: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{10}$/.test(value), {
      message: "WhatsApp number must be exactly 10 digits",
    })
    .default(""),
  mainLogo: imageRefSchema.default({ url: "", publicId: "" }),
  footerLogo: imageRefSchema.default({ url: "", publicId: "" }),
  mobileUiLogo: imageRefSchema.default({ url: "", publicId: "" }),
  emails: z.array(z.string().trim().email("Invalid email address").max(320)).max(20).default([]),
  officeAddresses: z.array(z.string().trim().min(1).max(1000)).max(20).default([]),
  googleAddress: z.string().max(20_000).default(""),
  googleUrl: optionalUrl.default(""),
  googleLink: optionalUrl.default(""),
  facebookLink: optionalUrl.default(""),
  instagramLink: optionalUrl.default(""),
  youtubeLink: optionalUrl.default(""),
  googleMapLink: optionalUrl.default(""),
  googleTrackingTag: z.string().max(50_000).default(""),
  titleTagForMainLandingPage: z.string().trim().max(300).default(""),
  keywords: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
});

const navUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (value) =>
      value === "" ||
      value === "#" ||
      value.startsWith("/") ||
      value.startsWith("#") ||
      z.string().url().safeParse(value).success,
    { message: "URL must be a path, hash link, or absolute URL" },
  );

export const navbarBodySchema = z.object({
  title: z.string().trim().min(1, "Section title is required").max(200),
  description: z.string().trim().max(500).default(""),
  url: navUrl.default("#"),
  menuHeading: z.string().trim().max(300).default(""),
  menuDescription: z.string().trim().max(500).default(""),
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
  subSections: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1).max(200),
        url: navUrl.default("#"),
        description: z.string().trim().max(500).default(""),
        active: z.boolean().default(true),
        order: z.coerce.number().int().min(0).max(10_000).default(0),
      }),
    )
    .max(50)
    .default([]),
});

export const activePatchSchema = z.object({
  active: z.boolean(),
});

export const galleryBodySchema = z
  .object({
    mediaType: z.enum(["image", "video", "text_card"]),
    mediaUrl: z.string().trim().max(2000).default(""),
    mediaPublicId: z.string().trim().max(500).default(""),
    clickUrl: navUrl.default(""),
    heading: z.string().trim().max(300).default(""),
    description: z.string().trim().max(4000).default(""),
    buttonLabel: z.string().trim().max(100).default(""),
    buttonUrl: navUrl.default(""),
    active: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    if (value.mediaType === "image" || value.mediaType === "video") {
      if (!value.mediaUrl) {
        ctx.addIssue({ code: "custom", path: ["mediaUrl"], message: "Media URL is required" });
      }
      return;
    }
    if (!value.heading) {
      ctx.addIssue({ code: "custom", path: ["heading"], message: "Heading is required for text cards" });
    }
    if (!value.description) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "Description is required for text cards",
      });
    }
  });

export const socialBodySchema = z.object({
  postType: z.enum(["instagram", "facebook"]),
  imageUrl: z.string().trim().min(1, "Image is required").max(2000),
  imagePublicId: z.string().trim().max(500).default(""),
  postUrl: optionalUrl,
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
});

export const reviewBodySchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(200),
  designation: z.string().trim().max(200).default(""),
  description: z.string().trim().min(1, "Review is required").max(5000),
  rating: z.coerce.number().int().min(1).max(5),
  imageUrl: z.string().trim().max(2000).default(""),
  imagePublicId: z.string().trim().max(500).default(""),
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
});

export const doctorBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  specializations: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  about: z.string().trim().min(1).max(20_000),
  experienceYears: z.coerce.number().int().min(0).max(80),
  state: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  phone: z.string().trim().max(30).default(""),
  email: z.string().trim().max(320).default(""),
  location: z.string().trim().max(500).default(""),
  education: z.string().max(10_000).default(""),
  degree: z.string().max(10_000).default(""),
  workHistory: z.string().max(20_000).default(""),
  workDays: z.string().max(2000).default(""),
  photoUrl: z.string().trim().min(1, "Photo is required").max(2000),
  photoPublicId: z.string().trim().max(500).default(""),
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
});

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens");

export const blogCreateSchema = z.object({
  name: z.string().trim().min(1, "Blog name is required").max(200),
  category: z.string().trim().min(1, "Blog category is required").max(120),
  badgeText: z.string().trim().max(120).default(""),
  stat1Number: z.string().trim().max(80).default(""),
  stat1Name: z.string().trim().max(120).default(""),
  stat1Text: z.string().trim().max(240).default(""),
  stat2Number: z.string().trim().max(80).default(""),
  stat2Name: z.string().trim().max(120).default(""),
  stat2Text: z.string().trim().max(240).default(""),
  slug: slugSchema.optional(),
  active: z.boolean().default(true),
});

export const blogUpdateSchema = blogCreateSchema.extend({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required").max(300),
  publishedAt: z.string().trim().min(1, "Date is required"),
  createdBy: z.string().trim().max(120).default(""),
  imageUrl: z.string().trim().max(2000).default(""),
  imagePublicId: z.string().trim().max(500).default(""),
  description: z.string().max(200_000).default(""),
  blockquote: z.string().trim().max(5000).default(""),
  accordionItems: z
    .array(
      z.object({
        question: z.string().trim().max(300),
        description: z.string().trim().max(5000),
      }),
    )
    .max(50)
    .default([]),
});

export const webpageCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  slug: slugSchema.optional(),
  active: z.boolean().default(true),
  templateType: z.string().trim().min(1).max(40).default("design1"),
});

export const footerBodySchema = z.object({
  thankYou: z.string().trim().max(300).default(""),
  description: z.string().trim().max(5000).default(""),
  columns: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1).max(200),
        active: z.boolean().default(true),
        order: z.coerce.number().int().min(0).max(10_000).default(0),
        links: z
          .array(
            z.object({
              id: z.string().optional(),
              label: z.string().trim().min(1).max(200),
              url: navUrl.default("#"),
              active: z.boolean().default(true),
              order: z.coerce.number().int().min(0).max(10_000).default(0),
            }),
          )
          .max(50)
          .default([]),
      }),
    )
    .max(20)
    .default([]),
});

export const activeOrderPatchSchema = z
  .object({
    active: z.boolean().optional(),
    order: z.coerce.number().int().min(0).max(10_000).optional(),
  })
  .refine((value) => value.active !== undefined || value.order !== undefined, {
    message: "Nothing to update",
  });

export const nameActivePatchSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => value.name !== undefined || value.active !== undefined, {
    message: "At least one of name or active is required",
  });

export const webpageMetaPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    slug: slugSchema.optional(),
    active: z.boolean().optional(),
    templateType: z.string().trim().min(1).max(40).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Nothing to update",
  });

export function parseRecord(schema: z.ZodType): (body: unknown) => JsonRecord {
  return (body: unknown) => schema.parse(body) as JsonRecord;
}

export function parseLoose(body: unknown): JsonRecord {
  return z.record(z.string(), z.unknown()).parse(body);
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return slug || "page";
}
