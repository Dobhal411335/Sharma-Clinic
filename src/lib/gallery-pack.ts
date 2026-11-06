/** Max items stacked in one masonry column (image / video / text card). */
export const GALLERY_MAX_ITEMS_PER_COLUMN = 2;

/** Preferred desktop column count for the lookbook masonry. */
export const GALLERY_DESKTOP_COLUMNS = 4;

/** Mobile / tablet column counts for denser small viewports. */
export const GALLERY_MOBILE_COLUMNS = 2;

/**
 * Pack gallery items into columns with a hard cap per column.
 * Uses round-robin so mixed heights stay balanced across columns.
 */
export function packGalleryColumns<T>(
  items: readonly T[],
  columnCount: number,
  maxPerColumn: number = GALLERY_MAX_ITEMS_PER_COLUMN,
): T[][] {
  const safeColumns = Math.max(1, Math.floor(columnCount));
  const capacity = safeColumns * Math.max(1, Math.floor(maxPerColumn));
  const visible = items.slice(0, capacity);
  const columns: T[][] = Array.from({ length: safeColumns }, () => []);

  visible.forEach((item, index) => {
    columns[index % safeColumns]?.push(item);
  });

  return columns;
}
