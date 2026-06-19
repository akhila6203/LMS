import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const vocabularyService = {
  lookup: (text) =>
    axiosClient.get(ENDPOINTS.VOCABULARY.LOOKUP, { params: { text, word: text } }),
};

export default vocabularyService;
