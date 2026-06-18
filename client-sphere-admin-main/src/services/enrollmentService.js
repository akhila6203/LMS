import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const enrollmentService = {
  getMyCourses: () => axiosClient.get(ENDPOINTS.ENROLLMENTS.MY_COURSES),

  getRecommended: () => axiosClient.get(ENDPOINTS.ENROLLMENTS.RECOMMENDED),

  saveProgress: (courseId, lessonKey, lessonType = "video") =>
    axiosClient.post(ENDPOINTS.ENROLLMENTS.progress(courseId), {
      lessonKey,
      lessonType,
    }),

  completeQuiz: (courseId, { score, total } = {}) =>
    axiosClient.post(ENDPOINTS.ENROLLMENTS.quizComplete(courseId), {
      score,
      total,
    }),

  remove: (courseId) => axiosClient.delete(ENDPOINTS.ENROLLMENTS.byCourse(courseId)),
};

export default enrollmentService;
