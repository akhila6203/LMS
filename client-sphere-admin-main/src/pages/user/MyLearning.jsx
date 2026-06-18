import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import { enrollmentService } from "@/services/enrollmentService";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { formatClassDisplay } from "@/utils/classDisplay";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

function MyLearningContent({ loading, stats, courses, navigate }) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading my courses…</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
          My Learning
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your lessons and progress. Open a lesson to continue — progress
          updates automatically as you complete topics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Started</p>
          <p className="text-3xl font-semibold">{stats.started}</p>
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

      {courses.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No courses yet. Open a class from the catalog to start
            learning.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Browse courses
          </Button>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-xs sm:text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Quiz score</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((row) => (
                <tr key={row.courseId} className="border-t">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">
                    {formatClassDisplay(row.category || row.classLevel)}
                  </td>
                  <td className="px-4 py-3">
                    {row.subCategory || row.subject || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32 sm:w-40">
                      <Progress value={row.progressPercent} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.progressPercent}% ({row.completedUnits}/
                        {row.totalUnits})
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.quizScore != null && row.quizTotal != null ? (
                      <span className="font-medium text-foreground">
                        {row.quizScore}/{row.quizTotal}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(row.startedAt)}</td>
                  <td className="px-4 py-3">
                    {formatDate(row.quizCompletedAt || row.completedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        row.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : row.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.status === "completed"
                        ? "Complete"
                        : row.status === "active"
                          ? "In progress"
                          : "Not started"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 px-2"
                      onClick={() =>
                        navigate(`/courses/${row.courseId}`, {
                          state: { from: "/my-learning" },
                        })
                      }
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default function MyLearningPage({ embedded = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    started: 0,
    completed: 0,
    hoursLearned: 0,
    daysToComplete: 0,
  });
  const [courses, setCourses] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const myRes = await enrollmentService.getMyCourses();
      setStats(myRes.data.stats || {
        started: 0,
        completed: 0,
        hoursLearned: 0,
        daysToComplete: 0,
      });
      setCourses(myRes.data.courses || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load my courses");
      setStats({
        started: 0,
        completed: 0,
        hoursLearned: 0,
        daysToComplete: 0,
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const content = (
    <MyLearningContent
      loading={loading}
      stats={stats}
      courses={courses}
      navigate={navigate}
    />
  );

  if (embedded) {
    return content;
  }

  return (
    <PageWithFooter variant="user">
      {content}
    </PageWithFooter>
  );
}
