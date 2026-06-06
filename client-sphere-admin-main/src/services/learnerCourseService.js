import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const learnerCourseService = {
  getAll: () => axiosClient.get(ENDPOINTS.LEARNER.COURSES),

  getById: (id) => axiosClient.get(ENDPOINTS.LEARNER.courseById(id)),

  getDashboard: (params = {}) =>
    axiosClient.get(ENDPOINTS.LEARNER.DASHBOARD, { params }),
};

export default learnerCourseService;
