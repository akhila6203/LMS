import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const homeVideoService = {
  getPublic: () => axiosClient.get(ENDPOINTS.HOME_VIDEO.PUBLIC),
  getAdmin: () => axiosClient.get(ENDPOINTS.HOME_VIDEO.BASE),

  create: (formData) =>
    axiosClient.post(ENDPOINTS.HOME_VIDEO.BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, formData) =>
    axiosClient.put(ENDPOINTS.HOME_VIDEO.byId(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => axiosClient.delete(ENDPOINTS.HOME_VIDEO.byId(id)),
};

export default homeVideoService;