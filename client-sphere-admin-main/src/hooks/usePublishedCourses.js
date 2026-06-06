import { useEffect, useState } from "react";
import { publicCourseService } from "@/services/publicCourseService";
import { mapPublicCourseForCard } from "@/utils/mapPublicCourse";
// import { setPublishedCoursesCache } from "@/utils/userStore";

export function usePublishedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await publicCourseService.getAll();
        const list = (res.data.courses || []).map(mapPublicCourseForCard);
        if (!cancelled) {
          setCourses(list);
          // setPublishedCoursesCache(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, loading, error };
}

export default usePublishedCourses;
