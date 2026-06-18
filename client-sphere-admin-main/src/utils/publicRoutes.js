/** Paths that are only for guests — logged-in learners are redirected to the user area. */
const PUBLIC_ONLY_PATHS = ["/", "/homecourses", "/about"];

export function isPublicOnlyPath(path) {
  const base = String(path || "").split("?")[0];
  return PUBLIC_ONLY_PATHS.includes(base);
}

export function isLearnerSession(user) {
  return user?.role === "user";
}
