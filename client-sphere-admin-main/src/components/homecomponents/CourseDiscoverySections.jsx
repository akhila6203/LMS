import { useMemo, useState } from "react";
import { CourseCard } from "@/pages/user/CourseCard";
import {
  filterFeaturedTabCourses,
  filterTrendingCourses,
} from "@/lib/courseLabels";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function CourseDiscoverySections({
  courses = [],
  loading = false,
  error = null,
}) {
  const [featureTab, setFeatureTab] = useState("Popular");
  const [trendSwiper, setTrendSwiper] = useState(null);
  const [featSwiper, setFeatSwiper] = useState(null);
  const [, forceUpdate] = useState(0);

  const featureTabs = ["Popular", "New", "Advanced"];
  const trending = useMemo(() => filterTrendingCourses(courses), [courses]);
  const featured = useMemo(
    () => filterFeaturedTabCourses(courses, featureTab),
    [courses, featureTab]
  );

  const emptyMsg = loading
    ? "Loading courses…"
    : error
      ? "Could not load courses."
      : "No published courses yet.";

  const showLeft = (swiper) => swiper && swiper.activeIndex > 0;
  const showRight = (swiper) => {
    if (!swiper) return false;
    const totalSlides = swiper.slides?.length || 0;
    const perView = swiper.params?.slidesPerView || 1;
    return swiper.activeIndex < totalSlides - perView;
  };

  const carousel = (items, setSwiper) =>
    !loading && items.length > 0 ? (
      <Swiper
        onSwiper={setSwiper}
        onSlideChange={() => forceUpdate((n) => n + 1)}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.2 },
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {items.map((c) => (
          <SwiperSlide key={c.id}>
            <CourseCard course={c} />
          </SwiperSlide>
        ))}
      </Swiper>
    ) : (
      <p className="text-center text-gray-500 py-6">{emptyMsg}</p>
    );

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h2 className="text-3xl font-semibold">Trending Courses</h2>
        <p className="text-gray-500 text-sm mb-4 mt-2">
         Explore courses that are currently gaining the most attention.
        </p>
        <div className="relative">
          {showLeft(trendSwiper) && (
            <button
              type="button"
              onClick={() => trendSwiper.slidePrev()}
              className="absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 z-10 bg-white border w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow hover:bg-gray-100"
            >
              ❮
            </button>
          )}
          {showRight(trendSwiper) && (
            <button
              type="button"
              onClick={() => trendSwiper.slideNext()}
              className="absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 z-10 bg-white border w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow hover:bg-gray-100"
            >
              ❯
            </button>
          )}
          {carousel(trending, setTrendSwiper)}
        </div>
      </div>

      <div>
        <div>
          <h2 className="text-3xl font-semibold">Featured Courses</h2>
          <p className="text-gray-500 text-sm mt-2">
            Handpicked courses recommended for learners looking to level up their skills.
          </p>
        </div>

        <div className="flex gap-6 border-b mt-4 pb-2 overflow-x-auto">
          {featureTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFeatureTab(t)}
              className={`pb-2 text-sm whitespace-nowrap ${
                featureTab === t
                  ? "border-b-2 border-purple-600 text-black font-medium"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              {t === "Advanced" ? "Intermediate & Advanced" : t}
            </button>
          ))}
        </div>

        <div className="relative mt-6">
          {showLeft(featSwiper) && (
            <button
              type="button"
              onClick={() => featSwiper.slidePrev()}
              className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10 bg-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow"
            >
              ❮
            </button>
          )}
          {showRight(featSwiper) && (
            <button
              type="button"
              onClick={() => featSwiper.slideNext()}
              className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-10 bg-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow"
            >
              ❯
            </button>
          )}
          {carousel(featured, setFeatSwiper)}
        </div>
      </div>
    </div>
  );
}
