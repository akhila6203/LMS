import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { enrollmentService } from "@/services/enrollmentService";
import { CourseCard } from "@/pages/user/CourseCard";
import { formatRupee } from "@/utils/coursePricing";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default function MyLearningPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    hoursLearned: 0,
    daysToComplete: 0,
  });
  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [popular, setPopular] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [myRes, recRes] = await Promise.all([
        enrollmentService.getMyCourses(),
        enrollmentService.getRecommended(),
      ]);
      setStats(myRes.data.stats || {});
      setCourses(myRes.data.courses || []);
      setRecommended(recRes.data.recommended || []);
      setPopular(recRes.data.popular || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load my courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeCourse = async (courseId) => {
    if (!window.confirm("Remove this course from My Learning?")) return;
    try {
      await enrollmentService.remove(courseId);
      toast.success("Removed");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove");
    }
  };

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading my courses…</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 sm:px-2 md:px-2 py-4 sm:py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your enrolled courses and progress.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Enrolled</p>
          <p className="text-3xl font-semibold">{stats.enrolled}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-3xl font-semibold">{stats.completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Hours learned</p>
          <p className="text-3xl font-semibold">{stats.hoursLearned}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Avg days to complete</p>
          <p className="text-3xl font-semibold">{stats.daysToComplete}d</p>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-xs sm:text-sm">
          <thead className="bg-secondary/60 text-left">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Purchased</th>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  No enrolled courses yet. Add courses to cart and complete checkout.
                </td>
              </tr>
            ) : (
              courses.map((row) => (
                <tr key={row.courseId} className="border-t">
                  <td className="px-4 py-3">{row.title}</td>
                  <td className="px-4 py-3">
                    <div className="w-32 sm:w-40">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{ width: `${row.progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.progressPercent}% ({row.completedUnits}/{row.totalUnits})
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatDate(row.purchasedAt)}</td>
                  <td className="px-4 py-3">{formatDate(row.startedAt)}</td>
                  <td className="px-4 py-3">
                    {formatDate(row.quizCompletedAt || row.completedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        row.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.status === "completed" ? "Complete" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/courses/${row.courseId}`, {
                            state: { from: "/my-learning" },
                          })
                        }
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => removeCourse(row.courseId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {recommended.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recommended for you</h2>
            <Link to="/courses" className="text-sm text-primary">
              View all
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on courses you enrolled in.
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommended.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Popular courses</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popular.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
