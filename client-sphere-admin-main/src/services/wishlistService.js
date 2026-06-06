import axiosClient from "@/api/axiosClient";
import ENDPOINTS from "@/api/endpoints";

export const wishlistService = {
  getAll: () => axiosClient.get(ENDPOINTS.WISHLIST.BASE),

  add: (courseId) =>
    axiosClient.post(ENDPOINTS.WISHLIST.BASE, {
      courseId: Number(courseId),
    }),

  remove: (courseId) =>
    axiosClient.delete(ENDPOINTS.WISHLIST.byId(courseId)),
};

export async function toggleWishlistAsync(courseId, wasWishlisted) {
  if (wasWishlisted) {
    await wishlistService.remove(courseId);
    return false;
  }

  await wishlistService.add(courseId);
  return true;
}

export default wishlistService;

// import axiosClient from "@/api/axiosClient";
// import ENDPOINTS from "@/api/endpoints";
// import {
//   getWishlist,
//   isLearnerLoggedIn,
//   setWishlist,
// } from "@/utils/userStore";

// export const wishlistService = {
//   getAll: () => axiosClient.get(ENDPOINTS.WISHLIST.BASE),

//   add: (courseId) =>
//     axiosClient.post(ENDPOINTS.WISHLIST.BASE, { courseId: Number(courseId) }),

//   remove: (courseId) =>
//     axiosClient.delete(ENDPOINTS.WISHLIST.byId(courseId)),
// };

// /** Load wishlist from MySQL and refresh local cache. */
// export async function syncWishlistFromServer() {
//   const res = await wishlistService.getAll();
//   const ids = (res.data.courseIds || []).map(String);
//   setWishlist(ids);
//   return {
//     courseIds: ids,
//     courses: res.data.courses || [],
//   };
// }

// /** Add/remove on server (when logged in) and update local cache. */
// export async function toggleWishlistAsync(courseId) {
//   const id = String(courseId);

//   if (!isLearnerLoggedIn()) {
//     throw new Error("Please login first");
//   }

//   const wasWishlisted = getWishlist().includes(id);

//   if (wasWishlisted) {
//     await wishlistService.remove(id);
//   } else {
//     await wishlistService.add(id);
//   }

//   const data = await syncWishlistFromServer();

//   return data.courseIds.includes(id);
// }

// export default wishlistService;




