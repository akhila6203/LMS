/** Combined password + Google learners for admin Students page */

const enrollmentSubquery = (userIdCol, accountType) => `
  (SELECT COUNT(*) FROM course_enrollments ce
   WHERE ce.user_id = ${userIdCol} AND ce.account_type = '${accountType}')
`;

const completedSubquery = (userIdCol, accountType) => `
  (SELECT COUNT(*) FROM course_enrollments ce
   WHERE ce.user_id = ${userIdCol} AND ce.account_type = '${accountType}'
     AND ce.status = 'completed')
`;

const STUDENTS_UNION = `
  SELECT
    u.id,
    'password' AS account_type,
    u.name,
    u.email,
    u.status,
    u.google_login,
    u.avatar,
    u.created_at,
    ${enrollmentSubquery("u.id", "password")} AS enrolled,
    ${completedSubquery("u.id", "password")} AS completed,
    COALESCE(sp.progress, 0) AS progress,
    COALESCE(sp.joined_date, DATE(u.created_at)) AS joined_date
  FROM users u
  LEFT JOIN student_profiles sp ON sp.user_id = u.id

  UNION ALL

  SELECT
    g.id,
    'google' AS account_type,
    g.name,
    g.email,
    g.status,
    1 AS google_login,
    g.avatar,
    g.created_at,
    ${enrollmentSubquery("g.id", "google")} AS enrolled,
    ${completedSubquery("g.id", "google")} AS completed,
    COALESCE(gsp.progress, 0) AS progress,
    COALESCE(gsp.joined_date, DATE(g.created_at)) AS joined_date
  FROM google_users g
  LEFT JOIN google_student_profiles gsp ON gsp.user_id = g.id
`;

const buildWhere = (search) => {
  if (!search) return { clause: "", params: [] };
  return {
    clause: "WHERE s.name LIKE ? OR s.email LIKE ?",
    params: [`%${search}%`, `%${search}%`],
  };
};

const listStudents = (search, limit, offset) => {
  const { clause, params } = buildWhere(search);
  return {
    sql: `
      SELECT * FROM (${STUDENTS_UNION}) AS s
      ${clause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `,
    params: [...params, limit, offset],
  };
};

const countStudents = (search) => {
  const { clause, params } = buildWhere(search);
  return {
    sql: `SELECT COUNT(*) AS total FROM (${STUDENTS_UNION}) AS s ${clause}`,
    params,
  };
};

const statsStudents = (search) => {
  const { clause, params } = buildWhere(search);
  return {
    sql: `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) AS active,
        COALESCE(AVG(s.progress), 0) AS avgProgress
      FROM (${STUDENTS_UNION}) AS s
      ${clause}
    `,
    params,
  };
};

module.exports = {
  listStudents,
  countStudents,
  statsStudents,
};
