import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEllipsisV, FaTrash } from "react-icons/fa";
import {
  FaPlus,
  FaUsers,
  FaBookOpen,
  FaClock,
  FaStar,
} from "react-icons/fa";

import useCourses from "@/hooks/useCourses";

export default function AdminCourses() {
  const navigate = useNavigate();

  const { courses, loading, deleteCourse, setCourses } = useCourses();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [sort, setSort] = useState("latest");
  const [openSort, setOpenSort] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleDelete = async (courseId, e) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this course?")) return;

    try {
      await deleteCourse(courseId);
    } catch {
      setCourses((prev) => {
        const updated = prev.filter((c) => c.id !== courseId);
        localStorage.setItem("courses", JSON.stringify(updated));
        return updated;
      });
    }
    setOpenMenuId(null);
  };

  let filtered = courses.filter((c) =>
    (c.title || "").toLowerCase().includes((search || "").toLowerCase())
  );

  if (tab === "Published") {
    filtered = filtered.filter((c) => c.status === "Active");
  }

  if (tab === "Draft") {
    filtered = filtered.filter((c) => c.status !== "Active");
  }

  if (sort === "latest") {
    filtered = [...filtered].sort((a, b) => b.id - a.id);
  }

  if (sort === "oldest") {
    filtered = [...filtered].sort((a, b) => a.id - b.id);
  }

  return (
    <div className="p-6 bg-gray-80 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            placeholder="Search courses..."
            className="w-[300px] border px-4 py-2 rounded-lg shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("All")}
              className={`px-4 py-1 rounded-full text-sm ${
                tab === "All" ? "bg-gray-200" : ""
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTab("Published")}
              className={`px-4 py-1 rounded-full text-sm ${
                tab === "Published" ? "bg-gray-200" : ""
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setTab("Draft")}
              className={`px-4 py-1 rounded-full text-sm ${
                tab === "Draft" ? "bg-gray-200" : ""
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/courses/create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
        >
          <FaPlus />
          New Course
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 mt-10">Loading courses...</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/admin/courses/${course.id}`)}
              className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-44 relative overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt="course"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                )}

                <div className="absolute inset-0 bg-black/20" />

                {/* <span className="absolute left-3 top-3 bg-white px-3 py-1 text-xs rounded-full shadow">
                  {course.category}
                </span> */}

                {/* <div
                  className="absolute right-3 top-3 bg-white p-2 rounded-full cursor-pointer shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === course.id ? null : course.id);
                  }}
                >
                  <FaEllipsisV size={14} />
                </div> */}

                {/* {openMenuId === course.id && (
                  <div
                    className="absolute right-3 top-12 bg-white shadow-lg rounded-lg p-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleDelete(course.id, e)}
                      className="flex items-center gap-2 text-red-500 px-1 py-1 hover:bg-gray-100 rounded"
                    >
                      <FaTrash className="size-3" /> Delete
                    </button>
                  </div>
                )} */}
              </div>
              
              <div className="p-4">
  {/* Category + Status */}
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm text-gray-700">
      {course.category || "Development"}
    </span>
    

    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${
        course.status === "Active"
          ? "bg-green-100 text-green-600"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {course.status === "Active" ? "Published" : "Draft"}
    </span>
  </div>
  {/* Sub Category */}
  <p className="text-sm text-black-600 mb-2">
    .{course.subCategory || course.sub_category}
  </p>

  {/* Title */}
  <h2 className="text-xl font-semibold text-blue-600 leading-snug mb-2">
    {course.title}
  </h2>

  {/* Description */}
  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
    {course.description }
  </p>

  {/* Instructor */}
  <p className="text-sm text-gray-600 mb-3">
    By {course.instructor}
  </p>

  {/* Hours + Lessons */}
  <div className="flex items-center gap-5 text-sm text-gray-500">
    <span className="flex items-center gap-1">
      <FaClock />
      {course.hours || "18h"}
    </span>

    <span className="flex items-center gap-1">
      <FaBookOpen />
      {course.videos?.length || 0} lessons
    </span>
  </div>
</div>
              {/* <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{course.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      course.status === "Active"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {course.status === "Active" ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-xs text-gray-500">By {course.instructor}</p>

                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaUsers /> {course.students || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaBookOpen /> {course.videos?.length || 0} lessons
                  </span>
                </div>
              </div> */}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No courses found</p>
      )}
    </div>
  );
}
