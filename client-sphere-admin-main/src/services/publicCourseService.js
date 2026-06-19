import axios from "axios";
import { API_BASE_URL } from "@/api/api";
import ENDPOINTS from "@/api/endpoints";

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const publicClassService = {
  getAll: () => publicClient.get(ENDPOINTS.PUBLIC_CLASSES.BASE),

  getById: (id) => publicClient.get(ENDPOINTS.PUBLIC_CLASSES.byId(id)),
};

/** @deprecated use publicClassService */
export const publicCourseService = publicClassService;

export default publicClassService;
