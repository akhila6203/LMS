import { Button } from "@/components/ui/button";
import { CourseCard } from "@/pages/user/CourseCard";
import { useGridShowMore } from "@/hooks/useGridShowMore";

export function CourseGridWithMore({
  courses = [],
  initialRows = 3,
  moreRows = 2,
  emptyMessage,
  className = "",
}) {
  const { visible, hasMore, showMore } = useGridShowMore(courses, {
    initialRows,
    moreRows,
  });

  if (!courses.length) {
    return emptyMessage ? (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    ) : null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {visible.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-6 sm:pt-8">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-10"
            onClick={showMore}
          >
            More
          </Button>
        </div>
      )}
    </div>
  );
}
