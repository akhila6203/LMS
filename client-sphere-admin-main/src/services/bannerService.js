import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const bannerService = {
  getPublic: () => axiosClient.get(ENDPOINTS.BANNERS.PUBLIC),
  getAdmin: () => axiosClient.get(ENDPOINTS.BANNERS.BASE),
  create: (formData) =>
    axiosClient.post(ENDPOINTS.BANNERS.BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => axiosClient.delete(ENDPOINTS.BANNERS.byId(id)),
};

export default bannerService;