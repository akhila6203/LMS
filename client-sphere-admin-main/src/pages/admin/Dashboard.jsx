import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell,
  AreaChart, Area, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, BookOpen, Users, GraduationCap, ChevronDown, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminDashboardService } from "@/services/adminDashboardService";

const miniDataFallback = [
  { v: 10 },
  { v: 20 },
  { v: 15 },
  { v: 25 },
  { v: 18 },
  { v: 30 },
];

const defaultUserActivity = [
  { name: "Students", value: 0, color: "#3b82f6" },
  { name: "Google", value: 0, color: "#f97316" },
  { name: "Learning", value: 0, color: "#22c55e" },
  { name: "Completed", value: 0, color: "#9333ea" },
];

function TrendBadge({ value }) {
  const up = value >= 0;
  return (
    <div className={`flex items-center mt-1 ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      <span className="ml-1">{Math.abs(value)}%</span>
    </div>
  );
}

function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(Number(n) || 0);
}

function StudentAvatar({ student }) {
  const [imgError, setImgError] = useState(false);
  const showImage = student.avatar && !imgError;

  if (showImage) {
    return (
      <img
        src={student.avatar}
        alt=""
        className="w-10 h-10 rounded-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center text-xs font-bold text-purple-800 dark:text-purple-200">
      {student.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userFilter, setUserFilter] = useState("Yearly");
  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    activeLearners: 0,
    totalStudents: 0,
    totalCourses: 0,
    avgProgress: 0,
    trends: { students: 0, courses: 0 },
    sparklines: { students: miniDataFallback },
  });

  const [userActivityData, setUserActivityData] = useState(defaultUserActivity);
  const [topStudents, setTopStudents] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getDashboard({
        userPeriod: userFilter,
      });
      const d = res.data;

      setStats(d.stats || stats);
      setUserActivityData(d.userActivity?.length ? d.userActivity : defaultUserActivity);
      setTopStudents(d.topStudents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const studentSpark = stats.sparklines?.students?.length
    ? stats.sparklines.students
    : miniDataFallback;

  return (
    <div className="space-y-6 px-3 py-3 sm:px-4 sm:py-4">
      <div>
        <p className="text-sm text-muted-foreground">LMS overview</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold dark:text-white">Active learners</p>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <BookOpen className="text-blue-600 dark:text-blue-300" size={18} />
              </div>
            </div>
            <h2 className="text-3xl font-bold dark:text-white">
              {loading ? "—" : formatNumber(stats.activeLearners)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Students with learning activity</p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold dark:text-white">Total Students</p>
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Users className="text-purple-600 dark:text-purple-300" size={18} />
              </div>
            </div>
            <h2 className="text-3xl font-bold dark:text-white">
              {loading ? "—" : formatNumber(stats.totalStudents)}
            </h2>
            <TrendBadge value={stats.trends?.students ?? 0} />
            <p className="text-sm text-gray-500 dark:text-gray-400">From last month</p>
            <div className="flex gap-2 mt-4 h-16 items-end">
              {studentSpark.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.max(8, Math.min(60, item.v * 2))}px` }}
                  className="w-4 bg-purple-500 rounded"
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold dark:text-white">Total Classes</p>
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                <GraduationCap className="text-orange-500 dark:text-orange-300" size={18} />
              </div>
            </div>
            <h2 className="text-3xl font-bold dark:text-white">
              {loading ? "—" : formatNumber(stats.totalCourses)}
            </h2>
            <TrendBadge value={stats.trends?.courses ?? 0} />
            <p className="text-sm text-gray-500 dark:text-gray-400">From last month</p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold dark:text-white">Avg. progress</p>
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <TrendingUp className="text-green-600 dark:text-green-300" size={18} />
              </div>
            </div>
            <h2 className="text-3xl font-bold dark:text-white">
              {loading ? "—" : `${stats.avgProgress}%`}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Topic completion across students</p>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow border dark:border-gray-700">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold dark:text-white">User activity</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-1 border px-3 py-1 rounded text-sm dark:text-white"
              >
                {userFilter} <ChevronDown size={16} />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1e293b] border rounded-md shadow z-50">
                  {["Yearly", "Monthly", "Weekly", "Today"].map((item) => (
                    <div
                      key={item}
                      onClick={() => {
                        setUserFilter(item);
                        setUserOpen(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="space-y-4 text-sm">
              {userActivityData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                  <div>
                    <p>{item.name}</p>
                    <p className="font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={userActivityData} innerRadius={60} outerRadius={90} dataKey="value">
                    {userActivityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow border dark:border-gray-700 relative">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold dark:text-white">Top Student</h2>
            <div className="relative">
              <MoreVertical className="cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} />
              {menuOpen && (
                <div className="absolute right-0 mt-2 z-10 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow rounded text-sm min-w-[100px]">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/students");
                    }}
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>

          {(topStudents.length ? topStudents : [{ name: "No students yet", marks: 0, subtitle: "—" }]).map((s, i) => (
            <div
              key={s.id ? `${s.id}` : i}
              className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 -mx-1 transition"
              onClick={() => s.name !== "No students yet" && navigate("/students")}
              role={s.name !== "No students yet" ? "button" : undefined}
            >
              <div className="flex items-center gap-3">
                <StudentAvatar student={s} />
                <div>
                  <p className="font-semibold dark:text-white">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.subtitle || "Student"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">Progress</p>
                <div className="w-10 h-10 rounded-full border-4 border-blue-500 flex items-center justify-center text-sm">
                  {s.marks}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
