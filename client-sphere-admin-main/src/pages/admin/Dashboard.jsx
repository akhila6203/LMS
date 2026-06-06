import React, { useState, useEffect, useCallback } from "react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/table";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";

import {
  LineChart, Line, XAxis, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
} from "lucide-react";

const miniDataFallback = [
  { v: 10 },
  { v: 20 },
  { v: 15 },
  { v: 25 },
  { v: 18 },
  { v: 30 },
];

import {
  YAxis,
  CartesianGrid,
} from "recharts";

import { ChevronDown } from "lucide-react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminDashboardService } from "@/services/adminDashboardService";

const defaultEarningData = [{ name: "-", value: 0 }];
const defaultUserActivity = [
  { name: "Password", value: 0, color: "#3b82f6" },
  { name: "Google", value: 0, color: "#f97316" },
  { name: "Active", value: 0, color: "#22c55e" },
  { name: "Completed", value: 0, color: "#9333ea" },
];
const defaultCourseActivity = [{ name: "-", paid: 0, free: 0 }];

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
  const [filter, setFilter] = useState("Yearly");
  const [open, setOpen] = useState(false);

  const [userFilter, setUserFilter] = useState("Yearly");
  const [userOpen, setUserOpen] = useState(false);

  const [courseFilter, setCourseFilter] = useState("Yearly");
  const [courseOpen, setCourseOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    enrolledCourses: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
    formattedEarnings: "$0",
    trends: { enrolled: 0, students: 0, courses: 0, earnings: 0 },
    sparklines: { enrolled: miniDataFallback, earnings: miniDataFallback },
  });

  const [earningData, setEarningData] = useState(defaultEarningData);
  const [earningSummary, setEarningSummary] = useState({
    formattedTotal: "$0",
    changePercent: 0,
    perDay: "$0",
  });

  const [userActivityData, setUserActivityData] = useState(defaultUserActivity);
  const [topStudents, setTopStudents] = useState([]);
  const [courseActivityData, setCourseActivityData] = useState(defaultCourseActivity);
  const [courseTotals, setCourseTotals] = useState({ paidTotal: 0, freeTotal: 0 });
  const [data, setData] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getDashboard({
        earningPeriod: filter,
        userPeriod: userFilter,
        coursePeriod: courseFilter,
      });
      const d = res.data;

      setStats(d.stats || stats);
      setEarningData(d.earningStatistics?.series || defaultEarningData);
      setEarningSummary({
        formattedTotal: d.earningStatistics?.formattedTotal || "$0",
        changePercent: d.earningStatistics?.changePercent ?? 0,
        perDay: d.earningStatistics?.perDay || "$0",
      });
      setUserActivityData(d.userActivity?.length ? d.userActivity : defaultUserActivity);
      setTopStudents(d.topStudents || []);
      setCourseActivityData(
        d.courseActivity?.series?.length ? d.courseActivity.series : defaultCourseActivity
      );
      setCourseTotals({
        paidTotal: d.courseActivity?.paidTotal ?? 0,
        freeTotal: d.courseActivity?.freeTotal ?? 0,
      });
      setData(d.recentPayments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, userFilter, courseFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const [page, setPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const paginated = data.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const enrolledSpark = stats.sparklines?.enrolled?.length
    ? stats.sparklines.enrolled
    : miniDataFallback;
  const earningsSpark = stats.sparklines?.earnings?.length
    ? stats.sparklines.earnings
    : miniDataFallback;

  const earningUp = earningSummary.changePercent >= 0;

  return (
    <div className="px-6 py-2 space-y-4">

      <div>
        <p className="text-sm text-gray-500">LMS → Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

          <div className="grid grid-cols-2 gap-6">

  <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow border dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <p className="font-semibold dark:text-white">Enrolled Courses</p>
      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
        <BookOpen className="text-blue-600 dark:text-blue-300" size={18} />
      </div>
    </div>

    <h2 className="text-3xl font-bold dark:text-white">
      {loading ? "—" : formatNumber(stats.enrolledCourses)}
    </h2>

    <TrendBadge value={stats.trends?.enrolled ?? 0} />

    <p className="text-sm text-gray-500 dark:text-gray-400">From last month</p>

    <div className="h-16 mt-2">
      <ResponsiveContainer>
        <AreaChart data={enrolledSpark}>
          <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#dbeafe" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
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
      {enrolledSpark.slice(0, 5).map((item, i) => (
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
      <p className="font-semibold dark:text-white">Total Courses</p>
      <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
        <GraduationCap className="text-orange-500 dark:text-orange-300" size={18} />
      </div>
    </div>

    <h2 className="text-3xl font-bold dark:text-white">
      {loading ? "—" : formatNumber(stats.totalCourses)}
    </h2>

    <TrendBadge value={stats.trends?.courses ?? 0} />

    <p className="text-sm text-gray-500 dark:text-gray-400">From last month</p>

    <div className="flex gap-2 mt-4 h-16 items-end">
      {earningsSpark.slice(0, 5).map((item, i) => (
        <div
          key={i}
          style={{ height: `${Math.max(8, Math.min(60, item.v / 10))}px` }}
          className="w-4 bg-orange-400 rounded"
        />
      ))}
    </div>
  </div>

  <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow border dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <p className="font-semibold dark:text-white">Total Earnings</p>
      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
        <DollarSign className="text-green-600 dark:text-green-300" size={18} />
      </div>
    </div>

    <h2 className="text-3xl font-bold dark:text-white">
      {loading ? "—" : stats.formattedEarnings}
    </h2>

    <TrendBadge value={stats.trends?.earnings ?? 0} />

    <p className="text-sm text-gray-500 dark:text-gray-400">From last month</p>

    <div className="h-16 mt-2">
      <ResponsiveContainer>
        <AreaChart data={earningsSpark}>
          <Area type="monotone" dataKey="v" stroke="#16a34a" fill="#dcfce7" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>
       <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow border dark:border-gray-700">

  <div className="flex justify-between items-center mb-4">
    <h2 className="font-semibold text-lg dark:text-white">
      Earning Statistic
    </h2>

    <div className="relative">
  <button
    onClick={() => setOpen(!open)}
    className="flex items-center gap-1 border px-3 py-1 rounded-md text-sm dark:text-white"
  >
    {filter} <ChevronDown size={16} />
  </button>

  {open && (
    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1e293b] border rounded-md shadow z-50">
      {["Yearly", "Monthly", "Weekly", "Today"].map((item) => (
        <div
          key={item}
          onClick={() => {
            setFilter(item);
            setOpen(false);
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

  <div className="flex items-center gap-3 mb-6">
    <h1 className="text-3xl font-bold dark:text-white">
      {loading ? "—" : earningSummary.formattedTotal}
    </h1>

    <span className={`px-2 py-1 rounded-full text-sm ${earningUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
      {Math.abs(earningSummary.changePercent)}% {earningUp ? "▲" : "▼"}
    </span>

    <span className="text-gray-500 text-sm dark:text-gray-400">
      + {earningSummary.perDay} Per Day
    </span>
  </div>

  <div className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={earningData}>

        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0.05}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 12 }}
        />

        <YAxis
          tick={{ fill: "#64748b", fontSize: 12 }}
        />

        <Tooltip />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#2a9d8f"
          strokeWidth={3}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>

</div>

      </div>

      <div className="grid grid-cols-3 gap-6">

  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow border dark:border-gray-700">

    <div className="flex justify-between mb-4">
      <h2 className="font-semibold dark:text-white">User activity</h2>

      <div className="relative">
        <div className="relative">
  <button
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
    </div>

    <div className="flex items-center gap-6">

      <div className="space-y-4 text-sm">
        {userActivityData.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ background: item.color }}
            />
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
            <Pie
              data={userActivityData}
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
            >
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
        <MoreVertical
          className="cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />

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
        key={s.id ? `${s.accountType}-${s.id}` : i}
        className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 -mx-1 transition"
        onClick={() => s.name !== "No students yet" && navigate("/students")}
        role={s.name !== "No students yet" ? "button" : undefined}
        tabIndex={s.name !== "No students yet" ? 0 : undefined}
        onKeyDown={(e) => {
          if (s.name !== "No students yet" && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            navigate("/students");
          }
        }}
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

        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow border dark:border-gray-700 mt-6">

  <div className="flex justify-between mb-4">
    <h2 className="font-semibold dark:text-white">Course Activity</h2>

    <div className="relative">
  <button
    onClick={() => setCourseOpen(!courseOpen)}
    className="flex items-center gap-1 border px-3 py-1 rounded text-sm dark:text-white"
  >
    {courseFilter} <ChevronDown size={16} />
  </button>

  {courseOpen && (
    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1e293b] border rounded-md shadow z-50">
      {["Yearly", "Monthly", "Weekly", "Today"].map((item) => (
        <div
          key={item}
          onClick={() => {
            setCourseFilter(item);
            setCourseOpen(false);
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

  <div className="flex gap-4 mb-3 text-sm">
    <p className="text-green-600">● Paid Course: {formatNumber(courseTotals.paidTotal)}</p>
    <p className="text-orange-500">● Free Course: {formatNumber(courseTotals.freeTotal)}</p>
  </div>

  <div className="h-[300px]">
    <ResponsiveContainer>
      <AreaChart data={courseActivityData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

        <XAxis dataKey="name" />
        <YAxis />

        <Tooltip />

        <Area
          type="monotone"
          dataKey="paid"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
        />

        <Area
          type="monotone"
          dataKey="free"
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>

</div>

      </div>

      <div className="bg-white dark:bg-[#1e293b] text-black dark:text-white p-4 rounded shadow border dark:border-gray-700">

        <h2 className="font-semibold mb-4">Recent Enrolled Courses</h2>

        <Table className="text-black dark:text-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-[#334155]">
              <TableHead>Invoice</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No approved payments yet
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow key={`${row.id}-${row.course}`}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.course}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.payment}</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data.length > perPage && (
        <Pagination className="mt-4 text-black dark:text-white">
          <PaginationContent>

            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => setPage(Math.min(totalPages, page + 1))} />
            </PaginationItem>

          </PaginationContent>
        </Pagination>
        )}

      </div>

    </div>
  );
}
