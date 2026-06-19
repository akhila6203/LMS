import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const enrollmentService = {
  getMyClasses: () => axiosClient.get(ENDPOINTS.ENROLLMENTS.MY_CLASSES),

  getRecommended: () => axiosClient.get(ENDPOINTS.ENROLLMENTS.RECOMMENDED),

  saveProgress: (classId, lessonKey, lessonType = "video") =>
    axiosClient.post(ENDPOINTS.ENROLLMENTS.progress(classId), {
      lessonKey,
      lessonType,
    }),

  completeQuiz: (classId, { score, total, quizId } = {}) =>
    axiosClient.post(ENDPOINTS.ENROLLMENTS.quizComplete(classId), {
      score,
      total,
      quizId,
    }),

  remove: (classId) => axiosClient.delete(ENDPOINTS.ENROLLMENTS.byClass(classId)),
};

/** @deprecated use getMyClasses */
export const getMyCourses = enrollmentService.getMyClasses;

export default enrollmentService;
