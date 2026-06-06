const { query } = require("../utils/dbQuery");
const { enrichCourse } = require("../utils/courseLabels");
const {
  accountTypeFromUser,
  mapPricingFromRow,
  PREVIEW_LESSON_COUNT,
} = require("../utils/enrollmentHelpers");

const mapCourseRow = (row) => {
  const pricing = mapPricingFromRow(row);
  return enrichCourse(
    {
      id: row.id,
      title: row.title,
      category: row.category,
      subCategory: row.sub_category,
      instructor: row.instructor,
      level: row.level,
      description: row.description,
      thumbnail: row.thumbnail,
      students: row.students,
      createdAt: row.created_at,
      ...pricing,
    },
    row
  );
};

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
  const quizDone = doneSet.has("quiz:all");

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

exports.getMyCourses = async (req, res) => {
  try {
    const accountType = accountTypeFromUser(req.user);

    const enrollments = await query(
      `SELECT e.*, c.title, c.category, c.thumbnail, c.instructor, c.price, c.discount_percent, c.labels, c.level
       FROM course_enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ? AND account_type = ?
       ORDER BY e.purchased_at DESC`,
      [req.user.id, accountType]
    );

    const courses = [];
    let completedCount = 0;
    let totalHours = 0;
    let totalDays = 0;

    for (const row of enrollments) {
      const progress = await getProgressForEnrollment(row.id, row.course_id);
      const status =
        row.status === "completed" || (progress.quizDone && progress.courseComplete)
          ? "completed"
          : "pending";

      if (status === "completed") completedCount += 1;

      const started = row.started_at || row.purchased_at;
      const ended = row.quiz_completed_at || row.completed_at;
      if (started && ended) {
        const days = Math.max(
          1,
          Math.ceil((new Date(ended) - new Date(started)) / (1000 * 60 * 60 * 24))
        );
        totalDays += days;
      }

      totalHours += progress.completedUnits * 0.5;

      courses.push({
        enrollmentId: row.id,
        courseId: row.course_id,
        title: row.title,
        category: row.category,
        thumbnail: row.thumbnail,
        instructor: row.instructor,
        ...mapCourseRow(row),
        progressPercent: progress.percent,
        completedUnits: progress.completedUnits,
        totalUnits: progress.totalUnits,
        courseComplete: progress.courseComplete,
        quizDone: progress.quizDone,
        status,
        purchasedAt: row.purchased_at,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        quizCompletedAt: row.quiz_completed_at,
      });
    }

    const enrolled = courses.length;
    const avgDays =
      completedCount > 0 ? Math.round(totalDays / completedCount) : 0;

    res.json({
      stats: {
        enrolled,
        completed: completedCount,
        hoursLearned: Math.round(totalHours),
        daysToComplete: avgDays,
      },
      courses,
      previewLessonCount: PREVIEW_LESSON_COUNT,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load my courses" });
  }
};

exports.markLessonProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonKey, lessonType = "video" } = req.body;
    const accountType = accountTypeFromUser(req.user);

    if (!lessonKey) {
      return res.status(400).json({ message: "lessonKey is required" });
    }

    const enrollments = await query(
      `SELECT id, started_at FROM course_enrollments
       WHERE user_id = ? AND account_type = ? AND course_id = ?
         AND status IN ('active', 'completed') LIMIT 1`,
      [req.user.id, accountType, courseId]
    );

    if (!enrollments.length) {
      return res.status(403).json({ message: "Enroll in this course first" });
    }

    const enrollmentId = enrollments[0].id;

    await query(
      `INSERT INTO course_lesson_progress (enrollment_id, lesson_key, lesson_type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE completed_at = NOW()`,
      [enrollmentId, lessonKey, lessonType]
    );

    if (!enrollments[0].started_at) {
      await query(
        "UPDATE course_enrollments SET started_at = NOW() WHERE id = ? AND started_at IS NULL",
        [enrollmentId]
      );
    }

    const progress = await getProgressForEnrollment(enrollmentId, courseId);

    if (progress.courseComplete && !progress.quizDone) {
      await query(
        "UPDATE course_enrollments SET completed_at = NOW() WHERE id = ? AND completed_at IS NULL",
        [enrollmentId]
      );
    }

    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};

exports.completeQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const accountType = accountTypeFromUser(req.user);

    const enrollments = await query(
      `SELECT id FROM course_enrollments
       WHERE user_id = ? AND account_type = ? AND course_id = ?
         AND status IN ('active', 'completed') LIMIT 1`,
      [req.user.id, accountType, courseId]
    );

    if (!enrollments.length) {
      return res.status(403).json({ message: "Enroll in this course first" });
    }

    const enrollmentId = enrollments[0].id;
    const progress = await getProgressForEnrollment(enrollmentId, courseId);

    if (!progress.courseComplete) {
      return res.status(403).json({
        message: "Complete all lessons and materials before starting the quiz",
        courseComplete: false,
      });
    }

    await query(
      `INSERT INTO course_lesson_progress (enrollment_id, lesson_key, lesson_type)
       VALUES (?, 'quiz:all', 'quiz')
       ON DUPLICATE KEY UPDATE completed_at = NOW()`,
      [enrollmentId]
    );

    await query(
      `UPDATE course_enrollments
       SET quiz_completed_at = NOW(), completed_at = NOW(), status = 'completed'
       WHERE id = ?`,
      [enrollmentId]
    );

    res.json({ message: "Quiz completed", status: "completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete quiz" });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const accountType = accountTypeFromUser(req.user);

    await query(
      "DELETE FROM course_enrollments WHERE user_id = ? AND account_type = ? AND course_id = ?",
      [req.user.id, accountType, courseId]
    );

    res.json({ message: "Removed from my courses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove enrollment" });
  }
};

exports.getRecommended = async (req, res) => {
  try {
    const accountType = accountTypeFromUser(req.user);

    const enrolled = await query(
      "SELECT course_id FROM course_enrollments WHERE user_id = ? AND account_type = ?",
      [req.user.id, accountType]
    );
    const enrolledIds = new Set(enrolled.map((e) => e.course_id));

    const enrolledCourses = await query(
      `SELECT category, sub_category, subject FROM courses
       WHERE id IN (${enrolled.length ? enrolled.map((e) => e.course_id).join(",") : "0"})`
    );

    const categories = [...new Set(enrolledCourses.map((c) => c.category).filter(Boolean))];

    let recommended = [];
    if (categories.length) {
      const placeholders = categories.map(() => "?").join(",");
      recommended = await query(
        `SELECT * FROM courses WHERE status = 'Active' AND category IN (${placeholders})
         ORDER BY students DESC LIMIT 8`,
        categories
      );
    } else {
      recommended = await query(
        "SELECT * FROM courses WHERE status = 'Active' ORDER BY students DESC LIMIT 8"
      );
    }

    const popular = await query(
      "SELECT * FROM courses WHERE status = 'Active' ORDER BY students DESC LIMIT 8"
    );

    const mapList = (rows) =>
      rows
        .filter((r) => !enrolledIds.has(r.id))
        .slice(0, 5)
        .map((r) => mapCourseRow(r));

    res.json({
      recommended: mapList(recommended),
      popular: mapList(popular),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load recommendations" });
  }
};
