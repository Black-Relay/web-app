import { SidebarProvider } from "@/components/ui/sidebar";
// import type React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/app-sidebar";
import AppBreadcrumb from "@/components/app-breadcrumb";
import "../css/layout.css";

export function Layout(/*{ children }: { children: React.ReactNode }*/) {


  return (
      <SidebarProvider>
        <AppSidebar />
        <div className="layout">
          <AppBreadcrumb />
          <Outlet />
        </div>
        {/* {children} */}
      </SidebarProvider>
  );
}
