/** Login session — stored in localStorage so same browser tabs share login. */
const SESSION_KEY = "user";
const TOKEN_KEY = "token";

const LEGACY_KEYS = [
  "user_profile",
  "admin",
  "admin_profile",
  "admin_details",
  "user_details",
  "course_draft",
  "courses",
];

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
// function readStorage(key) {
//   try {
//     return sessionStorage.getItem(key);
//   } catch {
//     return null;
//   }
// }

// function writeStorage(key, value) {
//   try {
//     if (value == null) sessionStorage.removeItem(key);
//     else sessionStorage.setItem(key, value);
//   } catch {
//     /* ignore quota / private mode */
//   }
// }

// function removeStorage(key) {
//   try {
//     sessionStorage.removeItem(key);
//   } catch {
//     /* ignore */
//   }
// }

/** Drop auth persisted in localStorage from older builds (tab reopen should require login). */
// function clearLegacyLocalAuth() {
//   localStorage.removeItem(TOKEN_KEY);
//   localStorage.removeItem(SESSION_KEY);
// }

// clearLegacyLocalAuth();

export function getAuthToken() {
  return readStorage(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) writeStorage(TOKEN_KEY, token);
  else removeStorage(TOKEN_KEY);
}

export function getSessionUser() {
  try {
    const raw = readStorage(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user) {
  if (!user?.id) {
    removeStorage(SESSION_KEY);
    return;
  }

  writeStorage(
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
      classLevel: user.classLevel || user.class_level || "",
      school: user.school || "",
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
    classLevel: profile.classLevel ?? profile.class_level ?? current.classLevel ?? "",
    school: profile.school ?? current.school ?? "",
  });
}

export function clearAuthSession() {
  removeStorage(TOKEN_KEY);
  removeStorage(SESSION_KEY);
  clearLegacyLocalAuth();
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
}



// /** Login session only — stored in sessionStorage so closing the tab ends the session. */
// const SESSION_KEY = "user";
// const TOKEN_KEY = "token";

// const LEGACY_KEYS = [
//   "user_profile",
//   "admin",
//   "admin_profile",
//   "admin_details",
//   "user_details",
//   "course_draft",
//   "courses",
// ];

// function readStorage(key) {
//   try {
//     return sessionStorage.getItem(key);
//   } catch {
//     return null;
//   }
// }

// function writeStorage(key, value) {
//   try {
//     if (value == null) sessionStorage.removeItem(key);
//     else sessionStorage.setItem(key, value);
//   } catch {
//     /* ignore quota / private mode */
//   }
// }

// function removeStorage(key) {
//   try {
//     sessionStorage.removeItem(key);
//   } catch {
//     /* ignore */
//   }
// }

// /** Drop auth persisted in localStorage from older builds (tab reopen should require login). */
// function clearLegacyLocalAuth() {
//   localStorage.removeItem(TOKEN_KEY);
//   localStorage.removeItem(SESSION_KEY);
// }

// clearLegacyLocalAuth();

// export function getAuthToken() {
//   return readStorage(TOKEN_KEY);
// }

// export function setAuthToken(token) {
//   if (token) writeStorage(TOKEN_KEY, token);
//   else removeStorage(TOKEN_KEY);
// }

// export function getSessionUser() {
//   try {
//     const raw = readStorage(SESSION_KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// export function setSessionUser(user) {
//   if (!user?.id) {
//     removeStorage(SESSION_KEY);
//     return;
//   }

//   writeStorage(
//     SESSION_KEY,
//     JSON.stringify({
//       id: user.id,
//       name: user.name || "",
//       email: user.email || "",
//       role: user.role,
//       status: user.status,
//       avatar: user.avatar || null,
//       bio: user.bio || "",
//       google_login: !!user.google_login,
//       authProvider: user.authProvider || (user.google_login ? "google" : "password"),
//       classLevel: user.classLevel || user.class_level || "",
//       school: user.school || "",
//     })
//   );
// }

// export function applyProfileToSession(profile) {
//   if (!profile) return;
//   const current = getSessionUser() || {};
//   setSessionUser({
//     id: profile.id ?? current.id,
//     name: profile.name ?? current.name,
//     email: profile.email ?? current.email,
//     role: profile.role ?? current.role,
//     status: profile.status ?? current.status,
//     avatar: profile.avatar ?? current.avatar ?? null,
//     bio: profile.bio ?? current.bio ?? "",
//     google_login: profile.google_login ?? current.google_login,
//     authProvider: profile.authProvider ?? current.authProvider,
//     classLevel: profile.classLevel ?? profile.class_level ?? current.classLevel ?? "",
//     school: profile.school ?? current.school ?? "",
//   });
// }

// export function clearAuthSession() {
//   removeStorage(TOKEN_KEY);
//   removeStorage(SESSION_KEY);
//   clearLegacyLocalAuth();
//   LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
// }
