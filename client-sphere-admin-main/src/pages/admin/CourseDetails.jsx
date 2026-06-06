import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getCourses } from "../../utils/storage";
import { buildCoursePayload } from "@/utils/buildCoursePayload";
import { courseService } from "@/services/courseService";

import { 
  FaFileAlt, 
  FaVideo, 
  FaTrash, 
  FaPlus, 
  FaEdit, 
  FaBookOpen ,
  FaUsers, 
  FaClock, 
} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";

import Step1 from "../../components/coursecomponents/Step1BasicInfo";
import Step2 from "../../components/coursecomponents/Step2Videos";
import Step3 from "../../components/coursecomponents/Step3Materials";
import Step4 from "../../components/coursecomponents/Step4Quiz";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");
  const [editQuizIndex, setEditQuizIndex] = useState(null);
  const [editVideoIndex, setEditVideoIndex] = useState(null);
  const [editMaterialIndex, setEditMaterialIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const seq = ++loadSeqRef.current;

    const load = async () => {
      setLoading(true);
      try {
        const res = await courseService.getById(id);
        if (!cancelled && seq === loadSeqRef.current) {
          setCourse(res.data.course);
        }
        return;
      } catch {
        /* fallback to local */
      }

      const all = getCourses();
      const found = all.find((c) => String(c.id) === String(id));
      if (!cancelled && seq === loadSeqRef.current) {
        setCourse(found || null);
      }
    };

    load().finally(() => {
      if (!cancelled && seq === loadSeqRef.current) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const saveCourseToDb = async (nextCourse) => {
    setSaving(true);
    try {
      const payload = buildCoursePayload(nextCourse);
      const res = await courseService.update(nextCourse.id, payload);
      loadSeqRef.current += 1;
      setCourse(res.data.course);
      return res.data.course;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update course in database");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteCourseFromDb = async () => {
    if (!window.confirm("Delete this course?")) return;
    setSaving(true);
    try {
      await courseService.delete(course.id);
      alert("Course deleted");
      navigate("/courses");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    } finally {
      setSaving(false);
    }
  };

  const togglePublishStatus = async () => {
    const isPublished = course.status === "Active";
    const nextStatus = isPublished ? "Draft" : "Active";
    const actionLabel = isPublished ? "move this course to draft" : "publish this course";

    if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;

    try {
      await saveCourseToDb({ ...course, status: nextStatus });
      alert(isPublished ? "Course moved to draft" : "Course published");
    } catch {
      /* saveCourseToDb already shows error */
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button onClick={() => navigate("/courses")} className="text-sm text-gray-600">
          ← All courses
        </button>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow text-gray-500">
          Loading course…
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <button onClick={() => navigate("/courses")} className="text-sm text-gray-600">
          ← All courses
        </button>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Course not found</h2>
          <p className="mt-2 text-sm text-gray-500">
            This course id doesn’t exist in storage. Please go back and open a valid course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 min-w-0 overflow-x-hidden">

      {/* HEADER */}
      <button onClick={() => navigate("/courses")}>
        ← All courses
      </button>

     <div className="bg-white rounded-2xl shadow overflow-hidden">

  {/* HERO */}
  {/* <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500" /> */}
        <div className="h-72 w-full overflow-hidden rounded-xl relative">

  {course.thumbnail ? (
    <img
      src={course.thumbnail}
      alt="course"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
  )}

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/20" />

</div>

  {/* INFO */}
  <div className="p-6 space-y-3">

    <div className="flex justify-between items-start gap-4 min-w-0">

      <div className="min-w-0 flex-1">
        {/* CATEGORY + SUBCATEGORY */}
<div className="flex items-center gap-2 flex-wrap mb-3">

  <span className="bg-gray-100 text-black-700 px-3 py-1 text-xs rounded-full">
    {course.category }
  </span>

  <span className="bg-blue-100 text-blue-600 px-3 py-1 text-xs rounded-full">
    {course.subCategory || course.sub_category }
  </span>

  <span
    className={`px-3 py-1 text-xs rounded-full ${
      course.status === "Active"
        ? "bg-green-100 text-green-600"
        : "bg-gray-200 text-gray-600"
    }`}
  >
    {course.status === "Active" ? "Published" : "Draft"}
  </span>
</div>

{/* TITLE */}
<h1 className="text-2xl font-bold text-gray-800 mb-2 break-words">
  {course.title}
</h1>

{/* DESCRIPTION */}
<p className="text-gray-500 text-sm leading-relaxed mb-3 break-words">
  {course.description}
</p>

{/* INSTRUCTOR */}
<p className="text-gray-700 text-sm mb-4">
  By <span className="font-semibold">{course.instructor}</span>
</p>

{/* STATS */}
<div className="flex items-center gap-6 flex-wrap text-sm text-gray-600">

  {/* LESSONS */}
  <div className="flex items-center gap-2">
    <FaBookOpen className="text-blue-500" />
    <span>{course.videos?.length || 0} Lessons</span>
  </div>

  {/* HOURS */}
  <div className="flex items-center gap-2">
    <FaClock className="text-purple-500" />
    <span>{course.hours || "18"} Hours</span>
  </div>

  {/* STUDENTS */}
  <div className="flex items-center gap-2">
    <FaUsers className="text-pink-500" />
    <span>{course.students || 0} Students</span>
  </div>

</div>
        
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 shrink-0 flex-wrap justify-end">
        <button
          onClick={() => setShowEdit(true)}
          className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
          disabled={saving}
        >
          <FaEdit className="text-sm" /> Edit
        </button>

        <button
          onClick={deleteCourseFromDb}
          className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-50 text-red-600"
          disabled={saving}
        >
           <FaTrash /> Delete
        </button>

        <button
          onClick={togglePublishStatus}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white disabled:opacity-60 ${
            course.status === "Active"
              ? "bg-gray-700 hover:bg-gray-800"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={saving}
        >
          {course.status === "Active" ? (
            <>
              <FaEyeSlash /> Move to Draft
            </>
          ) : (
            <>
              <FaEye /> Publish
            </>
          )}
        </button>
      </div>
    </div>
  </div>
</div>
      

      {/* TABS */}
      <div className="flex gap-2 bg-gray-200 p-1 rounded-lg w-fit">
            <button
                onClick={() => setActiveTab("materials")}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
                ${activeTab === "materials" ? "bg-white shadow font-semibold" : "text-gray-500"}
                `}
            >
                <FaFileAlt /> Materials
            </button>

            <button
                onClick={() => setActiveTab("videos")}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
                ${activeTab === "videos" ? "bg-white shadow font-semibold" : "text-gray-500"}
                `}
            >
                <FaVideo /> Videos
            </button>

            <button
                onClick={() => setActiveTab("quiz")}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
                ${activeTab === "quiz" ? "bg-white shadow font-semibold" : "text-gray-500"}
                `}
            >
                <FaBookOpen /> Quizzes
            </button>     

            </div>




      {/* MATERIALS */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        {activeTab === "materials" && (
          <div className="bg-white p-6 rounded-2xl shadow">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg">Course materials</h3>
                <p className="text-sm text-gray-500">
                  PDFs, slides, and supporting documents.
                </p>
              </div>

              <button
        onClick={() => {
          setEditMaterialIndex(null);
          setShowMaterial(true);
        }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
                disabled={saving}
              >
                <FaPlus /> Add material
              </button>
            </div>

            {/* LIST */}
            <div className="divide-y">

              {course.materials?.map((m, i) => {
                const fileType = m.type || m.file?.name?.split(".").pop()?.toUpperCase() || "FILE";

                // ⏱ TIME AGO FUNCTION
                const timeAgo = (date) => {
                  if (!date) return "Just now";
                  const diff = Date.now() - new Date(date).getTime();
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor(diff / (1000 * 60 * 60));

                  if (days > 0) return `${days}d ago`;
                  if (hours > 0) return `${hours}h ago`;
                  return "Just now";
                };

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4">

                      {/* ICON */}
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <FaFileAlt className="text-purple-600 text-lg" />
                      </div>

                      {/* TEXT */}
                      <div>
                        <p className="font-medium text-gray-800 break-words">
                          {m.title || m.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {fileType} • {m.size || "2.4 MB"} • {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* DELETE */}
                    <div className="flex items-center gap-3">

  {/* VIEW */}
  {m.url && (
    <a
      href={m.url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-500 text-sm hover:underline"
    >
      View
    </a>
  )}

  {/* EDIT */}
  <button
    onClick={() => {
      setEditMaterialIndex(i);
      setShowMaterial(true);
    }}
    className="text-gray-400 hover:text-blue-600 transition"
    disabled={saving}
    title="Edit"
  >
    <FaEdit />
  </button>

  {/* DELETE */}
  <button
    onClick={async () => {
      if (!window.confirm("Delete this material?")) return;
      const updated = {
        ...course,
        materials: (course.materials || []).filter((_, idx) => idx !== i),
      };
      await saveCourseToDb(updated);
    }}
    className="text-gray-400 hover:text-red-500 transition"
    disabled={saving}
  >
    <FaTrash />
  </button>

</div>
                    {/* <button
                      onClick={() => {
                        const updated = {
                          ...course,
                          materials: course.materials.filter((_, idx) => idx !== i),
                        };

                        const all = getCourses().map((c) =>
                          c.id === course.id ? updated : c
                        );

                        localStorage.setItem("courses", JSON.stringify(all));
                        setCourse(updated);
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FaTrash />
                    </button> */}
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {activeTab === "videos" && (
  <div className="bg-white p-6 rounded-2xl shadow">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-5">
      <div>
        <h3 className="font-semibold text-lg">Course videos</h3>
        <p className="text-sm text-gray-500">
          Lectures and tutorials your students will watch.
        </p>
      </div>

      <button
        onClick={() => {
          setEditVideoIndex(null);
          setShowVideo(true);
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
        disabled={saving}
      >
        <FaPlus /> Add video
      </button>
    </div>

    {/* GRID */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

      {course.videos?.map((v, i) => {

        // ⏱ TIME AGO
        const timeAgo = (date) => {
          if (!date) return "Just now";
          const diff = Date.now() - new Date(date).getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(diff / (1000 * 60 * 60));

          if (days > 0) return `${days}d ago`;
          if (hours > 0) return `${hours}h ago`;
          return "Just now";
        };

        return (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition cursor-pointer overflow-hidden"
          >

            {/* VIDEO THUMB */}
            {/* <div
              className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center relative"
              onClick={() => window.open(v.url, "_blank")}
            >
              <FaPlay className="text-white text-3xl opacity-80" />

              <span className="absolute bottom-2 right-2 text-xs bg-black/80 text-white px-2 py-1 rounded">
                {v.duration || "0:00"}
              </span>
            </div> */}
            <div
              className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center relative"
            >
              {v.url ? (
                <video controls className="w-full h-full object-cover">
                  <source src={v.url} />
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <FaPlay className="text-3xl opacity-80" />
                </div>
              )}

              <span className="absolute bottom-2 right-2 text-xs bg-black/80 text-white px-2 py-1 rounded">
                {v.duration || "0:00"}
              </span>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-1">

              {/* TITLE */}
              <p className="font-medium text-gray-800 line-clamp-2 break-words">
                {v.title}
              </p>

              {/* META */}
              <p className="text-sm text-gray-500">
                {v.views || 0} views • {timeAgo(v.createdAt)}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-end pt-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditVideoIndex(i);
                    setShowVideo(true);
                  }}
                  className="text-gray-400 hover:text-blue-600 transition"
                  disabled={saving}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!window.confirm("Delete this video?")) return;
                    const updated = {
                      ...course,
                      videos: (course.videos || []).filter((_, idx) => idx !== i),
                    };
                    saveCourseToDb(updated);
                  }}
                  className="text-gray-400 hover:text-red-500 transition"
                  disabled={saving}
                >
                  <FaTrash />
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

        {/* QUIZ POPUP */}
        {activeTab === "quiz" && (
  <div className="bg-white p-6 rounded-2xl shadow">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-5">
      <div>
        <h3 className="font-semibold text-lg">Quizzes</h3>
        <p className="text-sm text-gray-500">
          Assess what your students have learned.
        </p>
      </div>

      <button
        onClick={() => {
          setEditQuizIndex(null);
          setShowQuiz(true);
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
      >
        <FaPlus /> Add quiz
      </button>
    </div>

    {/* LIST */}
    <div className="divide-y">

      {/* {course.quizzes?.map((quiz, i) => ( */}
      {(course.quizzes || []).map((quiz, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-4"
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">

            {/* ICON */}
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaListCheck className="text-purple-600 text-lg" />
            </div>

            {/* TEXT */}
            <div>
              <p className="font-medium text-gray-800 break-words">
                {quiz.quizTitle}
              </p>

              <p className="text-sm text-gray-500">
                {quiz.questions?.length || 0} questions • {quiz.attempts || 0} attempts • {quiz.passRate || 0}% pass rate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditQuizIndex(i);
                setShowQuiz(true);
              }}
              className="px-4 py-1 border rounded-lg text-sm hover:bg-gray-100"
              disabled={saving}
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (!window.confirm("Delete this quiz?")) return;
                const updated = {
                  ...course,
                  quizzes: (course.quizzes || []).filter((_, idx) => idx !== i),
                };
                await saveCourseToDb(updated);
              }}
              className="px-3 py-1 border rounded-lg text-sm hover:bg-red-50 text-red-600"
              disabled={saving}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

    </div>
  </div>
)}
        {/* {activeTab === "quiz" && (
        <div className="bg-white p-6 rounded-xl shadow space-y-3">

            <div className="flex justify-between">
            <div>
                <h3 className="font-semibold">Quizzes</h3>
                <p className="text-sm text-gray-500">
                Assess what your students have learned.
                </p>
            </div>

            <button
                onClick={() => setShowQuiz(true)}
                className="bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-2"
            >
                <FaPlus />  Add quiz
            </button>
            </div>

            {course.questions?.map((q, i) => (
            <div key={i} className="border p-3 rounded flex justify-between">
                <p>Quiz {i + 1}</p>

               
                <button
                    onClick={() => {
                        setEditQuizIndex(i);
                        setShowQuiz(true);
                    }}
                    className="flex items-center gap-1 text-blue-500"
                    >
                     <FaEdit /> Edit
                    </button>
            </div>
            ))}

        </div>
        )} */}
      </div>



  {showMaterial && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">

    {/* GAP */}
    <div className="w-full h-full flex items-center justify-center p-[5%]">

      {/* MODAL BOX */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl 
                      flex flex-col max-h-[80vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="font-semibold text-lg">
            {editMaterialIndex !== null ? "Edit Material" : "Add Material"}
          </h2>

          <button
            onClick={() => {
              setShowMaterial(false);
              setEditMaterialIndex(null);
            }}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* SCROLL AREA */}
        <div className="overflow-y-auto p-4 flex-1 min-h-0">

          <Step3
            data={
              editMaterialIndex !== null
                ? { ...course, materials: [course.materials?.[editMaterialIndex]] }
                : {}
            }
            isModal={true}
            isEdit={editMaterialIndex !== null}
            onNext={async (res) => {
              const incoming = res.materials || [];
              let nextMaterials = [...(course.materials || [])];
              if (editMaterialIndex !== null) {
                if (incoming[0]) {
                  nextMaterials[editMaterialIndex] = {
                    ...course.materials?.[editMaterialIndex],
                    ...incoming[0],
                  };
                }
              } else {
                nextMaterials = [...nextMaterials, ...incoming];
              }
              const updated = {
                ...course,
                materials: nextMaterials,
              };
              await saveCourseToDb(updated);
              setShowMaterial(false);
              setEditMaterialIndex(null);
            }}
          />

        </div>

      </div>

    </div>

  </div>
)}


{showVideo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">

    <div className="w-full h-full flex items-center justify-center p-[5%]">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden">

        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="font-semibold text-lg">
            {editVideoIndex !== null ? "Edit Video" : "Add Video"}
          </h2>

          <button
            onClick={() => {
              setShowVideo(false);
              setEditVideoIndex(null);
            }}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1 min-h-0">

          <Step2
            data={
              editVideoIndex !== null
                ? { ...course, videos: [course.videos?.[editVideoIndex]] }
                : {}
            }
            isModal={true}
            isEdit={editVideoIndex !== null}
            onNext={async (res) => {
              const incoming = res.videos || [];
              let nextVideos = [...(course.videos || [])];
              if (editVideoIndex !== null) {
                if (incoming[0]) {
                  nextVideos[editVideoIndex] = {
                    ...course.videos?.[editVideoIndex],
                    ...incoming[0],
                  };
                }
              } else {
                nextVideos = [...nextVideos, ...incoming];
              }
              const updated = { ...course, videos: nextVideos };
              await saveCourseToDb(updated);
              setShowVideo(false);
              setEditVideoIndex(null);
            }}
          />

        </div>

      </div>

    </div>

  </div>
)}


{showQuiz && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">

    {/* GAP */}
    <div className="w-full h-full flex items-center justify-center p-[5%]">

      {/* MODAL BOX */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl 
                      flex flex-col max-h-[80vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="font-semibold text-lg">
            {editQuizIndex !== null ? "Edit Quiz" : "Add Quiz"}
          </h2>

          <button
            onClick={() => {
              setShowQuiz(false);
              setEditQuizIndex(null);
            }}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* SCROLL AREA */}
        <div className="overflow-y-auto p-5 flex-1 min-h-0">
            <Step4
              data={
                editQuizIndex !== null
                  ? course.quizzes?.[editQuizIndex]
                  : {}
              }
              isModal={true}
              isEdit={editQuizIndex !== null}
              onNext={(res) => {
            let updatedQuizzes = [...(course.quizzes || [])];
            const existingQuiz =
              editQuizIndex !== null ? course.quizzes?.[editQuizIndex] : null;
            const incomingQuiz =
              res?.quizzes?.[0] ||
              (res?.questions
                ? {
                    quizTitle: res.quizTitle || "Quiz",
                    questions: res.questions,
                    attempts: res.attempts || 0,
                    passRate: res.passRate || 0,
                  }
                : null);

            if (!incomingQuiz) {
              setShowQuiz(false);
              setEditQuizIndex(null);
              return;
            }

            if (editQuizIndex !== null) {
              updatedQuizzes[editQuizIndex] = {
                ...existingQuiz,
                ...incomingQuiz,
              };
            } else {
              updatedQuizzes.push(incomingQuiz);
            }

            const updated = {
              ...course,
              quizzes: updatedQuizzes,
            };
            saveCourseToDb(updated)
              .then(() => {
                setShowQuiz(false);
                setEditQuizIndex(null);
              })
              .catch(() => {});
          }}
            
            />
        </div>
      </div>
    </div>
  </div>
)}


{/* edit create course */}
{showEdit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">

    {/* GAP SPACE */}
    <div className="w-full h-full flex items-center justify-center p-[5%]">

      {/* MODAL BOX */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl 
                      flex flex-col max-h-[80vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Edit Course</h2>

          <button
            onClick={() => setShowEdit(false)}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* SCROLL AREA */}
        <div className="overflow-y-auto p-5">

          <Step1
            data={course}
            isModal={true}
            onNext={async (updated) => {
              const newCourse = { ...course, ...updated };
              await saveCourseToDb(newCourse);
              setShowEdit(false);
            }}
          />

        </div>

      </div>

    </div>

  </div>
)}


    </div>
  );
}