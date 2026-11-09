import type {
  BlogAccordionItem,
  BlogCreateFormValues,
  BlogCreatePayload,
  BlogEditFormValues,
  BlogUpdatePayload,
} from "@/types/admin/blog";

export type BlogCreateFormErrors = Partial<
  Record<keyof BlogCreateFormValues, string>
>;

export type BlogEditFormErrors = Partial<
  Record<keyof BlogEditFormValues, string>
>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyBlogName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return slug || "blog";
}

export function validateBlogCreateForm(
  values: BlogCreateFormValues,
):
  | { ok: true; data: BlogCreatePayload }
  | { ok: false; errors: BlogCreateFormErrors } {
  const errors: BlogCreateFormErrors = {};
  const name = values.name.trim();
  const category = values.category.trim();
  const slug = values.slug.trim().toLowerCase();

  if (!name) errors.name = "Blog name is required";
  if (!category) errors.category = "Blog category is required";
  if (slug && !SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers, and hyphens only";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      category,
      badgeText: values.badgeText.trim(),
      stat1Number: values.stat1Number.trim(),
      stat1Name: values.stat1Name.trim(),
      stat1Text: values.stat1Text.trim(),
      stat2Number: values.stat2Number.trim(),
      stat2Name: values.stat2Name.trim(),
      stat2Text: values.stat2Text.trim(),
      ...(slug ? { slug } : {}),
      active: true,
    },
  };
}

function safeTrim(value: string | undefined | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateBlogEditForm(
  values: BlogEditFormValues,
  meta: { name: string; slug: string; category: string },
):
  | { ok: true; data: BlogUpdatePayload }
  | { ok: false; errors: BlogEditFormErrors } {
  const errors: BlogEditFormErrors = {};
  const title = safeTrim(values.title);
  const createdBy = safeTrim(values.createdBy);
  const publishedAt = safeTrim(values.publishedAt);

  if (!title) errors.title = "Title is required";
  if (publishedAt && Number.isNaN(Date.parse(publishedAt))) {
    errors.publishedAt = "Enter a valid date";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: meta.name,
      slug: meta.slug,
      category: meta.category,
      badgeText: safeTrim(values.badgeText),
      stat1Number: safeTrim(values.stat1Number),
      stat1Name: safeTrim(values.stat1Name),
      stat1Text: safeTrim(values.stat1Text),
      stat2Number: safeTrim(values.stat2Number),
      stat2Name: safeTrim(values.stat2Name),
      stat2Text: safeTrim(values.stat2Text),
      title,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : "",
      createdBy,
      imageUrl: safeTrim(values.imageUrl),
      imagePublicId: safeTrim(values.imagePublicId),
      description: values.description ?? "",
      blockquote: safeTrim(values.blockquote),
      accordionItems: (values.accordionItems ?? [])
        .map((item) => ({
          question: safeTrim(item.question),
          description: safeTrim(item.description),
        }))
        .filter((item) => item.question.length > 0 || item.description.length > 0),
      active: values.active,
    },
  };
}

export function normalizeAccordionItems(
  value: BlogAccordionItem[] | undefined | null,
): BlogAccordionItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [{ question: "", description: "" }];
  }
  return value.map((item) => ({
    question: item.question ?? "",
    description: item.description ?? "",
  }));
}

/** Date input value (yyyy-mm-dd) from an ISO timestamp. */
export function toDateInputValue(iso: string | undefined | null): string {
  if (!iso?.trim()) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
