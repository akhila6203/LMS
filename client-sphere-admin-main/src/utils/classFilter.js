import { getSessionUser } from "@/utils/authSession";

/** After login, learners only see courses for their assigned class. */
export function filterCoursesByStudentClass(courses = [], user = null) {
  const sessionUser = user || getSessionUser();
  const classLevel = String(sessionUser?.classLevel || "").trim();

  if (!sessionUser || sessionUser.role === "admin" || !classLevel) {
    return courses;
  }

  return courses.filter(
    (c) => (c.category || c.classLevel || "").trim() === classLevel
  );
}

export function getStudentClassLevel(user = null) {
  const sessionUser = user || getSessionUser();
  return String(sessionUser?.classLevel || "").trim();
}
