const { query } = require("./dbQuery");

const PREVIEW_LESSON_COUNT = 1;

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
  const rows = await query(
    `SELECT id, status FROM course_enrollments
     WHERE user_id = ? AND course_id = ?
       AND status IN ('active', 'completed')
     LIMIT 1`,
    [user.id, courseId]
  );
  return rows.length > 0;
}

async function getEnrollment(user, courseId) {
  if (!user?.id) return null;
  const rows = await query(
    `SELECT * FROM course_enrollments
     WHERE user_id = ? AND course_id = ?
     LIMIT 1`,
    [user.id, courseId]
  );
  return rows[0] || null;
}

async function autoEnrollUser(user, courseId) {
  if (!user?.id) return false;

  const existing = await getEnrollment(user, courseId);
  if (existing && ["active", "completed"].includes(existing.status)) {
    return true;
  }

  if (existing) {
    await query(
      `UPDATE course_enrollments SET status = 'active' WHERE id = ?`,
      [existing.id]
    );
    return true;
  }

  await query(
    `INSERT INTO course_enrollments (user_id, course_id, status, enrolled_at)
     VALUES (?, ?, 'active', NOW())`,
    [user.id, courseId]
  );

  return true;
}

module.exports = {
  PREVIEW_LESSON_COUNT,
  mapVideoForAccess,
  isUserEnrolled,
  getEnrollment,
  autoEnrollUser,
};
