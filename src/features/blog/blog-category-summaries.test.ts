import { buildBlogCategorySummaries } from "@/features/blog/blog.service";

describe("buildBlogCategorySummaries", () => {
  it("counts posts per category in the given name order", () => {
    const result = buildBlogCategorySummaries(
      [
        { category: "Education" },
        { category: "Wellness Tips" },
        { category: "Education" },
      ],
      ["Education", "Wellness Tips", "Preventive Care"],
    );

    expect(result).toEqual([
      { name: "Education", count: 2 },
      { name: "Wellness Tips", count: 1 },
      { name: "Preventive Care", count: 0 },
    ]);
  });
});
