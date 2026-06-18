import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const vocabularyService = {
  lookup: (word) =>
    axiosClient.get(ENDPOINTS.VOCABULARY.LOOKUP, { params: { word } }),
};

export default vocabularyService;
