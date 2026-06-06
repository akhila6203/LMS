import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";
import { applyProfileToSession } from "@/utils/authSession";

export const adminProfileService = {
  getProfile: () => axiosClient.get(ENDPOINTS.ADMIN_PROFILE.ME),

  updateProfile: (payload) =>
    axiosClient.put(ENDPOINTS.ADMIN_PROFILE.ME, payload),

  changePassword: (payload) =>
    axiosClient.put(ENDPOINTS.ADMIN_PROFILE.PASSWORD, payload),
};

export async function fetchAdminProfile() {
  const res = await adminProfileService.getProfile();
  return res.data.profile;
}

export async function saveAdminProfile(payload) {
  const res = await adminProfileService.updateProfile(payload);
  applyProfileToSession(res.data.profile);
  window.dispatchEvent(new Event("profileUpdated"));
  return res.data.profile;
}

export default adminProfileService;
