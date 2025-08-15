import { Outlet } from "react-router-dom";
import CafeAdminSidebar from "../components/Sidebar/CafeAdminSidebar";
import Topbar from "../components/Topbar";
import React from "react";

const CafeAdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <CafeAdminSidebar />
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

export default CafeAdminLayout;
