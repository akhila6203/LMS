import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UICustomizationProvider } from "@/contexts/UICustomizationContext";

// PUBLIC
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminRegister from "@/pages/AdminRegister";
import PublicCoursePage from "./components/homecomponents/PublicCoursePage";

// ADMIN
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCourses from "@/pages/admin/Courses";
import Students from "@/pages/admin/Students";
import Materials from "@/pages/admin/Materials";
import AdminSettings from "@/pages/admin/Settings";
import AdminBanners from "@/pages/admin/Banners";
import AdminHomeVideo from "@/pages/admin/HomeVideo";

// USER
import UserDashboard from "@/pages/user/Dashboard";
import UserCourses from "@/pages/user/Courses";
// import MyMaterials from "@/pages/user/MyMaterials";
import UserSettings from "@/pages/user/Settings";
import UserDevelopment from "@/pages/user/Development";

import NotFound from "@/pages/NotFound";
import CreateCourse from "@/pages/admin/CreateCourse";
import CourseDetails from "@/pages/admin/CourseDetails";
import UserCourseDetails from "@/pages/user/CourseViewPage";
import MainLayout from "./layouts/MainLayout";
import About from "@/pages/About";

const queryClient = new QueryClient();

// ✅ NEW CODE
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import HomeCoursesPage from "./components/homecomponents/HomeCoursesPage";
import { getSessionUser } from "@/utils/authSession";
import { isLearnerSession } from "@/utils/publicRoutes";

const ProtectedRoute = () => {
  const location = useLocation();
  const user = getSessionUser();

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} />;
  }

  return user.role === "admin" ? <AdminLayout /> : <UserLayout />;
};

const AdminOnlyRoute = ({ children }) => {
  const user = getSessionUser();
  if (!user) return <Navigate to="/login?type=admin" />;
  if (user.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
};

const RoleRoute = ({ adminElement, userElement }) => {
  const user = getSessionUser();
  if (!user) return <Navigate to="/login" />;
  return user.role === "admin" ? adminElement : userElement;
};

const CourseGate = () => {
  const user = getSessionUser();

  if (!user) {
    return (
      <MainLayout>
        <PublicCoursePage />
      </MainLayout>
    );
  }

  return (
    <UserLayout>
      <UserCourseDetails />
    </UserLayout>
  );
};

const PublicRoute = ({ children }) => {
  const user = getSessionUser();

  if (user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role === "user" || isLearnerSession(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
// const PublicRoute = ({ children }) => {
//   const user = getSessionUser();

//   if (user?.role === "admin") {
//     return <Navigate to="/courses" replace />;
//   }

//   if (isLearnerSession(user)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UICustomizationProvider>
          <TooltipProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >

              <Toaster />
              <Sonner />

              <Routes>

                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/register" element={<AdminRegister />} />

                <Route element={<MainLayout />}>
                  <Route
                      path="/"
                      element={
                        <PublicRoute>
                          <Home />
                        </PublicRoute>
                      }
                    />

                    <Route
                      path="/homecourses"
                      element={
                        <PublicRoute>
                          <HomeCoursesPage />
                        </PublicRoute>
                      }
                    />
                  <Route
                    path="/about"
                    element={
                      <PublicRoute>
                        <About />
                      </PublicRoute>
                    }
                  />
                </Route>

                {/* Course details (public preview OR full after login) */}
                <Route path="/courses/:id" element={<CourseGate />} />
                          
                {/* PROTECTED */}
                <Route element={<ProtectedRoute />}>
                  
                  <Route
                    path="/dashboard"
                    element={<RoleRoute adminElement={<AdminDashboard />} userElement={<UserDashboard />} />}
                  />
                  <Route
                    path="/courses"
                    element={<RoleRoute adminElement={<AdminCourses />} userElement={<UserCourses />} />}
                  />
                  <Route
                    path="/courses/create"
                    element={
                      <AdminOnlyRoute>
                        <CreateCourse />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route path="/development" element={<UserDevelopment />} />
                  <Route
                    path="/my-learning"
                    element={<Navigate to="/settings?tab=learning" replace />}
                  />

                  {/* MATERIALS */}
                  {/* <Route
                    path="/materials"
                    element={<RoleRoute adminElement={<Materials />} userElement={<MyMaterials />} />}
                  /> */}
                  <Route
                    path="/materials"
                    element={<RoleRoute adminElement={<Materials />}  />}
                  />

                  {/* SETTINGS */}
                  <Route
                    path="/settings"
                    element={<RoleRoute adminElement={<AdminSettings />} userElement={<UserSettings />} />}
                  />

                  {/* ADMIN ONLY */}
                  <Route
                    path="/students"
                    element={
                      <AdminOnlyRoute>
                        <Students />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/admin/courses/:id"
                    element={
                      <AdminOnlyRoute>
                        <CourseDetails />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/admin/banners"
                    element={
                      <AdminOnlyRoute>
                        <AdminBanners />
                      </AdminOnlyRoute>
                    }
                  />

                  <Route
                    path="/admin/home-video"
                    element={
                      <AdminOnlyRoute>
                        <AdminHomeVideo />
                      </AdminOnlyRoute>
                    }
                  />

                </Route>

                {/* NOT FOUND */}
                <Route path="*" element={<NotFound />} />

              </Routes>

            </BrowserRouter>
          </TooltipProvider>
        </UICustomizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;






// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { ThemeProvider } from "@/contexts/ThemeContext";
// import { UICustomizationProvider } from "@/contexts/UICustomizationContext";

// // PUBLIC
// import Home from "@/pages/Home";
// import Login from "@/pages/Login";
// import AdminRegister from "@/pages/AdminRegister";
// import PublicCoursePage from "./components/homecomponents/PublicCoursePage";

// // ADMIN
// import AdminDashboard from "@/pages/admin/Dashboard";
// import AdminCourses from "@/pages/admin/Courses";
// import Students from "@/pages/admin/Students";
// import Materials from "@/pages/admin/Materials";
// import AdminSettings from "@/pages/admin/Settings";
// import AdminBanners from "@/pages/admin/Banners";
// import AdminHomeVideo from "@/pages/admin/HomeVideo";

// // USER
// import UserDashboard from "@/pages/user/Dashboard";
// import UserCourses from "@/pages/user/Courses";
// // import MyMaterials from "@/pages/user/MyMaterials";
// import UserSettings from "@/pages/user/Settings";
// import UserDevelopment from "@/pages/user/Development";

// import NotFound from "@/pages/NotFound";
// import CreateCourse from "@/pages/admin/CreateCourse";
// import CourseDetails from "@/pages/admin/CourseDetails";
// import UserCourseDetails from "@/pages/user/CourseViewPage";
// import MainLayout from "./layouts/MainLayout";
// import About from "@/pages/About";

// const queryClient = new QueryClient();

// // ✅ NEW CODE
// import AdminLayout from "./layouts/AdminLayout";
// import UserLayout from "./layouts/UserLayout";
// import HomeCoursesPage from "./components/homecomponents/HomeCoursesPage";
// import { getSessionUser } from "@/utils/authSession";
// import { isLearnerSession } from "@/utils/publicRoutes";

// const ProtectedRoute = () => {
//   const location = useLocation();
//   const user = getSessionUser();

//   if (!user) {
//     const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
//     return <Navigate to={`/login?redirect=${redirect}`} />;
//   }

//   return user.role === "admin" ? <AdminLayout /> : <UserLayout />;
// };

// const AdminOnlyRoute = ({ children }) => {
//   const user = getSessionUser();
//   if (!user) return <Navigate to="/login?type=admin" />;
//   if (user.role !== "admin") return <Navigate to="/dashboard" />;
//   return children;
// };

// const RoleRoute = ({ adminElement, userElement }) => {
//   const user = getSessionUser();
//   if (!user) return <Navigate to="/login" />;
//   return user.role === "admin" ? adminElement : userElement;
// };

// const CourseGate = () => {
//   const user = getSessionUser();

//   if (!user) {
//     return (
//       <MainLayout>
//         <PublicCoursePage />
//       </MainLayout>
//     );
//   }

//   return (
//     <UserLayout>
//       <UserCourseDetails />
//     </UserLayout>
//   );
// };

// const PublicRoute = ({ children }) => {
//   const user = getSessionUser();

//   if (user?.role === "admin") {
//     return <Navigate to="/courses" replace />;
//   }

//   if (isLearnerSession(user)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// const App = () => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider>
//         <UICustomizationProvider>
//           <TooltipProvider>
//             <BrowserRouter
//               future={{
//                 v7_startTransition: true,
//                 v7_relativeSplatPath: true,
//               }}
//             >

//               <Toaster />
//               <Sonner />

//               <Routes>

//                 {/* PUBLIC */}
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/admin/register" element={<AdminRegister />} />

//                 <Route element={<MainLayout />}>
//                   <Route
//                       path="/"
//                       element={
//                         <PublicRoute>
//                           <Home />
//                         </PublicRoute>
//                       }
//                     />

//                     <Route
//                       path="/homecourses"
//                       element={
//                         <PublicRoute>
//                           <HomeCoursesPage />
//                         </PublicRoute>
//                       }
//                     />
//                   <Route
//                     path="/about"
//                     element={
//                       <PublicRoute>
//                         <About />
//                       </PublicRoute>
//                     }
//                   />
//                 </Route>

//                 {/* Course details (public preview OR full after login) */}
//                 <Route path="/courses/:id" element={<CourseGate />} />
                          
//                 {/* PROTECTED */}
//                 <Route element={<ProtectedRoute />}>
                  
//                   <Route
//                     path="/dashboard"
//                     element={<RoleRoute adminElement={<AdminDashboard />} userElement={<UserDashboard />} />}
//                   />
//                   <Route
//                     path="/courses"
//                     element={<RoleRoute adminElement={<AdminCourses />} userElement={<UserCourses />} />}
//                   />
//                   <Route
//                     path="/courses/create"
//                     element={
//                       <AdminOnlyRoute>
//                         <CreateCourse />
//                       </AdminOnlyRoute>
//                     }
//                   />
//                   <Route path="/development" element={<UserDevelopment />} />
//                   <Route
//                     path="/my-learning"
//                     element={<Navigate to="/settings?tab=learning" replace />}
//                   />

//                   {/* MATERIALS */}
//                   {/* <Route
//                     path="/materials"
//                     element={<RoleRoute adminElement={<Materials />} userElement={<MyMaterials />} />}
//                   /> */}
//                   <Route
//                     path="/materials"
//                     element={<RoleRoute adminElement={<Materials />}  />}
//                   />

//                   {/* SETTINGS */}
//                   <Route
//                     path="/settings"
//                     element={<RoleRoute adminElement={<AdminSettings />} userElement={<UserSettings />} />}
//                   />

//                   {/* ADMIN ONLY */}
//                   <Route
//                     path="/students"
//                     element={
//                       <AdminOnlyRoute>
//                         <Students />
//                       </AdminOnlyRoute>
//                     }
//                   />
//                   <Route
//                     path="/admin/courses/:id"
//                     element={
//                       <AdminOnlyRoute>
//                         <CourseDetails />
//                       </AdminOnlyRoute>
//                     }
//                   />
//                   <Route
//                     path="/admin/banners"
//                     element={
//                       <AdminOnlyRoute>
//                         <AdminBanners />
//                       </AdminOnlyRoute>
//                     }
//                   />

//                   <Route
//                     path="/admin/home-video"
//                     element={
//                       <AdminOnlyRoute>
//                         <AdminHomeVideo />
//                       </AdminOnlyRoute>
//                     }
//                   />

//                 </Route>

//                 {/* NOT FOUND */}
//                 <Route path="*" element={<NotFound />} />

//               </Routes>

//             </BrowserRouter>
//           </TooltipProvider>
//         </UICustomizationProvider>
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;






