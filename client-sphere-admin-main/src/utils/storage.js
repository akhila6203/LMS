export const getCourses = () => {
  return JSON.parse(localStorage.getItem("courses")) || [];
};

export const saveCourse = (course) => {
  const prev = getCourses();
  localStorage.setItem("courses", JSON.stringify([course, ...prev]));
};

export const updateCourse = (updatedCourse) => {
  const courses = getCourses().map((c) =>
    c.id === updatedCourse.id ? updatedCourse : c
  );
  localStorage.setItem("courses", JSON.stringify(courses));
};

export const deleteCourse = (id) => {
  const courses = getCourses().filter((c) => c.id !== id);
  localStorage.setItem("courses", JSON.stringify(courses));
};


