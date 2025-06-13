import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Table2, CheckCircle, Clock3, Loader, AlertCircle } from "lucide-react";



const COLORS = ["#8884d8", "#ffc658", "#82ca9d"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/summary");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading...</div>;
  if (!data) return <div className="p-6 text-red-500">Failed to load analytics</div>;

  const { totalOrders, payments, tables } = data;
  console.log(data);
  

  const paymentData = [
    { name: "Pending", value: payments.pending },
    { name: "Requested", value: payments.requested },
    { name: "Completed", value: payments.completed },
  ];

  const tableData = [
    { name: "Occupied", value: tables.Occupied },
    { name: "Free", value: tables.Available },
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl shadow-lg bg-white border">
            <h2 className="text-xl font-semibold">Total Orders</h2>
            <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
          </div>

          <div className="p-6 rounded-xl shadow-lg bg-white border">
            <h2 className="text-xl font-semibold">Total Revenue</h2>
            <p className="text-3xl font-bold text-green-600">₹{payments.totalRevenue}</p>
          </div>

          <div className="p-6 rounded-xl shadow-lg bg-white border space-y-2">
            <h2 className="text-xl font-semibold">Payments</h2>
            <p>🟡 Pending: <span className="font-semibold">{payments.pending}</span></p>
            <p>🔵 Requested: <span className="font-semibold">{payments.requested}</span></p>
            <p>✅ Completed: <span className="font-semibold">{payments.completed}</span></p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Status Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table Occupancy Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Table Occupancy</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tableData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Status List */}
        <div className="bg-white p-6 rounded-2xl shadow-md border">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">🪑 Table Status Overview</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Total Tables */}
    <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-gray-50">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
        <Table2 className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Total Tables</p>
        <p className="text-xl font-bold text-gray-800">{tables.total}</p>
      </div>
    </div>

    {/* Table Status Cards */}
    <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-gray-50">
      <div className="p-3 bg-gray-200 text-gray-800 rounded-full">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Empty</p>
        <p className="text-xl font-bold">{tables.EMPTY || 0}</p>
      </div>
    </div>

    <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-yellow-50">
      <div className="p-3 bg-yellow-300 text-yellow-800 rounded-full">
        <Clock3 className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Ordered</p>
        <p className="text-xl font-bold">{tables.ORDERED || 0}</p>
      </div>
    </div>

    <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-red-50">
      <div className="p-3 bg-red-300 text-red-800 rounded-full">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Done</p>
        <p className="text-xl font-bold">{tables.DONE || 0}</p>
      </div>
    </div>

    <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-green-50">
      <div className="p-3 bg-green-300 text-green-800 rounded-full">
        <CheckCircle className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Paid</p>
        <p className="text-xl font-bold">{tables.PAID || 0}</p>
      </div>
    </div>
  </div>
</div>
      </div>
    </AdminLayout>
  );
}