/** Keep only courses that have at least one lesson/video */
export function filterCoursesWithLessons(courses = []) {
  return courses.filter((c) => {
    const count =
      Number(c.lessonCount) ||
      Number(c.lessons) ||
      Number(c.topics) ||
      Number(c.topicCount) ||
      (Array.isArray(c.videos) ? c.videos.length : 0);
    return count > 0;
  });
}
