import React from "react";
import { useAuth } from "../context/AuthContext";
import SuperAdminLayout from "./SuperAdminLayout";
import CafeAdminLayout from "./CafeAdminLayout";
import DashboardSkeleton from "../components/Common/DashboardSkeleton";

const RoleBasedLayout = ({ children }) => {
  const { user, isSuperAdmin, loading } = useAuth();

  // Show loading state while user data is being fetched
  if (loading) {
    return <DashboardSkeleton />;
  }

  // If no user, this should be handled by PrivateRoute, but just in case
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#f7f3e8'}}>
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue.</p>
        </div>
      </div>
    );
  }

  // Render the appropriate layout based on user role
  if (isSuperAdmin()) {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }

  // Default to cafe admin layout for regular admins and other roles
  return <CafeAdminLayout>{children}</CafeAdminLayout>;
};

export default RoleBasedLayout;
