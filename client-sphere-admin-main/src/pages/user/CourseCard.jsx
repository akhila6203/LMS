import { Link, useLocation } from "react-router-dom";
import { Clock, BookOpen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatClassDisplay } from "@/utils/classDisplay";
import { timeAgo } from "@/utils/formatMaterial";

export function CourseCard({ course }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const className = course.category || course.classLevel;
  const subjectName = course.subCategory || course.subject;
  const timeLabel = timeAgo(course.createdAt);

  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/classes/${course.id}`} state={{ from }} className="block group">
        <div className="relative h-32 sm:h-36 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt="class"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${course.cover}`} />
          )}

          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="space-y-2 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {className && (
              <span className="inline-flex rounded-md border border-border bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-foreground">
                {formatClassDisplay(className)}
              </span>
            )}
            {subjectName && (
              <span className="inline-flex rounded-md border border-border bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-foreground">
                {subjectName}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-blue-600 transition group-hover:text-purple-600 sm:text-base">
            {course.title}
          </h3>

          <p className="line-clamp-2 text-[11px] text-muted-foreground sm:text-xs">
            {course.description}
          </p>

          <p className="text-xs text-muted-foreground">
            By {course.mentor || course.instructor || "Mentor"}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:gap-3 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.topics ?? course.topicCount ?? course.lessons ?? 0} topics
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
