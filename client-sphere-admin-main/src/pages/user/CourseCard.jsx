import { Link, useLocation } from "react-router-dom";
import { Star, Clock, BookOpen, Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { isLearnerLoggedIn } from "@/utils/userStore";

import { cartService } from "@/services/cartService";
import { formatRupee } from "@/utils/coursePricing";

import { wishlistService, toggleWishlistAsync } from "@/services/wishlistService";

export function CourseCard({ course, onWishlistChange }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const showPricing = isLearnerLoggedIn();
  
  const [wishlisted, setWishlisted] = useState(false);

  const [inCart, setInCart] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

 
      useEffect(() => {
        const loadWishlist = async () => {
          if (!isLearnerLoggedIn()) {
            setWishlisted(false);
            return;
          }
          try {
            const res = await wishlistService.getAll();
            const ids = (res.data.courseIds || []).map(String);
            setWishlisted(ids.includes(String(course.id)));
          } catch {
            setWishlisted(false);
          }
        };
        loadWishlist();
      }, [course.id]);


  useEffect(() => {
  const checkCart = async () => {
    try {
      const res = await cartService.getMyCart();

      const exists = (res.data.cart || []).some(
        (item) => Number(item.id) === Number(course.id)
      );

      setInCart(exists);
    } catch {
      setInCart(false);
    }
  };

  checkCart();
}, [course.id]);

  
  const handleWishlist = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  // ✅ before login wishlist add avvakudadhu
  if (!isLearnerLoggedIn()) {
    toast.error("Please login to add courses to wishlist");
    return;
  }

  if (wishlistBusy) return;

  setWishlistBusy(true);

 
  try {
  const next = await toggleWishlistAsync(course.id, wishlisted);

  setWishlisted(next);
  onWishlistChange?.(course.id, next);

  // Header refresh kosam
  window.dispatchEvent(new Event("wishlistChanged"));

  toast.success(
    next ? "Added to wishlist" : "Removed from wishlist"
  );
} catch (err) {
    toast.error(
      err.response?.data?.message || "Could not update wishlist"
    );
  } finally {
    setWishlistBusy(false);
  }
};

  const handleCart = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  try {
    if (inCart) {
      await cartService.removeFromCart(course.id);

window.dispatchEvent(
  new Event("cartChanged")
);

setInCart(false);

toast.success("Removed from cart");
      
    } else {
      await cartService.addToCart(course.id);

window.dispatchEvent(
  new Event("cartChanged")
);

setInCart(true);

toast.success("Added to cart");
   
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "Could not update cart"
    );
  }
};

  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/courses/${course.id}`} state={{ from }} className="block group">
        <div className="relative h-32 sm:h-36 overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt="course"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${course.cover}`} />
            )}

            <div className="absolute inset-0 bg-black/10" />

            {course.tag && (
              <Badge className="absolute left-3 top-3 bg-background/95 text-foreground hover:bg-background">
                {course.tag}
              </Badge>
            )}

            <Badge
              variant="secondary"
              className="absolute right-3 top-3 bg-background/90"
            >
              {course.level}
            </Badge>

          </div>
        <div className="p-3 sm:p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            {course.category}
            {course.subCategory ? (
              <span className="text-muted-foreground/80"> · {course.subCategory}</span>
            ) : null}
          </p>

          <h3 className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition">
            {course.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
            {course.description}
          </p>

          <p className="text-xs text-muted-foreground">
            By {course.instructor || "Unknown"}
          </p>
          

          {/* <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-medium">
              {course.rating || 0}
            </span>
              <span className="text-xs text-muted-foreground">
                ({(course.reviews || 0).toLocaleString()})
              </span>
          </div> */}

          {showPricing ? (
            <p className="text-sm font-semibold text-purple-700">
              {formatRupee(course.finalPrice ?? course.price ?? 0)}
              {course.discountPercent > 0 && (
                <span className="text-xs text-muted-foreground line-through ml-1 font-normal">
                  {formatRupee(course.price)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sign in to view pricing</p>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {course.hours || 0}h
            </span>

            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessons || 0} lessons
            </span>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-2 border-t px-4 py-3">
        <Button
          type="button"
          variant={wishlisted ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          disabled={wishlistBusy}
          onClick={handleWishlist}
        >
          <Heart className={`mr-1 h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
          {wishlisted ? "Wishlisted" : "Wishlist"}
        </Button>

       <Button
          type="button"
          variant={inCart ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={handleCart}
        >
          <ShoppingCart className={`mr-1 h-4 w-4 ${inCart ? "fill-current" : ""}`} />
          {inCart ? "Added" : "Add cart"}
        </Button>
      </div>
    </Card>
  );
}


