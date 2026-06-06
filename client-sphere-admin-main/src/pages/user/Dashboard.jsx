import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseCard } from "@/pages/user/CourseCard";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { learnerCourseService } from "@/services/learnerCourseService";
import { mapPublicCourseForCard } from "@/utils/mapPublicCourse";
// import { getLearningProgress } from "@/utils/userStore";
// import { getLastViewedCourseId } from "@/utils/courseNavUtils";

const DASHBOARD_ROWS = 2;
const DASHBOARD_COLS = 4;
const DASHBOARD_VISIBLE = DASHBOARD_ROWS * DASHBOARD_COLS;

function DashboardSection({ title, subtitle,items, viewAllTo = "/courses" }) {
  if (!items?.length) return null;

  const visible = items.slice(0, DASHBOARD_VISIBLE);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {/* <p className="mt-1 text-sm text-muted-foreground">
          Click any card to open the full course details page.
        </p> */}
         <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {visible.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <div className="flex justify-center pt-1">
        <Button asChild variant="outline" className="rounded-full px-8">
          <Link to={viewAllTo}>
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Learner",
    email: "learner@example.com",
  };

  const { courses, loading: coursesLoading } = usePublishedCourses();
  const [feedLoading, setFeedLoading] = useState(true);
  const [feed, setFeed] = useState({
    recommended: [],
    becauseViewed: null,
    trending: [],
    featured: [],
  });

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setFeedLoading(true);
      try {
        // const progress = getLearningProgress();
        // const lastViewedCourseId = getLastViewedCourseId(progress);
        // const res = await learnerCourseService.getDashboard({
        //   lastViewedCourseId: lastViewedCourseId || undefined,
        // });
        const res = await learnerCourseService.getDashboard();
        if (cancelled) return;

        const mapList = (list) =>
          (list || []).map((c) => mapPublicCourseForCard(c));

        setFeed({
          recommended: mapList(res.data.recommended),
          becauseViewed: res.data.becauseViewed
            ? {
                title: res.data.becauseViewed.title,
                items: mapList(res.data.becauseViewed.courses),
              }
            : null,
          trending: mapList(res.data.trending),
          featured: mapList(res.data.featured),
        });
      } catch {
        if (!cancelled) {
          const fallback = courses.slice(0, 5).map((c) => mapPublicCourseForCard(c));
          setFeed({
            recommended: fallback,
            becauseViewed: null,
            trending: fallback,
            featured: courses.slice(5, 10).length
              ? courses.slice(5, 10).map((c) => mapPublicCourseForCard(c))
              : fallback,
          });
        }
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    };

    loadFeed();
    return () => {
      cancelled = true;
    };
  }, [courses]);

  return (
    <PageWithFooter variant="user">
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
            {(user?.name || "L").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-semibold text-slate-900">
              Welcome back, {user?.name?.split(" ")[0] || "Learner"}
            </p>
          </div>
        </div>
        <h1 className="mt-6 sm:mt-8 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          What to learn next
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover recommended courses and continue building your skills step by step.
        </p>
      </div>

      {(feedLoading || coursesLoading) && (
        <p className="text-sm text-muted-foreground">Loading your courses…</p>
      )}

      <DashboardSection
        title="Recommended for You"
        subtitle="Courses selected based on your interests and learning activity."
        items={feed.recommended}
      />

      {feed.becauseViewed?.items?.length > 0 && (
        <DashboardSection
          title={feed.becauseViewed.title}
          subtitle="Explore similar courses based on what you recently viewed."
          items={feed.becauseViewed.items}
        />
      )}

      <DashboardSection
        title="Trending Courses"
        subtitle="Popular courses that learners are exploring right now."
        items={feed.trending}
      />

      <DashboardSection
        title="Featured Courses"
        subtitle="Handpicked courses to help you learn useful and in-demand skills."
        items={feed.featured}
      />
      {/* <DashboardSection title="Recommended for you" items={feed.recommended} /> */}

      {/* {feed.becauseViewed?.items?.length > 0 && (
        <DashboardSection
          title={feed.becauseViewed.title}
          items={feed.becauseViewed.items}
        />
      )} */}

      {/* <DashboardSection title="Trending courses" items={feed.trending} /> */}

      {/* <DashboardSection title="Featured courses" items={feed.featured} /> */}

    </div>
    </PageWithFooter>
  );
}

export default StudentDashboard;
