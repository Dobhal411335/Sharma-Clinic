import {
  GALLERY_DESKTOP_COLUMNS,
  GALLERY_MAX_ITEMS_PER_COLUMN,
  packGalleryColumns,
} from "@/lib/gallery-pack";

describe("packGalleryColumns", () => {
  it("packs at most two items per column on a three-column desktop layout", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const columns = packGalleryColumns(
      items,
      GALLERY_DESKTOP_COLUMNS,
      GALLERY_MAX_ITEMS_PER_COLUMN,
    );

    expect(columns).toHaveLength(3);
    expect(columns.every((column) => column.length <= 2)).toBe(true);
    expect(columns.flat()).toEqual([1, 4, 2, 5, 3, 6]);
  });

  it("uses round-robin distribution across columns", () => {
    const columns = packGalleryColumns(["a", "b", "c", "d"], 2, 2);
    expect(columns).toEqual([
      ["a", "c"],
      ["b", "d"],
    ]);
  });
});
