import { getSessionUser } from "./authSession";

// import { getDiscountPercent, normalizeCoursePricing } from "@/utils/coursePricing";
// import { publicCourseService } from "@/services/publicCourseService";
// import { mapPublicCourseForCard } from "@/utils/mapPublicCourse";

// const KEY_WISHLIST = "wishlist_courses";
// const KEY_CART = "cart_courses";
// const KEY_CART_META = "cart_course_meta";
// const KEY_PUBLISHED_CACHE = "published_courses_cache";
// const KEY_PROGRESS = "learning_progress";

export const CART_CHANGED_EVENT = "lms-cart-changed";
// export const WISHLIST_CHANGED_EVENT = "lms-wishlist-changed";

// function normalizeCourseId(id) {
//   return String(id);
// }

// function notifyWishlistChanged() {
//   window.dispatchEvent(
//     new CustomEvent(WISHLIST_CHANGED_EVENT, {
//       detail: { count: getWishlist().length, ids: getWishlist() },
//     })
//   );
// }

// function notifyCartChanged() {
//   window.dispatchEvent(
//     new CustomEvent(CART_CHANGED_EVENT, { detail: { count: getCart().length } })
//   );
// }

export function isLearnerLoggedIn() {
  const user = getSessionUser();
  return Boolean(user?.role === "user");
}

/** Name/email from login session only — avatar/bio come from API in Settings/header. */
export function getProfile() {
  const account = getSessionUser() || {};
  return {
    fullName: account.name || "",
    email: account.email || "",
    phone: "",
    bio: "",
    avatar: "",
    expertise: "",
    company: "",
    role: account.role || "",
    linkedin: "",
    twitter: "",
    portfolio: "",
  };
}

export function saveProfile() {
  /* Profile is saved via API — not localStorage */
}

// export function getWishlist() {
//   try {
//     const raw = JSON.parse(localStorage.getItem(KEY_WISHLIST)) || [];
//     return raw.map(normalizeCourseId);
//   } catch {
//     return [];
//   }
// }

// export function setWishlist(ids = []) {
//   const next = ids.map(normalizeCourseId);
//   localStorage.setItem(KEY_WISHLIST, JSON.stringify(next));
//   notifyWishlistChanged();
//   return next;
// }

// export function toggleWishlist(courseId) {
//   const id = normalizeCourseId(courseId);
//   const current = getWishlist();
//   const exists = current.includes(id);
//   const next = exists ? current.filter((x) => x !== id) : [...current, id];
//   setWishlist(next);
//   return { next, added: !exists, wishlisted: !exists };
// }

// export function isWishlisted(courseId) {
//   return getWishlist().includes(normalizeCourseId(courseId));
// }

/** Resolve wishlist line items from published API cache + static catalog */
// export function resolveWishlistCourses() {
//   const ids = getWishlist();
//   const published = getPublishedCoursesCache();

//   return ids.map((id) => {
//     const fromPublished = published.find((c) => String(c.id) === id);
//     if (fromPublished) return fromPublished;

//     const fromCatalog = catalog.find((c) => String(c.id) === id);
//     if (fromCatalog) return fromCatalog;

//     return {
//       id,
//       title: `Course #${id}`,
//       thumbnail: "",
//       category: "",
//       price: 1000,
//       lessons: 0,
//     };
//   });
// }

// export function getCart() {
//   const raw = JSON.parse(localStorage.getItem(KEY_CART)) || [];
//   return raw.map((id) => String(id));
// }

// export function setPublishedCoursesCache(courses = []) {
//   localStorage.setItem(KEY_PUBLISHED_CACHE, JSON.stringify(courses));
// }

// export function getPublishedCoursesCache() {
//   try {
//     return JSON.parse(localStorage.getItem(KEY_PUBLISHED_CACHE)) || [];
//   } catch {
//     return [];
//   }
// }

// function getCartMetaMap() {
//   try {
//     return JSON.parse(localStorage.getItem(KEY_CART_META) || "{}");
//   } catch {
//     return {};
//   }
// }

// export function persistCartSnapshot(course) {
//   if (!course?.id) return;
//   const id = String(course.id);
//   const meta = getCartMetaMap();
//   meta[id] = {
//     id,
//     title: course.title || meta[id]?.title || `Course #${id}`,
//     thumbnail: course.thumbnail || meta[id]?.thumbnail || "",
//     category: course.category || meta[id]?.category || "",
//     cover: course.cover || meta[id]?.cover,
//     price: Number(course.price) || Number(meta[id]?.price) || 0,
//     discountPercent: getDiscountPercent(course) || getDiscountPercent(meta[id]),
//   };
//   localStorage.setItem(KEY_CART_META, JSON.stringify(meta));
// }

// function removeCartSnapshot(courseId) {
//   const id = String(courseId);
//   const meta = getCartMetaMap();
//   if (!meta[id]) return;
//   delete meta[id];
//   localStorage.setItem(KEY_CART_META, JSON.stringify(meta));
// }

// function mergeCartSource(id, published, meta, catalogEntry) {
//   const snap = meta[id];
//   const fromPublished = published.find((c) => String(c.id) === id);
//   const base = fromPublished || snap || catalogEntry;

//   if (!base) {
//     return normalizeCoursePricing({
//       id,
//       title: `Course #${id}`,
//       thumbnail: "",
//       category: "",
//       price: 0,
//       discountPercent: 0,
//       lessons: 0,
//       videos: [],
//     });
//   }

//   const price =
//     Number(fromPublished?.price) ||
//     Number(snap?.price) ||
//     Number(catalogEntry?.price) ||
//     0;
//   const discountPercent = getDiscountPercent(
//     fromPublished || snap || catalogEntry
//   );

//   return normalizeCoursePricing({
//     ...base,
//     id,
//     title: base.title || snap?.title || `Course #${id}`,
//     thumbnail: base.thumbnail || snap?.thumbnail || "",
//     category: base.category || snap?.category || "",
//     cover: base.cover || snap?.cover,
//     price,
//     discountPercent,
//   });
// }

/** Resolve cart line items from published API cache + saved snapshots + catalog */
// export function resolveCartCourses() {
//   const ids = getCart();
//   const published = getPublishedCoursesCache();
//   const meta = getCartMetaMap();

//   return ids.map((id) => {
//     const fromCatalog = catalog.find((c) => String(c.id) === id);
//     return mergeCartSource(id, published, meta, fromCatalog);
//   });
// }

/** Load cart items and fetch course price/discount from API when missing */
// export async function hydrateCartCourses() {
//   const items = resolveCartCourses();
//   const ids = getCart();

//   if (!ids.length) return [];

//   let published = getPublishedCoursesCache();
//   if (!published.length) {
//     try {
//       const res = await publicCourseService.getAll();
//       published = (res.data.courses || []).map(mapPublicCourseForCard);
//       setPublishedCoursesCache(published);
//     } catch {
//       published = [];
//     }
//   }

//   const meta = getCartMetaMap();
//   const hydrated = await Promise.all(
//     ids.map(async (id) => {
//       const fromCatalog = catalog.find((c) => String(c.id) === id);
//       let item = mergeCartSource(id, published, meta, fromCatalog);

//       if (item.finalPrice > 0 || item.price > 0) {
//         persistCartSnapshot(item);
//         return item;
//       }

//       try {
//         const res = await publicCourseService.getById(id);
//         const mapped = mapPublicCourseForCard(res.data.course);
//         persistCartSnapshot(mapped);
//         return normalizeCoursePricing(mapped);
//       } catch {
//         return item;
//       }
//     })
//   );

//   return hydrated;
// }

// export function toggleCart(courseId, courseSnapshot) {
//   const id = String(courseId);
//   const current = getCart();
//   const exists = current.includes(id);
//   const next = exists ? current.filter((x) => x !== id) : [...current, id];
//   localStorage.setItem(KEY_CART, JSON.stringify(next));

//   if (exists) {
//     removeCartSnapshot(id);
//   } else if (courseSnapshot) {
//     persistCartSnapshot(courseSnapshot);
//   }

//   notifyCartChanged();
//   return next;
// }

// export function isInCart(courseId) {
//   return getCart().includes(String(courseId));
// }

// export function clearCart() {
//   localStorage.removeItem(KEY_CART);
//   localStorage.removeItem(KEY_CART_META);
//   notifyCartChanged();
// }


// export function getLearningProgress() {
//   return JSON.parse(localStorage.getItem(KEY_PROGRESS)) || {};
// }

// export function saveLearningProgress(progress) {
//   localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
// }

// export function markLessonViewed(courseId, lessonTitle) {
//   if (!courseId || !lessonTitle) return;
//   const progress = getLearningProgress();
//   const current = progress[courseId] || { lessons: [], materials: [], quizzes: [], updatedAt: null };
//   if (!current.lessons.includes(lessonTitle)) current.lessons.push(lessonTitle);
//   current.updatedAt = new Date().toISOString();
//   progress[courseId] = current;
//   saveLearningProgress(progress);
// }

// export function markMaterialOpened(courseId, materialTitle) {
//   if (!courseId || !materialTitle) return;
//   const progress = getLearningProgress();
//   const current = progress[courseId] || { lessons: [], materials: [], quizzes: [], updatedAt: null };
//   if (!current.materials.includes(materialTitle)) current.materials.push(materialTitle);
//   current.updatedAt = new Date().toISOString();
//   progress[courseId] = current;
//   saveLearningProgress(progress);
// }

// export function markQuizCompleted(courseId, quizTitle) {
//   if (!courseId || !quizTitle) return;
//   const progress = getLearningProgress();
//   const current = progress[courseId] || { lessons: [], materials: [], quizzes: [], updatedAt: null };
//   if (!current.quizzes.includes(quizTitle)) current.quizzes.push(quizTitle);
//   current.updatedAt = new Date().toISOString();
//   progress[courseId] = current;
//   saveLearningProgress(progress);
// }
