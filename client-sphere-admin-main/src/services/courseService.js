import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const classService = {
  getAll: () => axiosClient.get(ENDPOINTS.CLASSES.BASE),

  getById: (id) => axiosClient.get(ENDPOINTS.CLASSES.byId(id)),

  create: (data) => axiosClient.post(ENDPOINTS.CLASSES.BASE, data),

  update: (id, data) => axiosClient.put(ENDPOINTS.CLASSES.byId(id), data),

  delete: (id) => axiosClient.delete(ENDPOINTS.CLASSES.byId(id)),
};

/** @deprecated use classService */
export const courseService = classService;

export default classService;
