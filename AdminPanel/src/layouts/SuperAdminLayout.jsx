import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../components/Sidebar/SuperAdminSidebar";
import Topbar from "../components/Topbar";
import React from "react";

const SuperAdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="ml-64 flex-1">
        <Topbar />
        <main className="p-6 bg-gray-100 min-h-[calc(100vh-4rem)]">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
