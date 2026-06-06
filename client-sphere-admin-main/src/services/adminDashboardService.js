import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const adminDashboardService = {
  getDashboard: (params = {}) =>
    axiosClient.get(ENDPOINTS.ADMIN.DASHBOARD, { params }),
};

export default adminDashboardService;
