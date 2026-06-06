import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const courseService = {
  getAll: () => axiosClient.get(ENDPOINTS.COURSES.BASE),

  getById: (id) => axiosClient.get(ENDPOINTS.COURSES.byId(id)),

  create: (data) => axiosClient.post(ENDPOINTS.COURSES.BASE, data),

  update: (id, data) => axiosClient.put(ENDPOINTS.COURSES.byId(id), data),

  delete: (id) => axiosClient.delete(ENDPOINTS.COURSES.byId(id)),
};

export default courseService;
