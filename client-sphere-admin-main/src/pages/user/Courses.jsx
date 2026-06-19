import { useMemo, useState } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { Navigate, useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { CourseGridWithMore } from "@/components/CourseGridWithMore";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { filterCoursesByStudentClass } from "@/utils/classFilter";
import { filterCoursesWithLessons } from "@/utils/courseFilters";
import { getSessionUser } from "@/utils/authSession";
import { formatClassDisplay } from "@/utils/classDisplay";
import { mapPublicCourseForCard } from "@/utils/mapPublicCourse";

function AppCoursesPage() {
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const activeSubject = searchParams.get("subject") || "";

  const { courses, loading, error } = usePublishedCourses();
  const sessionUser = getSessionUser();
  const catalogCourses = useMemo(
    () =>
      filterCoursesWithLessons(
        filterCoursesByStudentClass(courses, sessionUser)
      ).map((c) => mapPublicCourseForCard(c)),
    [courses, sessionUser]
  );

  const list = useMemo(() => {
    if (!activeSubject) return [];

    let out = catalogCourses.filter(
      (c) => (c.subCategory || c.subject) === activeSubject
    );

    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter(
        (c) =>
          c.title?.toLowerCase().includes(t) ||
          c.instructor?.toLowerCase().includes(t)
      );
    }

    out.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return out;
  }, [q, activeSubject, catalogCourses]);

  if (!activeSubject) {
    return <Navigate to="/dashboard" replace />;
  }

  const emptyMsg = loading
    ? "Loading courses…"
    : error
      ? "Could not load courses."
      : `No lessons found for ${activeSubject}.`;

  const classLabel = formatClassDisplay(sessionUser?.classLevel);

  return (
    <PageWithFooter variant="user">
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:space-y-8 sm:px-6 sm:py-6">
      <div>
        <p className="text-xs text-muted-foreground">
          {classLabel} / {activeSubject}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {activeSubject}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Lessons and materials for {activeSubject} in {classLabel}.
        </p>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search lessons..."
          className="h-11 rounded-full pl-9"
        />
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {emptyMsg}
        </p>
      ) : list.length === 0 ? (
        <div className="py-12 text-center sm:py-16">
          <FilterIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">{emptyMsg}</p>
        </div>
      ) : (
        <CourseGridWithMore
          courses={list}
          initialRows={4}
          moreRows={2}
        />
      )}
    </div>
    </PageWithFooter>
  );
}

export default AppCoursesPage;
