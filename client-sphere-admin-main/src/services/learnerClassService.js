import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const learnerClassService = {
  getAll: () => axiosClient.get(ENDPOINTS.LEARNER.CLASSES),

  getById: (id) => axiosClient.get(ENDPOINTS.LEARNER.classById(id)),

  getDashboard: () => axiosClient.get(ENDPOINTS.LEARNER.DASHBOARD),
};

export default learnerClassService;
