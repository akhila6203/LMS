import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Lock,
  Star,
  Clock,
  BookOpen,
  FileText,
  ListChecks,
  Check,
  Award,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
// import { ShoppingCart } from "lucide-react";
import VideoPlayer from "../../pages/user/VideoPlayer";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { publicCourseService } from "@/services/publicCourseService";
import { mapPublicCourseDetail } from "@/utils/mapPublicCourse";
// import { toggleCart, isInCart, isLearnerLoggedIn } from "@/utils/userStore";
import { isLearnerLoggedIn } from "@/utils/userStore";
import { cartService } from "@/services/cartService";

const FALLBACK_VIDEO =
  "https://cdn.pixabay.com/video/2016/09/21/5456-183788693_medium.mp4";

export default function PublicCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [tab, setTab] = useState("overview");
  const [cartAdded, setCartAdded] = useState(false);

  const isLoggedIn = isLearnerLoggedIn();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await publicCourseService.getById(id);
        if (!cancelled) {
          const mapped = mapPublicCourseDetail(res.data.course);
          setCourse(mapped);
          setActiveLessonIndex(0);

          if (isLearnerLoggedIn()) {
            try {
              const cartRes = await cartService.getMyCart();
              const exists = (cartRes.data.cart || []).some(
                (item) => Number(item.id) === Number(mapped.id)
              );
              setCartAdded(exists);
            } catch {
              setCartAdded(false);
            }
          } else {
            setCartAdded(false);
          }
          // setCourse(mapped);
          // setCartAdded(isInCart(mapped.id));
          // setActiveLessonIndex(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setCourse(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleProtected = () => {
    if (!isLoggedIn) navigate(`/login?redirect=/courses/${id}`);
    else navigate(`/courses/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-background">
        <p className="text-muted-foreground">Loading course…</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 min-h-screen bg-gray-100">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-4 text-sm text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>
        <h2 className="text-lg font-semibold">Course not found</h2>
        <p className="text-sm text-gray-500 mt-2">
          This course may be unpublished or does not exist.
        </p>
      </div>
    );
  }

  const curriculum = course.curriculum || [];
  const activeLesson = curriculum[activeLessonIndex];
  const previewSrc =
    activeLesson?.free && activeLesson?.url
      ? activeLesson.url
      : curriculum[0]?.url || FALLBACK_VIDEO;
  const previewTitle = activeLesson?.title || curriculum[0]?.title || "Demo lesson";
  const previewDuration =
    activeLesson?.duration || curriculum[0]?.duration || "";

  return (
    <PageWithFooter>
    <div className="w-full space-y-5 sm:space-y-6">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-4 text-sm text-gray-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </button>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-5 xl:gap-6">
        <div className="w-full min-w-0 space-y-6">
          <div className="w-full overflow-hidden rounded-xl bg-white shadow ring-1 ring-border/40">
            <VideoPlayer
              src={previewSrc}
              title={previewTitle}
              subtitle={previewDuration}
              badge="Free preview"
              className="min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[400px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-purple-50 border border-purple-200 p-4 rounded-xl">
  <div className="flex gap-3">
    <Lock className="text-purple-600 shrink-0" />
    <div>
      <p className="font-semibold text-sm">
        Preview: first 4 lessons free
      </p>
      <p className="text-xs text-gray-500">
        Login to continue learning this course.
      </p>
    </div>
  </div>

  <button
    type="button"
    onClick={handleProtected}
    className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-5 py-2 rounded-lg text-sm"
  >
    Continue
  </button>
</div>
          {/* <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-purple-50 border border-purple-200 p-4 rounded-xl">
            <div className="flex gap-3">
              <Lock className="text-purple-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  Preview: first 4 lessons free
                </p>
                <p className="text-xs text-gray-500">
                  Sign in to continue free lessons, add to cart, and unlock the full course.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleProtected}
                className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-5 py-2 rounded-lg text-sm"
              >
                {isLoggedIn ? "Continue learning" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate(`/login?redirect=/courses/${id}`);
                    return;
                  }
                  toggleCart(course.id, course);
                  setCartAdded(true);
                  navigate("/cart");
                }}
                className="border border-purple-200 text-purple-700 px-5 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartAdded ? "Go to cart" : "Add to cart"}
              </button>
            </div>
          </div> */}

          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                {course.category}
              </span>
              {course.subCategory && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                  {course.subCategory}
                </span>
              )}
              <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                {course.level}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {course.title}
            </h1>

            <p className="text-gray-500 mt-2 text-sm">{course.description}</p>

            <div className="flex flex-wrap gap-3 mt-3 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {course.rating} ({course.reviews})
              </span>
              <span className="flex gap-1 items-center">
                <Clock className="h-4 w-4" />
                {course.hours}h
              </span>
              <span className="flex gap-1 items-center">
                <BookOpen className="h-4 w-4" />
                {course.lessons} lessons
              </span>
              <span className="text-gray-500">
                By <span className="font-medium">{course.instructor}</span>
              </span>
            </div>
          </div>

          {/* TABS */}
          <div className="flex w-full justify-start gap-2 overflow-x-auto rounded-xl bg-gray-200 p-1">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={`px-4 py-1.5 rounded-lg text-sm flex items-center gap-1 transition whitespace-nowrap ${
                tab === "overview"
                  ? "bg-white shadow text-black font-medium"
                  : "text-gray-600"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setTab("materials")}
              className={`px-4 py-1.5 rounded-lg text-sm flex items-center gap-1 transition whitespace-nowrap ${
                tab === "materials"
                  ? "bg-white shadow text-black font-medium"
                  : "text-gray-600"
              }`}
            >
              <FileText className="h-4 w-4" /> Materials
            </button>
            <button
              type="button"
              onClick={() => setTab("quiz")}
              className={`px-4 py-1.5 rounded-lg text-sm flex items-center gap-1 transition whitespace-nowrap ${
                tab === "quiz"
                  ? "bg-white shadow text-black font-medium"
                  : "text-gray-600"
              }`}
            >
              <ListChecks className="h-4 w-4" /> Quizzes
            </button>
          </div>

          {tab === "overview" && (
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-4">What you'll learn</h3>
              <ul className="space-y-2 text-sm">
                  {(course.overview?.length ? course.overview : ["No overview added"]).map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {b}
                    </li>
                  ))}
                </ul>
            </div>
          )}

          {tab === "materials" && (
            <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <FileText className="text-gray-500" />
              </div>
              <h3 className="font-medium text-sm">Course materials are locked</h3>
              <p className="text-xs text-gray-500 mt-1">
                Sign in to download module PDFs, code samples and reference sheets.
              </p>
              <button
                type="button"
                onClick={handleProtected}
                className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-5 py-2 rounded-lg text-sm"
              >
                Continue
              </button>
            </div>
          )}

          {tab === "quiz" && (
            <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <ListChecks className="text-gray-500" />
              </div>
              <h3 className="font-medium text-sm">Quizzes are locked</h3>
              <p className="text-xs text-gray-500 mt-1">
                Sign in to take module knowledge checks and the final quiz.
              </p>
              <button
                type="button"
                onClick={handleProtected}
                className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-5 py-2 rounded-lg text-sm"
              >
                Continue
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-4 lg:mt-0">
          <div className="bg-white p-5 rounded-xl shadow space-y-3">
            <h3 className="text-sm font-semibold">Get full access</h3>
            <p className="text-xs text-gray-500">
              {isLoggedIn
                ? "Add this course to your cart and complete checkout to unlock all content."
                : "Sign in to purchase and unlock all lessons, materials, and quizzes."}
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!isLoggedIn) {
                  navigate(`/login?redirect=/courses/${id}`);
                  return;
                }
                if (cartAdded) {
  navigate("/cart");
  return;
}

try {
  await cartService.addToCart(course.id);
  window.dispatchEvent(new Event("cartChanged"));
  setCartAdded(true);
  navigate("/cart");
} catch (err) {
  console.log(err);
}
                // toggleCart(course.id, course);
                // setCartAdded(true);
                // navigate("/cart");
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white py-2 rounded-lg text-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartAdded ? "Go to cart" : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={handleProtected}
              className="w-full border py-2 rounded-lg text-sm"
            >
              {isLoggedIn ? "Continue learning" : "Sign in"}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b text-sm font-semibold">
              Curriculum
              <p className="text-xs text-gray-400 font-normal">
                {curriculum.length} lessons · {course.hours}h total
              </p>
            </div>

            {curriculum.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No lessons added yet.</p>
            ) : (
              curriculum.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  disabled={!l.free}
                  onClick={() => {
                    if (l.free) setActiveLessonIndex(i);
                    else handleProtected();
                  }}
                  className={`w-full flex justify-between items-start sm:items-center gap-2 p-4 border-b text-xs sm:text-sm text-left transition ${
                    !l.free ? "opacity-90 cursor-pointer" : "hover:bg-purple-50"
                  } ${activeLessonIndex === i && l.free ? "bg-purple-50" : ""}`}
                >
                  <div className="flex gap-2 items-center">
                    {l.free ? (
                      <Play className="text-purple-600 h-4 w-4 shrink-0" />
                    ) : (
                      <Lock className="text-gray-400 h-4 w-4 shrink-0" />
                    )}
                    <span>{l.title}</span>
                  </div>
                  <span className="text-gray-400 shrink-0">{l.duration}</span>
                </button>
              ))
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Earn a certificate</h3>
              <p className="text-xs text-gray-500 mt-1">
                Complete all lessons and the final quiz to receive your verified certificate.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
    </PageWithFooter>
  );
}
