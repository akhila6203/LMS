import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { catalog, CATEGORY_TABS } from "@/lib/catalog";
import { CourseCard } from "@/pages/user/CourseCard";
import { Button } from "@/components/ui/button";

export default function DevelopmentPage() {
  const developmentTabs = CATEGORY_TABS.Development;
  const [track, setTrack] = useState(developmentTabs[0]);
  const [visible, setVisible] = useState(8);

  const list = useMemo(() => {
    const dev = catalog.filter((c) => c.category === "Development");
    if (track !== "All Development") {
      return dev.filter((c) => c.subCategory === track);
    }
    return dev;
  }, [track]);

  const shown = list.slice(0, visible);

  return (
    <div className="space-y-6 sm:space-y-8  sm:px-6 md:px-10 py-4 sm:py-6">
      <div className="rounded-[28px] bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-xs text-muted-foreground">Home / Development / Courses</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">Development Courses</h1>
        <p className="mt-2 text-sm max-w-xl sm:max-w-2xl text-muted-foreground">
          Explore by track: Web Technology, Programming and Mobile Development.
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-5 flex gap-2 border-b pb-3 overflow-x-auto">
          {developmentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTrack(tab);
                setVisible(8);
              }}
              className={`border-b-2 px-2 sm:px-3 pb-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                track === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {visible < list.length && (
          <div className="mt-6 text-center px-2">
            <Button onClick={() => setVisible((v) => v + 8)} variant="outline" className="rounded-full">
              More courses
            </Button>
          </div>
        )}

        {list.length === 0 && (
          <div className="py-10 sm:py-12 text-center text-sm text-muted-foreground">
            No courses in this track yet. <Link to="/courses" className="text-primary">View all courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}

