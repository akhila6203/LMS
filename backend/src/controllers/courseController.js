const { query } = require("../utils/dbQuery");
const {
  STUDENT_COUNT_SQL,
  resolveClassLevel,
  resolveSubject,
  mapCourseRow,
} = require("../utils/courseMapper");
const {
  mapVideoForAccess,
  PREVIEW_LESSON_COUNT,
} = require("../utils/enrollmentHelpers");

const mapVideoRow = (row) => ({
  id: row.id,
  title: row.title,
  url: row.url,
  duration: row.duration || "",
  uploadedAt: row.uploaded_at,
});

const mapQuizQuestionRow = (q) => {
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

const serializeQuizQuestion = (q) => {
  const type = q.type || "radio";
  let correctIndex = Number(q.correct) || 0;
  let correctAnswers = null;
  let options = q.options || [];

  if (type === "checkbox") {
    correctAnswers = Array.isArray(q.correctIndices) ? q.correctIndices : [];
    correctIndex = correctAnswers[0] || 0;
  } else if (type === "fill_blank") {
    const answer = String(q.blankAnswer || "").trim();
    correctAnswers = answer ? [answer] : [];
    options = [];
    correctIndex = 0;
  }

  return {
    question: (q.q || "").trim(),
    questionType: type,
    options,
    correctIndex,
    correctAnswers: correctAnswers ? JSON.stringify(correctAnswers) : null,
  };
};

async function fetchCourseFullById(id) {
  const courseRows = await query(
    `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count FROM courses c WHERE c.id = ?`,
    [id]
  );
  if (!courseRows.length) return null;

  const videos = await query(
    `SELECT id, title, url, duration, uploaded_at
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
      questions: questions.map(mapQuizQuestionRow),
      attempts: 0,
      passRate: 0,
    });
  }

  return {
    ...mapCourseRow(courseRows[0]),
    videos: videos.map(mapVideoRow),
    materials: materials.map((m) => ({
      title: m.title,
      type: m.type,
      url: m.url,
      uploadedAt: m.uploaded_at,
    })),
    quizzes,
  };
}

exports.getCourses = async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.*,
        ${STUDENT_COUNT_SQL} AS student_count,
        (SELECT COUNT(*) FROM course_videos v WHERE v.course_id = c.id) AS video_count
       FROM courses c
       ORDER BY c.id DESC`
    );

    const courses = rows.map((row) => ({
      ...mapCourseRow(row),
      videos: Array(Number(row.video_count) || 0).fill({}),
    }));

    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await fetchCourseFullById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      course,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

/** Public catalog — published (Active) courses only, no auth */
exports.getPublicCourses = async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.*,
        ${STUDENT_COUNT_SQL} AS student_count,
        (SELECT COUNT(*) FROM course_videos v WHERE v.course_id = c.id) AS video_count
       FROM courses c
       WHERE c.status = 'Active'
       ORDER BY c.id DESC`
    );

    const courses = rows.map((row) => {
      const videoCount = Number(row.video_count) || 0;
      return {
        ...mapCourseRow(row),
        lessonCount: videoCount,
        lessons: videoCount,
        topics: videoCount,
        topicCount: videoCount,
      };
    });

    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch published courses" });
  }
};

/** Public course preview — videos only; no materials or quizzes */
exports.getPublicCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseRows = await query(
      `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
       FROM courses c
       WHERE c.id = ? AND c.status = 'Active'
       LIMIT 1`,
      [id]
    );
    if (!courseRows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    const videos = await query(
      `SELECT title, url, duration, uploaded_at
       FROM course_videos WHERE course_id = ? ORDER BY sort_order`,
      [id]
    );

    const course = {
      ...mapCourseRow(courseRows[0]),
      videos: videos.map((v, i) => mapVideoForAccess(v, i, false)),
      previewLessonCount: PREVIEW_LESSON_COUNT,
      lessonCount: videos.length,
      lessons: videos.length,
      topics: videos.length,
      topicCount: videos.length,
    };

    res.json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

exports.createCourse = async (req, res) => {
  const {
    title,
    instructor,
    description,
    status,
    thumbnail,
    videos = [],
    materials = [],
    quizzes = [],
    quizTitle,
    questions = [],
    overview = [],
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Course title is required" });
  }

  const classLevel = resolveClassLevel(req.body);
  const subject = resolveSubject(req.body);

  if (!classLevel) {
    return res.status(400).json({ message: "Class is required" });
  }
  if (!subject) {
    return res.status(400).json({ message: "Subject is required" });
  }

  const adminId = req.user?.id || null;

  try {
    const courseResult = await query(
      `INSERT INTO courses
        (title, class_level, subject, instructor, description, status, thumbnail, overview, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        classLevel,
        subject,
        instructor || "",
        description || "",
        status || "Draft",
        thumbnail || null,
        JSON.stringify(overview || []),
        adminId,
      ]
    );

    const courseId = courseResult.insertId;

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (!v?.title?.trim()) continue;

      const uploadedAt = v.uploadedAt
        ? new Date(v.uploadedAt)
        : new Date();

      await query(
        `INSERT INTO course_videos (course_id, title, url, duration, sort_order, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          v.title.trim(),
          v.url || "",
          v.duration || "",
          i,
          uploadedAt,
        ]
      );
    }

    for (let i = 0; i < materials.length; i++) {
      const m = materials[i];
      if (!m?.title?.trim()) continue;

      const uploadedAt = m.uploadedAt
        ? new Date(m.uploadedAt)
        : new Date();

      await query(
        `INSERT INTO course_materials (course_id, title, type, url, sort_order, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          m.title.trim(),
          m.type || "PDF",
          m.url || "",
          i,
          uploadedAt,
        ]
      );
    }

    const quizList =
      quizzes?.length > 0
        ? quizzes
        : questions?.length
          ? [{ quizTitle: quizTitle || "Course Quiz", questions }]
          : [];

    for (const quiz of quizList) {
      if (!quiz?.questions?.length) continue;

      const quizResult = await query(
        `INSERT INTO course_quizzes (course_id, quiz_title) VALUES (?, ?)`,
        [courseId, quiz.quizTitle || quizTitle || "Course Quiz"]
      );

      const quizId = quizResult.insertId;

      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        const serialized = serializeQuizQuestion(q);
        if (!serialized.question) continue;
        await query(
          `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_index, correct_answers, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            quizId,
            serialized.question,
            serialized.questionType,
            JSON.stringify(serialized.options),
            serialized.correctIndex,
            serialized.correctAnswers,
            i,
          ]
        );
      }
    }

    const created = await query(
      `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count FROM courses c WHERE c.id = ?`,
      [courseId]
    );

    res.status(201).json({
      message: "Course created successfully",
      course: mapCourseRow(created[0]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create course",
      error: err.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM courses WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete course" });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    instructor,
    description,
    status,
    thumbnail,
    videos = [],
    materials = [],
    quizzes = [],
    quizTitle,
    questions = [],
    overview = [],
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Course title is required" });
  }

  const classLevel = resolveClassLevel(req.body);
  const subject = resolveSubject(req.body);

  if (!classLevel) {
    return res.status(400).json({ message: "Class is required" });
  }
  if (!subject) {
    return res.status(400).json({ message: "Subject is required" });
  }

  try {
    const existing = await query("SELECT id FROM courses WHERE id = ? LIMIT 1", [
      id,
    ]);
    if (!existing.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    await query(
      `UPDATE courses
       SET title = ?, class_level = ?, subject = ?,
           instructor = ?, description = ?, status = ?,
           thumbnail = ?, overview = ?
       WHERE id = ?`,
      [
        title.trim(),
        classLevel,
        subject,
        instructor || "",
        description || "",
        status || "Draft",
        thumbnail || null,
        JSON.stringify(overview || []),
        id,
      ]
    );

    // Replace child rows (simple & reliable for LMS admin UI)
    await query("DELETE FROM course_videos WHERE course_id = ?", [id]);
    await query("DELETE FROM course_materials WHERE course_id = ?", [id]);

    const quizIds = await query(
      "SELECT id FROM course_quizzes WHERE course_id = ?",
      [id]
    );
    if (quizIds.length) {
      await query(
        `DELETE FROM quiz_questions WHERE quiz_id IN (${quizIds
          .map((q) => q.id)
          .join(",")})`
      );
    }
    await query("DELETE FROM course_quizzes WHERE course_id = ?", [id]);

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (!v?.title?.trim()) continue;
      const uploadedAt = v.uploadedAt ? new Date(v.uploadedAt) : new Date();
      await query(
        `INSERT INTO course_videos (course_id, title, url, duration, sort_order, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, v.title.trim(), v.url || "", v.duration || "", i, uploadedAt]
      );
    }

    for (let i = 0; i < materials.length; i++) {
      const m = materials[i];
      if (!m?.title?.trim()) continue;
      const uploadedAt = m.uploadedAt ? new Date(m.uploadedAt) : new Date();
      await query(
        `INSERT INTO course_materials (course_id, title, type, url, sort_order, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, m.title.trim(), m.type || "PDF", m.url || "", i, uploadedAt]
      );
    }

    const quizList =
      quizzes?.length > 0
        ? quizzes
        : questions?.length
          ? [{ quizTitle: quizTitle || "Course Quiz", questions }]
          : [];

    for (const quiz of quizList) {
      if (!quiz?.questions?.length) continue;

      const quizResult = await query(
        `INSERT INTO course_quizzes (course_id, quiz_title) VALUES (?, ?)`,
        [id, quiz.quizTitle || quizTitle || "Course Quiz"]
      );
      const newQuizId = quizResult.insertId;

      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        const serialized = serializeQuizQuestion(q);
        if (!serialized.question) continue;
        await query(
          `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_index, correct_answers, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newQuizId,
            serialized.question,
            serialized.questionType,
            JSON.stringify(serialized.options),
            serialized.correctIndex,
            serialized.correctAnswers,
            i,
          ]
        );
      }
    }

    const updated = await fetchCourseFullById(id);

    res.json({
      message: "Course updated",
      course: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update course" });
  }
};
