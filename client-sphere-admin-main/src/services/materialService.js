import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const materialService = {
  getAll: () => axiosClient.get(ENDPOINTS.MATERIALS.BASE),

  create: (payload) => axiosClient.post(ENDPOINTS.MATERIALS.BASE, payload),

  delete: (sourceType, id) =>
    axiosClient.delete(ENDPOINTS.MATERIALS.byId(sourceType, id)),
};

export default materialService;
