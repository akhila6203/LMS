import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const uploadService = {
  video: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(ENDPOINTS.UPLOAD.VIDEO, formData, {
      headers: multipartHeaders,
    });
  },

  material: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(ENDPOINTS.UPLOAD.MATERIAL, formData, {
      headers: multipartHeaders,
    });
  },
};

export default uploadService;
