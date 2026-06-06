// layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopHeader } from "@/components/TopHeader";

export default function AdminLayout({ children }) {

  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen w-full bg-background">

      {/* SIDEBAR */}
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* RIGHT SIDE */}
      <div
        className={`flex-1 flex flex-col h-screen transition-all duration-300 
        ${collapsed ? "ml-[72px]" : "ml-[260px]"}`}
      >

        {/* HEADER */}
        <div
          className={`fixed top-0 right-0 h-16 z-50 bg-card/95 border-b shadow-sm transition-all duration-300
          ${collapsed ? "left-[72px]" : "left-[260px]"}`}
        >
          <TopHeader collapsed={collapsed} />
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 pt-20 bg-background">
          {children ?? <Outlet />}
        </main>

      </div>
    </div>
  );
}