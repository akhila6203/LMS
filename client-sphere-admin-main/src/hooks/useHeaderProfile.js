import { useState, useEffect, useCallback } from "react";
import { getSessionUser } from "@/utils/authSession";
import { fetchAdminProfile } from "@/services/adminProfileService";
import { fetchUserProfile } from "@/services/userProfileService";

/** Header avatar/name/email from database (not localStorage cache). */
export function useHeaderProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const session = getSessionUser();
    if (!session?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data =
        session.role === "admin"
          ? await fetchAdminProfile()
          : await fetchUserProfile();
      setProfile(data);
    } catch {
      setProfile({
        name: session.name || "",
        email: session.email || "",
        avatar: null,
        bio: "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("profileUpdated", load);
    return () => window.removeEventListener("profileUpdated", load);
  }, [load]);

  const session = getSessionUser();

  return {
    loading,
    profile,
    name: profile?.name || session?.name || "User",
    email: profile?.email || session?.email || "",
    avatar: profile?.avatar || null,
  };
}
