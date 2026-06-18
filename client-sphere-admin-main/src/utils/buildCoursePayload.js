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

  const classLevel = (course.classLevel || course.category || "").trim();
  const subject = (course.subject || course.subCategory || course.sub_category || "").trim();

  return {
    title: course.title,
    classLevel,
    subject,
    instructor: course.instructor,
    description: course.description,
    status: course.status || "Draft",
    thumbnail: course.thumbnail || null,
    videos,
    materials,
    quizzes,
    overview: course.overview || [],
  };
}

export default buildCoursePayload;
