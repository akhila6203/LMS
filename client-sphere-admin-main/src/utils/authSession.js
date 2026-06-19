/** In-memory session mirror — synced by AuthContext (no browser storage). */
let currentUser = null;

const normalizeUser = (user) => {
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role,
    status: user.status,
    avatar: user.avatar || null,
    bio: user.bio || "",
    google_login: !!user.google_login,
    authProvider: user.authProvider || (user.google_login ? "google" : "password"),
    classLevel: user.classLevel || user.class_level || "",
    school: user.school || "",
  };
};

export function syncSessionUser(user) {
  currentUser = normalizeUser(user);
}

export function getSessionUser() {
  return currentUser;
}

export function applyProfileToSession(profile) {
  if (!profile) return;
  const current = currentUser || {};
  syncSessionUser({
    id: profile.id ?? current.id,
    name: profile.name ?? current.name,
    email: profile.email ?? current.email,
    role: profile.role ?? current.role,
    status: profile.status ?? current.status,
    avatar: profile.avatar ?? current.avatar ?? null,
    bio: profile.bio ?? current.bio ?? "",
    google_login: profile.google_login ?? current.google_login,
    authProvider: profile.authProvider ?? current.authProvider,
    classLevel: profile.classLevel ?? profile.class_level ?? current.classLevel ?? "",
    school: profile.school ?? current.school ?? "",
  });
}

export function clearAuthSession() {
  currentUser = null;
}

/** @deprecated JWT is stored in HttpOnly cookie — not accessible from JavaScript */
export function getAuthToken() {
  return null;
}

/** @deprecated Use AuthContext login instead */
export function setAuthToken() {}

/** @deprecated Use AuthContext login instead */
export function setSessionUser(user) {
  syncSessionUser(user);
}

export { normalizeUser };
