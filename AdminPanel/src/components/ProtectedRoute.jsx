import { Navigate, Outlet, useLocation } from "react-router-dom";
import {useAuth} from "../context/AuthContext";

function ProtectedRoute({ allowedRole }) {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    // not logged in → go to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    // logged in but wrong role → redirect to correct dashboard
    return user.role === "super-admin"
      ? <Navigate to="/super-admin" replace />
      : <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
