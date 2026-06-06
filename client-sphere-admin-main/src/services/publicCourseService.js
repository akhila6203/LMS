import axios from "axios";
import { API_BASE_URL } from "@/api/api";
import ENDPOINTS from "@/api/endpoints";

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const publicCourseService = {
  getAll: () => publicClient.get(ENDPOINTS.PUBLIC_COURSES.BASE),

  getById: (id) => publicClient.get(ENDPOINTS.PUBLIC_COURSES.byId(id)),
};

export default publicCourseService;
