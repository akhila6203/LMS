import { useEffect, useState } from "react";

/** Grid columns at lg breakpoint — keep in sync with CourseGridWithMore */
export const GRID_COLS = 4;

export function useGridShowMore(items, { initialRows = 3, moreRows = 2 } = {}) {
  const initialCount = initialRows * GRID_COLS;
  const increment = moreRows * GRID_COLS;
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const itemsKey = items.map((i) => i.id).join(",");

  useEffect(() => {
    setVisibleCount(initialRows * GRID_COLS);
  }, [itemsKey, initialRows, moreRows]);

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const showMore = () =>
    setVisibleCount((v) => Math.min(v + increment, items.length));

  return { visible, hasMore, showMore, total: items.length };
}
