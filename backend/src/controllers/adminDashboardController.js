const { query } = require("../utils/dbQuery");
const { statsStudents } = require("../utils/studentListSql");

const PERIODS = ["Yearly", "Monthly", "Weekly", "Today"];

const pctChange = (current, previous) => {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) return c > 0 ? 100 : 0;
  return Math.round(((c - p) / p) * 1000) / 10;
};

async function monthComparison(dateCol, table, extraWhere = "") {
  const rows = await query(
    `SELECT
      SUM(CASE WHEN ${dateCol} >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 ELSE 0 END) AS current_month,
      SUM(CASE WHEN ${dateCol} >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND ${dateCol} < DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 ELSE 0 END) AS prev_month
     FROM ${table}
     WHERE 1=1 ${extraWhere}`
  );
  return {
    current: Number(rows[0]?.current_month) || 0,
    previous: Number(rows[0]?.prev_month) || 0,
  };
}

async function getUserActivity() {
  const [userRows, googleLoginRows, activeRows, completedRows] = await Promise.all([
    query(`SELECT COUNT(*) AS c FROM users`),
    query(`SELECT COUNT(*) AS c FROM users WHERE google_login = 1`),
    query(
      `SELECT COUNT(DISTINCT user_id) AS c FROM course_enrollments WHERE status IN ('active', 'completed')`
    ),
    query(
      `SELECT COUNT(DISTINCT user_id) AS c FROM course_enrollments WHERE status = 'completed'`
    ),
  ]);

  return [
    { name: "Students", value: Number(userRows[0]?.c) || 0, color: "#3b82f6" },
    { name: "Google", value: Number(googleLoginRows[0]?.c) || 0, color: "#f97316" },
    { name: "Learning", value: Number(activeRows[0]?.c) || 0, color: "#22c55e" },
    { name: "Completed", value: Number(completedRows[0]?.c) || 0, color: "#9333ea" },
  ];
}

async function getTopStudents() {
  const rows = await query(
    `SELECT u.id, u.name, u.email, COALESCE(sp.progress, 0) AS progress, u.avatar,
            COALESCE(u.google_login, 0) AS google_login
     FROM users u
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     ORDER BY progress DESC, u.name ASC
     LIMIT 5`
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    marks: Math.round(Number(r.progress) || 0),
    avatar: r.avatar || null,
    googleLogin: !!r.google_login,
    subtitle: r.google_login ? "Google" : "Student",
  }));
}

async function getSparkline(table, dateCol, extraWhere = "") {
  const rows = await query(
    `SELECT COUNT(*) AS c
     FROM ${table}
     WHERE ${dateCol} >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       ${extraWhere}
     GROUP BY YEAR(${dateCol}), MONTH(${dateCol})
     ORDER BY YEAR(${dateCol}), MONTH(${dateCol})
     LIMIT 6`
  );
  const values = rows.map((r) => ({ v: Number(r.c) || 0 }));
  return values.length
    ? values
    : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
}

exports.getDashboard = async (req, res) => {
  try {
    const statsSql = statsStudents();

    const [
      activeLearnerRows,
      courseCountRows,
      statsRow,
      studentTrend,
      courseTrend,
    ] = await Promise.all([
      query(
        `SELECT COUNT(DISTINCT user_id) AS c FROM course_enrollments WHERE status IN ('active', 'completed')`
      ),
      query("SELECT COUNT(*) AS c FROM courses"),
      query(statsSql.sql, statsSql.params),
      monthComparison("created_at", "users", ""),
      monthComparison("created_at", "courses", ""),
    ]);

    const activeLearners = Number(activeLearnerRows[0]?.c) || 0;
    const totalStudents = Number(statsRow[0]?.total) || 0;
    const totalCourses = Number(courseCountRows[0]?.c) || 0;
    const avgProgress = Math.round(Number(statsRow[0]?.avgProgress) || 0);

    const [userActivity, topStudents, studentSpark] = await Promise.all([
      getUserActivity(),
      getTopStudents(),
      getSparkline("users", "created_at", ""),
    ]);

    res.json({
      stats: {
        activeLearners,
        totalStudents,
        totalCourses,
        avgProgress,
        trends: {
          students: pctChange(studentTrend.current, studentTrend.previous),
          courses: pctChange(courseTrend.current, courseTrend.previous),
        },
        sparklines: {
          students: studentSpark,
        },
      },
      userActivity,
      topStudents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
