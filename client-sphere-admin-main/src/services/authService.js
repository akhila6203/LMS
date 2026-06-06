import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const authService = {
  adminLogin: (credentials) =>
    axiosClient.post(ENDPOINTS.AUTH.ADMIN_LOGIN, credentials),

  adminRegister: (payload) =>
    axiosClient.post(ENDPOINTS.AUTH.ADMIN_REGISTER, payload),

  /** Legacy — disabled on API; learners use googleLogin */
  // userLogin: (credentials) =>
  //   axiosClient.post(ENDPOINTS.AUTH.LOGIN, credentials),

  googleLogin: (payload) =>
    axiosClient.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, payload),
};

export default authService;
