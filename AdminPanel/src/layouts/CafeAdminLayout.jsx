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
        <main className="p-6 min-h-[calc(100vh-4rem)]" style={{backgroundColor: '#f7f3e8'}}>
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
};

export default CafeAdminLayout;
