import { normalizeCourseLabels, parseCourseLabels } from "@/lib/courseLabels";

/** Strip File blobs; keep only fields the API persists */
export function buildCoursePayload(course) {
  const videos = (course.videos || [])
    .filter((v) => v?.title?.trim())
    .map((v) => ({
      title: v.title.trim(),
      url: v.url || "",
      duration: v.duration || "",
      uploadedAt: v.uploadedAt || new Date().toISOString(),
    }));

  const materials = (course.materials || [])
    .filter((m) => m?.title?.trim())
    .map((m) => ({
      title: m.title.trim(),
      type: m.type || "PDF",
      url: m.url || "",
      uploadedAt: m.uploadedAt || new Date().toISOString(),
    }));

  const quizzes = (course.quizzes || []).length
    ? course.quizzes
    : course.questions?.length
      ? [
          {
            quizTitle: course.quizTitle || "Course Quiz",
            questions: course.questions,
          },
        ]
      : [];

  const labels = normalizeCourseLabels(
    course.labels?.length ? course.labels : parseCourseLabels(course)
  );

  return {
    title: course.title,
    category: course.category,
    subCategory: course.subCategory,
    subject: course.subject,
    classLevel: course.classLevel,
    instructor: course.instructor,
    level: course.level,
    labels,
    description: course.description,
    status: course.status || "Draft",
    students: course.students || 0,
    price: Number(course.price) || 0,
    discountPercent: Number(course.discountPercent ?? course.discount_percent) || 0,
    thumbnail: course.thumbnail || null,
    videos,
    materials,
    quizzes,
    overview: course.overview || [],
  };
}

export default buildCoursePayload;
