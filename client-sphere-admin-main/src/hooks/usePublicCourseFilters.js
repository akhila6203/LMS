import { useMemo, useState } from "react";
import { buildCatalogCategories } from "@/utils/courseNavUtils";

/**
 * Category-only filtering for public home / courses pages (no subcategory tabs).
 */
export function usePublicCourseFilters(courses) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => buildCatalogCategories(courses),
    [courses]
  );

  const filtered = useMemo(() => {
    if (activeCategory === "All") return courses;
    return courses.filter((c) => c.category === activeCategory);
  }, [courses, activeCategory]);

  const selectCategory = (cat) => {
    setActiveCategory(cat);
  };

  return {
    categories,
    activeCategory,
    filtered,
    selectCategory,
  };
}

export default usePublicCourseFilters;
