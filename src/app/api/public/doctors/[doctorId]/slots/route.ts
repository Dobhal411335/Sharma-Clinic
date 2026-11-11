import { z } from "zod";

import { listBookableSlots } from "@/features/doctors/bookable-slots.service";
import { withRequestLogging } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
};

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

async function getHandler(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { doctorId } = await context.params;
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: url.searchParams.get("date") ?? "",
  });

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_QUERY",
          message: "Provide date as YYYY-MM-DD.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const slots = await listBookableSlots({
      doctorId,
      date: parsed.data.date,
    });
    return Response.json({
      success: true,
      message: "OK",
      data: { doctorId, date: parsed.data.date, slots },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load slots.";
    const status = /not found/i.test(message) ? 404 : 400;
    return Response.json(
      {
        success: false,
        error: { code: "SLOTS_ERROR", message },
      },
      { status },
    );
  }
}

export const GET = withRequestLogging(getHandler, {
  api: "public.doctors.slots",
});
