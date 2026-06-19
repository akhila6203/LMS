import {
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  BookOpen,
} from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useHeaderProfile } from "@/hooks/useHeaderProfile";
import HeaderSearch from "@/components/HeaderSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logo from "../assets/photos/logo.png";

export function TopHeader() {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const sessionUser = user || {
    name: "Learner",
    email: "learner@example.com",
    role: "user",
  };
  const isAdmin = sessionUser?.role === "admin";
  const { name: nameText, email: emailText, avatar: avatarSrc } =
    useHeaderProfile();

  const location = useLocation();
  const path = location.pathname;
  const settingsTab = new URLSearchParams(location.search).get("tab");

let title = "Dashboard";

if (path.startsWith("/admin/classes/")) {
  title = "Class Detail";
} else if (path.startsWith("/classes/create")) {
  title = "Create Class";
} else if (path.startsWith("/classes/")) {
  title = "Class Detail";
} else if (path.startsWith("/classes")) {
  title = "Classes";
} else if (path.startsWith("/dashboard")) {
  title = "Dashboard";
} else if (path.startsWith("/students")) {
  title = "Students";
} else if (path.startsWith("/materials")) {
  title = "Materials";
} else if (path.startsWith("/admin/banners")) {
  title = "Banners";
} else if (path.startsWith("/admin/home-video")) {
  title = "Home Videos";
} else if (path.startsWith("/subjects")) {
  title = "Subjects";
} else if (path.startsWith("/quiz")) {
  title = "Quiz";
} else if (path.startsWith("/settings")) {
  title = !isAdmin && settingsTab === "learning" ? "My Learning" : "Settings";
} else if (path.startsWith("/my-learning")) {
  title = "My Learning";
}


  return (
    <>
      <header className="flex h-full w-full items-center justify-between bg-card/80 px-4 backdrop-blur-md border-b border-border sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-[120px]">
          {user?.role !== "admin" ? (
            <button
              type="button"
              onClick={() => navigate("/dashboard", { replace: true })}
              className="flex items-center gap-2"
              aria-label="Dashboard"
            >
              <img
                src={logo}
                alt="LMS"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
              />
            </button>
            // <button
            //   onClick={() => navigate("/dashboard")}
            //   className="flex items-center gap-2"
            // >
            //   <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white shadow-sm">
            //     <Zap className="h-4 w-4" />
            //   </div>
            //   <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">LMS</span>
            // </button>
          ) : (
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h1>
          )}
        </div>
        
        {/* Search — desktop inline, mobile icon overlay */}
        <div className="flex flex-1 justify-center px-2">
          <HeaderSearch
            placeholder={user?.role === "admin" ? `Search ${title.toLowerCase()}…` : "Search classes, subjects, lessons…"}
            className="hidden md:block w-full max-w-2xl"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <HeaderSearch variant="mobile-only-icon" className="md:hidden" />
          {user?.role !== "admin" && (
            <button
              type="button"
              onClick={() => navigate("/settings?tab=learning")}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              My Learning
            </button>
          )}

          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full transition hover:scale-[1.03]">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xs">
                    {nameText
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  )}
                {/* {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs shadow-sm">
                    {(user?.name || "L").slice(0, 2).toUpperCase()}
                  </div>
                )} */}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="pb-2">
                <div className="flex items-center gap-3">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xs">
                      {(nameText || "L")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  {/* {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs">
                      {(user?.name || "L").slice(0, 2).toUpperCase()}
                    </div>
                  )} */}
                  <div>
                    {/* <p className="text-sm font-semibold leading-tight">{nameText}</p> */}
                    <p className="text-xs sm:text-sm md:text-base font-semibold leading-tight truncate max-w-[100px] sm:max-w-[140px] md:max-w-none">
                      {nameText}
                    </p>
                    <p className="text-xs font-normal text-muted-foreground">{emailText}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {isAdmin ? (
                <>
                  <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings?tab=personal")} className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-learning")} className="cursor-pointer gap-2">
                    <BookOpen className="h-4 w-4" /> My learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings?tab=personal")} className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                onClick={async () => {
                  await logout();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}



// import {
//   Search,
//   Sun,
//   Moon,
//   User,
//   LogOut,
//   Settings,
//   Heart,
//   ShoppingCart,
//   BookOpen,
// } from "lucide-react";

// import { useTheme } from "@/contexts/ThemeContext";
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   CART_CHANGED_EVENT,
//   getCart,
//   getWishlist,
//   WISHLIST_CHANGED_EVENT,
// } from "@/utils/userStore";
// import { getSessionUser, clearAuthSession } from "@/utils/authSession";
// import { useHeaderProfile } from "@/hooks/useHeaderProfile";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import logo from "../assets/photos/logo.png"

// export function TopHeader() {
//   const { isDark, toggle } = useTheme();
//   const navigate = useNavigate();
//   const user = getSessionUser() || {
//     name: "Learner",
//     email: "learner@example.com",
//     role: "user",
//   };
//   const isAdmin = user?.role === "admin";
//   const { name: nameText, email: emailText, avatar: avatarSrc } =
//     useHeaderProfile();

//   const location = useLocation();
//   const path = location.pathname;
//   const [wishlistCount, setWishlistCount] = useState(() => getWishlist().length);
//   const [cartCount, setCartCount] = useState(() => getCart().length);

//   useEffect(() => {
//     const refreshWishlist = () => setWishlistCount(getWishlist().length);
//     const refreshCart = () => setCartCount(getCart().length);
//     refreshWishlist();
//     refreshCart();
//     window.addEventListener(WISHLIST_CHANGED_EVENT, refreshWishlist);
//     window.addEventListener(CART_CHANGED_EVENT, refreshCart);
//     return () => {
//       window.removeEventListener(WISHLIST_CHANGED_EVENT, refreshWishlist);
//       window.removeEventListener(CART_CHANGED_EVENT, refreshCart);
//     };
//   }, []);

// let title = "Dashboard";

// if (path.startsWith("/admin/courses/")) {
//   title = "Course Detail";
// } else if (path.startsWith("/courses/create")) {
//   title = "Create Course";
// } else if (path.startsWith("/courses/")) {
//   title = "Course Detail";
// } else if (path.startsWith("/courses")) {
//   title = "Courses";
// } else if (path.startsWith("/dashboard")) {
//   title = "Dashboard";
// } else if (path.startsWith("/students")) {
//   title = "Students";
// } else if (path.startsWith("/materials")) {
//   title = "Materials";
// } else if (path.startsWith("/quiz")) {
//   title = "Quiz";
// } else if (path.startsWith("/settings")) {
//   title = "Settings";
// } else if (path.startsWith("/my-learning")) {
//   title = "My Learning";
// }


//   return (
//     <>
//       <header className="flex h-full w-full items-center justify-between bg-card/80 px-4 backdrop-blur-md border-b border-border sm:px-6">
//         <div className="flex items-center gap-2 sm:gap-4 min-w-[120px]">
//           {user?.role !== "admin" ? (
//             <button
//               type="button"
//               onClick={() => navigate("/")}
//               className="flex items-center gap-2"
//               aria-label="Home"
//             >
//               <img
//                 src={logo}
//                 alt="LMS"
//                 className="h-8 sm:h-10 md:h-12 w-auto object-contain"
//               />
//             </button>
//             // <button
//             //   onClick={() => navigate("/dashboard")}
//             //   className="flex items-center gap-2"
//             // >
//             //   <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white shadow-sm">
//             //     <Zap className="h-4 w-4" />
//             //   </div>
//             //   <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">LMS</span>
//             // </button>
//           ) : (
//             <h1 className="text-xl font-semibold text-foreground">{title}</h1>
//           )}
//         </div>
        
//         {/* Search */}
//           <div className="flex-1 flex justify-center px-2">
//             <div className="hidden md:block relative w-full max-w-2xl flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <input
//                 type="text"
//                 placeholder={user?.role === "admin" ? `Search ${title.toLowerCase()}...` : "Search for anything"}
//                 className="w-full h-11 rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
//               />
//             </div>
//           </div>
        

//         <div className="flex items-center gap-1.5">
//           {user?.role !== "admin" && (
//             <>
//               <button
//                 type="button"
//                 onClick={() => navigate("/settings?tab=learning")}
//                 className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
//               >
//                 <BookOpen className="h-4 w-4" />
//                 My Learning
//               </button>
//               <button
//                 // onClick={() => navigate("/wishlist")}
//                 onClick={() => navigate("/settings?tab=wishlist")}
//                 className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
//               >
//                 <Heart className="h-4 w-4" />
//                 {wishlistCount > 0 && (
//                   <span className="absolute right-1 top-1 rounded-full bg-primary px-1 text-[10px] text-white">
//                     {wishlistCount}
//                   </span>
//                 )}
//               </button>
//               <button
//                 onClick={() => navigate("/cart")}
//                 // onClick={() => navigate("/settings?tab=cart")}
//                 className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
//               >
//                 <ShoppingCart className="h-4 w-4" />
//                 {cartCount > 0 && (
//                   <span className="absolute right-1 top-1 rounded-full bg-primary px-1 text-[10px] text-white">
//                     {cartCount}
//                   </span>
//                 )}
//               </button>
//             </>
//           )}

//           <button
//             onClick={toggle}
//             className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
//           >
//             {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//           </button>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="ml-1 rounded-full transition hover:scale-[1.03]">
//                 {avatarSrc ? (
//                   <img
//                     src={avatarSrc}
//                     alt="profile"
//                     className="h-9 w-9 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xs">
//                     {nameText
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")
//                       .slice(0, 2)
//                       .toUpperCase()}
//                   </div>
//                   )}
//                 {/* {avatarSrc ? (
//                   <img
//                     src={avatarSrc}
//                     alt="Profile"
//                     className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-border"
//                   />
//                 ) : (
//                   <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs shadow-sm">
//                     {(user?.name || "L").slice(0, 2).toUpperCase()}
//                   </div>
//                 )} */}
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-64">
//               <DropdownMenuLabel className="pb-2">
//                 <div className="flex items-center gap-3">
//                   {avatarSrc ? (
//                     <img
//                       src={avatarSrc}
//                       alt="Profile"
//                       className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-border"
//                     />
//                   ) : (
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xs">
//                       {(nameText || "L")
//                         .split(" ")
//                         .map((n) => n[0])
//                         .join("")
//                         .slice(0, 2)
//                         .toUpperCase()}
//                     </div>
//                   )}
//                   {/* {avatarSrc ? (
//                     <img
//                       src={avatarSrc}
//                       alt="Profile"
//                       className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
//                     />
//                   ) : (
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs">
//                       {(user?.name || "L").slice(0, 2).toUpperCase()}
//                     </div>
//                   )} */}
//                   <div>
//                     {/* <p className="text-sm font-semibold leading-tight">{nameText}</p> */}
//                     <p className="text-xs sm:text-sm md:text-base font-semibold leading-tight truncate max-w-[100px] sm:max-w-[140px] md:max-w-none">
//                       {nameText}
//                     </p>
//                     <p className="text-xs font-normal text-muted-foreground">{emailText}</p>
//                   </div>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />

//               {isAdmin ? (
//                 <>
//                   <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")} className="cursor-pointer gap-2">
//                     <User className="h-4 w-4" /> Profile
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => navigate("/settings?tab=personal")} className="cursor-pointer gap-2">
//                     <Settings className="h-4 w-4" /> Settings
//                   </DropdownMenuItem>
//                 </>
//               ) : (
//                 <>
//                 <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")} className="cursor-pointer gap-2">
//                     <User className="h-4 w-4" /> Profile
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => navigate("/my-learning")} className="cursor-pointer gap-2">
//                     <User className="h-4 w-4" /> My learning
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => navigate("/settings?tab=wishlist")} className="cursor-pointer gap-2">
//                     <Heart className="h-4 w-4" /> Wishlist
//                   </DropdownMenuItem>
//                   {/* <DropdownMenuItem onClick={() => navigate("/settings?tab=cart")} className="cursor-pointer gap-2">
//                     <ShoppingCart className="h-4 w-4" /> Cart
//                   </DropdownMenuItem> */}
//                   <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")} className="cursor-pointer gap-2">
//                     <Settings className="h-4 w-4" /> Settings
//                   </DropdownMenuItem>
                  
//                 </>
//               )}

//               <DropdownMenuSeparator />
//               <DropdownMenuItem
//                 className="cursor-pointer gap-2 text-destructive focus:text-destructive"
//                 onClick={() => {
//                   clearAuthSession();
//                   navigate("/login");
//                 }}
//               >
//                 <LogOut className="h-4 w-4" /> Sign out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </header>
//     </>
//   );
// }

