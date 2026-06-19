import { useMemo } from "react";

import { CourseGridWithMore } from "@/components/CourseGridWithMore";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { filterCoursesByStudentClass } from "@/utils/classFilter";
import { filterCoursesWithLessons } from "@/utils/courseFilters";
import { getSessionUser } from "@/utils/authSession";
import { formatClassDisplay } from "@/utils/classDisplay";
import { mapPublicCourseForCard } from "@/utils/mapPublicCourse";

function StudentDashboard() {
  const sessionUser = getSessionUser();
  const { courses, loading, error } = usePublishedCourses();

  const classCourses = useMemo(
    () =>
      filterCoursesWithLessons(
        filterCoursesByStudentClass(courses, sessionUser)
      ).map((c) => mapPublicCourseForCard(c)),
    [courses, sessionUser]
  );

  const firstName = sessionUser?.name?.split(" ")[0] || "Learner";
  const classLabel = formatClassDisplay(sessionUser?.classLevel);

  return (
    <PageWithFooter variant="user">
      <div className="space-y-0">
        <div className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-4 text-white sm:px-6 sm:py-5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Welcome to {firstName}
          </h1>
          {(sessionUser?.classLevel || sessionUser?.school) && (
            <p className="mt-2 text-sm text-teal-50/90 sm:text-base">
              {sessionUser?.classLevel ? classLabel : ""}
              {sessionUser?.classLevel && sessionUser?.school ? " · " : ""}
              {sessionUser?.school || ""}
            </p>
          )}
        </div>

        <div className="border-b border-border" />

        <div className="space-y-4 pt-4 sm:pt-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              All subjects
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              All published courses for {classLabel}. Use the subject tabs above
              to filter by subject.
            </p>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading your courses…
            </p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-500">
              Could not load courses. Make sure the backend is running.
            </p>
          )}

          {!loading && !error && (
            <CourseGridWithMore
              courses={classCourses}
              initialRows={4}
              moreRows={2}
              emptyMessage={`No courses published for ${classLabel} yet. Ask your admin to add classes.`}
            />
          )}
        </div>
      </div>
    </PageWithFooter>
  );
}

export default StudentDashboard;
