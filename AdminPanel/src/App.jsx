import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Empty for now
import PrivateRoute from "./components/PrivateRoute"; // Private route component
import MenuManagement from "./pages/MenuManagment";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

     <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
        </Route>
    </Routes>
  );
}

export default App;
