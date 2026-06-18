/** Admin Students page — single users table */

const enrollmentSubquery = (userIdCol) => `
  (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.user_id = ${userIdCol})
`;

const completedSubquery = (userIdCol) => `
  (SELECT COUNT(*) FROM course_enrollments ce
   WHERE ce.user_id = ${userIdCol} AND ce.status = 'completed')
`;

const STUDENTS_BASE = `
  SELECT
    u.id,
    u.name,
    u.email,
    u.status,
    u.google_login,
    u.avatar,
    u.class_level,
    u.school,
    u.created_at,
    ${enrollmentSubquery("u.id")} AS enrolled,
    ${completedSubquery("u.id")} AS completed,
    COALESCE(sp.progress, 0) AS progress,
    COALESCE(sp.joined_date, DATE(u.created_at)) AS joined_date
  FROM users u
  LEFT JOIN student_profiles sp ON sp.user_id = u.id
`;

const buildWhere = ({ search = "", classLevel = "", school = "" } = {}) => {
  const clauses = [];
  const params = [];

  if (search) {
    clauses.push(
      "(s.name LIKE ? OR s.email LIKE ? OR s.school LIKE ? OR s.class_level LIKE ?)"
    );
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (classLevel) {
    clauses.push("s.class_level = ?");
    params.push(classLevel);
  }

  if (school) {
    clauses.push("s.school = ?");
    params.push(school);
  }

  const clause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { clause, params };
};

const listStudents = (filters, limit, offset) => {
  const { clause, params } = buildWhere(filters);
  return {
    sql: `
      SELECT * FROM (${STUDENTS_BASE}) AS s
      ${clause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `,
    params: [...params, limit, offset],
  };
};

const countStudents = (filters) => {
  const { clause, params } = buildWhere(filters);
  return {
    sql: `SELECT COUNT(*) AS total FROM (${STUDENTS_BASE}) AS s ${clause}`,
    params,
  };
};

const statsStudents = (filters) => {
  const { clause, params } = buildWhere(filters);
  return {
    sql: `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) AS active,
        COALESCE(AVG(s.progress), 0) AS avgProgress
      FROM (${STUDENTS_BASE}) AS s
      ${clause}
    `,
    params,
  };
};

const distinctSchools = () => ({
  sql: `
    SELECT name AS school FROM schools
    WHERE name IS NOT NULL AND name != ''
    ORDER BY school ASC
  `,
  params: [],
});

module.exports = {
  listStudents,
  countStudents,
  statsStudents,
  distinctSchools,
};
