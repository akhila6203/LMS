import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";
import { applyProfileToSession } from "@/utils/authSession";

export const userProfileService = {
  getProfile: () => axiosClient.get(ENDPOINTS.USER_PROFILE.ME),

  updateProfile: (payload) =>
    axiosClient.put(ENDPOINTS.USER_PROFILE.ME, payload),

  changePassword: (payload) =>
    axiosClient.put(ENDPOINTS.USER_PROFILE.PASSWORD, payload),
};

/** Load profile from database only. */
export async function fetchUserProfile() {
  const res = await userProfileService.getProfile();
  return res.data.profile;
}

/** Save to database; updates login session name/email on success. */
export async function saveUserProfile(payload) {
  const res = await userProfileService.updateProfile(payload);
  applyProfileToSession(res.data.profile);
  window.dispatchEvent(new Event("profileUpdated"));
  return res.data.profile;
}

export default userProfileService;
