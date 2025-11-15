import { SidebarProvider } from "@/components/ui/sidebar";
// import type React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/app-sidebar";
import AppBreadcrumb from "@/components/app-breadcrumb";
import "../css/layout.css";

export function Layout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
      <SidebarProvider>
        {!isLandingPage && <AppSidebar />}
        <div className="layout">
          {!isLandingPage && <AppBreadcrumb />}
          <Outlet />
        </div>
      </SidebarProvider>
  );
}
