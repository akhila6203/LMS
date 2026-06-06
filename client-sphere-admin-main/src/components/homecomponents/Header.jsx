import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Pencil,
  Trash2,
  Heart,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { catalog } from "../../lib/catalog";
// import { getWishlist, WISHLIST_CHANGED_EVENT } from "@/utils/userStore";
import { isLearnerLoggedIn } from "@/utils/userStore";
import { wishlistService } from "@/services/wishlistService";

import { useCartCount } from "@/hooks/useCartCount";
import { getSessionUser, clearAuthSession } from "@/utils/authSession";
import { useHeaderProfile } from "@/hooks/useHeaderProfile";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

import logo from "../../assets/photos/logo.png"

function SlidePanel({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-80 bg-card border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { isDark, toggle } = useTheme();
  const user = getSessionUser();
  const isAdmin = user?.role === "admin";
  const headerProfile = useHeaderProfile();

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const avatarSrc = user && !isAdmin ? headerProfile.avatar : "";
  const nameText = user && !isAdmin ? headerProfile.name : user?.name || "Learner";
  const emailText = user && !isAdmin ? headerProfile.email : user?.email || "";
  // const [wishlistCount, setWishlistCount] = useState(() => getWishlist().length);
  const [wishlistCount, setWishlistCount] = useState(0);
  const cartCount = useCartCount();

  // console.log("Header Cart Count:", cartCount);

  useEffect(() => {
  const loadWishlistCount = async () => {
    if (!isLearnerLoggedIn()) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await wishlistService.getAll();
      setWishlistCount((res.data.courseIds || []).length);
    } catch {
      setWishlistCount(0);
    }
  };
  loadWishlistCount();
  window.addEventListener("wishlistChanged", loadWishlistCount);
  return () => {
    window.removeEventListener("wishlistChanged", loadWishlistCount);
  };
}, []);
  // useEffect(() => {
  //   const refresh = () => setWishlistCount(getWishlist().length);
  //   refresh();
  //   window.addEventListener(WISHLIST_CHANGED_EVENT, refresh);
  //   return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, refresh);
  // }, []);
  // const isAdmin = user?.role === "admin";

  const [openPanel, setOpenPanel] = useState("none");
  const closePanel = () => setOpenPanel("none");
  const togglePanel = (panel) => setOpenPanel((prev) => (prev === panel ? "none" : panel));

  const filteredCourses = catalog.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-10 border-b bg-card/95 shadow-sm backdrop-blur">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-3 py-3">
      
        {/* LOGO */}
        {/* <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-purple-600 cursor-pointer"
        >
          LMS
        </h1> */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={logo}
            alt="LMS"
            className="h-10 sm:h-10 md:h-12 w-auto object-contain"
          />
        </div>
        

        {/* SEARCH */}
      
         <div className="relative w-full sm:w-40 md:w-80 lg:w-96">
          <div className="flex items-center rounded-lg bg-secondary px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* DROPDOWN */}
          {query && (
            <div className="absolute top-full mt-2 max-h-60 w-full overflow-y-auto rounded-xl border bg-card shadow-lg">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      navigate(`/courses/${course.id}`);
                      setQuery("");
                    }}
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-secondary"
                  >
                    {course.title}
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">No results</p>
              )}
            </div>
          )}
        </div> 

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-6">
           
          <button onClick={() => navigate("/homecourses")} className="hidden md:flex items-center gap-1 text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Courses
          </button>

          {user && !isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/settings?tab=learning")}
              className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              My Learning
            </button>
          )}

          <Link to="/about" className="hidden md:block text-sm">
            About
          </Link>

          
            {!isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/cart")}
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="hidden md:flex relative h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <ShoppingCart className="h-5 w-5" />
              
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-semibold bg-purple-600 text-white px-1 rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

           <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
            onClick={() => togglePanel("menu")}
          >
            ☰
          </button>

          {!user || isAdmin ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-2 py-2 rounded-lg text-sm shadow"
            >
              Login
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full transition hover:scale-[1.03]">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" className="h-9 w-9 rounded-full object-cover ring-1 ring-border" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
                      {(user?.name || "U").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-3">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs">
                        {(user?.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold leading-tight">{nameText}</p>
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
                    <DropdownMenuItem onClick={() => navigate("/settings?tab=learning")} className="cursor-pointer gap-2">
                      <User className="h-4 w-4" /> My learning
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings?tab=wishlist")} className="cursor-pointer gap-2">
                      <Heart className="h-4 w-4" /> Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-xs rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                          {wishlistCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => navigate("/settings?tab=cart")} className="cursor-pointer gap-2">
                      <ShoppingCart className="h-4 w-4" /> Cart
                      {cartCount > 0 && (
                        <span className="ml-auto text-xs rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                          {cartCount}
                        </span>
                      )}
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => navigate("/settings?tab=personal")} className="cursor-pointer gap-2">
                      <Settings className="h-4 w-4" /> Settings
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    clearAuthSession();
                    navigate("/login");
                  }}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      </header>

      <SlidePanel
  open={openPanel === "menu"}
  onClose={closePanel}
  title="Menu"
>
  <div className="p-4 space-y-4">

    <button
      onClick={() => {
        navigate("/homecourses");
        closePanel();
      }}
      className="w-full text-left"
    >
      Courses
    </button>

    <button
      onClick={() => {
        navigate("/about");
        closePanel();
      }}
      className="w-full text-left"
    >
      About
    </button>

    {!isAdmin && (
      <button
        type="button"
        onClick={() => {
          navigate("/cart");
          closePanel();
        }}
        className="w-full text-left flex items-center justify-between"
      >
        <span>Cart</span>
        {cartCount > 0 && (
          <span className="text-xs rounded-full bg-purple-600 text-white px-2 py-0.5">
            {cartCount}
          </span>
        )}
      </button>
    )}

  </div>
</SlidePanel>


    </>
  );
}
