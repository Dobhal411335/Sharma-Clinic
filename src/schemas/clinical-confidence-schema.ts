import type { ClinicalConfidenceConfigPayload, ClinicalConfidenceFormValues } from "@/types/admin/clinical-confidence";
const validUrl = (value: string) => { const v = value.trim(); if (!v || v === "#" || v.startsWith("/") || v.startsWith("#")) return true; try { return ["http:", "https:"].includes(new URL(v).protocol); } catch { return false; } };
export type ClinicalConfidenceErrors = { heading?: string; description?: string; button1Url?: string; button2Url?: string; cards?: string };
export function validateClinicalConfidence(values: ClinicalConfidenceFormValues): { success: true; data: ClinicalConfidenceFormValues } | { success: false; errors: ClinicalConfidenceErrors } {
  const errors: ClinicalConfidenceErrors = {};
  if (!values.heading.trim()) errors.heading = "Heading is required";
  if (!values.description.trim()) errors.description = "Description is required";
  if (!validUrl(values.button1Url)) errors.button1Url = "Enter a valid URL";
  if (!validUrl(values.button2Url)) errors.button2Url = "Enter a valid URL";
  values.cards.forEach((card, index) => { if (!card.heading.trim() || !card.description.trim()) errors.cards = `Card ${index + 1} needs a heading and description`; });
  return Object.keys(errors).length ? { success: false, errors } : { success: true, data: values };
}
export function toClinicalConfidencePayload(values: ClinicalConfidenceFormValues): ClinicalConfidenceConfigPayload { return { badgeText: values.badgeText.trim(), heading: values.heading.trim(), description: values.description.trim(), button1Label: values.button1Label.trim(), button1Url: values.button1Url.trim(), button2Label: values.button2Label.trim(), button2Url: values.button2Url.trim(), backgroundImageUrl: values.backgroundImage.url.trim(), backgroundImagePublicId: values.backgroundImage.publicId.trim(), cards: values.cards.map((card, index) => ({ imageUrl: card.image.url.trim(), imagePublicId: card.image.publicId.trim(), heading: card.heading.trim(), description: card.description.trim(), buttonLabel: card.buttonLabel.trim(), buttonUrl: card.buttonUrl.trim(), active: card.active, sortOrder: index })) }; }
