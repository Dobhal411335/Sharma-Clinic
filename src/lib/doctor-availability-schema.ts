import { z } from "zod";

import {
  AVAILABILITY_SCOPE_VALUES,
  WEEKDAY_VALUES,
} from "@/types/doctors-availability";

const windowSchema = z.object({
  weekday: z.enum(WEEKDAY_VALUES),
  startTimeLocal: z.string().trim(),
  endTimeLocal: z.string().trim(),
  slotDurationMinutes: z.coerce.number().int().min(5).max(240),
});

export const doctorAvailabilityBodySchema = z
  .object({
    windows: z.array(windowSchema).min(1),
    scope: z.enum(AVAILABILITY_SCOPE_VALUES).default("FIXED"),
    applyMode: z
      .enum([
        "WEEK",
        "MONTH",
        "NEXT_WEEKS",
        "NEXT_MONTHS",
        "UNTIL_DATE",
        "DATE_RANGE",
      ])
      .default("WEEK"),
    applyWeekdays: z.array(z.enum(WEEKDAY_VALUES)).optional(),
    repeatCount: z.coerce.number().int().min(1).max(52).optional(),
    untilDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    rangeStart: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    rangeEnd: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "CUSTOM") {
      if (!value.rangeStart) {
        ctx.addIssue({
          code: "custom",
          path: ["rangeStart"],
          message: "Custom schedule requires a start date.",
        });
      }
      if (!value.rangeEnd) {
        ctx.addIssue({
          code: "custom",
          path: ["rangeEnd"],
          message: "Custom schedule requires an end date.",
        });
      }
      return;
    }

    if (value.scope === "TEMPORARY") {
      if (
        value.applyMode === "NEXT_WEEKS" ||
        value.applyMode === "NEXT_MONTHS"
      ) {
        if (!value.repeatCount) {
          ctx.addIssue({
            code: "custom",
            path: ["repeatCount"],
            message: "Enter how many weeks or months to apply.",
          });
        }
      }
      if (value.applyMode === "UNTIL_DATE" && !value.untilDate) {
        ctx.addIssue({
          code: "custom",
          path: ["untilDate"],
          message: "Choose an until date.",
        });
      }
    }
  });
