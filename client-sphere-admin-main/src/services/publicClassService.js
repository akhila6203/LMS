import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const publicClassService = {
  getAll: () => axiosClient.get(ENDPOINTS.PUBLIC_CLASSES.BASE),

  getById: (id) => axiosClient.get(ENDPOINTS.PUBLIC_CLASSES.byId(id)),
};

export default publicClassService;
