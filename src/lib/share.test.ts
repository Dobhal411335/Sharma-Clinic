import { plainTextForShare } from "@/lib/share-text";

describe("plainTextForShare", () => {
  it("strips HTML and collapses whitespace", () => {
    expect(plainTextForShare("<p>Hello&nbsp;<strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("truncates long SEO text", () => {
    const long = "a".repeat(200);
    const result = plainTextForShare(long, 20);
    expect(result.length).toBeLessThanOrEqual(21);
    expect(result.endsWith("…")).toBe(true);
  });
});
