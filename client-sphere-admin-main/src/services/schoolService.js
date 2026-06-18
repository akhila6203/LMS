import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const schoolService = {
  getAll: () => axiosClient.get(ENDPOINTS.SCHOOLS.BASE),
  create: (name) => axiosClient.post(ENDPOINTS.SCHOOLS.BASE, { name }),
};

export default schoolService;
