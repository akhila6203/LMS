import { parseCourseLabels } from "@/lib/courseLabels";
import { lineTotal } from "@/utils/coursePricing";

const DEFAULT_PREVIEW_COUNT = 4;

function normalizeOverview(overview) {
  if (!overview) return [];

  if (Array.isArray(overview)) return overview;

  if (typeof overview === "string") {
    try {
      const parsed = JSON.parse(overview);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return overview
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/** Parse "m:ss" or "h:mm:ss" into fractional hours for display */
export function durationToHours(duration) {
  if (!duration || typeof duration !== "string") return 0;
  const parts = duration.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] + parts[1] / 60 + parts[2] / 3600;
  }
  if (parts.length === 2) {
    return parts[0] / 60 + parts[1] / 3600;
  }
  return 0;
}

export function sumVideoHours(videos = []) {
  const total = videos.reduce((acc, v) => acc + durationToHours(v.duration), 0);
  return total > 0 ? Math.max(1, Math.round(total)) : 0;
}

/** Shape API course for public CourseCard / listing */
export function mapPublicCourseForCard(course) {
  const videos = course.videos || [];
  const lessonCount =
    course.lessonCount ?? course.lessons ?? videos.length ?? 0;
  const labels = parseCourseLabels(course);

  return {
    ...course,
    overview: normalizeOverview(course.overview),
    id: course.id,
    labels,
    subCategory: course.subCategory || course.sub_category || "",
    lessons: lessonCount,
    hours:
      course.hours ??
      (sumVideoHours(videos) || Math.max(1, lessonCount)),
    rating: course.rating ?? 4.8,
    reviews: course.reviews ?? course.students ?? 0,
    cover: course.cover ?? "from-purple-500 to-indigo-600",
    tag: course.tag ?? labels.find((l) => l !== course.level) ?? labels[0] ?? "Popular",
    status: course.status,
    price: Number(course.price) || 0,
    discountPercent: Number(course.discountPercent ?? course.discount_percent) || 0,
    finalPrice: lineTotal(
      course.price,
      course.discountPercent ?? course.discount_percent
    ),
  };
}

export function mapPublicCourseDetail(course) {
  const previewCount = course.previewLessonCount ?? DEFAULT_PREVIEW_COUNT;
  const videos = (course.videos || []).map((v, i) => ({
    id: String(i + 1),
    title: v.title || `Lesson ${i + 1}`,
    duration: v.duration || "",
    url: v.url || "",
    free: v.free ?? i < previewCount,
    locked: v.locked ?? i >= previewCount,
  }));

  const lessonCount = videos.length;
  const hours = sumVideoHours(course.videos) || Math.max(1, lessonCount);

  return {
    ...mapPublicCourseForCard(course),
    videos: course.videos || [],
    curriculum: videos,
    lessons: lessonCount,
    hours,
  };
}
