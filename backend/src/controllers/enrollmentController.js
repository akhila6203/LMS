const { query } = require("../utils/dbQuery");
const { STUDENT_COUNT_SQL, mapCourseRow } = require("../utils/courseMapper");
const { PREVIEW_LESSON_COUNT } = require("../utils/enrollmentHelpers");
const {
  getProgressForEnrollment,
  syncStudentProfileProgress,
  getUserClassLevel,
} = require("../utils/progressHelpers");

exports.getMyCourses = async (req, res) => {
  try {
    const classLevel = await getUserClassLevel(req.user.id);
    const classParams = [];
    let classFilter = "";

    if (classLevel) {
      classFilter = " AND c.class_level = ?";
      classParams.push(classLevel);
    }

    const classCourses = await query(
      `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
       FROM courses c
       WHERE c.status = 'Active'${classFilter}
       ORDER BY c.subject ASC, c.title ASC`,
      classParams
    );

    const enrollments = await query(
      `SELECT e.* FROM course_enrollments e
       WHERE e.user_id = ? AND e.status IN ('active', 'completed')`,
      [req.user.id]
    );
    const enrollmentByCourse = new Map(
      enrollments.map((e) => [e.course_id, e])
    );

    const courses = [];
    let completedCount = 0;
    let totalHours = 0;
    let totalDays = 0;

    for (const row of classCourses) {
      const enrollment = enrollmentByCourse.get(row.id);
      let progress = {
        percent: 0,
        completedUnits: 0,
        totalUnits: 0,
        courseComplete: false,
        quizDone: false,
      };
      let status = "pending";

      if (enrollment) {
        progress = await getProgressForEnrollment(enrollment.id, row.id);
        status =
          enrollment.status === "completed" ||
          (progress.quizDone && progress.courseComplete)
            ? "completed"
            : progress.completedUnits > 0
              ? "active"
              : "pending";

        if (status === "completed") completedCount += 1;

        const started = enrollment.started_at || enrollment.enrolled_at;
        const ended = enrollment.quiz_completed_at || enrollment.completed_at;
        if (started && ended) {
          const days = Math.max(
            1,
            Math.ceil((new Date(ended) - new Date(started)) / (1000 * 60 * 60 * 24))
          );
          totalDays += days;
        }
      } else {
        const units = await query(
          `SELECT
            (SELECT COUNT(*) FROM course_videos WHERE course_id = ?) +
            (SELECT COUNT(*) FROM course_materials WHERE course_id = ?) AS total`,
          [row.id, row.id]
        );
        progress.totalUnits = Number(units[0]?.total) || 0;
      }

      totalHours += progress.completedUnits * 0.5;

      courses.push({
        enrollmentId: enrollment?.id || null,
        courseId: row.id,
        title: row.title,
        category: row.class_level,
        subCategory: row.subject,
        thumbnail: row.thumbnail,
        instructor: row.instructor,
        ...mapCourseRow(row),
        progressPercent: progress.percent,
        completedUnits: progress.completedUnits,
        totalUnits: progress.totalUnits,
        courseComplete: progress.courseComplete,
        quizDone: progress.quizDone,
        status,
        enrolledAt: enrollment?.enrolled_at || null,
        startedAt: enrollment?.started_at || null,
        completedAt: enrollment?.completed_at || null,
        quizCompletedAt: enrollment?.quiz_completed_at || null,
        quizScore: enrollment?.quiz_score ?? null,
        quizTotal: enrollment?.quiz_total ?? null,
      });
    }

    const enrolled = courses.filter((c) => c.enrollmentId).length;
    const started = courses.filter((c) => c.startedAt || c.completedUnits > 0).length;
    const avgDays =
      completedCount > 0 ? Math.round(totalDays / completedCount) : 0;

    res.json({
      stats: {
        started,
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

    if (!lessonKey) {
      return res.status(400).json({ message: "lessonKey is required" });
    }

    const enrollments = await query(
      `SELECT id, started_at FROM course_enrollments
       WHERE user_id = ? AND course_id = ?
         AND status IN ('active', 'completed') LIMIT 1`,
      [req.user.id, courseId]
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

    await syncStudentProfileProgress(req.user.id);

    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};

exports.completeQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const scoreRaw = req.body?.score;
    const totalRaw = req.body?.total;

    const score =
      scoreRaw !== undefined && scoreRaw !== null && scoreRaw !== ""
        ? Math.max(0, parseInt(scoreRaw, 10))
        : null;
    const total =
      totalRaw !== undefined && totalRaw !== null && totalRaw !== ""
        ? Math.max(0, parseInt(totalRaw, 10))
        : null;

    if (
      score === null ||
      total === null ||
      Number.isNaN(score) ||
      Number.isNaN(total) ||
      total <= 0 ||
      score > total
    ) {
      return res.status(400).json({ message: "Valid quiz score and total are required" });
    }

    const enrollments = await query(
      `SELECT id FROM course_enrollments
       WHERE user_id = ? AND course_id = ?
         AND status IN ('active', 'completed') LIMIT 1`,
      [req.user.id, courseId]
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
       SET quiz_completed_at = NOW(), completed_at = NOW(), status = 'completed',
           quiz_score = ?, quiz_total = ?
       WHERE id = ?`,
      [score, total, enrollmentId]
    );

    await syncStudentProfileProgress(req.user.id);

    res.json({ message: "Quiz completed", status: "completed", score, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete quiz" });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    await query(
      "DELETE FROM course_enrollments WHERE user_id = ? AND course_id = ?",
      [req.user.id, courseId]
    );

    res.json({ message: "Removed from my courses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove enrollment" });
  }
};

exports.getRecommended = async (req, res) => {
  try {
    const enrolled = await query(
      "SELECT course_id FROM course_enrollments WHERE user_id = ?",
      [req.user.id]
    );
    const enrolledIds = new Set(enrolled.map((e) => e.course_id));

    const enrolledCourses = await query(
      `SELECT class_level, subject FROM courses
       WHERE id IN (${enrolled.length ? enrolled.map((e) => e.course_id).join(",") : "0"})`
    );

    const classLevels = [
      ...new Set(enrolledCourses.map((c) => c.class_level).filter(Boolean)),
    ];

    let recommended = [];
    if (classLevels.length) {
      const placeholders = classLevels.map(() => "?").join(",");
      recommended = await query(
        `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
         FROM courses c
         WHERE c.status = 'Active' AND c.class_level IN (${placeholders})
         ORDER BY student_count DESC LIMIT 8`,
        classLevels
      );
    } else {
      recommended = await query(
        `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
         FROM courses c
         WHERE c.status = 'Active'
         ORDER BY student_count DESC LIMIT 8`
      );
    }

    const popular = await query(
      `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
       FROM courses c
       WHERE c.status = 'Active'
       ORDER BY student_count DESC LIMIT 8`
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
