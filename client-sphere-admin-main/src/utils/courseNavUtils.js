import { CATEGORIES } from "@/lib/catalog";

const PREDEFINED = CATEGORIES.filter((c) => c !== "All");

/** All + known catalog categories + custom categories from published courses */
export function buildCatalogCategories(courses = []) {
  const inData = [
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];
  const known = PREDEFINED.filter((c) => inData.includes(c));
  const custom = inData
    .filter((c) => !PREDEFINED.includes(c))
    .sort((a, b) => a.localeCompare(b));
  const merged = ["All", ...known, ...custom];
  return merged.length > 1 ? merged : ["All", ...PREDEFINED];
}

/** Navbar categories from published courses (All + categories that exist in DB) */
export function buildNavCategories(courses = []) {
  return buildCatalogCategories(courses);
}

/** Subcategory pills for a category — from real course data */
export function buildSubTabs(courses = [], category) {
  if (!category || category === "All") return [];

  const subs = [
    ...new Set(
      courses
        .filter((c) => c.category === category)
        .map((c) => c.subCategory)
        .filter(Boolean)
    ),
  ];

  const allLabel = `All ${category}`;
  return subs.length ? [allLabel, ...subs] : [allLabel];
}

/** Last opened course id from local learning progress */
export function getLastViewedCourseId(progressMap = {}) {
  const entries = Object.entries(progressMap);
  if (!entries.length) return null;

  entries.sort((a, b) => {
    const ta = new Date(a[1]?.updatedAt || 0).getTime();
    const tb = new Date(b[1]?.updatedAt || 0).getTime();
    return tb - ta;
  });

  return entries[0][0];
}
