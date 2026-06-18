import { useCallback, useEffect, useState } from "react";
import { courseService } from "@/services/courseService";

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await courseService.getAll();
      setCourses(res.data.courses || []);
    } catch (err) {
      setCourses([]);
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const deleteCourse = useCallback(async (courseId) => {
    await courseService.delete(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    deleteCourse,
    setCourses,
  };
}
