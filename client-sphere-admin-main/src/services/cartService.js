import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const cartService = {
  getMyCart: () =>
    axiosClient.get(ENDPOINTS.CART.BASE),

  addToCart: (courseId) =>
    axiosClient.post(
      ENDPOINTS.CART.BASE,
      { courseId }
    ),

  removeFromCart: (courseId) =>
    axiosClient.delete(
      ENDPOINTS.CART.byCourse(courseId)
    ),

  clearCart: () =>
    axiosClient.delete(
      `${ENDPOINTS.CART.BASE}/clear`
    ),
};

