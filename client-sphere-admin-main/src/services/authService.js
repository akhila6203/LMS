import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

let bootstrapMePromise = null;

function fetchMe() {
  return axiosClient.get(ENDPOINTS.AUTH.ME);
}

export const authService = {
  /** Single in-flight bootstrap request — avoids duplicate /auth/me on load */
  getMe: () => {
    if (!bootstrapMePromise) {
      bootstrapMePromise = fetchMe().finally(() => {
        bootstrapMePromise = null;
      });
    }
    return bootstrapMePromise;
  },

  invalidateMe: () => {
    bootstrapMePromise = null;
  },

  logout: () => axiosClient.post(ENDPOINTS.AUTH.LOGOUT),

  adminLogin: (credentials) =>
    axiosClient.post(ENDPOINTS.AUTH.ADMIN_LOGIN, credentials),

  adminRegister: (payload) =>
    axiosClient.post(ENDPOINTS.AUTH.ADMIN_REGISTER, payload),

  googleLogin: (payload) =>
    axiosClient.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, payload),
};

export default authService;
