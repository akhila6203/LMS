const CLASS_NUMBER = (classLevel = "") => {
  const match = String(classLevel).match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

/** Sort classes by number (Class 4 before Class 5), then alphabetically */
export function sortClassLevels(classes = []) {
  return [...classes].sort((a, b) => {
    const numA = CLASS_NUMBER(a);
    const numB = CLASS_NUMBER(b);
    if (numA != null && numB != null && numA !== numB) return numA - numB;
    if (numA != null && numB == null) return -1;
    if (numA == null && numB != null) return 1;
    return a.localeCompare(b);
  });
}

/** All + admin-published classes only (no hardcoded fallback) */
export function buildCatalogCategories(courses = []) {
  const inData = [
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];
  const sorted = sortClassLevels(inData);
  return sorted.length ? ["All", ...sorted] : ["All"];
}

/** Navbar categories from published courses */
export function buildNavCategories(courses = []) {
  return buildCatalogCategories(courses);
}

/** Subject pills for a class — only subjects with published courses, in add order */
export function buildSubTabs(courses = [], category) {
  if (!category || category === "All") return [];

  const seen = new Set();
  const subs = [];
  for (const c of courses) {
    if (c.category !== category) continue;
    const sub = (c.subCategory || c.subject || "").trim();
    if (sub && !seen.has(sub)) {
      seen.add(sub);
      subs.push(sub);
    }
  }

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
