import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const studentService = {
  getAll: ({ page = 1, limit = 20, search = "" } = {}) =>
    axiosClient.get(ENDPOINTS.STUDENTS.BASE, {
      params: { page, limit, search: search.trim() || undefined },
    }),

  create: (payload) => axiosClient.post(ENDPOINTS.STUDENTS.BASE, payload),

  bulkImport: (students) =>
    axiosClient.post(ENDPOINTS.STUDENTS.BULK_IMPORT, { students }),

  invite: (invites, message) =>
    axiosClient.post(ENDPOINTS.STUDENTS.INVITE, { invites, message }),
};

export default studentService;
