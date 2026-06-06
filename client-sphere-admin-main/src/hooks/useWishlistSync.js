import { useEffect } from "react";
import { isLearnerLoggedIn } from "@/utils/userStore";
import { syncWishlistFromServer } from "@/services/wishlistService";

/** Pull wishlist from database when a logged-in learner opens the app shell. */
export function useWishlistSync() {
  useEffect(() => {
    if (!isLearnerLoggedIn()) return;

    let cancelled = false;

    (async () => {
      try {
        await syncWishlistFromServer();
      } catch {
        /* keep local cache if API unavailable */
      }
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}

export default useWishlistSync;
