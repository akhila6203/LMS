const { query } = require("../utils/dbQuery");
const { statsStudents } = require("../utils/studentListSql");

const PERIODS = ["Yearly", "Monthly", "Weekly", "Today"];

const periodWhere = (period, column = "created_at") => {
  const p = PERIODS.includes(period) ? period : "Yearly";
  switch (p) {
    case "Today":
      return { clause: `DATE(${column}) = CURDATE()`, groupFormat: "%H:00" };
    case "Weekly":
      return {
        clause: `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        groupFormat: "%a",
      };
    case "Monthly":
      return {
        clause: `${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        groupFormat: "%d %b",
      };
    default:
      return {
        clause: `${column} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`,
        groupFormat: "%b",
      };
  }
};

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const formatAmount = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

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

async function monthEarningsComparison() {
  const rows = await query(
    `SELECT
      COALESCE(SUM(CASE WHEN verified_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN total_amount END), 0) AS current_month,
      COALESCE(SUM(CASE WHEN verified_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND verified_at < DATE_FORMAT(NOW(), '%Y-%m-01') THEN total_amount END), 0) AS prev_month
     FROM purchase_orders
     WHERE status = 'approved' AND verified_at IS NOT NULL`
  );
  return {
    current: Number(rows[0]?.current_month) || 0,
    previous: Number(rows[0]?.prev_month) || 0,
  };
}

async function getEarningSeries(period) {
  const { clause, groupFormat } = periodWhere(period, "verified_at");

  const rows = await query(
    `SELECT DATE_FORMAT(verified_at, ?) AS label,
            SUM(total_amount) AS value
     FROM purchase_orders
     WHERE status = 'approved' AND verified_at IS NOT NULL AND ${clause}
     GROUP BY label
     ORDER BY MIN(verified_at) ASC`,
    [groupFormat]
  );

  return rows.map((r) => ({
    name: r.label,
    value: Math.round(Number(r.value) * 100) / 100,
  }));
}

async function getEarningSummary(period) {
  const { clause } = periodWhere(period, "verified_at");

  const [periodRows, dailyRows, compareRows] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM purchase_orders
       WHERE status = 'approved' AND verified_at IS NOT NULL AND ${clause}`
    ),
    query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM purchase_orders
       WHERE status = 'approved' AND verified_at IS NOT NULL AND DATE(verified_at) = CURDATE()`
    ),
    query(
      `SELECT
        COALESCE(SUM(CASE WHEN ${clause} THEN total_amount ELSE 0 END), 0) AS current_sum,
        COALESCE(SUM(CASE WHEN verified_at >= DATE_SUB(
          (SELECT COALESCE(MIN(verified_at), NOW()) FROM purchase_orders
           WHERE status = 'approved' AND verified_at IS NOT NULL AND ${clause}),
          INTERVAL 30 DAY)
          AND verified_at < (SELECT COALESCE(MIN(verified_at), NOW()) FROM purchase_orders
           WHERE status = 'approved' AND verified_at IS NOT NULL AND ${clause} LIMIT 1)
          THEN total_amount ELSE 0 END), 0) AS prev_sum
       FROM purchase_orders
       WHERE status = 'approved' AND verified_at IS NOT NULL`
    ),
  ]);

  const periodTotal = Number(periodRows[0]?.total) || 0;
  const todayTotal = Number(dailyRows[0]?.total) || 0;
  const currentSum = Number(compareRows[0]?.current_sum) || periodTotal;
  const prevSum = Number(compareRows[0]?.prev_sum) || 0;

  return {
    periodTotal,
    formattedTotal: formatCurrency(periodTotal),
    changePercent: pctChange(currentSum, prevSum),
    perDay: formatCurrency(todayTotal),
  };
}

async function getUserActivity() {
  const [passwordRows, googleRows, activeRows, completedRows] = await Promise.all([
    query(`SELECT COUNT(*) AS c FROM users`),
    query(`SELECT COUNT(*) AS c FROM google_users`),
    query(`SELECT COUNT(*) AS c FROM course_enrollments WHERE status = 'active'`),
    query(`SELECT COUNT(*) AS c FROM course_enrollments WHERE status = 'completed'`),
  ]);

  return [
    { name: "Password", value: Number(passwordRows[0]?.c) || 0, color: "#3b82f6" },
    { name: "Google", value: Number(googleRows[0]?.c) || 0, color: "#f97316" },
    { name: "Active", value: Number(activeRows[0]?.c) || 0, color: "#22c55e" },
    { name: "Completed", value: Number(completedRows[0]?.c) || 0, color: "#9333ea" },
  ];
}

async function getTopStudents() {
  const rows = await query(
    `SELECT id, name, email, progress, avatar, account_type, google_login FROM (
      SELECT u.id, u.name, u.email, COALESCE(sp.progress, 0) AS progress, u.avatar,
             'password' AS account_type, COALESCE(u.google_login, 0) AS google_login
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      UNION ALL
      SELECT g.id, g.name, g.email, COALESCE(gsp.progress, 0) AS progress, g.avatar,
             'google' AS account_type, 1 AS google_login
      FROM google_users g
      LEFT JOIN google_student_profiles gsp ON gsp.user_id = g.id
    ) AS s
    ORDER BY progress DESC, name ASC
    LIMIT 5`
  );

  return rows.map((r) => ({
    id: r.id,
    accountType: r.account_type || "password",
    name: r.name,
    email: r.email,
    marks: Math.round(Number(r.progress) || 0),
    avatar: r.avatar || null,
    googleLogin: !!r.google_login,
    subtitle: r.account_type === "google" ? "Google" : "Student",
  }));
}

async function getCourseActivity(period) {
  const { clause, groupFormat } = periodWhere(period, "ce.purchased_at");

  const rows = await query(
    `SELECT DATE_FORMAT(ce.purchased_at, ?) AS label,
            SUM(CASE WHEN COALESCE(c.price, 0) > 0 THEN 1 ELSE 0 END) AS paid,
            SUM(CASE WHEN COALESCE(c.price, 0) = 0 THEN 1 ELSE 0 END) AS free
     FROM course_enrollments ce
     JOIN courses c ON c.id = ce.course_id
     WHERE ce.status IN ('active', 'completed')
       AND ce.purchased_at IS NOT NULL
       AND ${clause}
     GROUP BY label
     ORDER BY MIN(ce.purchased_at) ASC`,
    [groupFormat]
  );

  const totals = await query(
    `SELECT
      SUM(CASE WHEN COALESCE(c.price, 0) > 0 THEN 1 ELSE 0 END) AS paidTotal,
      SUM(CASE WHEN COALESCE(c.price, 0) = 0 THEN 1 ELSE 0 END) AS freeTotal
     FROM course_enrollments ce
     JOIN courses c ON c.id = ce.course_id
     WHERE ce.status IN ('active', 'completed')`
  );

  return {
    series: rows.map((r) => ({
      name: r.label,
      paid: Number(r.paid) || 0,
      free: Number(r.free) || 0,
    })),
    paidTotal: Number(totals[0]?.paidTotal) || 0,
    freeTotal: Number(totals[0]?.freeTotal) || 0,
  };
}

async function getRecentPayments() {
  const rows = await query(
    `SELECT o.id AS order_id, o.customer_name, o.payment_method, o.created_at,
            oi.line_total, c.title AS course_title
     FROM purchase_orders o
     JOIN purchase_order_items oi ON oi.order_id = o.id
     JOIN courses c ON c.id = oi.course_id
     WHERE o.status = 'approved'
     ORDER BY o.created_at DESC, oi.id DESC
     LIMIT 100`
  );

  return rows.map((r) => ({
    id: `#${r.order_id}`,
    name: r.customer_name,
    course: r.course_title,
    amount: formatAmount(r.line_total),
    payment: (r.payment_method || "cash").replace(/^\w/, (c) => c.toUpperCase()),
    date: new Date(r.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
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
    const earningPeriod = req.query.earningPeriod || "Yearly";
    const coursePeriod = req.query.coursePeriod || "Yearly";

    const statsSql = statsStudents();

    const [
      enrolledRows,
      courseCountRows,
      earningsRows,
      statsRow,
      enrollTrend,
      studentTrend,
      courseTrend,
      earningTrend,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) AS c FROM course_enrollments WHERE status IN ('active', 'completed')`
      ),
      query("SELECT COUNT(*) AS c FROM courses"),
      query(
        `SELECT COALESCE(SUM(total_amount), 0) AS total
         FROM purchase_orders WHERE status = 'approved'`
      ),
      query(statsSql.sql, statsSql.params),
      monthComparison("purchased_at", "course_enrollments", "AND status IN ('active','completed')"),
      monthComparison("created_at", "users", ""),
      monthComparison("created_at", "courses", ""),
      monthEarningsComparison(),
    ]);

    const enrolledCount = Number(enrolledRows[0]?.c) || 0;
    const totalStudents = Number(statsRow[0]?.total) || 0;
    const totalCourses = Number(courseCountRows[0]?.c) || 0;
    const totalEarnings = Number(earningsRows[0]?.total) || 0;

    const [
      earningSeries,
      earningSummary,
      userActivity,
      topStudents,
      courseActivity,
      recentPayments,
      enrolledSpark,
    ] = await Promise.all([
      getEarningSeries(earningPeriod),
      getEarningSummary(earningPeriod),
      getUserActivity(),
      getTopStudents(),
      getCourseActivity(coursePeriod),
      getRecentPayments(),
      getSparkline("course_enrollments", "purchased_at", "AND status IN ('active','completed')"),
    ]);

    res.json({
      stats: {
        enrolledCourses: enrolledCount,
        totalStudents,
        totalCourses,
        totalEarnings,
        formattedEarnings: formatCurrency(totalEarnings),
        trends: {
          enrolled: pctChange(enrollTrend.current, enrollTrend.previous),
          students: pctChange(studentTrend.current, studentTrend.previous),
          courses: pctChange(courseTrend.current, courseTrend.previous),
          earnings: pctChange(earningTrend.current, earningTrend.previous),
        },
        sparklines: {
          enrolled: enrolledSpark,
          earnings: earningSeries.slice(-6).map((p) => ({ v: p.value })),
        },
      },
      earningStatistics: {
        series: earningSeries.length ? earningSeries : [{ name: "-", value: 0 }],
        ...earningSummary,
      },
      userActivity,
      topStudents,
      courseActivity,
      recentPayments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
