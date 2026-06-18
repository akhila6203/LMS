import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getSessionUser } from "@/utils/authSession";
import { useHeaderProfile } from "@/hooks/useHeaderProfile";
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Images,
  Folder,
  Video,
} from "lucide-react";

import logo2 from "../assets/photos/logo2.png";

const adminMenu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Classes", path: "/courses", icon: BookOpen },
  { name: "Students", path: "/students", icon: Users },
  { name: "Materials", path: "/materials", icon: Folder },
  { name: "Banners", path: "/admin/banners", icon: Images },
  { name: "Home Video", path: "/admin/home-video", icon: Video },
  { name: "Settings", path: "/settings", icon: Settings },
];

const userMenu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Learning", path: "/settings?tab=learning", icon: BookOpen },
  { name: "Classes", path: "/courses", icon: BookOpen },
  { name: "My Materials", path: "/materials", icon: Folder },
  { name: "Settings", path: "/settings", icon: Settings },
];

function SidebarAvatar({ name, avatar, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt=""
        className={`${dim} rounded-full object-cover shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {(name || "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}

export function AppSidebar({ collapsed, setCollapsed }) {
  const session = getSessionUser();
  const { name, email, avatar } = useHeaderProfile();
  const menu = session?.role === "admin" ? adminMenu : userMenu;
  const roleLabel = session?.role === "admin" ? "Admin" : "Student";
  // const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (

      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 ${
          collapsed ? "w-[68px]" : "w-[220px]"
        }`}
      > 
  
     {/* LOGO */}
     <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3">
        <img
          src={logo2}
          alt="LMS"
          className="h-10 sm:h-10 md:h-12 w-auto object-contain"
          // className={`w-auto object-contain invert brightness-0 transition-all duration-300 
          //   ${collapsed ? "h-10 mx-auto" : "h-12 sm:h-10"}`}
        />

      </div>
      {/* <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Zap className="w-4 h-4 text-white" />
        </div>

        {!collapsed && (
          <span className="font-bold text-2xl text-sidebar-primary-foreground">
            LMS
          </span>
        )}
      </div> */}

      
      {/* ✅ MENU (YOUR CODE PLACE HERE) */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {menu.map((item) => {
          const isActive = (() => {
            if (item.path.includes("?")) {
              const [path, query] = item.path.split("?");
              const tab = new URLSearchParams(query).get("tab");
              const currentTab = new URLSearchParams(location.search).get("tab");
              return location.pathname === path && currentTab === tab;
            }
            return location.pathname === item.path;
          })();

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-primary text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* PROFILE — same image + email as header (from API) */}
      <div className={`mx-3 mb-3 ${collapsed ? "flex justify-center" : ""}`}>
        <div
          className={`rounded-xl bg-sidebar-accent/40 border border-sidebar-border ${
            collapsed ? "p-2" : "p-3"
          }`}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <SidebarAvatar name={name} avatar={avatar} size={collapsed ? "sm" : "md"} />

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-primary-foreground truncate">
                  {name}
                </p>
                <p className="text-[10px] text-sidebar-muted truncate">{email}</p>
                <p className="text-[10px] text-sidebar-muted/80 truncate">{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COLLAPSE */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent transition"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}








// import { useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard, Users, UserCircle, TrendingUp, CheckSquare,
//   Calendar, Headphones, BarChart3, Settings, Shield, ChevronLeft,
//   ChevronRight, ChevronDown, Zap, Layers, Briefcase, Cog,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const navGroups = [
//   {
//     label: "Overview",
//     icon: Layers,
//     items: [
//       { label: "Dashboard", icon: LayoutDashboard, path: "/" },
//       { label: "Analytics", icon: BarChart3, path: "/analytics" },
//     ],
//   },
//   {
//     label: "CRM",
//     icon: Briefcase,
//     items: [
//       { label: "Leads", icon: Users, path: "/leads" },
//       { label: "Customers", icon: UserCircle, path: "/customers" },
//       { label: "Pipeline", icon: TrendingUp, path: "/pipeline" },
//     ],
//   },
//   {
//     label: "Workspace",
//     icon: CheckSquare,
//     items: [
//       { label: "Tasks", icon: CheckSquare, path: "/tasks" },
//       { label: "Calendar", icon: Calendar, path: "/calendar" },
//       { label: "Support", icon: Headphones, path: "/support" },
//     ],
//   },
//   {
//     label: "Admin",
//     icon: Cog,
//     items: [
//       { label: "Settings", icon: Settings, path: "/settings" },
//       { label: "Roles", icon: Shield, path: "/roles" },
//     ],
//   },
// ];

// function SidebarGroup({ group, collapsed, isOpen, onToggle }) {
//   const location = useLocation();
//   const hasActiveChild = group.items.some((item) => location.pathname === item.path);

//   return (
//     <div className="mb-1">
//       {!collapsed ? (
//         <button
//           onClick={onToggle}
//           className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
//             hasActiveChild
//               ? "text-sidebar-primary-foreground bg-sidebar-accent/50"
//               : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
//           }`}
//         >
//           <group.icon className="w-4 h-4 shrink-0" />
//           <span className="flex-1 text-left">{group.label}</span>
//           <motion.div
//             animate={{ rotate: isOpen ? 180 : 0 }}
//             transition={{ duration: 0.2 }}
//           >
//             <ChevronDown className="w-3.5 h-3.5" />
//           </motion.div>
//         </button>
//       ) : (
//         <div className="flex justify-center py-2">
//           <div className={`w-6 h-0.5 rounded-full ${hasActiveChild ? "bg-primary" : "bg-sidebar-border"}`} />
//         </div>
//       )}

//       <AnimatePresence initial={false}>
//         {(isOpen || collapsed) && (
//           <motion.div
//             initial={collapsed ? false : { height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.25, ease: "easeInOut" }}
//             className="overflow-hidden"
//           >
//             <div className={`space-y-0.5 ${!collapsed ? "mt-1 ml-3 pl-3 border-l border-sidebar-border/50" : "mt-1"}`}>
//               {group.items.map((item) => {
//                 const isActive = location.pathname === item.path;
//                 return (
//                   <NavLink
//                     key={item.path}
//                     to={item.path}
//                     className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       collapsed ? "justify-center" : ""
//                     } ${
//                       isActive
//                         ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
//                         : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//                     }`}
//                   >
//                     <item.icon className="w-[18px] h-[18px] shrink-0" />
//                     {!collapsed && <span>{item.label}</span>}

//                     {collapsed && isActive && (
//                       <motion.div
//                         layoutId="activeIndicator"
//                         className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary"
//                       />
//                     )}

//                     {collapsed && (
//                       <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg pointer-events-none">
//                         {item.label}
//                         <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-foreground rotate-45 rounded-[1px]" />
//                       </div>
//                     )}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export function AppSidebar() {
//   const [collapsed, setCollapsed] = useState(false);
//   const location = useLocation();

//   const [openGroups, setOpenGroups] = useState(() => {
//     const initial = {};
//     navGroups.forEach((group) => {
//       initial[group.label] = group.items.some((item) => item.path === location.pathname);
//     });
//     return initial;
//   });

//   const toggleGroup = (label) => {
//     setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
//   };

//   return (
//     <aside
//       className={`sticky top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
//         collapsed ? "w-[72px]" : "w-[260px]"
//       }`}
//     >
//       <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3">
//         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
//           <Zap className="w-4 h-4 text-primary-foreground" />
//         </div>
//         {!collapsed && (
//           <span className="font-heading font-bold text-lg text-sidebar-primary-foreground tracking-tight">
//             NexusCRM
//           </span>
//         )}
//       </div>

//       <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
//         {navGroups.map((group) => (
//           <SidebarGroup
//             key={group.label}
//             group={group}
//             collapsed={collapsed}
//             isOpen={openGroups[group.label] ?? false}
//             onToggle={() => toggleGroup(group.label)}
//           />
//         ))}
//       </nav>

//       {!collapsed && (
//         <div className="mx-3 mb-3 p-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/50">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs">
//               JD
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-sidebar-primary-foreground truncate">John Doe</p>
//               <p className="text-[10px] text-sidebar-muted truncate">Admin</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="p-3 border-t border-sidebar-border">
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
//         >
//           {collapsed ? (
//             <ChevronRight className="w-4 h-4" />
//           ) : (
//             <>
//               <ChevronLeft className="w-4 h-4" />
//               <span>Collapse</span>
//             </>
//           )}
//         </button>
//       </div>
//     </aside>
//   );
// }
