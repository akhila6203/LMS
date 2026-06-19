import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const searchService = {
  search: (q) =>
    axiosClient.get(ENDPOINTS.SEARCH, {
      params: { q: String(q || "").trim() },
    }),
};

export default searchService;
