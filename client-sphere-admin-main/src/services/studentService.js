import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const studentService = {
  getAll: ({ page = 1, limit = 20, search = "", classLevel = "", school = "" } = {}) =>
    axiosClient.get(ENDPOINTS.STUDENTS.BASE, {
      params: {
        page,
        limit,
        search: search.trim() || undefined,
        classLevel: classLevel || undefined,
        school: school || undefined,
      },
    }),

  create: (payload) => axiosClient.post(ENDPOINTS.STUDENTS.BASE, payload),

  bulkImport: (students) =>
    axiosClient.post(ENDPOINTS.STUDENTS.BULK_IMPORT, {
      students,
    }),

  invite: (invites, message, classLevel, school) =>
    axiosClient.post(ENDPOINTS.STUDENTS.INVITE, {
      invites,
      message,
      classLevel,
      school,
    }),

  update: (id, payload) => axiosClient.put(ENDPOINTS.STUDENTS.byId(id), payload),

  remove: (id) => axiosClient.delete(ENDPOINTS.STUDENTS.byId(id)),
};

export default studentService;
