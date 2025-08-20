import { Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Empty for now
import PrivateRoute from "./components/PrivateRoute"; // Private route component
import MenuManagement from "./pages/MenuManagment";
import CategoryManagement from "./pages/CategoryManagment";
import { socket } from "./utils/socket"; // Import the socket instance
import TableManagment from "./pages/TableManagment";
import OrderManagment from "./pages/OrderManagment";
import Analytics from "./pages/Analytics";
import AdminPaymentManager from "./pages/AdminPaymentManager";
import KitchenDashboard from "./pages/kitchen/KitchenDashboard";
import SuperAdminCafeManagement from "./pages/SuperAdminCafeManagement";
import SuperAdminAnalyticsDashboard from "./pages/SuperAdminAnalyticsDashboard";
import SuperAdminSystemSettings from "./pages/SuperAdminSystemSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSettings from "./pages/PaymentSettings";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRealtimeNotifications } from "./hooks/useRealtimeNotifications";

function AppContent() {
  useRealtimeNotifications();
  
  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, []);
  
  return ( <>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
  {/* Cafe Admin Routes */}
  <Route path="/admin" element={<ProtectedRoute allowedRole="admin" />}>
    <Route index element={<Dashboard />} /> 
    <Route path="menu" element={<MenuManagement />} />
    <Route path="categories" element={<CategoryManagement />} />
    <Route path="tables" element={<TableManagment />} />
    <Route path="orders" element={<OrderManagment />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="payment" element={<AdminPaymentManager />} />
    <Route path="payment-settings" element={<PaymentSettings />} />
    <Route path="kitchen/dashboard" element={<KitchenDashboard />} /> 
  </Route>

  {/* Super Admin Routes */}
  <Route path="/super-admin" element={<ProtectedRoute allowedRole="super-admin" />}>
    <Route index element={<Dashboard />} /> 
    <Route path="cafes" element={<SuperAdminCafeManagement />} />
    <Route path="analytics" element={<SuperAdminAnalyticsDashboard />} />
    <Route path="settings" element={<SuperAdminSystemSettings />} />
  </Route>
  
</Route>

      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />
        </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
