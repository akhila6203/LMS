import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const orderService = {
  create: (formData) =>
    axiosClient.post(ENDPOINTS.ORDERS.BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getMy: () => axiosClient.get(ENDPOINTS.ORDERS.MY),

  getAdmin: (status) =>
    axiosClient.get(ENDPOINTS.ORDERS.ADMIN, { params: status ? { status } : {} }),

  verify: (id, action, adminNote) =>
    axiosClient.patch(ENDPOINTS.ORDERS.verify(id), { action, adminNote }),
};

export default orderService;
