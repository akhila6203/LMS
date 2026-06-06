/** Login session only — profile fields (bio, avatar) come from the API, not localStorage. */
const SESSION_KEY = "user";

const LEGACY_KEYS = ["user_profile", "admin", "admin_profile", "admin_details", "user_details"];

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user) {
  if (!user?.id) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      status: user.status,
      avatar: user.avatar || null,
      bio: user.bio || "",
      google_login: !!user.google_login,
      authProvider: user.authProvider || (user.google_login ? "google" : "password"),
    })
  );
}

export function applyProfileToSession(profile) {
  if (!profile) return;
  const current = getSessionUser() || {};
  setSessionUser({
    id: profile.id ?? current.id,
    name: profile.name ?? current.name,
    email: profile.email ?? current.email,
    role: profile.role ?? current.role,
    status: profile.status ?? current.status,
    avatar: profile.avatar ?? current.avatar ?? null,
    bio: profile.bio ?? current.bio ?? "",
    google_login: profile.google_login ?? current.google_login,
    authProvider: profile.authProvider ?? current.authProvider,
  });
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem(SESSION_KEY);
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
}
