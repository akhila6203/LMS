// layouts/UserLayout.jsx

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { TopHeader } from "@/components/TopHeader";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
// import { useWishlistSync } from "@/hooks/useWishlistSync";
import { buildNavCategories, buildSubTabs } from "@/utils/courseNavUtils";

export default function UserLayout({ children }) {
  // useWishlistSync();
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);

  const { courses } = usePublishedCourses();
  const navItems = useMemo(() => buildNavCategories(courses), [courses]);

  const goToCategory = (item) => {
    if (item === "All") {
      navigate("/courses", { replace: true });
      return;
    }
    const params = new URLSearchParams({ category: item });
    const tabs = buildSubTabs(courses, item);
    if (tabs[0]) {
      params.set("subCategory", tabs[0]);
    }
    navigate(`/courses?${params.toString()}`, { replace: true });
  };

  const isNavActive = (item) => {
    if (location.pathname !== "/courses") {
      return false;
    }

    const category = search.get("category") || "All";

    if (item === "All") {
      return category === "All";
    }
    return category === item;
  };

  return (
     <div className="min-h-screen bg-background">

    {/* HEADER */}
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-card">
      <TopHeader />
    </header>

    {/* NAVBAR */}
    <nav className="sticky top-16 z-40 border-b bg-card">
      <div className="flex justify-center overflow-x-auto">
        <div className="inline-flex gap-6 px-4 py-2">
          {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToCategory(item)}
                  className={`shrink-0 whitespace-nowrap border-b-2 pb-1 font-medium transition hover:text-foreground ${
                    isNavActive(item)
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  {item}
                </button>
              ))}
        </div>
      </div>
    </nav>

    {/* CONTENT */}
    <main className="pt-[80px]">
      {children ?? <Outlet />}
    </main>

  </div>

  
    // <div className="flex min-h-screen w-full flex-col bg-background">
    //   <header className="fixed inset-x-0 top-0 z-50 h-16 border-b bg-card shadow-sm">
    //     <TopHeader />
    //   </header>

    //   <div className="flex flex-1 flex-col pt-16">
    //     <nav className="sticky top-16 z-40 w-full border-b bg-card shadow-sm">
    //       <div className="flex w-full justify-center overflow-x-auto">
    //         <div className="inline-flex min-w-0 items-center justify-center gap-6 px-4 py-2.5 text-sm sm:px-6">
    //           {navItems.map((item) => (
    //             <button
    //               key={item}
    //               type="button"
    //               onClick={() => goToCategory(item)}
    //               className={`shrink-0 whitespace-nowrap border-b-2 pb-1 font-medium transition hover:text-foreground ${
    //                 isNavActive(item)
    //                   ? "border-foreground text-foreground"
    //                   : "border-transparent text-muted-foreground hover:border-muted-foreground/40"
    //               }`}
    //             >
    //               {item}
    //             </button>
    //           ))}
    //         </div>
    //       </div>
    //     </nav>

    //     <main className="flex flex-1 w-full flex-col bg-background">
    //       {children ?? <Outlet />}
    //     </main>
    //   </div>
    // </div>
  );
}
