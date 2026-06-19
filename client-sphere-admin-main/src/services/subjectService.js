import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const subjectService = {
  getAll: (classLevel = "") =>
    axiosClient.get(ENDPOINTS.SUBJECTS.BASE, {
      params: classLevel ? { classLevel } : undefined,
    }),
  getPublic: (classLevel = "") =>
    axiosClient.get(ENDPOINTS.SUBJECTS.PUBLIC, {
      params: classLevel ? { classLevel } : undefined,
    }),
  getUserSubjects: () => axiosClient.get(ENDPOINTS.USER.SUBJECTS),
  create: (name, classLevel) =>
    axiosClient.post(ENDPOINTS.SUBJECTS.BASE, { name, classLevel }),
  update: (id, name) =>
    axiosClient.put(ENDPOINTS.SUBJECTS.byId(id), { name }),
  remove: (id) => axiosClient.delete(ENDPOINTS.SUBJECTS.byId(id)),
};

export default subjectService;
