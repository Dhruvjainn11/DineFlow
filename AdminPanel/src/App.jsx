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

function App() {
  useEffect(() => {
 socket.connect();
    return () => socket.disconnect();
  })
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

     <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/tables" element={<TableManagment />} />
          <Route path="/admin/orders" element={<OrderManagment />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/payment" element={<AdminPaymentManager />} />
        </Route>
    </Routes>
  );
}

export default App;
