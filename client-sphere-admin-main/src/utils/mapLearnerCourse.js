import {
  mapPublicCourseForCard,
  sumVideoHours,
} from "@/utils/mapPublicCourse";

export function mapLearnerCourseDetail(course) {
  const enrolled = Boolean(course.enrolled);
  const videos = (course.videos || []).map((v, i) => ({
    id: `v${i + 1}`,
    title: v.title || `Lesson ${i + 1}`,
    duration: v.duration || "",
    url: v.url || "",
    done: false,
    free: v.free ?? enrolled,
    locked: v.locked ?? (!enrolled && !v.url),
  }));

  const materials = (course.materials || []).map((m) => ({
    title: m.title,
    type: m.type || "PDF",
    url: m.url || "",
    locked: m.locked ?? !enrolled,
  }));

  const quizzes = (course.quizzes || []).map((qz) => ({
    quizTitle: qz.quizTitle || "Quiz",
    questions: (qz.questions || []).map((q, qi) => ({
      id: `q-${qi + 1}`,
      type: q.type || "radio",
      question: q.question || q.q || "Question",
      options:
        typeof q.options === "string" ? JSON.parse(q.options) : q.options || [],
      correctIndex:
        typeof q.correctIndex === "number"
          ? q.correctIndex
          : Number(q.correct) || 0,
      correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
      blankAnswer: q.blankAnswer || "",
    })),
  }));

  const lessonCount = videos.length;
  const hours = sumVideoHours(course.videos) || Math.max(1, lessonCount);

  return {
    ...mapPublicCourseForCard(course),
    enrolled,
    videos,
    materials,
    quizzes: quizzes.map((q) => ({ ...q, locked: q.locked ?? !enrolled })),
    lessons: lessonCount,
    hours,
  };
}
