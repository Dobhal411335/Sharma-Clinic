import { z } from "zod";

import { isFilledText } from "@/features/webpages/utils/is-filled-text";
import type { DoctorQualificationCard } from "@/types/doctors";

export const doctorQualificationCardSchema = z.object({
  id: z.string().trim().min(1).max(80),
  heading: z.string().trim().max(200).default(""),
  descriptions: z.array(z.string().max(50_000)).max(20).default([]),
});

export const doctorQualificationFieldsSchema = z.object({
  qualificationTitle: z.string().trim().max(200).default("Qualification"),
  qualificationCards: z.array(doctorQualificationCardSchema).max(30).default([]),
});

export function createQualificationCardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `qc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyQualificationCard(): DoctorQualificationCard {
  return {
    id: createQualificationCardId(),
    heading: "",
    descriptions: [""],
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function legacyPlainToHtml(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return `<p>${escapeHtml(text).replace(/\n+/g, "</p><p>")}</p>`;
}

function legacyCard(
  heading: string,
  value: unknown,
): DoctorQualificationCard | null {
  const html = legacyPlainToHtml(value);
  if (!isFilledText(html)) return null;
  return {
    id: createQualificationCardId(),
    heading,
    descriptions: [html],
  };
}

/**
 * Normalize stored CMS doctor qualification fields.
 * Migrates legacy education/degree/workHistory/workDays into cards when needed.
 */
export function normalizeDoctorQualification(source: {
  qualificationTitle?: unknown;
  qualificationCards?: unknown;
  education?: unknown;
  degree?: unknown;
  workHistory?: unknown;
  workDays?: unknown;
}): {
  qualificationTitle: string;
  qualificationCards: DoctorQualificationCard[];
} {
  const title =
    typeof source.qualificationTitle === "string" &&
    source.qualificationTitle.trim()
      ? source.qualificationTitle.trim()
      : "Qualification";

  if (Array.isArray(source.qualificationCards)) {
    const cards = source.qualificationCards
      .map((raw): DoctorQualificationCard | null => {
        if (!raw || typeof raw !== "object") return null;
        const item = raw as Record<string, unknown>;
        const heading = String(item.heading ?? "").trim();
        const descriptions = Array.isArray(item.descriptions)
          ? item.descriptions.map((entry) => String(entry ?? ""))
          : [];
        const filledDescriptions = descriptions.filter((entry) =>
          isFilledText(entry),
        );
        if (!heading && filledDescriptions.length === 0) return null;
        return {
          id:
            typeof item.id === "string" && item.id.trim()
              ? item.id.trim()
              : createQualificationCardId(),
          heading,
          descriptions:
            filledDescriptions.length > 0 ? filledDescriptions : [""],
        };
      })
      .filter((card): card is DoctorQualificationCard => card != null);

    return { qualificationTitle: title, qualificationCards: cards };
  }

  const migrated = [
    legacyCard("Education", source.education),
    legacyCard("Degree", source.degree),
    legacyCard("Work history", source.workHistory),
    legacyCard("Work days", source.workDays),
  ].filter((card): card is DoctorQualificationCard => card != null);

  return { qualificationTitle: title, qualificationCards: migrated };
}

export function sanitizeQualificationCards(
  cards: DoctorQualificationCard[],
): DoctorQualificationCard[] {
  return cards
    .map((card) => {
      const heading = card.heading.trim();
      const descriptions = card.descriptions
        .map((entry) => entry.trim())
        .filter((entry) => isFilledText(entry));
      if (!heading && descriptions.length === 0) return null;
      return {
        id: card.id.trim() || createQualificationCardId(),
        heading,
        descriptions,
      };
    })
    .filter((card): card is DoctorQualificationCard => card != null);
}

export function qualificationSearchText(input: {
  qualificationTitle?: string;
  qualificationCards?: DoctorQualificationCard[];
}): string {
  const parts = [input.qualificationTitle ?? ""];
  for (const card of input.qualificationCards ?? []) {
    parts.push(card.heading);
    for (const description of card.descriptions) {
      parts.push(description.replace(/<[^>]*>/g, " "));
    }
  }
  return parts.join(" ");
}
