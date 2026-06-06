export const DIFFICULTY_LABELS = ["Beginner", "Intermediate", "Advanced"];

export const MARKETING_LABELS = [
  "Bestseller",
  "Popular",
  "Trending",
  "Premium",
  "Recommended",
];

export const COURSE_LABEL_GROUPS = [
  { title: "Difficulty", options: DIFFICULTY_LABELS },
  { title: "Course highlights", options: MARKETING_LABELS },
];

export function normalizeCourseLabels(input) {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [];
  const all = [...DIFFICULTY_LABELS, ...MARKETING_LABELS];
  return list.map((l) => String(l).trim()).filter((l) => all.includes(l));
}

export function parseCourseLabels(course) {
  if (course?.labels?.length) return normalizeCourseLabels(course.labels);
  if (course?.level && DIFFICULTY_LABELS.includes(course.level)) {
    return [course.level];
  }
  return [];
}

export function hasCourseLabel(course, label) {
  return parseCourseLabels(course).includes(label);
}

export function filterCoursesByLabel(courses, label) {
  return courses.filter((c) => hasCourseLabel(c, label));
}

export function filterCoursesByAnyLabel(courses, labels) {
  return courses.filter((c) =>
    labels.some((label) => hasCourseLabel(c, label))
  );
}

export function sortCoursesNewest(courses, limit = 8) {
  return [...courses]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, limit);
}

/** Featured tab filters for public / logged-in course pages */
export function filterFeaturedTabCourses(courses, tab) {
  if (tab === "Popular") {
    const tagged = filterCoursesByLabel(courses, "Popular");
    if (tagged.length) return tagged;
    return [...courses].sort((a, b) => (b.students || 0) - (a.students || 0));
  }
  if (tab === "New") {
    return sortCoursesNewest(courses, courses.length);
  }
  if (tab === "Advanced") {
    const tagged = filterCoursesByAnyLabel(courses, [
      "Intermediate",
      "Advanced",
    ]);
    if (tagged.length) return tagged;
    return courses.filter((c) =>
      ["Intermediate", "Advanced"].includes(c.level)
    );
  }
  return courses;
}

export function filterTrendingCourses(courses) {
  const tagged = filterCoursesByLabel(courses, "Trending");
  if (tagged.length) return tagged;
  return sortCoursesNewest(courses, 8);
}
