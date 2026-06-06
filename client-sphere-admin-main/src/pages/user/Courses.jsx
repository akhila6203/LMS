import { useMemo, useState } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageWithFooter } from "@/components/layout/PageWithFooter";

import { CourseCard } from "@/pages/user/CourseCard";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { buildSubTabs } from "@/utils/courseNavUtils";
import { hasCourseLabel } from "@/lib/courseLabels";

function AppCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("popular");

  const { courses, loading, error } = usePublishedCourses();

  const rawCategory = searchParams.get("category");
  const cat = !rawCategory || rawCategory === "All" ? "All" : rawCategory;
  const activeTab = searchParams.get("subCategory") || "";

  const subTabs = useMemo(() => buildSubTabs(courses, cat), [courses, cat]);
  const allTabLabel = subTabs[0] || "All";

  const setCategory = (category, subCategory = "") => {
    if (!category || category === "All") {
      setSearchParams({}, { replace: true });
      return;
    }
    const next = new URLSearchParams({ category });
    if (subCategory) next.set("subCategory", subCategory);
    setSearchParams(next, { replace: true });
  };

  const onSubTabClick = (tab) => {
    setCategory(cat, tab);
  };

  const list = useMemo(() => {
    let out = [...courses];

    if (cat !== "All") {
      out = out.filter((c) => c.category === cat);
    }

    if (cat !== "All" && activeTab && activeTab !== allTabLabel) {
      out = out.filter((c) => c.subCategory === activeTab);
    }

    if (level !== "All") {
      out = out.filter(
        (c) => hasCourseLabel(c, level) || c.level === level
      );
    }

    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter(
        (c) =>
          c.title?.toLowerCase().includes(t) ||
          c.instructor?.toLowerCase().includes(t)
      );
    }

    if (sort === "rating") {
      out.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "newest") {
      out.sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    } else {
      out.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }

    return out;
  }, [q, cat, activeTab, level, sort, courses, allTabLabel]);

  const emptyMsg = loading
    ? "Loading courses…"
    : error
      ? "Could not load courses."
      : "No courses match your filters.";

  return (
    <PageWithFooter variant="user">
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      <div>
        <p className="text-xs text-muted-foreground">
          {cat === "All"
            ? "Home / Courses"
            : activeTab && activeTab !== allTabLabel
              ? `Home / ${cat} / ${activeTab}`
              : `Home / ${cat} / Courses`}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          {cat === "All"
            ? "All Courses"
            : activeTab && activeTab !== allTabLabel
              ? activeTab
              : `${cat} Courses`}
        </h1>
        <p className="mt-2 max-w-xl sm:max-w-2xl text-sm text-muted-foreground">
           Explore our complete course collection, discover new skills, and find the right learning path to achieve your goals.
        </p>
      </div>

      {subTabs.length > 0 && cat !== "All" && (
        <div className="flex items-center gap-2 overflow-x-auto">
          {subTabs.map((tab) => (
            <Button
              key={tab}
              type="button"
              variant={activeTab === tab ? "default" : "ghost"}
              className={`rounded-full px-4 ${
                activeTab === tab ? "" : "text-muted-foreground"
              }`}
              onClick={() => onSubTabClick(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses or instructors..."
            className="h-11 rounded-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[140px] rounded-full">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px] rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
              <SelectItem value="newest">A → Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            {emptyMsg}
          </p>
        ) : (
          list.map((c) => <CourseCard key={c.id} course={c} />)
        )}

        {!loading && list.length === 0 && (
          <div className="col-span-full py-12 sm:py-16 text-center">
            <FilterIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{emptyMsg}</p>
          </div>
        )}
      </div>
    </div>
    </PageWithFooter>
  );
}

export default AppCoursesPage;
