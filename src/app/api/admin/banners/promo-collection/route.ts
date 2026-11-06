import { singletonHandlers } from "@/features/cms/handlers";
import { jsonMessage } from "@/features/cms/http";
import { parseLoose } from "@/features/cms/parse";

function sectionOf(request: Request, body?: unknown): "promo" | "collection" | null {
  const query = new URL(request.url).searchParams.get("section");
  const fromBody =
    body && typeof body === "object" && "section" in body
      ? (body as { section?: unknown }).section
      : undefined;
  const value = query || fromBody;
  if (value === "promo" || value === "collection") return value;
  return null;
}

function handlersFor(section: "promo" | "collection") {
  if (section === "collection") {
    return singletonHandlers({
      key: "collection-banner",
      message: "Collection banners",
      parse: (body) => {
        const record = parseLoose(body);
        delete record.section;
        return record;
      },
      empty: { sectionLabel: "", sectionHeading: "", items: [] },
    });
  }
  return singletonHandlers({
    key: "promo-banner",
    message: "Promo banners",
    parse: (body) => {
      const record = parseLoose(body);
      delete record.section;
      return record;
    },
    empty: { items: [] },
  });
}

export async function GET(request: Request) {
  const section = sectionOf(request);
  if (!section) return jsonMessage(400, "section must be promo or collection");
  return handlersFor(section).GET();
}

export async function PUT(request: Request) {
  const section = sectionOf(request);
  if (!section) return jsonMessage(400, "section must be promo or collection");
  return handlersFor(section).PUT(request);
}
