import { singletonHandlers } from "@/features/cms/handlers";
import { footerBodySchema, parseRecord } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "footer",
  message: "Footer",
  parse: parseRecord(footerBodySchema),
  empty: { thankYou: "", description: "", columns: [] },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
