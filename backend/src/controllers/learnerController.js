const { query } = require("../utils/dbQuery");
const {
  STUDENT_COUNT_SQL,
  mapCourseRow,
} = require("../utils/courseMapper");
const {
  isUserEnrolled,
  autoEnrollUser,
  mapVideoForAccess,
  PREVIEW_LESSON_COUNT,
} = require("../utils/enrollmentHelpers");

const mapQuizQuestion = (q) => {
  const options =
    typeof q.options === "string" ? JSON.parse(q.options) : q.options || [];
  const correctAnswers =
    typeof q.correct_answers === "string"
      ? JSON.parse(q.correct_answers)
      : q.correct_answers;

  return {
    q: q.question,
    type: q.question_type || "radio",
    options,
    correct: q.correct_index,
    correctIndices: Array.isArray(correctAnswers)
      ? correctAnswers
      : q.question_type === "checkbox"
        ? []
        : undefined,
    blankAnswer:
      q.question_type === "fill_blank" && Array.isArray(correctAnswers)
        ? correctAnswers[0] || ""
        : "",
  };
};

const mapVideoRow = (row) => ({
  title: row.title,
  url: row.url,
  duration: row.duration || "",
  uploadedAt: row.uploaded_at,
});

async function fetchActiveCourses(classLevel = "") {
  const params = [];
  let classFilter = "";

  if (classLevel) {
    classFilter = " AND c.class_level = ?";
    params.push(classLevel);
  }

  const rows = await query(
    `SELECT c.*,
      ${STUDENT_COUNT_SQL} AS student_count,
      (SELECT COUNT(*) FROM course_videos v WHERE v.course_id = c.id) AS video_count
     FROM courses c
     WHERE c.status = 'Active'${classFilter}
     ORDER BY c.id DESC`,
    params
  );

  return rows.map((row) => {
    const videoCount = Number(row.video_count) || 0;
    return {
      ...mapCourseRow(row),
      lessonCount: videoCount,
      lessons: videoCount,
      topics: videoCount,
      topicCount: videoCount,
      reviews: Number(row.student_count) || 0,
      rating: 4.8,
    };
  });
}

async function fetchCourseFullById(id, reqUser = null) {
  const courseRows = await query(
    `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
     FROM courses c
     WHERE c.id = ? AND c.status = 'Active'
     LIMIT 1`,
    [id]
  );
  if (!courseRows.length) return null;

  if (reqUser) {
    await autoEnrollUser(reqUser, id);
  }

  const enrolled = reqUser ? await isUserEnrolled(reqUser, id) : false;

  const videos = await query(
    `SELECT title, url, duration, uploaded_at
     FROM course_videos WHERE course_id = ? ORDER BY sort_order`,
    [id]
  );

  const materials = await query(
    `SELECT title, type, url, uploaded_at
     FROM course_materials WHERE course_id = ? ORDER BY sort_order`,
    [id]
  );

  const quizRows = await query(
    "SELECT id, quiz_title FROM course_quizzes WHERE course_id = ? ORDER BY id",
    [id]
  );

  const quizzes = [];
  for (const quizRow of quizRows) {
    const questions = await query(
      "SELECT question, question_type, options, correct_index, correct_answers FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order",
      [quizRow.id]
    );

    quizzes.push({
      quizTitle: quizRow.quiz_title,
      questions: questions.map(mapQuizQuestion),
    });
  }

  return {
    ...mapCourseRow(courseRows[0]),
    enrolled,
    previewLessonCount: PREVIEW_LESSON_COUNT,
    videos: videos.map((v, i) => mapVideoForAccess(v, i, enrolled)),
    materials: enrolled
      ? materials.map((m) => ({
          title: m.title,
          type: m.type,
          url: m.url,
          uploadedAt: m.uploaded_at,
          locked: false,
        }))
      : materials.map((m) => ({
          title: m.title,
          type: m.type,
          url: "",
          uploadedAt: m.uploaded_at,
          locked: true,
        })),
    quizzes: enrolled
      ? quizzes
      : quizzes.map((q) => ({ ...q, locked: true })),
    lessonCount: videos.length,
    lessons: videos.length,
    topics: videos.length,
    topicCount: videos.length,
  };
}

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function scoreCourseForProfile(course, tokens) {
  if (!tokens.length) return 0;
  const haystack = [
    course.title,
    course.description,
    course.classLevel,
    course.subject,
    course.category,
    course.subCategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return tokens.reduce((score, t) => (haystack.includes(t) ? score + 1 : score), 0);
}

function pickRecommended(courses, bio = "") {
  const tokens = tokenize(bio);
  const scored = courses
    .map((c) => ({ course: c, score: scoreCourseForProfile(c, tokens) }))
    .sort((a, b) => b.score - a.score || (b.course.students || 0) - (a.course.students || 0));

  const matched = scored.filter((s) => s.score > 0).map((s) => s.course);
  const pool = matched.length
    ? matched
    : [...courses].sort((a, b) => (b.students || 0) - (a.students || 0));
  return pool.slice(0, 5);
}

function pickBecauseViewed(courses, viewed) {
  if (!viewed) return null;

  const keywords = tokenize(viewed.title);
  let related = courses.filter((c) => String(c.id) !== String(viewed.id));

  if (keywords.length) {
    related = related.filter((c) => {
      const hay = [
        c.title,
        c.description,
        c.classLevel,
        c.subject,
        c.category,
        c.subCategory,
      ]
        .join(" ")
        .toLowerCase();
      return keywords.some((k) => hay.includes(k));
    });
  } else if (viewed.classLevel || viewed.category) {
    const viewedClass = viewed.classLevel || viewed.category;
    related = related.filter(
      (c) => (c.classLevel || c.category) === viewedClass
    );
  }

  if (!related.length) return null;

  return {
    title: `Because you viewed ${viewed.title}`,
    courses: related.slice(0, 5),
  };
}

async function getUserClassLevel(reqUser) {
  if (!reqUser?.id) return "";

  const rows = await query(
    `SELECT class_level FROM users WHERE id = ? LIMIT 1`,
    [reqUser.id]
  );
  return String(rows[0]?.class_level || "").trim();
}

exports.getLearnerCourses = async (req, res) => {
  try {
    const classLevel = await getUserClassLevel(req.user);
    const courses = await fetchActiveCourses(classLevel);
    res.json({ courses, classLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

exports.getLearnerCourseById = async (req, res) => {
  try {
    const classLevel = await getUserClassLevel(req.user);
    const course = await fetchCourseFullById(req.params.id, req.user);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (classLevel && course.classLevel !== classLevel) {
      return res.status(403).json({
        message: "This course is not available for your class",
      });
    }

    res.json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

exports.getLearnerDashboard = async (req, res) => {
  try {
    const { lastViewedCourseId } = req.query;
    const classLevel = await getUserClassLevel(req.user);
    const courses = await fetchActiveCourses(classLevel);

    const profileRows = await query(
      `SELECT bio FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const bio = profileRows[0]?.bio || "";

    let viewed = null;
    if (lastViewedCourseId) {
      viewed =
        courses.find((c) => String(c.id) === String(lastViewedCourseId)) ||
        (await fetchCourseFullById(lastViewedCourseId));
    }

    const recommended = pickRecommended(courses, bio);
    const becauseViewed = pickBecauseViewed(courses, viewed);

    const trending = [...courses]
      .sort((a, b) => (b.students || 0) - (a.students || 0))
      .slice(0, 5);

    const featured = [...courses]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 5);

    res.json({
      recommended,
      becauseViewed,
      trending,
      featured,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
