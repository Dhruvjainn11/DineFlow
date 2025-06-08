import { Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Empty for now
import PrivateRoute from "./components/PrivateRoute"; // Private route component
import MenuManagement from "./pages/MenuManagment";
import CategoryManagement from "./pages/CategoryManagment";
import { socket } from "./utils/socket"; // Import the socket instance

function App() {
  useEffect(() => {
 socket.connect();
    return () => socket.disconnect();
  })
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

     <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
        </Route>
    </Routes>
  );
}

export default App;
