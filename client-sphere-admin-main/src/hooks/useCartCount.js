import { useEffect, useState } from "react";
import { cartService } from "@/services/cartService";
import { useLocation } from "react-router-dom";
import { getSessionUser } from "@/utils/authSession";

export function useCartCount() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  const loadCount = async () => {
    const user = getSessionUser();

    if (!localStorage.getItem("token") || user?.role !== "user") {
      setCount(0);
      return;
    }

    try {
      const res = await cartService.getMyCart();
      const cart = res.data?.cart || [];
      setCount(cart.length);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    loadCount();
  }, [location.pathname]);

  useEffect(() => {
    const handleCartChange = () => loadCount();

    window.addEventListener("cartChanged", handleCartChange);

    return () => {
      window.removeEventListener("cartChanged", handleCartChange);
    };
  }, []);

  return count;
}

// import { useEffect, useState } from "react";
// import { cartService } from "@/services/cartService";
// import { useLocation } from "react-router-dom";

// export function useCartCount() {
//   const [count, setCount] = useState(0);
//   const location = useLocation();

//   const loadCount = async () => {
//     try {
//       const res = await cartService.getMyCart();
//       const cart = res.data?.cart || [];
//       setCount(cart.length);
//     } catch (err) {
//       setCount(0);
//     }
//   };

//   useEffect(() => {
//     loadCount();
//   }, [location.pathname]); // route change ayina prathi sari

//   useEffect(() => {
//     const handleCartChange = () => {
//       loadCount();
//     };

//     window.addEventListener("cartChanged", handleCartChange);

//     return () => {
//       window.removeEventListener("cartChanged", handleCartChange);
//     };
//   }, []);

//   return count;
// }





// import { useEffect, useState } from "react";
// import { CART_CHANGED_EVENT, getCart } from "@/utils/userStore";

// export function useCartCount() {
//   const [count, setCount] = useState(() => getCart().length);

//   useEffect(() => {
//     const sync = () => setCount(getCart().length);

//     window.addEventListener(CART_CHANGED_EVENT, sync);
//     window.addEventListener("storage", (e) => {
//       if (e.key === "cart_courses") sync();
//     });

//     return () => {
//       window.removeEventListener(CART_CHANGED_EVENT, sync);
//     };
//   }, []);

//   return count;
// }

// export default useCartCount;
