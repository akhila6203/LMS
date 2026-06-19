const { query } = require("./dbQuery");

async function getProgressForEnrollment(enrollmentId, courseId) {
  const videos = await query(
    "SELECT id, title, duration, sort_order FROM course_videos WHERE course_id = ? ORDER BY sort_order",
    [courseId]
  );
  const materials = await query(
    "SELECT id, title FROM course_materials WHERE course_id = ? ORDER BY sort_order",
    [courseId]
  );
  const quizzes = await query(
    "SELECT id, quiz_title FROM course_quizzes WHERE course_id = ? ORDER BY id",
    [courseId]
  );

  const doneRows = await query(
    "SELECT lesson_key, lesson_type FROM course_lesson_progress WHERE enrollment_id = ?",
    [enrollmentId]
  );
  const doneSet = new Set(doneRows.map((r) => r.lesson_key));

  let videosDone = 0;
  let materialsDone = 0;

  videos.forEach((v, i) => {
    const key = `video:${v.id || i + 1}`;
    if (doneSet.has(key) || doneSet.has(`video:${i + 1}`)) videosDone += 1;
  });
  materials.forEach((m, i) => {
    const key = `material:${m.id || i + 1}`;
    if (doneSet.has(key) || doneSet.has(`material:${i + 1}`)) materialsDone += 1;
  });

  const contentUnits = videos.length + materials.length;
  const completedContent = videosDone + materialsDone;
  const percent =
    contentUnits > 0
      ? Math.min(100, Math.round((completedContent / contentUnits) * 100))
      : 0;

  const courseComplete =
    videos.length === videosDone &&
    materials.length === materialsDone &&
    contentUnits > 0;

  const legacyAllQuizDone = doneSet.has("quiz:all");
  const completedQuizIds = new Set(
    [...doneSet]
      .filter((key) => key.startsWith("quiz:") && key !== "quiz:all")
      .map((key) => key.slice("quiz:".length))
  );

  const quizDone =
    quizzes.length === 0
      ? legacyAllQuizDone
      : quizzes.every(
          (q) =>
            completedQuizIds.has(String(q.id)) ||
            (legacyAllQuizDone && quizzes.length === 1)
        );

  return {
    totalUnits: contentUnits,
    completedUnits: completedContent,
    percent: quizDone ? 100 : percent,
    courseComplete,
    quizDone,
    videosCount: videos.length,
    materialsCount: materials.length,
    quizzesCount: quizzes.length,
  };
}

async function getUserClassLevel(userId) {
  const rows = await query(
    "SELECT class_level FROM users WHERE id = ? LIMIT 1",
    [userId]
  );
  return String(rows[0]?.class_level || "").trim();
}

async function calculateUserOverallProgress(userId) {
  const classLevel = await getUserClassLevel(userId);
  const params = [userId];
  let classFilter = "";

  if (classLevel) {
    classFilter = " AND c.class_level = ?";
    params.push(classLevel);
  }

  const enrollments = await query(
    `SELECT ce.id, ce.course_id, ce.status
     FROM course_enrollments ce
     INNER JOIN courses c ON c.id = ce.course_id
     WHERE ce.user_id = ?
       AND ce.status IN ('active', 'completed')${classFilter}`,
    params
  );

  let totalTopics = 0;
  let completedTopics = 0;
  let completedLessons = 0;

  for (const row of enrollments) {
    const progress = await getProgressForEnrollment(row.id, row.course_id);
    totalTopics += progress.totalUnits;
    completedTopics += progress.completedUnits;
    if (progress.quizDone || (progress.courseComplete && progress.percent >= 100)) {
      completedLessons += 1;
    }
  }

  const progressPercent =
    totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0;

  return {
    enrolled: enrollments.length,
    completed: completedLessons,
    progress: progressPercent,
    totalTopics,
    completedTopics,
  };
}

async function ensureStudentProfile(userId) {
  const rows = await query(
    "SELECT user_id FROM student_profiles WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (!rows.length) {
    await query(
      `INSERT INTO student_profiles (user_id, enrolled, completed, progress, joined_date)
       VALUES (?, 0, 0, 0, CURDATE())`,
      [userId]
    );
  }
}

async function syncStudentProfileProgress(userId) {
  try {
    await ensureStudentProfile(userId);
    const stats = await calculateUserOverallProgress(userId);
    await query(
      `UPDATE student_profiles
       SET enrolled = ?, completed = ?, progress = ?
       WHERE user_id = ?`,
      [stats.enrolled, stats.completed, stats.progress, userId]
    );
    return stats;
  } catch (err) {
    console.error("syncStudentProfileProgress:", err);
    return null;
  }
}

async function fetchSubjectProgressByUserIds(userIds) {
  if (!userIds.length) return {};

  const placeholders = userIds.map(() => "?").join(",");
  const enrollmentRows = await query(
    `SELECT ce.user_id, ce.id AS enrollment_id, ce.course_id, c.subject
     FROM course_enrollments ce
     INNER JOIN courses c ON c.id = ce.course_id
     WHERE ce.user_id IN (${placeholders})
       AND ce.status IN ('active', 'completed')
       AND c.subject IS NOT NULL AND c.subject != ''
     ORDER BY c.subject ASC`,
    userIds
  );

  const map = {};

  for (const row of enrollmentRows) {
    const progress = await getProgressForEnrollment(row.enrollment_id, row.course_id);

    if (!map[row.user_id]) map[row.user_id] = {};
    if (!map[row.user_id][row.subject]) {
      map[row.user_id][row.subject] = {
        subject: row.subject,
        completed: 0,
        total: 0,
      };
    }

    map[row.user_id][row.subject].completed += progress.completedUnits;
    map[row.user_id][row.subject].total += progress.totalUnits;
  }

  const result = {};
  for (const userId of Object.keys(map)) {
    result[userId] = Object.values(map[userId]).map((sp) => ({
      subject: sp.subject,
      completed: sp.completed,
      total: sp.total,
      progress:
        sp.total > 0 ? Math.min(100, Math.round((sp.completed / sp.total) * 100)) : 0,
    }));
  }

  return result;
}

module.exports = {
  getProgressForEnrollment,
  calculateUserOverallProgress,
  syncStudentProfileProgress,
  fetchSubjectProgressByUserIds,
  getUserClassLevel,
};
