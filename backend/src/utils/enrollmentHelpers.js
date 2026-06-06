const { query } = require("./dbQuery");

const PREVIEW_LESSON_COUNT = 4;

const accountTypeFromUser = (user) =>
  user?.authProvider === "google" ? "google" : "password";

const mapVideoForAccess = (row, index, enrolled) => ({
  title: row.title,
  duration: row.duration || "",
  uploadedAt: row.uploaded_at,
  sortOrder: index,
  free: enrolled || index < PREVIEW_LESSON_COUNT,
  url: enrolled || index < PREVIEW_LESSON_COUNT ? row.url || "" : "",
  locked: !enrolled && index >= PREVIEW_LESSON_COUNT,
});

async function isUserEnrolled(user, courseId) {
  if (!user?.id) return false;
  const accountType = accountTypeFromUser(user);
  const rows = await query(
    `SELECT id, status FROM course_enrollments
     WHERE user_id = ? AND account_type = ? AND course_id = ?
       AND status IN ('active', 'completed')
     LIMIT 1`,
    [user.id, accountType, courseId]
  );
  return rows.length > 0;
}

async function getEnrollment(user, courseId) {
  if (!user?.id) return null;
  const accountType = accountTypeFromUser(user);
  const rows = await query(
    `SELECT * FROM course_enrollments
     WHERE user_id = ? AND account_type = ? AND course_id = ?
     LIMIT 1`,
    [user.id, accountType, courseId]
  );
  return rows[0] || null;
}

function lineTotal(price, discountPercent) {
  const p = Number(price) || 0;
  const d = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  return Math.round(p * (1 - d / 100) * 100) / 100;
}

function mapPricingFromRow(row) {
  const price = Number(row.price) || 0;
  const discountPercent = Number(row.discount_percent) || 0;
  return {
    price,
    discountPercent,
    finalPrice: lineTotal(price, discountPercent),
  };
}

module.exports = {
  PREVIEW_LESSON_COUNT,
  accountTypeFromUser,
  mapVideoForAccess,
  isUserEnrolled,
  getEnrollment,
  lineTotal,
  mapPricingFromRow,
};
