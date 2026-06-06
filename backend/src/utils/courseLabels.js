const DIFFICULTY_LABELS = ["Beginner", "Intermediate", "Advanced"];
const MARKETING_LABELS = [
  "Bestseller",
  "Popular",
  "Trending",
  "Premium",
  "Recommended",
];

const ALL_LABELS = [...DIFFICULTY_LABELS, ...MARKETING_LABELS];

const normalizeLabels = (input) => {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [];
  return list
    .map((l) => String(l).trim())
    .filter((l) => ALL_LABELS.includes(l));
};

const parseLabelsFromRow = (row) => {
  if (row?.labels != null && row.labels !== "") {
    try {
      const raw =
        typeof row.labels === "string" ? JSON.parse(row.labels) : row.labels;
      const parsed = normalizeLabels(Array.isArray(raw) ? raw : []);
      if (parsed.length) return parsed;
    } catch {
      /* fall through */
    }
  }
  if (row?.level && DIFFICULTY_LABELS.includes(row.level)) {
    return [row.level];
  }
  return [];
};

const serializeLabels = (labels) => {
  const normalized = normalizeLabels(labels);
  return normalized.length ? JSON.stringify(normalized) : null;
};

const deriveLevel = (labels) => {
  const n = normalizeLabels(labels);
  if (n.includes("Advanced")) return "Advanced";
  if (n.includes("Intermediate")) return "Intermediate";
  if (n.includes("Beginner")) return "Beginner";
  return "Beginner";
};

const primaryMarketingTag = (labels) => {
  const n = normalizeLabels(labels);
  return MARKETING_LABELS.find((l) => n.includes(l)) || null;
};

const hasLabel = (course, label) => {
  const labels = course?.labels || [];
  return labels.includes(label);
};

const filterByLabel = (courses, label) =>
  courses.filter((c) => hasLabel(c, label));

const filterByAnyLabel = (courses, labelList) =>
  courses.filter((c) => labelList.some((l) => hasLabel(c, l)));

const sortByNewest = (courses, limit = 8) =>
  [...courses]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, limit);

const enrichCourse = (course, row) => {
  const labels = parseLabelsFromRow(row || course);
  return {
    ...course,
    labels,
    level: deriveLevel(labels.length ? labels : [course.level]),
    tag: primaryMarketingTag(labels) || course.tag || "Popular",
  };
};

module.exports = {
  DIFFICULTY_LABELS,
  MARKETING_LABELS,
  ALL_LABELS,
  normalizeLabels,
  parseLabelsFromRow,
  serializeLabels,
  deriveLevel,
  primaryMarketingTag,
  hasLabel,
  filterByLabel,
  filterByAnyLabel,
  sortByNewest,
  enrichCourse,
};
