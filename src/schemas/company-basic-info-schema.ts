import { z } from "zod";

import type { CompanyBasicInfoFormValues } from "@/types/admin/company-basic-info";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL",
  });

const imageRefSchema = z.object({
  url: z.string(),
  publicId: z.string(),
});

export const companyBasicInfoFormSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  companyDomainName: z.string().trim().min(1, "Domain name is required"),
  contactNumbers: z.array(
    z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d{10}$/.test(value), {
        message: "Each contact number must be exactly 10 digits",
      }),
  ),
  whatsappNumber: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{10}$/.test(value), {
      message: "WhatsApp number must be exactly 10 digits",
    }),
  mainLogo: imageRefSchema,
  footerLogo: imageRefSchema,
  mobileUiLogo: imageRefSchema,
  emails: z.array(
    z
      .string()
      .trim()
      .refine((value) => value === "" || z.string().email().safeParse(value).success, {
        message: "Enter a valid email",
      }),
  ),
  officeAddresses: z.array(z.string()),
  googleAddress: z.string(),
  googleUrl: optionalUrl,
  googleLink: optionalUrl,
  facebookLink: optionalUrl,
  instagramLink: optionalUrl,
  youtubeLink: optionalUrl,
  googleMapLink: optionalUrl,
  googleTrackingTag: z.string(),
  titleTagForMainLandingPage: z.string(),
  keywords: z.array(z.string()),
});

export type CompanyBasicInfoFormErrors = Partial<
  Record<keyof CompanyBasicInfoFormValues, string>
>;

export function validateCompanyBasicInfoForm(
  values: CompanyBasicInfoFormValues,
): { success: true; data: CompanyBasicInfoFormValues } | { success: false; errors: CompanyBasicInfoFormErrors } {
  const result = companyBasicInfoFormSchema.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data as CompanyBasicInfoFormValues };
  }

  const errors: CompanyBasicInfoFormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof CompanyBasicInfoFormValues] = issue.message;
    }
  }
  return { success: false, errors };
}

export function toCompanyBasicInfoPayload(values: CompanyBasicInfoFormValues) {
  const clean = (items: string[]) =>
    items.map((item) => item.trim()).filter(Boolean);

  return {
    ...values,
    companyName: values.companyName.trim(),
    companyDomainName: values.companyDomainName.trim(),
    contactNumbers: clean(values.contactNumbers).map((n) =>
      n.replace(/\D/g, "").slice(0, 10),
    ),
    whatsappNumber: values.whatsappNumber.replace(/\D/g, "").slice(0, 10),
    emails: clean(values.emails),
    officeAddresses: clean(values.officeAddresses),
    keywords: clean(values.keywords),
  };
}
