import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaBookOpen, FaClock } from "react-icons/fa";
import { GraduationCap, BookOpen } from "lucide-react";

import useCourses from "@/hooks/useCourses";
import { CLASS_OPTIONS } from "@/lib/catalog";
import { timeAgo } from "@/utils/formatMaterial";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function courseClass(c) {
  return (c.category || c.classLevel || "").trim();
}

function courseSubject(c) {
  return (c.subCategory || c.sub_category || c.subject || "").trim();
}

function courseTopicCount(course) {
  return (
    course.topics ??
    course.topicCount ??
    course.lessons ??
    course.videos?.length ??
    0
  );
}

export default function AdminCourses() {
  const navigate = useNavigate();
  const { courses, loading } = useCourses();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const classOptions = useMemo(() => {
    const fromCourses = [
      ...new Set(courses.map(courseClass).filter(Boolean)),
    ];
    return fromCourses.length ? fromCourses.sort() : CLASS_OPTIONS;
  }, [courses]);

  const subjectOptions = useMemo(() => {
    const pool = classFilter
      ? courses.filter((c) => courseClass(c) === classFilter)
      : courses;
    return [...new Set(pool.map(courseSubject).filter(Boolean))].sort();
  }, [courses, classFilter]);

  let filtered = courses.filter((c) =>
    (c.title || "").toLowerCase().includes((search || "").toLowerCase())
  );

  if (tab === "Published") {
    filtered = filtered.filter((c) => c.status === "Active");
  }

  if (tab === "Draft") {
    filtered = filtered.filter((c) => c.status !== "Active");
  }

  if (classFilter) {
    filtered = filtered.filter((c) => courseClass(c) === classFilter);
  }

  if (subjectFilter) {
    filtered = filtered.filter((c) => courseSubject(c) === subjectFilter);
  }

  filtered = [...filtered].sort((a, b) => b.id - a.id);

  return (
    <div className="space-y-6 px-3 py-3 sm:px-4 sm:py-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Manage published and draft classes by grade and subject.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <input
            placeholder="Search classes..."
            className="w-full min-w-[200px] max-w-[280px] rounded-lg border bg-background px-4 py-2 text-sm shadow-sm sm:w-[280px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={classFilter || "all"}
            onValueChange={(v) => {
              setClassFilter(v === "all" ? "" : v);
              setSubjectFilter("");
            }}
          >
            <SelectTrigger className="w-[160px]">
              <GraduationCap className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classOptions.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={subjectFilter || "all"}
            onValueChange={(v) => setSubjectFilter(v === "all" ? "" : v)}
            disabled={subjectOptions.length === 0}
          >
            <SelectTrigger className="w-[160px]">
              <BookOpen className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjectOptions.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            {["All", "Published", "Draft"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setTab(label === "Draft" ? "Draft" : label)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  tab === label || (label === "Draft" && tab === "Draft")
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {label === "Draft" ? "Drafts" : label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/courses/create")}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
        >
          <FaPlus />
          New Class
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-muted-foreground">
          Loading classes...
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/admin/courses/${course.id}`)}
              className="cursor-pointer overflow-hidden rounded-xl bg-card shadow transition hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt="course"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {courseClass(course) || "—"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      course.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {course.status === "Active" ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="mb-2 text-sm font-medium">
                  {courseSubject(course) || "—"}
                </p>

                <h2 className="mb-2 text-xl font-semibold leading-snug text-blue-600">
                  {course.title}
                </h2>

                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>

                <p className="mb-3 text-sm text-muted-foreground">
                  By {course.instructor}
                </p>

                <div className="flex items-center gap-5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {timeAgo(course.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaBookOpen />
                    {courseTopicCount(course)} topics
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No classes found
        </p>
      )}
    </div>
  );
}
