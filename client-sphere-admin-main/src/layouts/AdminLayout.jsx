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
        ${collapsed ? "ml-[68px]" : "ml-[220px]"}`}
      >

        {/* HEADER */}
        <div
          className={`fixed top-0 right-0 h-16 z-50 bg-card/95 border-b shadow-sm transition-all duration-300
          ${collapsed ? "left-[68px]" : "left-[220px]"}`}
        >
          <TopHeader collapsed={collapsed} />
        </div>

        {/* CONTENT — gap below fixed header; title lives in TopHeader only */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="min-h-full px-3 pb-4 pt-20 sm:px-4 sm:pb-6">
            {children ?? <Outlet />}
          </div>
        </main>

      </div>
    </div>
  );
}