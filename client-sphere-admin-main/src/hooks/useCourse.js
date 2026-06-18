import { useCallback, useEffect, useState } from "react";
import { courseService } from "@/services/courseService";

export default function useCourse(id) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await courseService.getById(id);
      setCourse(res.data.course);
    } catch (err) {
      setCourse(null);
      setError(err.response?.data?.message || "Course not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const updateCourse = useCallback(
    async (payload) => {
      const res = await courseService.update(id, payload);
      setCourse(res.data.course);
      return res.data.course;
    },
    [id]
  );

  const removeCourse = useCallback(async () => {
    await courseService.delete(id);
  }, [id]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
    updateCourse,
    removeCourse,
    setCourse,
  };
}
