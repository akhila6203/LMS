const { query } = require("../utils/dbQuery");
const {
  enrichCourse,
  filterByLabel,
  sortByNewest,
} = require("../utils/courseLabels");
const {
  isUserEnrolled,
  mapVideoForAccess,
  mapPricingFromRow,
  PREVIEW_LESSON_COUNT,
} = require("../utils/enrollmentHelpers");

const mapCourseRow = (row) =>
  enrichCourse(
    {
      id: row.id,
      title: row.title,
      category: row.category,
      subCategory: row.sub_category,
      subject: row.subject,
      classLevel: row.class_level,
      instructor: row.instructor,
      level: row.level,
      description: row.description,
      status: row.status,
      students: row.students,
      thumbnail: row.thumbnail,
      createdAt: row.created_at,
      ...mapPricingFromRow(row),
    },
    row
  );

const mapVideoRow = (row) => ({
  title: row.title,
  url: row.url,
  duration: row.duration || "",
  uploadedAt: row.uploaded_at,
});

async function fetchActiveCourses() {
  const rows = await query(
    `SELECT c.*,
      (SELECT COUNT(*) FROM course_videos v WHERE v.course_id = c.id) AS video_count
     FROM courses c
     WHERE c.status = 'Active'
     ORDER BY c.id DESC`
  );

  return rows.map((row) => {
    const videoCount = Number(row.video_count) || 0;
    return {
      ...mapCourseRow(row),
      lessonCount: videoCount,
      lessons: videoCount,
      reviews: row.students || 0,
      rating: 4.8,
    };
  });
}

async function fetchCourseFullById(id, reqUser = null) {
  const courseRows = await query(
    "SELECT * FROM courses WHERE id = ? AND status = 'Active' LIMIT 1",
    [id]
  );
  if (!courseRows.length) return null;

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
      "SELECT question, options, correct_index FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order",
      [quizRow.id]
    );

    quizzes.push({
      quizTitle: quizRow.quiz_title,
      questions: questions.map((q) => ({
        q: q.question,
        options:
          typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        correct: q.correct_index,
      })),
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
    course.category,
    course.subCategory,
    course.subject,
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
  const pool = matched.length ? matched : [...courses].sort((a, b) => (b.students || 0) - (a.students || 0));
  return pool.slice(0, 5);
}

function isAiRelated(course) {
  const text = [course.title, course.description, course.category, course.subCategory]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\bai\b|artificial intelligence|machine learning|ml\b|data science/.test(text);
}

function pickBecauseViewed(courses, viewed) {
  if (!viewed) return null;

  const keywords = tokenize(viewed.title);
  let related = courses.filter((c) => String(c.id) !== String(viewed.id));

  if (isAiRelated(viewed)) {
    related = related.filter(isAiRelated);
  } else if (keywords.length) {
    related = related.filter((c) => {
      const hay = [c.title, c.description, c.category, c.subCategory].join(" ").toLowerCase();
      return keywords.some((k) => hay.includes(k));
    });
  } else if (viewed.category) {
    related = related.filter((c) => c.category === viewed.category);
  }

  if (!related.length) return null;

  return {
    title: `Because you viewed ${viewed.title}`,
    courses: related.slice(0, 5),
  };
}

exports.getLearnerCourses = async (_req, res) => {
  try {
    const courses = await fetchActiveCourses();
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

exports.getLearnerCourseById = async (req, res) => {
  try {
    const course = await fetchCourseFullById(req.params.id, req.user);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
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
    const courses = await fetchActiveCourses();

    const profileTable =
      req.user.authProvider === "google" ? "google_users" : "users";
    const profileRows = await query(
      `SELECT bio FROM ${profileTable} WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const bio = profileRows[0]?.bio || "";

    let viewed = null;
    if (lastViewedCourseId) {
      viewed =
        courses.find((c) => String(c.id) === String(lastViewedCourseId)) ||
        (await fetchCourseFullById(lastViewedCourseId));
    }

    const recommendedTagged = filterByLabel(courses, "Recommended");
    const recommended =
      recommendedTagged.length > 0
        ? recommendedTagged.slice(0, 5)
        : pickRecommended(courses, bio);

    const becauseViewed = pickBecauseViewed(courses, viewed);

    const trendingTagged = filterByLabel(courses, "Trending");
    const trending =
      trendingTagged.length > 0
        ? trendingTagged.slice(0, 5)
        : [...courses]
            .sort((a, b) => (b.students || 0) - (a.students || 0))
            .slice(0, 5);

    const featuredTagged = filterByLabel(courses, "Popular");
    const featured =
      featuredTagged.length > 0
        ? featuredTagged.slice(0, 5)
        : sortByNewest(courses, 5);

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
