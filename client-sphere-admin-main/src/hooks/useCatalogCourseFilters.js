import { useEffect, useMemo, useState } from "react";
import {
  buildCatalogCategories,
  buildSubTabs,
} from "@/utils/courseNavUtils";

/**
 * Category + subcategory filtering for the Courses catalog page only.
 */
export function useCatalogCourseFilters(courses) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  const categories = useMemo(
    () => buildCatalogCategories(courses),
    [courses]
  );

  const subCategories = useMemo(() => {
    if (activeCategory === "All") return [];
    return buildSubTabs(courses, activeCategory);
  }, [activeCategory, courses]);

  useEffect(() => {
    if (activeCategory === "All") {
      setActiveSubCategory(null);
      return;
    }
    setActiveSubCategory(subCategories[0] ?? null);
  }, [activeCategory, subCategories]);

  const filtered = useMemo(() => {
    let list = courses;
    if (activeCategory !== "All") {
      list = list.filter((c) => c.category === activeCategory);
      if (
        activeSubCategory &&
        !String(activeSubCategory).startsWith("All")
      ) {
        list = list.filter((c) => c.subCategory === activeSubCategory);
      }
    }
    return list;
  }, [courses, activeCategory, activeSubCategory]);

  const selectCategory = (cat) => {
    setActiveCategory(cat);
  };

  const selectSubCategory = (sub) => {
    setActiveSubCategory(sub);
  };

  return {
    categories,
    subCategories,
    activeCategory,
    activeSubCategory,
    filtered,
    selectCategory,
    selectSubCategory,
  };
}

export default useCatalogCourseFilters;
