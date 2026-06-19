import { useMemo } from "react";
import { CourseCard } from "../../pages/user/CourseCard";

import PublicCategoryFilters from "./PublicCategoryFilters";

import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { getSessionUser } from "@/utils/authSession";
import { filterCoursesByStudentClass } from "@/utils/classFilter";
import { filterCoursesWithLessons } from "@/utils/courseFilters";

import { useCatalogCourseFilters } from "@/hooks/useCatalogCourseFilters";

import { PageWithFooter } from "@/components/layout/PageWithFooter";

import { CourseGridWithMore } from "@/components/CourseGridWithMore";



export default function HomeCoursesPage() {

  const { courses, loading, error } = usePublishedCourses();
  const sessionUser = getSessionUser();
  const isLoggedInStudent = sessionUser && sessionUser.role === "user";

  const scopedCourses = useMemo(() => {
    let list = filterCoursesWithLessons(courses);
    if (isLoggedInStudent) {
      list = filterCoursesByStudentClass(list, sessionUser);
    }
    return list;
  }, [courses, isLoggedInStudent, sessionUser]);

  const {

    categories,

    subCategories,

    activeCategory,

    activeSubCategory,

    filtered,

    selectCategory,

    selectSubCategory,

  } = useCatalogCourseFilters(scopedCourses);



  const emptyMsg = loading

    ? "Loading courses…"

    : error

      ? "Could not load courses."

      : "No published courses yet.";



  return (

    <PageWithFooter>

    <div className="w-full space-y-8 sm:space-y-10">

      <p className="-mt-2 text-sm text-gray-500">

        Home &gt; <span className="font-medium text-black">Classes</span>

      </p>



      <div>

        <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">

          Browse by Class & Subject

        </h1>

        <p className="text-gray-500">

          Choose your class, then pick a subject to see related lessons.

          Only classes and subjects added by your admin are shown here.

        </p>

      </div>



      <div>

        <PublicCategoryFilters

          categories={categories}

          subCategories={subCategories}

          activeCategory={activeCategory}

          activeSubCategory={activeSubCategory}

          onCategoryChange={selectCategory}

          onSubCategoryChange={selectSubCategory}

        />



        <div className="mt-6">

          {loading ? (

            <p className="py-8 text-center text-gray-500">{emptyMsg}</p>

          ) : (

            <CourseGridWithMore

              courses={filtered}

              initialRows={3}

              moreRows={2}

              emptyMessage={emptyMsg}

            />

          )}

        </div>

      </div>



    </div>

    </PageWithFooter>

  );

}

