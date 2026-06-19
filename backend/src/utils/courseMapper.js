/** Class = category, Subject = subCategory (frontend aliases). */

const STUDENT_COUNT_SQL = `(SELECT COUNT(*) FROM course_enrollments ce
  WHERE ce.course_id = c.id AND ce.status IN ('active', 'completed'))`;

function parseOverview(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Resolve class from request body (accepts legacy category alias). */
function resolveClassLevel(body = {}, row = null) {
  return String(
    body.classLevel || body.category || row?.class_level || ""
  ).trim();
}

/** Resolve subject from request body (accepts legacy subCategory alias). */
function resolveSubject(body = {}, row = null) {
  return String(
    body.subject || body.subCategory || body.sub_category || row?.subject || ""
  ).trim();
}

function mapCourseRow(row) {
  const classLevel = String(row?.class_level || "").trim();
  const subject = String(row?.subject || "").trim();
  const students = Number(row?.student_count ?? row?.students ?? 0) || 0;

  return {
    id: row.id,
    title: row.title,
    classLevel,
    subject,
    category: classLevel,
    subCategory: subject,
    instructor: row.instructor || "",
    mentor: row.instructor || "",
    description: row.description || "",
    status: row.status,
    students,
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    overview: parseOverview(row.overview),
    tag: "",
    level: "Beginner",
    labels: [],
  };
}

module.exports = {
  STUDENT_COUNT_SQL,
  parseOverview,
  resolveClassLevel,
  resolveSubject,
  mapCourseRow,
};
