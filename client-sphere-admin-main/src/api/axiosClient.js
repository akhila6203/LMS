import axios from "axios";
import { API_BASE_URL } from "./api";

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      if (!requestUrl.includes("/auth/me")) {
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
