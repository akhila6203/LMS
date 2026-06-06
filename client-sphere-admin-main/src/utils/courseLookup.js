import { getCourses } from "@/utils/storage";
import { catalog } from "@/lib/catalog";

function thumbnailFromId(id) {
  return `https://picsum.photos/seed/course-${id}/1200/675`;
}

function categoryToCover(category) {
  switch (category) {
    case "Development":
      return "from-violet-500 to-fuchsia-500";
    case "Business":
      return "from-amber-500 to-orange-400";
    case "Data Science":
      return "from-sky-500 to-cyan-400";
    case "Design":
      return "from-pink-500 to-rose-400";
    case "Marketing":
      return "from-emerald-500 to-teal-400";
    case "IT & Software":
      return "from-indigo-500 to-blue-500";
    default:
      return "from-slate-700 to-slate-900";
  }
}

export function getStoredCourseById(id) {
  const all = getCourses();
  return all.find((c) => String(c.id) === String(id)) || null;
}

export function getCatalogCourseById(id) {
  return catalog.find((c) => String(c.id) === String(id)) || null;
}

export function getUnifiedCourse(id) {
  const stored = getStoredCourseById(id);
  if (stored) {
    return {
      source: "storage",
      id: stored.id,
      title: stored.title,
      category: stored.category || "Development",
      instructor: stored.instructor || "Instructor",
      level: stored.level || "Beginner",
      description: stored.description || "",
      rating: stored.rating ?? 4.7,
      reviews: stored.reviews ?? 0,
      tag: stored.status === "Active" ? "Published" : "Draft",
      cover: stored.cover || categoryToCover(stored.category),
      thumbnail: stored.thumbnail || thumbnailFromId(stored.id),
      hours: stored.hours ?? 0,
      lessons: stored.videos?.length ?? 0,
      videos: stored.videos || [],
      materials: stored.materials || [],
      quizzes: stored.quizzes || [],
    };
  }

  const cat = getCatalogCourseById(id);
  if (!cat) return null;
  return {
    source: "catalog",
    ...cat,
    thumbnail: cat.thumbnail || thumbnailFromId(cat.id),
    videos: [],
    materials: [],
    quizzes: [],
  };
}

