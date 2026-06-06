import { useMemo, useState } from "react";
import { CourseCard } from "../../pages/user/CourseCard";
import PublicCategoryFilters from "./PublicCategoryFilters";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { useCatalogCourseFilters } from "@/hooks/useCatalogCourseFilters";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import CourseDiscoverySections from "./CourseDiscoverySections";

export default function HomeCoursesPage() {
  const { courses, loading, error } = usePublishedCourses();
  const {
    categories,
    subCategories,
    activeCategory,
    activeSubCategory,
    filtered,
    selectCategory,
    selectSubCategory,
  } = useCatalogCourseFilters(courses);

  const [catSwiper, setCatSwiper] = useState(null);
  const [, forceUpdate] = useState(0);

  const showLeft = (swiper) => {
    if (!swiper) return false;
    return swiper.activeIndex > 0;
  };

  const showRight = (swiper) => {
    if (!swiper) return false;
    const totalSlides = swiper.slides?.length || 0;
    const perView = swiper.params?.slidesPerView || 1;
    return swiper.activeIndex < totalSlides - perView;
  };

  const emptyMsg = loading
    ? "Loading courses…"
    : error
      ? "Could not load courses."
      : "No published courses yet.";

  return (
    <PageWithFooter>
    <div className="w-full space-y-8 sm:space-y-10">
      <p className="text-sm text-gray-500 -mt-2">
        Home &gt; <span className="text-black font-medium">Courses</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Discover Top Courses to Boost Your Career
        </h1>
        <p className="text-gray-500">
           Explore our collection of high-quality courses designed to help you learn and grow.
        </p>
      </div>

      {/* Discover Top Courses — category + subcategory filters */}
      <div>
        <PublicCategoryFilters
          categories={categories}
          subCategories={subCategories}
          activeCategory={activeCategory}
          activeSubCategory={activeSubCategory}
          onCategoryChange={selectCategory}
          onSubCategoryChange={selectSubCategory}
        />

        <div className="relative mt-6">
          {showLeft(catSwiper) && (
            <button
              type="button"
              onClick={() => catSwiper.slidePrev()}
              className="absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 z-10 bg-white border w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow hover:bg-gray-100"
            >
              ❮
            </button>
          )}
          {showRight(catSwiper) && (
            <button
              type="button"
              onClick={() => catSwiper.slideNext()}
              className="absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 z-10 bg-white border w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow hover:bg-gray-100"
            >
              ❯
            </button>
          )}

          {loading || filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{emptyMsg}</p>
          ) : (
            <Swiper
              modules={[Navigation]}
              onSwiper={setCatSwiper}
              onSlideChange={() => forceUpdate((n) => n + 1)}
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 1.2 },
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
            >
              {filtered.map((c) => (
                <SwiperSlide key={c.id}>
                  <CourseCard course={c} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      <CourseDiscoverySections
        courses={courses}
        loading={loading}
        error={error}
      />

    </div>
    </PageWithFooter>
  );
}
