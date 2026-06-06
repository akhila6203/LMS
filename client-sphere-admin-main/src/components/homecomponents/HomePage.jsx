import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Sparkles,
  Star,
  Award,
  Users,
  BookOpen,
  Zap,
  Shield,
} from "lucide-react";

import { useEffect } from "react";
import { homeVideoService } from "@/services/homeVideoService";

import { CourseCard } from "../../pages/user/CourseCard";
import VideoPlayer from "../../pages/user/VideoPlayer";
import PublicCategoryFilters from "./PublicCategoryFilters";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { usePublicCourseFilters } from "@/hooks/usePublicCourseFilters";

import demo from "../../assets/videos/demo.mp4";
import { PageWithFooter } from "@/components/layout/PageWithFooter";

const features = [
  { icon: Award, title: "Certified courses", desc: "Industry-recognized certificates upon completion." },
  { icon: Users, title: "Mentor support", desc: "Direct access to instructors and community." },
  { icon: Zap, title: "Hands-on projects", desc: "Ship real work — not just theory." },
  { icon: Shield, title: "Lifetime access", desc: "Buy once, learn forever." },
];

export default function HomePage() {
  const { courses, loading, error } = usePublishedCourses();
  const { categories, activeCategory, filtered, selectCategory } =
    usePublicCourseFilters(courses);

  const [visibleCount, setVisibleCount] = useState(8);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = user && user.role !== "admin";

  const visibleCourses = filtered.slice(0, visibleCount);
  const heroCourse = courses[0];

  const [demoVideo, setDemoVideo] = useState(null);

    useEffect(() => {
      homeVideoService
        .getPublic()
        .then((res) => setDemoVideo(res.data.video))
        .catch(() => setDemoVideo(null));
    }, []);

  return (
    <PageWithFooter>
    <div className="bg-background text-foreground">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-12 sm:py-16 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              New: AI for Builders course is live
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Learning today,
              <br />
              <span className="text-purple-600">leading tomorrow.</span>
            </h1>

            <p className="mt-4 text-muted-foreground">
              Mentor-led courses with real projects in web development,
              data science, design, AI and cloud.
            </p>

            <div className="mt-6 flex gap-4">
              <a href="#courses" className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                Browse courses <ChevronRight className="w-4 h-4" />
              </a>

              {!isLoggedIn && (
                <Link to="/login" className="rounded-lg border px-6 py-3">
                  Sign in
                </Link>
              )}
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500"].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full border-2 border-white ${c}`} />
                  ))}
                </div>
                50,000+ learners
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
                <span className="font-medium">4.8</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl bg-card p-4 shadow-xl">
              <VideoPlayer
                  src={demoVideo?.video_url || demo}
                  controls
                  autoPlay
                  muted
                  loop
                  poster={heroCourse?.thumbnail}
                  title={heroCourse?.title || "Course preview"}
                  subtitle={
                    heroCourse
                      ? `${heroCourse.lessons || 0} lessons · ${heroCourse.hours || 0}h`
                      : "Explore our catalog"
                  }
                />

              <div className="grid grid-cols-3 gap-3 mt-4">
                  {courses.slice(1, 4).map((c) => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.id}`}
                      className="block bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition"
                    >
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="h-16 w-full object-cover"
                        />
                      ) : (
                        <div className={`h-16 bg-gradient-to-br ${c.cover}`} />
                      )}

                      <div className="p-2">
                        <p className="text-xs line-clamp-2">{c.title}</p>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {c.rating}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
             
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y bg-secondary/40 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow">
                <f.icon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="max-w-7xl mx-auto py-12 sm:py-16">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Skills to transform your career</h2>
            <p className="mt-2 text-muted-foreground">
              Learn in-demand skills through expert-led courses, real-world projects, and industry-focused training.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PublicCategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              selectCategory(cat);
              setVisibleCount(8);
            }}
          />
        </div>

        {loading && (
          <p className="mt-8 text-center text-muted-foreground">Loading courses…</p>
        )}

        {error && !loading && (
          <p className="mt-8 text-center text-red-500 text-sm">
            Could not load courses. Make sure the backend is running.
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            No published courses in this category yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {visibleCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-8 text-center">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => setVisibleCount((prev) => prev + 20)}
            >
              More
            </Button>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl py-16">
        <div className="rounded-2xl px-8 py-14 text-center text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 shadow-xl">
          <BookOpen className="mx-auto h-10 w-10 opacity-90" />
          <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
            Start your learning journey today
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">
            Join 50,000+ learners building skills that matter — with mentor-led courses and real-world projects.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {!isLoggedIn && (
              <Link
                to="/login"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium shadow hover:scale-105 transition"
              >
                Get started free
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
    </PageWithFooter>
  );
}
