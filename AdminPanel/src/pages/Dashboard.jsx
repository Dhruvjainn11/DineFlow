import AdminLayout from "../layouts/AdminLayout";
import React from "react";

const Dashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      <p>Welcome to the DineFlow Admin Panel.</p>
    </AdminLayout>
  );
};

export default Dashboard;
