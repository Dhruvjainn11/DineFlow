import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";
import DashboardSkeleton from "./Common/DashboardSkeleton";

const PrivateRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
